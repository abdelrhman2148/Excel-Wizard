
import React, { useRef } from 'react';
import { Paperclip, X, Sparkles, Wrench, Bot, Lock, Command, CornerDownLeft } from 'lucide-react';
import { AppMode, Platform } from '../types';
import { QUICK_SUGGESTIONS } from '../constants';

interface FormulaInputProps {
  value: string;
  mode: AppMode;
  platform: Platform;
  onChange: (val: string) => void;
  onSubmit: () => void;
  loading: boolean;
  onAttach: (file: File) => void;
  fileName: string | null;
  columns: string[];
  onClearFile: () => void;
  disabled?: boolean;
  fileDisabled?: boolean;
}

export const FormulaInput: React.FC<FormulaInputProps> = ({ 
  value, onChange, onSubmit, loading, mode, platform, 
  onAttach, fileName, columns, onClearFile, disabled, fileDisabled
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !disabled) {
      e.preventDefault();
      onSubmit();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onAttach(e.target.files[0]);
    }
  };

  const insertColumn = (col: string) => {
    onChange(value + (value.endsWith(' ') || value === '' ? '' : ' ') + `[${col}]`);
  };

  let placeholder = `Describe what you want to calculate...`;
  if (mode === 'debug') placeholder = `Paste the broken formula...`;
  if (mode === 'template') placeholder = `Describe the workbook (e.g. "Inventory Tracker")...`;
  if (mode === 'analyze') placeholder = `(Optional) What should I look for?...`;
  if (mode === 'chat') placeholder = `Ask a question about your data...`;
  if (mode === 'automate') placeholder = `Describe the changes (e.g. "Add a Total column")...`;

  return (
    <div className={`bg-white rounded-2xl shadow-xl border border-gray-200 transition-all duration-300 ${disabled ? 'opacity-70 grayscale' : 'focus-within:ring-4 focus-within:ring-excel-50 focus-within:border-excel-300'}`}>
      
      {/* File Context Header */}
      {fileName && (
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 rounded-t-xl">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-green-100 text-green-700 rounded-lg">
                <Paperclip size={14} />
              </div>
              <span className="text-sm font-semibold text-gray-700 truncate max-w-[200px]">{fileName}</span>
            </div>
            <button onClick={onClearFile} className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-gray-100">
              <X size={16} />
            </button>
          </div>
          
          {columns.length > 0 && (
             <div className="flex flex-wrap gap-1.5 max-h-[80px] overflow-y-auto scrollbar-hide">
               {columns.map(col => (
                 <button 
                   key={col}
                   onClick={() => insertColumn(col)}
                   className="text-[10px] bg-white border border-gray-200 text-gray-600 px-2 py-1 rounded hover:border-excel-400 hover:text-excel-700 transition-colors"
                 >
                   {col}
                 </button>
               ))}
             </div>
          )}
        </div>
      )}

      <div className="relative p-1">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? "Feature locked on current plan." : placeholder}
          className="w-full min-h-[120px] p-4 pr-32 text-lg text-gray-800 placeholder-gray-400 bg-transparent border-none outline-none resize-none rounded-xl disabled:cursor-not-allowed"
          disabled={loading || disabled}
        />
        
        {/* Bottom Actions */}
        <div className="absolute bottom-3 left-3 flex space-x-2">
           <button 
             onClick={() => !fileDisabled && fileInputRef.current?.click()}
             title={fileDisabled ? "Upgrade to Attach Files" : "Attach Excel/CSV"}
             disabled={fileDisabled}
             className={`p-2 rounded-lg transition-colors flex items-center space-x-2 text-sm font-medium ${fileName ? 'bg-green-50 text-green-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'} ${fileDisabled ? 'cursor-not-allowed opacity-50' : ''}`}
           >
             {fileDisabled ? <Lock size={16} /> : <Paperclip size={18} />}
             <span className="hidden sm:inline">{fileName ? 'Change File' : 'Attach File'}</span>
             <input type="file" ref={fileInputRef} className="hidden" accept=".csv, .xlsx, .xls" onChange={handleFileChange}/>
           </button>
        </div>

        <div className="absolute bottom-3 right-3 flex items-center space-x-3">
          <div className="hidden sm:flex items-center text-xs text-gray-300 gap-1 mr-2">
            <CornerDownLeft size={12} />
            <span>Enter to submit</span>
          </div>
          <button
            onClick={onSubmit}
            disabled={loading || disabled || (!value.trim() && mode !== 'analyze')}
            className={`
              flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl font-semibold text-white transition-all duration-200
              ${loading || disabled || (!value.trim() && mode !== 'analyze')
                ? 'bg-gray-300 cursor-not-allowed' 
                : mode === 'debug' ? 'bg-amber-500 hover:bg-amber-600' : 
                  mode === 'automate' ? 'bg-indigo-600 hover:bg-indigo-700' :
                  'bg-excel-600 hover:bg-excel-700 shadow-md hover:shadow-lg active:scale-95'}
            `}
          >
            {loading ? (
              <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
            ) : disabled ? (
              <Lock size={18}/>
            ) : (
              <>
                 <span className="hidden sm:inline">{mode === 'generate' ? 'Generate' : mode === 'automate' ? 'Plan' : mode === 'analyze' ? 'Scan' : 'Run'}</span>
                 {mode === 'automate' ? <Bot size={18} /> : mode === 'generate' ? <Sparkles size={18} /> : <Wrench size={18} />}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Quick Suggestions - Only show when empty */}
      {!value && !fileName && !disabled && (
         <div className="px-4 pb-4 flex flex-wrap gap-2 animate-fade-in">
           {QUICK_SUGGESTIONS.map(s => (
             <button 
               key={s} 
               onClick={() => onChange(s + " ")}
               className="text-xs bg-gray-50 text-gray-500 px-3 py-1.5 rounded-full hover:bg-excel-50 hover:text-excel-700 transition-colors border border-transparent hover:border-excel-200"
             >
               {s}
             </button>
           ))}
         </div>
      )}
    </div>
  );
};
