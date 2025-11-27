
import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { FormulaInput } from './components/FormulaInput';
import { FormulaOutput } from './components/FormulaOutput';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { Examples } from './components/Examples';
import { HistorySidebar } from './components/HistorySidebar';
import { SnippetLibrary } from './components/SnippetLibrary';
import { WorkflowLibrary } from './components/WorkflowLibrary';
import { UpgradeModal } from './components/UpgradeModal';
import { TeamSettings } from './components/TeamSettings';
import { AuthScreen } from './components/AuthScreen';
import { Marketplace } from './components/Marketplace';
import { DeveloperPortal } from './components/DeveloperPortal';
import { OnboardingModal } from './components/OnboardingModal';

import { generateOrDebugFormula } from './services/geminiService';
import { parseFileContext, generateDemoSheet, executeWorkflow } from './services/fileService';
import { 
  loginMock, getCurrentUser, logoutMock, incrementUsage, checkUsageLimit, upgradeUserPlan, DAILY_LIMIT_FREE, completeOnboarding 
} from './services/authService';
import { trackEvent, logFeedback } from './services/analyticsService';

import { WizardResponse, AnalyticsData, AppMode, Platform, FileContextData, HistoryItem, TeamSettingsData, Workflow, User, PlanType } from './types';
import { Toaster, toast } from 'react-hot-toast';
import { Sparkles, Wrench, BookOpen, Clock, LayoutTemplate, Activity, MessageSquare, Bot, Workflow as WorkflowIcon, ShoppingBag, Terminal } from 'lucide-react';

