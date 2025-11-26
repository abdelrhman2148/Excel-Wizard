
import React, { useState } from 'react';
import { WizardResponse, AppMode } from '../types';
import { toast } from 'react-hot-toast';
import { Download, ChevronRight, AlertTriangle, CheckCircle, Info, MessageCircle, FileDown, Play, Save } from 'lucide-react';
import { generateTemplateWorkbook } from '../services/fileService';

interface FormulaOutputProps {
  result: WizardResponse;
  onFeedback: (isHelpful: boolean) => void;
  onDownloadDemo?: (formula: string) => void;
  onRunWorkflow?: () => void;
  onSaveWorkflow?: () => void;
  prompt: string;
  mode?: AppMode;
}

export const FormulaOutput: React.FC<FormulaOutputProps> = ({ 
  result, onFeedback, onDownloadDemo, onRunWorkflow, onSaveWorkflow, prompt, mode 
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [rated, setRated] = useState(false);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success("Copied!");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleRate = (helpful: boolean) => {
    if (!rated) {
      onFeedback(helpful);
      setRated(true);
    }
  };

  const downloadTemplate = () => {
    if (result.steps) {
      generateTemplateWorkbook(result.steps, prompt.slice(0, 20));
      toast.success("Template downloaded!");
    }
  };

  if (result.requiresMoreInfo) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 flex items-start space-x-4">
        <AlertTriangle className="text-yellow-500 flex-shrink-0" />
        <div>
          <h3 className="font-semibold text-yellow-800">Clarification Needed</h3>
          <p className="text-yellow-700 mt-1">I couldn't generate a result. Please provide more details.</p>
        </div>
      </div>
    );
  }

  // --- ANALYSIS VIEW ---
  if (result.responseType === 'analysis' && result.analysis) {
    const { healthScore, issues, summary } = result.analysis;
    const scoreColor = healthScore > 80 ? 'text-green-600' : healthScore > 50 ? 'text-amber-600' : 'text-red-600';
    
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">Sheet Health Report</h3>
            <div className={`text-3xl font-bold ${scoreColor}`}>{healthScore}/100</div>
          </div>
          <p className="text-gray-600 mb-6 border-b border-gray-100 pb-4">{summary}</p>
          
          <div className="space-y-4">
            {issues.map((issue, idx) => (
              <div key={idx} className={`p-4 rounded-lg border-l-4 ${
                issue.severity === 'critical' ? 'bg-red-50 border-red-500' : 
                issue.severity === 'warning' ? 'bg-amber-50 border-amber-500' : 'bg-blue-50 border-blue-500'
              }`}>
                <div className="flex justify-between items-start">
                  <h4 className="font-semibold text-gray-800">{issue.title}</h4>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                     issue.severity === 'critical' ? 'bg-red-100 text-red-700' : 
                     issue.severity === 'warning' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                  }`}>{issue.severity}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{issue.message}</p>
                <div className="mt-2 text-sm font-medium text-gray-700 flex items-center space-x-2">
                  <CheckCircle size={14} className="text-green-600" />
                  <span>Fix: {issue.suggestion}</span>
                </div>
              </div>
            ))}
          </div>

          {result.steps && result.steps.length > 0 && onRunWorkflow && (
             <div className="mt-6 pt-4 border-t border-gray-100">
               <button 
                 onClick={onRunWorkflow}
                 className="w-full flex items-center justify-center space-x-2 bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
               >
                 <Play size={18} fill="currentColor" />
                 <span>Apply Automatic Fixes</span>
               </button>
             </div>
          )}
        </div>
      </div>
    );
  }

  // --- Q&A VIEW ---
  if (result.responseType === 'answer' && result.qa) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-blue-100 rounded-full text-blue-600 flex-shrink-0">
            <MessageCircle size={24} />
          </div>
          <div>
             <h3 className="text-lg font-medium text-gray-900">Answer</h3>
             <p className="text-gray-700 mt-2 leading-relaxed text-lg">{result.qa.answerText}</p>
          </div>
        </div>
        
        {result.qa.supportingFormula && (
          <div className="mt-6 pt-4 border-t border-gray-100">
             <p className="text-xs uppercase text-gray-400 font-bold tracking-wider mb-2">Supporting Formula</p>
             <code className="block bg-gray-900 text-green-400 p-3 rounded-lg font-mono text-sm">
               {result.qa.supportingFormula}
             </code>
          </div>
        )}
      </div>
    );
  }

  // --- TEMPLATE / STEPS / AUTOMATE VIEW ---
  return (
    <div className="space-y-6">
      {/* Workflow Header if Automate */}
      {mode === 'automate' && (
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-800">Execution Plan</h3>
          <div className="flex space-x-2">
             {onSaveWorkflow && (
               <button onClick={onSaveWorkflow} className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex items-center space-x-1 text-sm font-medium">
                 <Save size={16} />
                 <span className="hidden sm:inline">Save Workflow</span>
               </button>
             )}
             {onRunWorkflow && (
               <button onClick={onRunWorkflow} className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 shadow-sm transition-colors text-sm font-bold">
                 <Play size={16} fill="currentColor" />
                 <span>Run on File</span>
               </button>
             )}
          </div>
        </div>
      )}

      {/* Debug Error */}
      {result.errorDebug && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg text-sm text-amber-700">
          <strong>Debug Insight: </strong> {result.errorDebug}
        </div>
      )}

      {/* Steps List */}
      {result.steps?.map((step, index) => (
        <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-excel-100 text-excel-700 text-xs font-bold">{index + 1}</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${
                step.action === 'formula' ? 'bg-green-100 text-green-700' :
                step.action === 'create_sheet' ? 'bg-purple-100 text-purple-700' :
                step.action === 'clean_data' ? 'bg-indigo-100 text-indigo-700' :
                step.action === 'header' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-700'
              }`}>
                {step.action.replace('_', ' ')}
              </span>
              <span className="text-sm font-semibold text-gray-500">
                {step.location}
              </span>
            </div>
            
            {step.action === 'formula' && (
              <button
                onClick={() => handleCopy(step.value, index)}
                className="text-gray-500 hover:text-excel-600 transition-colors text-sm font-medium flex items-center space-x-1"
              >
                <span>{copiedIndex === index ? 'Copied' : 'Copy'}</span>
              </button>
            )}
          </div>

          <div className="p-6 relative">
            {step.action === 'formula' ? (
              <code className="block bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-lg break-all">
                {step.value}
              </code>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg text-gray-800 font-medium border border-gray-200">
                {step.value}
              </div>
            )}
            <p className="mt-4 text-gray-600 text-sm leading-relaxed">{step.explanation}</p>
          </div>
        </div>
      ))}

      {/* Template Actions */}
      {mode === 'template' && result.steps && result.steps.some(s => s.action === 'create_sheet' || s.action === 'header') && (
        <div className="flex justify-center pt-4">
          <button 
             onClick={downloadTemplate}
             className="flex items-center space-x-2 bg-gray-900 text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl active:scale-95"
          >
            <FileDown size={20} />
            <span>Download Template (.xlsx)</span>
          </button>
        </div>
      )}

      {/* Preview Value (Legacy / Simple Gen) */}
      {result.previewValue && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600"><ChevronRight size={18} /></div>
            <div>
              <p className="text-xs text-blue-500 uppercase font-bold tracking-wide">Preview</p>
              <p className="text-blue-900 font-medium font-mono">{result.previewValue}</p>
            </div>
          </div>
          {onDownloadDemo && result.steps && result.steps[0].action === 'formula' && mode === 'generate' && (
            <button 
              onClick={() => onDownloadDemo(result.steps![0].value)}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-blue-200 text-blue-700 rounded-lg text-sm hover:bg-blue-50"
            >
              <Download size={16} /><span>Demo</span>
            </button>
          )}
        </div>
      )}

      {/* Feedback Controls */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
         <span className="text-xs text-gray-400 flex items-center gap-1">
           <Info size={12} /> AI can make mistakes.
         </span>
         <div className="flex space-x-2">
           <button onClick={() => handleRate(true)} disabled={rated} className={`p-2 hover:bg-green-50 rounded-full text-gray-400 hover:text-green-600 ${rated && 'opacity-30'}`}>
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714.211 1.412.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg>
           </button>
           <button onClick={() => handleRate(false)} disabled={rated} className={`p-2 hover:bg-red-50 rounded-full text-gray-400 hover:text-red-600 ${rated && 'opacity-30'}`}>
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714-.211-1.412-.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" /></svg>
           </button>
         </div>
      </div>
    </div>
  );
};
