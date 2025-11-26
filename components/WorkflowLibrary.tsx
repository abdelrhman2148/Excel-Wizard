
import React from 'react';
import { WorkflowIcon, Play, Trash2, ArrowRight } from 'lucide-react';
import { Workflow } from '../types';

interface WorkflowLibraryProps {
  workflows: Workflow[];
  onRun: (workflow: Workflow) => void;
  onDelete: (id: string) => void;
}

export const WorkflowLibrary: React.FC<WorkflowLibraryProps> = ({ workflows, onRun, onDelete }) => {
  if (workflows.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
        <div className="mx-auto bg-gray-100 p-4 rounded-full w-16 h-16 flex items-center justify-center text-gray-400 mb-4">
          <WorkflowIcon size={32} />
        </div>
        <h3 className="text-lg font-medium text-gray-900">No Saved Workflows</h3>
        <p className="text-gray-500 max-w-sm mx-auto mt-2">
          Create an automation plan in the "Automate" tab and click "Save Workflow" to build your library.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {workflows.map(wf => (
        <div key={wf.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <WorkflowIcon size={18} />
              </div>
              <h3 className="font-bold text-gray-800">{wf.name}</h3>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(wf.id); }}
              className="text-gray-300 hover:text-red-500 transition-colors p-1"
            >
              <Trash2 size={16} />
            </button>
          </div>
          
          <p className="text-sm text-gray-500 mb-4 line-clamp-2 h-10">
            {wf.description}
          </p>
          
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
             <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded">
               {wf.steps.length} Steps
             </span>
             <button 
               onClick={() => onRun(wf)}
               className="flex items-center space-x-1 text-sm font-semibold text-indigo-600 hover:text-indigo-800"
             >
               <span>Load & Run</span>
               <ArrowRight size={16} />
             </button>
          </div>
        </div>
      ))}
    </div>
  );
};