export default function App() {
  // --- Auth State ---
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // --- App State ---
  const [prompt, setPrompt] = useState('');
  const [mode, setMode] = useState<AppMode>('generate');
  const [activeTab, setActiveTab] = useState<'tool' | 'snippets' | 'workflows' | 'marketplace' | 'developer'>('tool');
  const [platform, setPlatform] = useState<Platform>('Excel');
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<WizardResponse | null>(null);
  
  // File Context
  const [fileContext, setFileContext] = useState<FileContextData | null>(null);
  const [rawFile, setRawFile] = useState<File | null>(null);

  // Modals
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  const [teamSettings, setTeamSettings] = useState<TeamSettingsData>(() => {
    const saved = localStorage.getItem('excel_wizard_team_settings');
    return saved ? JSON.parse(saved) : { preferredFunctions: '', formattingRules: '', language: 'English' };
  });

  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem('excel_wizard_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [workflows, setWorkflows] = useState<Workflow[]>(() => {
    const saved = localStorage.getItem('excel_wizard_workflows');
    return saved ? JSON.parse(saved) : [];
  });

  // --- Initialization ---
  useEffect(() => {
    const u = getCurrentUser();
    setUser(u);
    if (u && !u.hasOnboarded) {
      setShowOnboarding(true);
    }
    setLoadingAuth(false);
    
    // Tip of the Day
    if (u) {
      setTimeout(() => {
        const tips = ["Pro Tip: Use 'Debug' mode to fix errors instantly.", "Did you know? You can upload a sheet for context.", "Try 'Automate' to run multiple steps at once."];
        toast(tips[Math.floor(Math.random() * tips.length)], { icon: '💡', duration: 4000, position: 'bottom-center' });
      }, 5000);
    }
  }, []);

  useEffect(() => { localStorage.setItem('excel_wizard_history', JSON.stringify(history)); }, [history]);
  useEffect(() => { localStorage.setItem('excel_wizard_team_settings', JSON.stringify(teamSettings)); }, [teamSettings]);
  useEffect(() => { localStorage.setItem('excel_wizard_workflows', JSON.stringify(workflows)); }, [workflows]);

  // --- Keyboard Shortcuts ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

      // Shortcuts that work when NOT typing
      if (!isInput) {
         if (e.key.toLowerCase() === 'c' && result?.steps?.[0]?.action === 'formula') {
           e.preventDefault();
           navigator.clipboard.writeText(result.steps[0].value);
           toast.success("Copied to clipboard!");
         }
         if (e.key.toLowerCase() === 'd') {
           e.preventDefault();
           setMode('debug');
           setActiveTab('tool');
           toast("Switched to Debug mode");
         }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [result]);

  // --- Auth Handlers ---
  const handleLogin = async (email: string) => {
    const u = await loginMock(email);
    setUser(u);
    trackEvent('login', { userId: u.id });
    if (!u.hasOnboarded) setShowOnboarding(true);
    toast.success(`Welcome back, ${u.name}!`);
  };

  const handleLogout = () => {
    logoutMock();
    setUser(null);
    setResult(null);
    setFileContext(null);
  };

  const handleUpgrade = (plan: PlanType) => {
    const updated = upgradeUserPlan(plan);
    if (updated) {
      setUser(updated);
      trackEvent('upgrade', { plan });
      toast.success(`Upgraded to ${plan.toUpperCase()} Plan!`);
    }
  };

  const handleCompleteOnboarding = () => {
    completeOnboarding();
    if (user) setUser({ ...user, hasOnboarded: true });
    setShowOnboarding(false);
    trackEvent('onboarding_complete');
  };

  // --- Feature Gates ---
  const isFeatureLocked = (featureMode: AppMode): boolean => {
    if (!user) return true;
    if (user.plan === 'free') {
      if (featureMode === 'debug' || featureMode === 'automate' || featureMode === 'analyze' || featureMode === 'chat') {
        return true;
      }
    }
    return false;
  };

  const isFileAccessLocked = (): boolean => {
    return user?.plan === 'free';
  };

  // --- Handlers ---
  const handleAttachFile = async (file: File) => {
    if (isFileAccessLocked()) {
      setShowUpgrade(true);
      return;
    }
    try {
      setRawFile(file);
      const toastId = toast.loading("Reading workbook structure...");
      const context = await parseFileContext(file);
      setFileContext(context);
      trackEvent('file_upload', { type: file.type });
      toast.dismiss(toastId);
      toast.success(`Loaded ${file.name}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to read file.");
    }
  };

  const handleSubmit = async () => {
    if (!user) return;

    if (!checkUsageLimit(user)) {
      toast.error(`Daily limit reached (${DAILY_LIMIT_FREE} requests). Upgrade to continue.`);
      setShowUpgrade(true);
      return;
    }

    if (isFeatureLocked(mode)) {
      setShowUpgrade(true);
      return;
    }

    if (!prompt.trim() && mode !== 'analyze') {
      toast.error("Please enter a request.");
      return;
    }
    
    if ((mode === 'analyze' || mode === 'automate') && !fileContext) {
      toast.error(`Please attach a file to ${mode}.`);
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // Deduct credit
      const updatedUser = incrementUsage(user);
      setUser(updatedUser);

      const data = await generateOrDebugFormula(prompt, mode, platform, fileContext, teamSettings);
      setResult(data);
      trackEvent('generate_success', { mode, platform });

      if (!data.requiresMoreInfo) {
         const newItem: HistoryItem = {
           id: Date.now().toString(),
           type: mode,
           platform: platform,
           prompt: prompt || (mode === 'analyze' ? 'File Analysis' : 'Automated Task'),
           result: data,
           timestamp: Date.now()
         };
         setHistory(prev => [newItem, ...prev]);
      } else {
        toast("I need more info.", { icon: '🤔' });
      }

    } catch (error) {
      console.error(error);
      trackEvent('generate_error', { mode });
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadDemo = (formula: string) => {
    if (fileContext && fileContext.fullData) {
      try {
        generateDemoSheet(fileContext.fullData, formula, fileContext.fileName);
        toast.success("Download started!");
        trackEvent('download_demo');
      } catch (e) {
        toast.error("Could not generate download.");
      }
    }
  };

  const handleRunWorkflow = async () => {
    if (!rawFile || !result?.steps) {
      toast.error("No file or steps to execute.");
      return;
    }
    const t = toast.loading("Executing workflow on file...");
    try {
      await executeWorkflow(rawFile, result.steps);
      toast.dismiss(t);
      toast.success("Workflow complete! File downloaded.");
      trackEvent('run_workflow');
    } catch (e) {
      console.error(e);
      toast.dismiss(t);
      toast.error("Execution failed.");
    }
  };

  const handleSaveWorkflow = () => {
    if (!result?.steps || result.steps.length === 0) return;
    const name = window.prompt("Name this workflow:", prompt.slice(0, 30));
    if (name) {
      const newWorkflow: Workflow = {
        id: Date.now().toString(),
        name,
        description: prompt,
        steps: result.steps,
        platform,
        timestamp: Date.now()
      };
      setWorkflows(prev => [newWorkflow, ...prev]);
      toast.success("Workflow saved to library!");
      trackEvent('save_workflow');
    }
  };

  const handleRunSavedWorkflow = (workflow: Workflow) => {
    if (!rawFile) {
      toast.error("Attach a file first to run this workflow.");
      return;
    }
    setPrompt(workflow.description);
    setMode('automate');
    setResult({
      responseType: 'steps',
      steps: workflow.steps,
      requiresMoreInfo: false
    });
    toast.success(`Loaded "${workflow.name}". Click 'Run on File' to execute.`);
    setActiveTab('tool');
  };

  const handleFeedback = (helpful: boolean) => {
     logFeedback({
       id: Date.now().toString(),
       userId: user?.id || 'anon',
       prompt,
       response: JSON.stringify(result),
       isHelpful: helpful,
       timestamp: Date.now()
     });
     toast.success("Thanks for your feedback!");
  };

  // --- Render ---
  if (loadingAuth) return null;
  if (!user) return <AuthScreen onLogin={handleLogin} />;

  const renderTab = (id: AppMode, label: string, icon: React.ReactNode, colorClass: string) => (
    <button 
      onClick={() => { setActiveTab('tool'); setMode(id); setResult(null); }}
      className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'tool' && mode === id ? colorClass + ' shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
      {isFeatureLocked(id) && <span className="ml-1 text-[9px] bg-gray-200 text-gray-500 px-1 rounded uppercase tracking-wide">Pro</span>}
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-gray-900">
      <Toaster position="top-center" />
      
      <Header 
        platform={platform} 
        onTogglePlatform={() => setPlatform(p => p === 'Excel' ? 'Google Sheets' : 'Excel')}
        user={user}
        onUpgrade={() => setShowUpgrade(true)}
        onOpenSettings={() => setShowSettings(true)}
        onLogout={handleLogout}
      />

      <HistorySidebar 
        isOpen={showHistory} 
        onClose={() => setShowHistory(false)} 
        history={history}
        onSelect={(item) => { setMode(item.type); setPlatform(item.platform); setPrompt(item.prompt); setResult(item.result); setActiveTab('tool'); setShowHistory(false); }}
        onClear={() => setHistory([])}
      />

      <UpgradeModal 
        isOpen={showUpgrade} 
        onClose={() => setShowUpgrade(false)}
        onConfirm={handleUpgrade}
      />
      
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={handleCompleteOnboarding}
      />

      <TeamSettings 
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={teamSettings}
        onSave={setTeamSettings}
        currentUser={user}
      />
      
      <main className="flex-grow container mx-auto px-4 py-6 max-w-4xl relative">
        <button 
          onClick={() => setShowHistory(true)}
          className="fixed bottom-6 right-6 lg:fixed lg:bottom-6 lg:right-6 bg-white p-3 rounded-full shadow-lg border border-gray-200 text-gray-500 hover:text-excel-600 z-40 transition-transform hover:scale-105"
        >
          <Clock size={20} />
        </button>

        <div className="space-y-4">
          
          {/* Navigation Bar */}
          <div className="bg-white p-1.5 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-2 justify-between overflow-x-auto">
            <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
              {renderTab('generate', 'Generate', <Sparkles size={16}/>, 'bg-excel-50 text-excel-700')}
              {renderTab('debug', 'Debug', <Wrench size={16}/>, 'bg-amber-50 text-amber-700')}
              {renderTab('automate', 'Automate', <Bot size={16}/>, 'bg-indigo-50 text-indigo-700')}
              {renderTab('template', 'Template', <LayoutTemplate size={16}/>, 'bg-purple-50 text-purple-700')}
              {renderTab('analyze', 'Analyze', <Activity size={16}/>, 'bg-red-50 text-red-700')}
              {renderTab('chat', 'Chat', <MessageSquare size={16}/>, 'bg-blue-50 text-blue-700')}
            </div>
            
            <div className="flex gap-1 border-t sm:border-t-0 sm:border-l border-gray-100 pt-1 sm:pt-0 sm:pl-2 min-w-max">
              <button onClick={() => setActiveTab('workflows')} className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'workflows' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}>
                <WorkflowIcon size={16} /><span className="hidden lg:inline">Workflows</span>
              </button>
              <button onClick={() => setActiveTab('marketplace')} className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'marketplace' ? 'bg-purple-50 text-purple-700 shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}>
                <ShoppingBag size={16} /><span className="hidden lg:inline">Store</span>
              </button>
               <button onClick={() => setActiveTab('developer')} className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'developer' ? 'bg-gray-100 text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}>
                <Terminal size={16} /><span className="hidden lg:inline">API</span>
              </button>
            </div>
          </div>

          {activeTab === 'tool' ? (
            <div className="space-y-6 animate-fade-in-up">
              
              <div className="text-center space-y-1 mt-2 mb-4">
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                  {mode === 'generate' && 'Generate Formulas'}
                  {mode === 'debug' && 'Fix Broken Formulas'}
                  {mode === 'automate' && 'Automate Workflows'}
                  {mode === 'template' && 'Build Templates'}
                  {mode === 'analyze' && 'Analyze Sheet Health'}
                  {mode === 'chat' && 'Ask Your Data'}
                </h2>
                <div className="text-gray-500 text-xs flex items-center justify-center gap-2">
                   {user.plan === 'free' && (
                     <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-semibold">
                       {user.usageToday} / {DAILY_LIMIT_FREE} daily credits
                     </span>
                   )}
                </div>
              </div>

              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1 min-w-0">
                  <FormulaInput 
                    value={prompt} 
                    onChange={setPrompt} 
                    onSubmit={handleSubmit}
                    loading={loading}
                    mode={mode}
                    platform={platform}
                    onAttach={handleAttachFile}
                    fileName={fileContext?.fileName || null}
                    columns={fileContext?.sheets[0]?.columns || []}
                    onClearFile={() => { setFileContext(null); setRawFile(null); }}
                    disabled={isFeatureLocked(mode)}
                    fileDisabled={isFileAccessLocked()}
                  />
                  
                  {/* Result Area - Now directly below input for flow */}
                  {result && (
                    <div className="mt-6 animate-fade-in-up">
                      <FormulaOutput 
                        result={result} 
                        onFeedback={handleFeedback}
                        onDownloadDemo={fileContext?.fullData ? handleDownloadDemo : undefined}
                        onRunWorkflow={rawFile && result.steps ? handleRunWorkflow : undefined}
                        onSaveWorkflow={result.steps ? handleSaveWorkflow : undefined}
                        prompt={prompt}
                        mode={mode}
                      />
                    </div>
                  )}

                  {!result && mode === 'generate' && (
                     <div className="mt-6">
                        <Examples onSelect={(text) => setPrompt(text)} />
                     </div>
                  )}
                </div>
              </div>

            </div>
          ) : activeTab === 'workflows' ? (
             <div className="animate-fade-in-up mt-6">
               <WorkflowLibrary 
                 workflows={workflows} 
                 onRun={handleRunSavedWorkflow} 
                 onDelete={(id) => setWorkflows(prev => prev.filter(w => w.id !== id))}
               />
             </div>
          ) : activeTab === 'marketplace' ? (
            <div className="animate-fade-in-up mt-6">
              <Marketplace onPurchase={(item) => toast.success("Added to library")} />
            </div>
          ) : activeTab === 'developer' ? (
            <div className="animate-fade-in-up mt-6">
              <DeveloperPortal />
            </div>
          ) : (
            <div className="animate-fade-in-up mt-6">
              <SnippetLibrary onSelect={(formula) => {
                 setPrompt(`Explain and adapt this: ${formula}`);
                 setActiveTab('tool');
                 setMode('generate');
              }} />
            </div>
          )}

        </div>
      </main>

      <footer className="mt-12 bg-white border-t border-gray-200">
        <div className="container mx-auto px-4 py-8">
          <AnalyticsDashboard data={{
            requestCount: user.usageToday,
            creditsUsed: user.usageToday,
            successfulGens: 0,
            helpfulCount: 0,
            totalFeedback: 0
          }} />
        </div>
      </footer>
    </div>
  );
}
