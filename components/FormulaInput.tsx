
import React, { useRef } from 'react';
import { Paperclip, X, Sparkles, Wrench, Bot, Lock } from 'lucide-react';
import { AppMode, Platform } from '../types';

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

  let placeholder = `Describe what you want to calculate...`;
  if (mode === 'debug') placeholder = `Paste the broken formula...`;
  if (mode === 'template') placeholder = `Describe the workbook you want to build (e.g. "Inventory Tracker")...`;
  if (mode === 'analyze') placeholder = `(Optional) Ask specifically what to look for, or just click Analyze...`;
  if (mode === 'chat') placeholder = `Ask a question about your data...`;
  if (mode === 'automate') placeholder = `Describe the changes (e.g., "Add a Total column", "Clean email column")...`;

  return (
    <div className={`bg-white p-2 rounded-2xl shadow-lg border border-gray-200 focus-within:ring-2 focus-within:ring-excel-400 transition-all duration-300 ${disabled ? 'opacity-70 grayscale' : ''}`}>
      
      {/* File Context Header */}
      {fileName && (
        <div className="px-4 py-2 flex flex-wrap items-center gap-2 border-b border-gray-100 bg-gray-50/50 rounded-t-xl mb-1">
          <div className="flex items-center bg-white border border-gray-200 rounded-full pl-3 pr-1 py-1 text-xs font-medium text-gray-700 shadow-sm">
            <span className="truncate max-w-[150px]">{fileName}</span>
            <button onClick={onClearFile} className="ml-2 p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-red-500">
              <X size={12} />
            </button>
          </div>
          <span className="text-xs text-gray-400 ml-1">{columns.length} cols detected</span>
        </div>
      )}

      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? "Feature locked on current plan." : placeholder}
          className="w-full min-h-[100px] p-4 pr-32 text-lg text-gray-700 placeholder-gray-400 bg-transparent border-none outline-none resize-none rounded-xl disabled:cursor-not-allowed"
          disabled={loading || disabled}
        />
        
        <div className="absolute bottom-3 left-3 flex space-x-2">
           <div className="relative group">
             <button 
               onClick={() => !fileDisabled && fileInputRef.current?.click()}
               title={fileDisabled ? "Upgrade to Attach Files" : "Attach Excel/CSV"}
               disabled={fileDisabled}
               className={`p-2 rounded-lg transition-colors ${fileName ? 'bg-green-50 text-green-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'} ${fileDisabled ? 'cursor-not-allowed opacity-50' : ''}`}
             >
               {fileDisabled ? <Lock size={18} /> : <Paperclip size={20} />}
               <input type="file" ref={fileInputRef} className="hidden" accept=".csv, .xlsx, .xls" onChange={handleFileChange}/>
             </button>
           </div>
        </div>

        <div className="absolute bottom-3 right-3">
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
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                <span>Thinking...</span>
              </>
            ) : disabled ? (
              <><span>Locked</span><Lock size={16}/></>
            ) : (
              <>
                <span>{mode === 'generate' ? 'Generate' : mode === 'automate' ? 'Plan' : mode === 'analyze' ? 'Scan' : mode === 'chat' ? 'Ask' : 'Fix'}</span>
                {mode === 'automate' ? <Bot size={16} /> : mode === 'generate' ? <Sparkles size={16} /> : <Wrench size={16} />}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
