import React from 'react';
import { 
  LayoutDashboard, Wand2, GitBranch, Activity, 
  BrainCircuit, Plug, Settings, Bell, User
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export default function Layout({ children, currentTab, onTabChange }: LayoutProps) {
  const navItems = [
    { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard },
    { id: 'create', label: 'Create Workflow', icon: Wand2 },
    { id: 'workflows', label: 'Workflows', icon: GitBranch },
    { id: 'executions', label: 'Executions', icon: Activity },
    { id: 'intelligence', label: 'Intelligence', icon: BrainCircuit },
    { id: 'integrations', label: 'Integrations', icon: Plug },
  ];

  return (
    <div className="min-h-screen bg-[#0B101E] text-slate-200 flex flex-col md:flex-row overflow-hidden font-sans">
      
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-[#0F172A] border-r border-slate-800 flex flex-col shrink-0 md:h-screen">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-100 tracking-tight leading-tight">FLOWMIND</h1>
              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">AI Workflow OS</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-blue-600/10 text-blue-400' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-500' : 'text-slate-500'}`} />
                {item.label}
              </button>
            );
          })}

          <div className="pt-6 pb-2">
            <div className="px-3 text-[10px] uppercase tracking-wider text-slate-600 font-semibold mb-2">System</div>
            <button
              onClick={() => onTabChange('settings')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentTab === 'settings' 
                  ? 'bg-blue-600/10 text-blue-400' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Settings className={`w-4 h-4 ${currentTab === 'settings' ? 'text-blue-500' : 'text-slate-500'}`} />
              Settings
            </button>
          </div>
        </nav>

        <div className="p-4 border-t border-slate-800 mt-auto bg-[#0B101E]/30">
          <div className="flex items-center gap-3 px-2">
            <div className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-300">OLLAMA CONNECTED</span>
              <span className="text-[10px] text-slate-500 font-mono">model: qwen3:8b</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-[#0B101E]">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-800/60 bg-[#0F172A]/40 backdrop-blur-sm flex items-center justify-between px-6 shrink-0 sticky top-0 z-10">
          <div className="flex flex-col">
            {/* The page itself can provide title, or we can derive it here. We'll let the page provide it inside children, or we can just leave this empty/generic. */}
            {/* Actually, the instructions say "Every major page should have a consistent header." Let's provide a generic top bar and let the page render its own specific header, or we can pass title/subtitle as props. Let's let the page render its own header for more flexibility, but keep the right side standard here. */}
            <div className="text-sm font-medium text-slate-400 hidden sm:block">
              {navItems.find(i => i.id === currentTab)?.label || 'Settings'}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-slate-500 hover:text-slate-300 transition-colors">
              <Bell className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-slate-700"></div>
            <button className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors">
              <div className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center border border-slate-700">
                <User className="w-3 h-3 text-slate-400" />
              </div>
              <span className="hidden sm:inline">Administrator</span>
            </button>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <div className="flex-1 overflow-auto relative">
          {children}
        </div>
      </main>
    </div>
  );
}
