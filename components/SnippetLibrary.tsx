import React, { useState } from 'react';
import { Search } from 'lucide-react';

const SNIPPETS = [
  { id: '1', title: 'Sum by Condition', desc: 'Sum values in one column based on criteria in another.', formula: '=SUMIF(range, criteria, sum_range)' },
  { id: '2', title: 'VLOOKUP Exact Match', desc: 'Find a value in a table.', formula: '=VLOOKUP(lookup_value, table_array, col_index_num, FALSE)' },
  { id: '3', title: 'Index Match', desc: 'More flexible lookup than VLOOKUP.', formula: '=INDEX(return_range, MATCH(lookup_value, lookup_range, 0))' },
  { id: '4', title: 'Extract Year', desc: 'Get the year from a date cell.', formula: '=YEAR(A1)' },
  { id: '5', title: 'Concatenate Names', desc: 'Join first and last name.', formula: '=A1 & " " & B1' },
  { id: '6', title: 'Count Non-Empty', desc: 'Count cells with data.', formula: '=COUNTA(A1:A10)' },
  { id: '7', title: 'Percentage Change', desc: 'Calculate growth between two numbers.', formula: '=(New_Value - Old_Value) / Old_Value' },
  { id: '8', title: 'If Error Then Blank', desc: 'Hide errors cleanly.', formula: '=IFERROR(formula, "")' },
];

interface SnippetLibraryProps {
  onSelect: (formula: string) => void;
}

export const SnippetLibrary: React.FC<SnippetLibraryProps> = ({ onSelect }) => {
  const [search, setSearch] = useState('');

  const filtered = SNIPPETS.filter(s => 
    s.title.toLowerCase().includes(search.toLowerCase()) || 
    s.desc.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center space-x-2">
        <Search size={16} className="text-gray-400" />
        <input 
          type="text" 
          placeholder="Search common formulas..." 
          className="bg-transparent border-none outline-none text-sm w-full"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      <div className="max-h-[300px] overflow-y-auto p-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
        {filtered.map(item => (
          <button 
            key={item.id}
            onClick={() => onSelect(item.formula)}
            className="text-left p-3 hover:bg-excel-50 rounded-lg border border-transparent hover:border-excel-100 transition-all group"
          >
            <div className="font-semibold text-gray-800 text-sm group-hover:text-excel-700">{item.title}</div>
            <div className="text-xs text-gray-500 mt-1">{item.desc}</div>
          </button>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-2 text-center py-8 text-gray-400 text-sm">No snippets found</div>
        )}
      </div>
    </div>
  );
};
