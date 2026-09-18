import { Plug, Brain, Mail, GitBranch, Calendar, HardDrive, CheckCircle2, AlertTriangle, Settings2 } from 'lucide-react';

const integrations = [
  {
    name: 'Ollama',
    description: 'Local LLM inference for workflow generation.',
    icon: Brain,
    status: 'CONNECTED',
    meta: 'qwen3:8b',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20'
  },
  {
    name: 'GitHub',
    description: 'Manage issues, PRs, and repository settings.',
    icon: GitBranch,
    status: 'MOCK MODE',
    meta: 'Authentication bypassed',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20'
  },
  {
    name: 'Gmail',
    description: 'Read, process, and send emails.',
    icon: Mail,
    status: 'NOT CONNECTED',
    meta: 'Requires OAuth',
    color: 'text-slate-400',
    bg: 'bg-slate-800 border-slate-700'
  },
  {
    name: 'Google Calendar',
    description: 'Schedule events and check availability.',
    icon: Calendar,
    status: 'MOCK MODE',
    meta: 'Using synthetic schedules',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20'
  },
  {
    name: 'Filesystem',
    description: 'Local file operations and directory management.',
    icon: HardDrive,
    status: 'AVAILABLE',
    meta: 'Restricted to /workspace',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20'
  }
];

export default function Integrations() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-100 flex items-center gap-3">
            <Plug className="w-8 h-8 text-blue-500" />
            Integrations
          </h1>
          <p className="text-slate-400 mt-2 text-sm">Connect external services, APIs, and AI providers to expand automation capabilities.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((integration, idx) => {
          const Icon = integration.icon;
          return (
            <div key={idx} className="glass-panel p-6 rounded-xl flex flex-col hover:border-slate-600 transition-colors cursor-pointer group">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center border border-slate-700 group-hover:border-slate-500 transition-colors">
                  <Icon className="w-6 h-6 text-slate-200" />
                </div>
                <button className="text-slate-500 hover:text-slate-300 transition-colors">
                  <Settings2 className="w-5 h-5" />
                </button>
              </div>
              <h3 className="text-lg font-bold text-slate-100 mb-1">{integration.name}</h3>
              <p className="text-sm text-slate-400 mb-6 flex-1">{integration.description}</p>
              
              <div className="flex items-center justify-between pt-4 border-t border-slate-800/50">
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-bold tracking-wider uppercase border ${integration.bg} ${integration.color}`}>
                  {integration.status === 'CONNECTED' && <CheckCircle2 className="w-3 h-3" />}
                  {integration.status === 'NOT CONNECTED' && <AlertTriangle className="w-3 h-3" />}
                  {integration.status}
                </div>
                <span className="text-xs text-slate-500 font-mono">{integration.meta}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
