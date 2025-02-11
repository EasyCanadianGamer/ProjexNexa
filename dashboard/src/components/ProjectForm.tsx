import React from 'react';
import { X } from 'lucide-react';
import { ProjectFormData, Project } from './types';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";


type ProjectFormProps = {
  isFormOpen: boolean;
  setIsFormOpen: (isOpen: boolean) => void;
  editingProject: ProjectFormData | null;
  setEditingProject: (project: Project | null) => void; // Update this type
  handleSubmit: (e: React.FormEvent) => void;
  formData: ProjectFormData;
  setFormData: (formData: ProjectFormData) => void;
};



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
deadline:'',
daysLeft: 0,  // Initialize as 0 or calculate dynamically
};




const ProjectForm: React.FC<ProjectFormProps> = ({
  isFormOpen,
  setIsFormOpen,
  editingProject,
  setEditingProject,
  handleSubmit,
  formData,
  setFormData,
}) => {
  if (!isFormOpen) return null;



  const handleDateChange = (date: Date | null) => {
    // Update deadline
    const newDeadline = date ? date.toISOString().split('T')[0] : null;
    
    // Calculate daysLeft based on the new deadline
    const daysLeft = newDeadline ? calculateDaysLeft(newDeadline) : 0;
  
    // Update both deadline and daysLeft
    setFormData({ ...formData, deadline: newDeadline, daysLeft });
  };
 // Function to reset the form to initial state
 const handleCancel = () => {
  setIsFormOpen(false);
  setEditingProject(null);
  setFormData(initialFormData);  // Reset form to initial data
};


  const calculateDaysLeft = (deadline: string): number => {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const difference = deadlineDate.getTime() - today.getTime();
    return Math.ceil(difference / (1000 * 3600 * 24)); // Convert from ms to days
  };
  return (
    <div className="fixed inset-0 backdrop-blur flex items-center justify-center z-50    ">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto dark:bg-gray-900">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {editingProject ? 'Edit Project' : 'New Project'}
          </h2>
          <button 
            onClick={handleCancel}
            className="text-gray-500 hover:text-gray-700 dark:text-white dark:hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Form fields go here */}
          <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-50">Project Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:shadow-white "
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-50">Description</label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:shadow-white"
                    placeholder="Describe the project's goals and scope..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-50">Category</label>
                    <input
                      type="text"
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:shadow-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-50">Priority</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as "High" | "Medium" | "Low" })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:shadow-white"
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-50">Total Tasks</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.tasks.total}
                      onChange={(e) => setFormData({
                        ...formData,
                        tasks: { ...formData.tasks, total: parseInt(e.target.value) }
                      })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:shadow-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-50">Completed Tasks</label>
                    <input
                      type="number"
                      required
                      min="0"
                      max={formData.tasks.total}
                      value={formData.tasks.completed}
                      onChange={(e) => setFormData({
                        ...formData,
                        tasks: { ...formData.tasks, completed: parseInt(e.target.value) }
                      })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:shadow-white"
                    />
                  </div>
                </div>
                <div>
  <label className="block text-sm font-medium text-gray-700 dark:text-gray-50">Deadline</label>
  <DatePicker
    selected={formData.deadline ? new Date(formData.deadline) : null}
    onChange={handleDateChange}
    dateFormat="yyyy-MM-dd"
    placeholderText="Select a deadline"
    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-white dark:focus:border-blue-200 dark:shadow-white"
  />

  
</div>
<div>
  <label className="block text-sm font-medium text-gray-700 dark:text-gray-50">Days Left</label>
  <input
    type="number"
    required
    min="0"
    value={formData.daysLeft}
    readOnly
    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:shadow-white"
  />
</div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-50">Milestones</label>
                  <div className="space-y-4">
                    {formData.milestones.map((milestone, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <span className="text-sm font-medium w-16">{milestone.percent}%</span>
                        <input
                          type="text"
                          required
                          placeholder="Milestone name"
                          value={milestone.name}
                          onChange={(e) => {
                            const newMilestones = [...formData.milestones];
                            newMilestones[index] = { ...milestone, name: e.target.value };
                            setFormData({ ...formData, milestones: newMilestones });
                          }}
                          className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:shadow-white"
                        />
                                                <input
                          type="text"
                          required
                          placeholder="Milestone description"
                          value={milestone.descriptions}
                          onChange={(e) => {
                            const newMilestones = [...formData.milestones];
                            newMilestones[index] = { ...milestone, descriptions: e.target.value };
                            setFormData({ ...formData, milestones: newMilestones });
                          }}
                          className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:shadow-white"
                        />
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={milestone.completed}
                            onChange={(e) => {
                              const newMilestones = [...formData.milestones];
                              newMilestones[index] = { ...milestone, completed: e.target.checked };
                              setFormData({ ...formData, milestones: newMilestones });
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-white"
                          />
                          <span className="text-sm text-gray-600 dark:text-gray-50">Completed</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 dark:border-white text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-300 dark:hover:bg-blue-400 dark:text-black"
                  >
                    {editingProject ? 'Save Changes' : 'Create Project'}
                  </button>
                </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectForm;