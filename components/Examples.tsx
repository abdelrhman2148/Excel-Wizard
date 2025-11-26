import React from 'react';
import { EXAMPLES } from '../constants';

interface ExamplesProps {
  onSelect: (text: string) => void;
}

export const Examples: React.FC<ExamplesProps> = ({ onSelect }) => {
  return (
    <div className="space-y-4 pt-4 border-t border-gray-100">
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider text-center">Or try these examples</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {EXAMPLES.map((ex, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(ex)}
            className="text-left px-4 py-3 bg-white border border-gray-200 rounded-xl hover:border-excel-300 hover:shadow-sm hover:bg-excel-50/50 transition-all duration-200 text-gray-600 text-sm font-medium"
          >
            {ex}
          </button>
        ))}
      </div>
    </div>
  );
};
