import { Settings, Shield, BrainCircuit, Activity } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 pb-20">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-slate-100 flex items-center gap-3">
          <Settings className="w-8 h-8 text-blue-500" />
          Settings
        </h1>
        <p className="text-slate-400 mt-2 text-sm">Configure AI models, execution policies, and global preferences.</p>
      </header>

      <div className="space-y-6">
        
        {/* AI Provider */}
        <section className="glass-panel p-6 rounded-xl space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-4">
            <BrainCircuit className="w-5 h-5 text-slate-300" />
            <h2 className="text-lg font-semibold text-slate-200">AI Provider Configuration</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Provider</label>
              <select className="w-full bg-[#0B101E] border border-slate-700 rounded-lg p-2.5 text-slate-200 text-sm focus:border-blue-500 focus:outline-none">
                <option>Ollama (Local)</option>
                <option>OpenAI</option>
                <option>Anthropic</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Model</label>
              <input type="text" defaultValue="qwen3:8b" className="w-full bg-[#0B101E] border border-slate-700 rounded-lg p-2.5 text-slate-200 text-sm focus:border-blue-500 focus:outline-none" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Base URL</label>
              <input type="text" defaultValue="http://localhost:11434" className="w-full bg-[#0B101E] border border-slate-700 rounded-lg p-2.5 text-slate-200 text-sm focus:border-blue-500 focus:outline-none font-mono" />
            </div>
          </div>
        </section>

        {/* Execution Settings */}
        <section className="glass-panel p-6 rounded-xl space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-4">
            <Activity className="w-5 h-5 text-slate-300" />
            <h2 className="text-lg font-semibold text-slate-200">Execution Policies</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Maximum Retries</label>
              <input type="number" defaultValue={3} className="w-full bg-[#0B101E] border border-slate-700 rounded-lg p-2.5 text-slate-200 text-sm focus:border-blue-500 focus:outline-none" />
              <p className="text-[10px] text-slate-500 mt-1">Number of self-healing attempts before failing.</p>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Default Timeout (s)</label>
              <input type="number" defaultValue={30} className="w-full bg-[#0B101E] border border-slate-700 rounded-lg p-2.5 text-slate-200 text-sm focus:border-blue-500 focus:outline-none" />
            </div>
          </div>
        </section>

        {/* Security Settings */}
        <section className="glass-panel p-6 rounded-xl space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-4">
            <Shield className="w-5 h-5 text-slate-300" />
            <h2 className="text-lg font-semibold text-slate-200">Security & Permissions</h2>
          </div>
          
          <div className="space-y-4">
            <label className="flex items-center justify-between p-4 bg-[#0B101E]/50 border border-slate-800 rounded-lg cursor-pointer hover:bg-[#0B101E] transition-colors">
              <div>
                <div className="text-sm font-semibold text-slate-200">Require Manual Approval</div>
                <div className="text-xs text-slate-500 mt-0.5">High-risk actions (e.g. sending emails, deleting data) require human confirmation.</div>
              </div>
              <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                <input type="checkbox" defaultChecked className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-blue-500" style={{ right: 0 }} />
                <label className="toggle-label block overflow-hidden h-5 rounded-full bg-blue-500 cursor-pointer"></label>
              </div>
            </label>

            <label className="flex items-center justify-between p-4 bg-[#0B101E]/50 border border-slate-800 rounded-lg cursor-pointer hover:bg-[#0B101E] transition-colors">
              <div>
                <div className="text-sm font-semibold text-slate-200">Workflow Memory</div>
                <div className="text-xs text-slate-500 mt-0.5">Allow workflows to access historical context from previous executions.</div>
              </div>
              <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                <input type="checkbox" defaultChecked className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-slate-400 border-4 appearance-none cursor-pointer" style={{ left: 0 }} />
                <label className="toggle-label block overflow-hidden h-5 rounded-full bg-slate-700 cursor-pointer"></label>
              </div>
            </label>
          </div>
        </section>

        <div className="pt-4 flex justify-end">
          <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-blue-900/20">
            Save Configuration
          </button>
        </div>

      </div>
    </div>
  );
}
