import React from 'react';
import { Project } from './types';

type ProgressBarProps = {
  project: Project;
  hoveredMilestone: string | null;
  setHoveredMilestone: (milestone: string | null) => void;
};

const ProgressBar: React.FC<ProgressBarProps> = ({
  project,
  hoveredMilestone,
  setHoveredMilestone,
}) => {
//   const getProgressColor = (progress: number) => {
//     if (progress < 30) return 'bg-red-500';
//     if (progress < 70) return 'bg-yellow-500';
//     return 'bg-green-500';
//   };

  const getProgressColor = () => {
    return 'bg-green-300';
  };
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">Progress</span>
        <span className="text-sm font-semibold text-gray-900">{project.progress}%</span>
      </div>
      <div className="relative">
        {/* Milestone markers */}
        <div className="absolute top-0 left-0 w-full h-2 flex items-center">
          {project.milestones.map((milestone, mIndex) => (
            <div
              key={mIndex}
              className="absolute h-3 w-3 -mt-0.5 transform -translate-x-1/2 cursor-pointer"
              style={{ left: `${milestone.percent}%` }}
              onMouseEnter={() => setHoveredMilestone(`${project.id}-${milestone.percent}`)}
              onMouseLeave={() => setHoveredMilestone(null)}
            >
              <div className={`h-full w-full rounded-full ${milestone.completed ? 'bg-green-600' : 'bg-gray-400'}`} />
              
              {/* Milestone tooltip */}
              {hoveredMilestone === `${project.id}-${milestone.percent}` && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 z-10">
                  <div className="bg-gray-900 text-white text-xs rounded py-1 px-2">
                    <p className="font-semibold">{milestone.name}</p>
                    <p className="text-gray-300">{milestone.percent}% milestone</p>
                    <p className="text-gray-300">{milestone.descriptions}</p>
                    <p className="text-gray-300">{milestone.completed ? '✓ Completed' : '○ Pending'}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Progress bar */}
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full ${getProgressColor()} transition-all duration-500`}
            style={{ width: `${project.progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;