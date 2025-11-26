import React from 'react';
import { HistoryItem } from '../types';
import { Clock, Trash2, FileSpreadsheet } from 'lucide-react';

interface HistorySidebarProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({ history, onSelect, onClear, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 flex flex-col border-l border-gray-100">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
        <div className="flex items-center space-x-2 text-gray-700">
          <Clock size={18} />
          <h3 className="font-semibold">History</h3>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
           &times;
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {history.length === 0 && (
          <div className="text-center text-gray-400 mt-10">
            <p className="text-sm">No history yet.</p>
          </div>
        )}
        
        {history.map((item) => (
          <div 
            key={item.id}
            onClick={() => onSelect(item)}
            className="group cursor-pointer bg-white hover:bg-slate-50 border border-gray-100 hover:border-excel-200 rounded-lg p-3 transition-all"
          >
            <div className="flex justify-between items-start mb-1">
               <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${item.platform === 'Excel' ? 'bg-excel-50 text-excel-700' : 'bg-sheets-50 text-sheets-600'}`}>
                 {item.platform}
               </span>
               <span className="text-[10px] text-gray-400">
                 {new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
               </span>
            </div>
            <p className="text-sm font-medium text-gray-800 line-clamp-2 mb-2">{item.prompt}</p>
            {item.result.steps.length > 0 && (
              <code className="text-xs font-mono text-gray-500 bg-gray-50 p-1 rounded block truncate">
                {item.result.steps[0].formula}
              </code>
            )}
            {item.result.steps.length > 1 && (
               <div className="text-[10px] text-blue-500 mt-1">
                 +{item.result.steps.length - 1} more steps
               </div>
            )}
          </div>
        ))}
      </div>

      {history.length > 0 && (
        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={onClear}
            className="w-full flex items-center justify-center space-x-2 text-red-500 hover:bg-red-50 py-2 rounded-lg text-sm transition-colors"
          >
            <Trash2 size={14} />
            <span>Clear History</span>
          </button>
        </div>
      )}
    </div>
  );
};