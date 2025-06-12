
import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import ProjectForm from './components/ProjectForm';
import ProjectCard from './components/ProjectCard';
import SearchBar from './components/SearchBar';
import { Project, ProjectFormData } from './components/types';
import ExcelJS from 'exceljs';
import { openDB } from 'idb';
import { RxGear } from "react-icons/rx";
import Settings from "./components/Settings";
import { writeFile,BaseDirectory, exists} from '@tauri-apps/plugin-fs';
import { save } from '@tauri-apps/plugin-dialog';
const App: React.FC = () => {
  const [hoveredMilestone, setHoveredMilestone] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModal, showDeleteModal] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  async function getAvailableFilename(baseName: string, ext: string, dir: BaseDirectory): Promise<string> {
    let index = 0;
    let filename = `${baseName}.${ext}`;
  
    while (await exists(filename, { baseDir: dir })) {
      index++;
      filename = `${baseName}(${index}).${ext}`;
    }
  
    return filename;
  }
  const openSettings = () => {
      setIsSettingsOpen(true);
  };

  const closeSettings = () => {
      setIsSettingsOpen(false);
  };


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
    priority: 'Medium',
    category: '',
    milestones: [
      { percent: 20, name: '', descriptions: '', completed: false },
      { percent: 40, name: '', descriptions: '', completed: false },
      { percent: 60, name: '', descriptions: '', completed: false },
      { percent: 80, name: '', descriptions: '', completed: false },
      { percent: 100, name: '', descriptions: '', completed: false }
    ],
    deadline: null,
    daysLeft: 0,  // Initialize as 0 or calculate dynamically
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

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Projects');
  
    // Add headers
    worksheet.addRow([
      'ID', 'Name', 'Description', 'Progress', 'Priority', 'Days Left',
      'Deadline', 'Category',
      'Milestone 1 (20%)', 'Milestone 2 (40%)', 'Milestone 3 (60%)',
      'Milestone 4 (80%)', 'Milestone 5 (100%)',
    ]);
  
    // Add data rows
    projects.forEach((project) => {
      worksheet.addRow([
        project.id,
        project.name,
        project.description,
        `${project.progress}%`,
        project.priority,
        project.daysLeft,
        project.deadline,
        project.category,
        ...project.milestones.map(m => 
          `${m.name}: ${m.descriptions} - ${m.completed ? 'Completed' : 'Not Completed'}`
        ),
      ]);
    });
  
    // Generate Excel buffer
    const buffer = await workbook.xlsx.writeBuffer();
    const data = new Uint8Array(buffer);


    // try{
    //   const filename = await getAvailableFilename('projects', 'xlsx', BaseDirectory.Download);
    //   await writeFile(filename, data, { baseDir: BaseDirectory.Download });
      
    //   // console.log(`✅ Saved as: ${filename}`);

    // }
    try {
      const filename = await getAvailableFilename('projects', 'xlsx', BaseDirectory.Download);

      // Show save dialog
      const filePath = await save({
        defaultPath: filename,
        filters: [{ name: 'Excel Files', extensions: ['xlsx'] }],
      });
  
      if (filePath) {
        // Write binary file
        await writeFile(filePath, data, { baseDir: BaseDirectory.Download });
        
        console.log("✅ File saved successfully:", filePath);
        return true;
      } else {
        console.log("⚠️ Save operation canceled by user");
        return false;
      }
    }
     catch (error) {
      console.error("❌ Error saving file:", error);
      throw error;
    }
  };
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
  
    const reader = new FileReader();
    reader.onload = async (e) => {
      const data = e.target?.result;
      if (!data) return;
  
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(data as ArrayBuffer);
  
      const worksheet = workbook.getWorksheet(1); // Get the first worksheet
      if (!worksheet) {
        console.error('No worksheet found in the Excel file.');
        return;
      }
  
      const importedProjects: Project[] = [];
  
      worksheet.eachRow((row, rowNumber) => {
        // Row 1 is the header
        if (rowNumber === 1) return;
  
        const project: Project = {
          id: row.getCell(1).text || crypto.randomUUID(), // Use Excel UUID or fallback
          name: row.getCell(2).text,
          description: row.getCell(3).text,
          progress: parseInt(row.getCell(4).text, 10) || 0,
          priority: (row.getCell(5).text as 'High' | 'Medium' | 'Low') || 'Medium',
          daysLeft: parseInt(row.getCell(6).text, 10) || 0,
          deadline: row.getCell(7).text || '',
          category: row.getCell(8).text || '',
          tasks: { completed: 0, total: 0 }, // Static/default, or enhance if needed
          milestones: [
            parseMilestone(row.getCell(9).text, 20),
            parseMilestone(row.getCell(10).text, 40),
            parseMilestone(row.getCell(11).text, 60),
            parseMilestone(row.getCell(12).text, 80),
            parseMilestone(row.getCell(13).text, 100),
          ],
        };
  
        importedProjects.push(project);
      });
  
      console.log('Imported Projects:', importedProjects);
      setProjects((prev) => [...prev, ...importedProjects]);
    };
  
    reader.readAsArrayBuffer(file);
  };
  
  const parseMilestone = (text: string, percent: number) => {
    const [description, status] = text.split(' - ');
    return {
      percent,
      name: `Milestone ${percent}%`,
      descriptions: description?.trim() || '',
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
<main id='main' >
<div className="min-h-screen bg-gray-50 dark:bg-gray-900 dark:text-white p-8">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white p-8">Projects Overview</h1>
            <p className="text-gray-500">Track and manage your active projects</p>
          </div>
          <div className="flex gap-4">
            <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            <button
              onClick={() => setIsFormOpen(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors dark:bg-blue-300 dark:text-black dark:hover:bg-blue-400"
            >
              <Plus className="h-5 w-5" />
              New Project
            </button>
            <button
              onClick={exportToExcel}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors dark:bg-green-300 dark:text-black dark:hover:bg-green-400"
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
              className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors cursor-pointer dark:bg-purple-300 dark:text-black balck:hover:bg-purple:400"
            >
              Import from Excel
            </label>

            <button
                className="flex items-center gap-2 text-black px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors dark:text-white dark:hover:bg-gray-600"
                onClick={openSettings}
            >
                <RxGear />
            </button>

            <Settings isOpen={isSettingsOpen} onClose={closeSettings} />

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
</main>
  );
};

export default App;