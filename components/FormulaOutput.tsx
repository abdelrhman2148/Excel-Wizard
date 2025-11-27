

import React, { useState } from 'react';
import { WizardResponse, AppMode } from '../types';
import { toast } from 'react-hot-toast';
import { Download, ChevronRight, AlertTriangle, CheckCircle, Info, MessageCircle, FileDown, Play, Save, Copy, Terminal, Activity, Bot } from 'lucide-react';
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
      <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 flex items-start space-x-4">
        <div className="p-2 bg-yellow-100 rounded-lg text-yellow-600"><AlertTriangle size={24} /></div>
        <div>
          <h3 className="font-bold text-yellow-800 text-lg">Clarification Needed</h3>
          <p className="text-yellow-700 mt-1 leading-relaxed">I couldn't generate a clear result. Please provide column names or more details about your data.</p>
        </div>
      </div>
    );
  }

  // --- ANALYSIS VIEW ---
  if (result.responseType === 'analysis' && result.analysis) {
    const { healthScore, issues, summary } = result.analysis;
    const scoreColor = healthScore > 80 ? 'text-green-600' : healthScore > 50 ? 'text-amber-600' : 'text-red-600';
    
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
            <Activity size={20} className="text-gray-400" /> Analysis Report
          </h3>
          <div className={`text-4xl font-black ${scoreColor}`}>{healthScore}</div>
        </div>
        
        <div className="p-6">
          <p className="text-gray-600 mb-8 text-lg leading-relaxed">{summary}</p>
          
          <div className="space-y-4">
            {issues.map((issue, idx) => (
              <div key={idx} className={`p-4 rounded-xl border-l-4 ${
                issue.severity === 'critical' ? 'bg-red-50 border-red-500' : 
                issue.severity === 'warning' ? 'bg-amber-50 border-amber-500' : 'bg-blue-50 border-blue-500'
              }`}>
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-bold text-gray-900">{issue.title}</h4>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                     issue.severity === 'critical' ? 'bg-red-100 text-red-700' : 
                     issue.severity === 'warning' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                  }`}>{issue.severity}</span>
                </div>
                <p className="text-gray-700">{issue.message}</p>
                <div className="mt-3 flex items-center space-x-2 text-sm font-medium text-gray-900 bg-white/50 p-2 rounded-lg inline-block">
                  <CheckCircle size={14} className="text-green-600" />
                  <span>Suggestion: {issue.suggestion}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {result.steps && result.steps.length > 0 && onRunWorkflow && (
           <div className="p-6 bg-gray-50 border-t border-gray-100 text-center">
             <button 
               onClick={onRunWorkflow}
               className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-indigo-600 text-white px-8 py-3 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 font-bold"
             >
               <Play size={18} fill="currentColor" />
               <span>Apply {result.steps.length} Fixes</span>
             </button>
           </div>
        )}
      </div>
    );
  }

  // --- Q&A VIEW ---
  if (result.responseType === 'answer' && result.qa) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 space-y-6">
        <div className="flex items-start space-x-5">
          <div className="p-3 bg-blue-100 rounded-full text-blue-600 flex-shrink-0 mt-1">
            <MessageCircle size={24} />
          </div>
          <div className="flex-1">
             <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">AI Response</h3>
             <p className="text-gray-900 text-xl leading-relaxed">{result.qa.answerText}</p>
          </div>
        </div>
        
        {result.qa.supportingFormula && (
          <div className="bg-gray-900 rounded-xl p-6 overflow-x-auto">
             <div className="flex justify-between items-center mb-2 text-gray-400 text-xs uppercase font-bold tracking-wider">
               <span>Supporting Formula</span>
             </div>
             <code className="font-mono text-green-400 text-lg">
               {result.qa.supportingFormula}
             </code>
          </div>
        )}
      </div>
    );
  }

  // --- FORMULA / STEPS VIEW ---
  return (
    <div className="space-y-6">
      
      {/* Workflow Header if Automate */}
      {mode === 'automate' && (
        <div className="flex items-center justify-between bg-indigo-50 p-4 rounded-xl border border-indigo-100">
          <div className="flex items-center gap-2">
            <Bot className="text-indigo-600" />
            <h3 className="font-bold text-indigo-900">Execution Plan Created</h3>
          </div>
          <div className="flex space-x-2">
             {onSaveWorkflow && (
               <button onClick={onSaveWorkflow} className="px-4 py-2 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors font-medium">
                 Save
               </button>
             )}
             {onRunWorkflow && (
               <button onClick={onRunWorkflow} className="flex items-center space-x-2 bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 shadow-sm font-bold">
                 <Play size={16} fill="currentColor" />
                 <span>Run</span>
               </button>
             )}
          </div>
        </div>
      )}

      {/* Debug Error Message */}
      {result.errorDebug && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl">
          <h4 className="font-bold text-red-700 flex items-center gap-2"><Terminal size={16}/> Debug Analysis</h4>
          <p className="text-red-800 mt-1">{result.errorDebug}</p>
        </div>
      )}

      {/* Steps List */}
      <div className="space-y-4">
        {result.steps?.map((step, index) => (
          <div key={index} className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300">
            {/* Step Header */}
            <div className="bg-gray-50/80 backdrop-blur-sm px-6 py-3 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                 <span className={`text-xs font-black uppercase px-2 py-1 rounded tracking-wide ${
                    step.action === 'formula' ? 'bg-green-100 text-green-700' :
                    step.action === 'create_sheet' ? 'bg-purple-100 text-purple-700' :
                    step.action === 'clean_data' ? 'bg-indigo-100 text-indigo-700' :
                    step.action === 'header' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-700'
                 }`}>
                   {step.action.replace('_', ' ')}
                 </span>
                 <span className="text-gray-400 text-sm font-mono">{step.location}</span>
              </div>
              
              {step.action === 'formula' && (
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-gray-300 hidden sm:inline">Press C to Copy</span>
                  <button
                    onClick={() => handleCopy(step.value, index)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg hover:border-excel-500 hover:text-excel-600 text-gray-600 text-sm font-medium transition-all"
                  >
                    {copiedIndex === index ? <CheckCircle size={16} className="text-green-500"/> : <Copy size={16}/>}
                    <span>{copiedIndex === index ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Step Content */}
            <div className="p-6">
              {step.action === 'formula' ? (
                <div className="relative group">
                  <code className="block bg-gray-900 text-green-400 p-5 rounded-xl font-mono text-xl sm:text-2xl break-all shadow-inner">
                    {step.value}
                  </code>
                </div>
              ) : (
                <div className="bg-white border-2 border-dashed border-gray-200 p-4 rounded-xl text-gray-800 font-bold text-lg text-center">
                  {step.value}
                </div>
              )}
              
              <div className="mt-4 flex items-start gap-3">
                <div className="mt-1 p-1 bg-blue-50 text-blue-500 rounded-full"><Info size={14}/></div>
                <p className="text-gray-600 text-lg leading-relaxed">{step.explanation}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Legacy Preview / Demo Section */}
      {result.previewValue && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center text-blue-600 font-bold text-lg">
               =
             </div>
             <div>
               <p className="text-xs text-blue-500 uppercase font-bold tracking-wider">Live Preview</p>
               <p className="text-blue-900 text-xl font-bold font-mono">{result.previewValue}</p>
               <p className="text-xs text-blue-400 mt-0.5">Calculated based on sample row 1</p>
             </div>
          </div>
          
          {onDownloadDemo && result.steps && result.steps[0].action === 'formula' && mode === 'generate' && (
            <button 
              onClick={() => onDownloadDemo(result.steps![0].value)}
              className="flex items-center space-x-2 px-5 py-2.5 bg-white shadow-sm text-blue-700 rounded-xl hover:bg-blue-50 hover:shadow font-medium transition-all"
            >
              <Download size={18} /><span>Download Demo Sheet</span>
            </button>
          )}
        </div>
      )}

      {/* Feedback Controls */}
      <div className="flex justify-center gap-4 pt-4">
        <button onClick={() => handleRate(true)} disabled={rated} className={`flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 hover:border-green-500 hover:bg-green-50 text-gray-500 hover:text-green-600 transition-all ${rated && 'opacity-50'}`}>
          <span className="text-xl">👍</span> <span className="text-sm font-medium">Helpful</span>
        </button>
        <button onClick={() => handleRate(false)} disabled={rated} className={`flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 hover:border-red-500 hover:bg-red-50 text-gray-500 hover:text-red-600 transition-all ${rated && 'opacity-50'}`}>
          <span className="text-xl">👎</span> <span className="text-sm font-medium">Not helpful</span>
        </button>
      </div>
    </div>
  );
};