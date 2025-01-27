
import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import ProjectForm from './components/ProjectForm';
import ProjectCard from './components/ProjectCard';
import SearchBar from './components/SearchBar';
import { Project, ProjectFormData } from './components/types';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { openDB } from 'idb';


const App: React.FC = () => {
  const [hoveredMilestone, setHoveredMilestone] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModal, showDeleteModal] = useState(false);






  // Create a BroadcastChannel
  const channel = new BroadcastChannel('projects-channel');

  // Initialize IndexedDB
  const initDB = async () => {
    const db = await openDB('ProjectsDB', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('projects')) {
          db.createObjectStore('projects', { keyPath: 'id' });
        }
      },
    });
    return db;
  };

  // Save projects to IndexedDB and broadcast changes
  const saveProjects = async (projects: Project[]) => {
    const db = await initDB();
    const tx = db.transaction('projects', 'readwrite');
    const store = tx.objectStore('projects');
    await store.clear(); // Clear existing data
    for (const project of projects) {
      await store.put(project);
    }
    // Broadcast changes to other tabs
    channel.postMessage({ type: 'UPDATE', data: projects });
  };

  // Load projects from IndexedDB
  const loadProjects = async () => {
    const db = await initDB();
    const tx = db.transaction('projects', 'readonly');
    const store = tx.objectStore('projects');
    return await store.getAll();
  };

  // Listen for messages from other tabs
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'UPDATE') {
        setProjects(event.data.data);
      }
    };

    channel.addEventListener('message', handleMessage);

    return () => {
      channel.removeEventListener('message', handleMessage);
    };
  }, []);

  // Load projects on initial render
  useEffect(() => {
    loadProjects().then((savedProjects) => {
      if (savedProjects.length > 0) {
        setProjects(savedProjects);
      }
    });
  }, []);

  // Save projects whenever they change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveProjects(projects);
    }, 100); // Delay saving by 100ms
  
    return () => clearTimeout(timeoutId);
  }, [projects]);

  const initialFormData: ProjectFormData = {
    name: '',
    description: '',
    tasks: { completed: 0, total: 0 },
    daysLeft: 0,
    priority: 'Medium',
    category: '',
    milestones: [
      { percent: 20, name: '', descriptions: '', completed: false },
      { percent: 40, name: '', descriptions: '', completed: false },
      { percent: 60, name: '', descriptions: '', completed: false },
      { percent: 80, name: '', descriptions: '', completed: false },
      { percent: 100, name: '', descriptions: '', completed: false },
    ],
  };

  const [formData, setFormData] = useState<ProjectFormData>(initialFormData);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const progress = formData.milestones.filter((m) => m.completed).length * 20;

    if (editingProject) {
      setProjects(
        projects.map((p) =>
          p.id === editingProject.id
            ? { ...formData, id: editingProject.id, progress }
            : p
        )
      );
    } else {
      const newProject: Project = {
        ...formData,
        id: crypto.randomUUID(),
        progress,
      };
      setProjects([...projects, newProject]);
    }

    setFormData(initialFormData);
    setIsFormOpen(false);
    setEditingProject(null);
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData(project);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    const updatedProjects = projects.filter((p) => p.id !== id);
    setProjects(updatedProjects);
    saveProjects(updatedProjects); // Update IndexedDB
    console.log('Item Deleted');
    showDeleteModal(false);
  };

  const toggleDeleteModal = () => {
    showDeleteModal(!deleteModal);
  };

  // Export projects to Excel
  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Projects');

    // Add headers
    worksheet.addRow([
      'ID',
      'Name',
      'Description',
      'Progress',
      'Priority',
      'Days Left',
      'Category',
      'Milestone 1 (20%)',
      'Milestone 2 (40%)',
      'Milestone 3 (60%)',
      'Milestone 4 (80%)',
      'Milestone 5 (100%)',
    ]);

    // Add project data
    projects.forEach((project) => {
      worksheet.addRow([
        project.id,
        project.name,
        project.description,
        `${project.progress}%`,
        project.priority,
        project.daysLeft,
        project.category,
        ...project.milestones.map(
          (milestone) =>
            `${milestone.name}: ${milestone.descriptions} - ${milestone.completed ? 'Completed' : 'Not Completed'}`
        ),
      ]);
    });

    // Set column widths
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 40 },
      { header: 'Name', key: 'name', width: 25 },
      { header: 'Description', key: 'description', width: 40 },
      { header: 'Progress', key: 'progress', width: 15 },
      { header: 'Priority', key: 'priority', width: 15 },
      { header: 'Days Left', key: 'daysLeft', width: 15 },
      { header: 'Category', key: 'category', width: 20 },
      { header: 'Milestone 1 (20%)', key: 'milestones1', width: 50 },
      { header: 'Milestone 2 (40%)', key: 'milestones2', width: 50 },
      { header: 'Milestone 3 (60%)', key: 'milestones3', width: 50 },
      { header: 'Milestone 4 (80%)', key: 'milestones4', width: 50 },
      { header: 'Milestone 5 (100%)', key: 'milestones5', width: 50 },
    ];

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Save file
    saveAs(new Blob([buffer]), 'projects.xlsx');
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = e.target?.result;
        if (data) {
          const workbook = new ExcelJS.Workbook();
          await workbook.xlsx.load(data as ArrayBuffer);
  
          const worksheet = workbook.getWorksheet(1); // Get the first worksheet
  
          // Check if the worksheet exists
          if (!worksheet) {
            console.error('No worksheet found in the Excel file.');
            return;
          }
  
          const importedProjects: Project[] = [];
  
          worksheet.eachRow((row, rowNumber) => {
            if (rowNumber > 1) {
              // Skip the header row
              const project: Project = {
                id: crypto.randomUUID(),
                name: row.getCell(1).text, // Name
                description: row.getCell(2).text, // Description
                progress: parseInt(row.getCell(3).text, 10) || 0, // Progress (default to 0 if missing)
                priority: (row.getCell(4).text as 'High' | 'Medium' | 'Low') || 'Medium', // Priority (default to 'Medium' if missing)
                daysLeft: parseInt(row.getCell(5).text, 10) || 0, // Days Left (default to 0 if missing)
                category: row.getCell(6).text || '', // Category (default to empty string if missing)
                tasks: { completed: 0, total: 0 }, // Default tasks
                milestones: [
                  parseMilestone(row.getCell(7).text, 20), // Milestone 1
                  parseMilestone(row.getCell(8).text, 40), // Milestone 2
                  parseMilestone(row.getCell(9).text, 60), // Milestone 3
                  parseMilestone(row.getCell(10).text, 80), // Milestone 4
                  parseMilestone(row.getCell(11).text, 100), // Milestone 5
                ],
              };
  
              // Add the project to the imported projects list
              importedProjects.push(project);
            }
          });
  
          // Add imported projects to the existing projects
                // Update state in one go
        console.log('Imported Projects:', importedProjects);
        setProjects((prevProjects) => {
          const newProjects = [...prevProjects, ...importedProjects];
          console.log('Updated Projects:', newProjects);
          return newProjects;
        });
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };
  
  // Helper function to parse milestone description and status
  const parseMilestone = (text: string, percent: number) => {
    const [description, status] = text.split(' - '); // Split by ' - ' to separate description and status
    return {
      percent,
      name: `Milestone ${percent}%`,
      descriptions: description?.trim() || '', // Handle undefined description
      completed: status?.trim().toLowerCase() === 'completed',
    };
  };

  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Projects Overview</h1>
            <p className="text-gray-500">Track and manage your active projects</p>
          </div>
          <div className="flex gap-4">
            <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            <button
              onClick={() => setIsFormOpen(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              New Project
            </button>
            <button
              onClick={exportToExcel}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Export to Excel
            </button>
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors cursor-pointer"
            >
              Import from Excel
            </label>
          </div>
        </div>

        {/* Project Form Modal */}
        <ProjectForm
          isFormOpen={isFormOpen}
          setIsFormOpen={setIsFormOpen}
          editingProject={editingProject}
          setEditingProject={setEditingProject}
          handleSubmit={handleSubmit}
          formData={formData}
          setFormData={setFormData}
        />

        {/* Projects Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              handleEdit={handleEdit}
              handleDelete={handleDelete}
              toggleDeleteModal={toggleDeleteModal}
              deleteModal={deleteModal}
              hoveredMilestone={hoveredMilestone}
              setHoveredMilestone={setHoveredMilestone}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;