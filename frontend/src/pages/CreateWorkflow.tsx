import { useState } from 'react';
import WorkflowBuilder from '../components/WorkflowBuilder';
import ExecutionMonitor from '../components/ExecutionMonitor';
import { Sparkles, Brain, Lock, CheckCircle2, Loader2, Play } from 'lucide-react';

export default function CreateWorkflow() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [workflow, setWorkflow] = useState<any>(null);
  const [executionId, setExecutionId] = useState<string | null>(null);
  const [loadingState, setLoadingState] = useState<number>(0);

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    setWorkflow(null);
    setExecutionId(null);
    setLoadingState(1); // Understanding Intent

    try {
      // Simulate multi-step planning animation for better UX
      setTimeout(() => setLoadingState(2), 1000); // Generating Workflow
      setTimeout(() => setLoadingState(3), 2500); // Validating Tools
      setTimeout(() => setLoadingState(4), 3500); // Ready
      
      const res = await fetch("http://localhost:8000/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });
      if (res.ok) {
        const data = await res.json();
        setWorkflow(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRun = async () => {
    if (!workflow) return;
    try {
      // 1. Save Workflow
      const saveRes = await fetch("http://localhost:8000/workflows/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(workflow)
      });
      const saveData = await saveRes.json();
      const wId = saveData.id;

      // 2. Run Workflow
      const runRes = await fetch(`http://localhost:8000/workflows/${wId}/run`, {
        method: "POST"
      });
      if (runRes.ok) {
        const runData = await runRes.json();
        setExecutionId(runData.execution_id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const examplePrompts = [
    "Process incoming project deadline emails...",
    "Monitor GitHub issues and create tasks...",
    "Organize project files automatically...",
    "Summarize important emails and schedule follow-ups..."
  ];

  return (
    <div className="flex flex-col lg:flex-row h-full overflow-hidden">
      {/* Left side: AI Command Interface */}
      <div className="w-full lg:w-1/3 border-r border-slate-800 bg-[#0F172A]/50 p-8 flex flex-col overflow-y-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-100">Create Workflow</h1>
          <p className="text-slate-400 mt-2 text-sm">Describe what you want FlowMind to automate in natural language.</p>
        </header>

        <div className="flex-1 flex flex-col gap-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Command</label>
            <textarea
              className="w-full h-40 bg-[#0B101E] border border-slate-700 rounded-xl p-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none transition-all shadow-inner"
              placeholder="What would you like FlowMind to automate?"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">Examples</label>
            <div className="flex flex-wrap gap-2">
              {examplePrompts.map((ep, i) => (
                <button 
                  key={i} 
                  onClick={() => setPrompt(ep)}
                  className="text-left text-xs bg-slate-800/50 hover:bg-slate-700/80 text-slate-300 px-3 py-2 rounded-lg border border-slate-700/50 transition-colors"
                >
                  {ep}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-auto pt-6">
            <button
              onClick={handleGenerate}
              disabled={loading || !prompt}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all shadow-lg
                ${loading || !prompt ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20'}`}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              {loading ? 'Processing...' : 'Generate Workflow'}
            </button>
          </div>
        </div>
      </div>

      {/* Right side: Preview & Execution */}
      <div className="w-full lg:w-2/3 bg-[#0B101E] flex flex-col relative overflow-hidden">
        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 z-50 bg-[#0B101E]/80 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl max-w-sm w-full shadow-2xl">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <Brain className="w-5 h-5 text-blue-500" />
                AI Planning Sequence
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  {loadingState >= 1 ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Loader2 className="w-4 h-4 text-slate-600 animate-spin" />}
                  <span className={`text-sm ${loadingState >= 1 ? 'text-slate-300' : 'text-slate-600'}`}>Understanding Intent</span>
                </div>
                <div className="flex items-center gap-3">
                  {loadingState >= 2 ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : loadingState === 1 ? <Loader2 className="w-4 h-4 text-blue-500 animate-spin" /> : <div className="w-4 h-4 rounded-full border border-slate-700" />}
                  <span className={`text-sm ${loadingState >= 2 ? 'text-slate-300' : loadingState === 1 ? 'text-blue-400' : 'text-slate-600'}`}>Generating Workflow</span>
                </div>
                <div className="flex items-center gap-3">
                  {loadingState >= 3 ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : loadingState === 2 ? <Loader2 className="w-4 h-4 text-blue-500 animate-spin" /> : <div className="w-4 h-4 rounded-full border border-slate-700" />}
                  <span className={`text-sm ${loadingState >= 3 ? 'text-slate-300' : loadingState === 2 ? 'text-blue-400' : 'text-slate-600'}`}>Validating Tools</span>
                </div>
                <div className="flex items-center gap-3">
                  {loadingState >= 4 ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : loadingState === 3 ? <Loader2 className="w-4 h-4 text-blue-500 animate-spin" /> : <div className="w-4 h-4 rounded-full border border-slate-700" />}
                  <span className={`text-sm ${loadingState >= 4 ? 'text-slate-300' : loadingState === 3 ? 'text-blue-400' : 'text-slate-600'}`}>Checking Permissions</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {!workflow && !loading && (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
            <Brain className="w-16 h-16 text-slate-800 mb-4" />
            <p className="text-lg font-medium text-slate-400">Workflow Preview</p>
            <p className="text-sm">Generate a workflow to see its execution graph here.</p>
          </div>
        )}

        {workflow && (
          <div className="flex-1 flex flex-col p-6 overflow-hidden">
            <div className="flex items-center justify-between mb-4 shrink-0">
              <h2 className="text-xl font-semibold text-slate-200 flex items-center gap-2">
                {workflow.name}
              </h2>
              <button
                onClick={handleRun}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-emerald-900/20"
              >
                <Play className="w-4 h-4" /> Execute
              </button>
            </div>
            
            <div className="flex-1 relative border border-slate-700 rounded-xl overflow-hidden bg-slate-900/50">
              <WorkflowBuilder initialWorkflow={workflow} onChange={setWorkflow} />
            </div>

            {executionId && (
              <div className="mt-6 shrink-0 max-h-64 overflow-y-auto rounded-xl border border-slate-700 bg-slate-900/80 p-4">
                <ExecutionMonitor executionId={executionId} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
