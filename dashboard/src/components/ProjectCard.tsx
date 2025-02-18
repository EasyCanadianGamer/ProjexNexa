import React from 'react';
import { Edit2, X, CheckCircle2, Clock } from 'lucide-react';
import { Project } from './types';
import ProgressBar from './ProgressBar';
import ProjectDelete from './ProjectDelete'
import { getPriorityColor } from './util'; // Import the utility function

type ProjectCardProps = {
  project: Project;
  handleEdit: (project: Project) => void;
  handleDelete: (id: string) => void;
  toggleDeleteModal: () => void;
  deleteModal: boolean; // Add this prop
  hoveredMilestone: string | null;
  setHoveredMilestone: (milestone: string | null) => void;
};


const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  handleEdit,
  handleDelete,
  toggleDeleteModal,
  deleteModal, 
  hoveredMilestone,
  setHoveredMilestone,
}) => {


  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow dark:bg-gray-900 dark:shadow-gray-500/50   ">
      {/* Project Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Name: {project.name}</h2>
          <div className="flex gap-2 mt-2">
            <span className={`text-xs px-2 py-1 rounded-full   ${getPriorityColor(project.priority)}`}>
              {project.priority} Priority
            </span>
            <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-600 "> 
              {project.category}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => handleEdit(project)}
            className="text-gray-400 hover:text-blue-600 dark:text-white"
          >
            <Edit2 className="h-5 w-5" />
          </button>
          <button 
            onClick={toggleDeleteModal}
            className="text-gray-400 hover:text-red-600 dark:text-white"
          >
            <X className="h-5 w-5" />
          </button>

          <ProjectDelete 
            open={deleteModal} 
            onClose={toggleDeleteModal} 
            onConfirm={() => {
              handleDelete(project.id);
              toggleDeleteModal();
            }} 
            message="Are you sure you want to delete this project?" 
          />        </div>
      </div>

      {/* Description */}
      <p className="text-gray-600 text-sm mb-6 line-clamp-2 dark:text-white">{project.description}</p>

      {/* Progress Section */}
      <ProgressBar 
        project={project}
        hoveredMilestone={hoveredMilestone}
        setHoveredMilestone={setHoveredMilestone}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 rounded-lg p-3 flex items-center space-x-3 dark:bg-blue-200">
          <div className="bg-blue-100 p-2 rounded-lg dark:bg-blue-300">
            <CheckCircle2 className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-800 ">Tasks</p>
            <p className="text-sm font-semibold text-gray-900">
              {project.tasks.completed}/{project.tasks.total}
            </p>
          </div>
        </div>

        <div className="bg-orange-50 rounded-lg p-3 flex items-center space-x-3 dark:bg-orange-200 ">
          <div className="bg-orange-100 p-2 rounded-lg dark:bg-orange-300">
            <Clock className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <p className="text-xs text-gray-600">Days Left</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-1000">{project.daysLeft}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;