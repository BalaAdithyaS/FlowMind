import { useState, useEffect } from 'react';
import { Activity, CheckCircle2, AlertTriangle, RefreshCcw, Clock, Brain } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const perfData = [
  { name: '1', time: 4.2 },
  { name: '2', time: 5.1 },
  { name: '3', time: 4.8 },
  { name: '4', time: 6.2 },
  { name: '5', time: 5.9 },
  { name: '6', time: 7.1 },
  { name: '7', time: 4.5 },
];

export default function CommandCenter() {
  const [stats, setStats] = useState({
    active_workflows: 0,
    success_rate: 0,
    recovery_rate: 0
  });

  const [executions, setExecutions] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('http://localhost:8000/workflows/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
        
        const execRes = await fetch('http://localhost:8000/executions/');
        if (execRes.ok) {
          const execData = await execRes.json();
          setExecutions(execData.reverse().slice(0, 5)); // show latest 5
        }
      } catch (e) {
        console.error('Failed to fetch stats', e);
      }
    };
    
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-slate-100">Command Center</h1>
        <p className="text-slate-400 mt-1">Monitor, execute and optimize autonomous workflows.</p>
      </header>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-xl flex flex-col">
          <span className="text-xs font-semibold text-slate-500 mb-1">ACTIVE WORKFLOWS</span>
          <div className="text-3xl font-bold text-slate-200">{stats.active_workflows}</div>
          <span className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">{stats.active_workflows === 0 ? 'No workflows' : '1 running'}</span>
        </div>
        <div className="glass-panel p-5 rounded-xl flex flex-col">
          <span className="text-xs font-semibold text-slate-500 mb-1">SUCCESS RATE</span>
          <div className="text-3xl font-bold text-emerald-400">{stats.success_rate}%</div>
          <span className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">Based on recent executions</span>
        </div>
        <div className="glass-panel p-5 rounded-xl flex flex-col">
          <span className="text-xs font-semibold text-slate-500 mb-1">RECOVERY RATE</span>
          <div className="text-3xl font-bold text-blue-400">{stats.recovery_rate}%</div>
          <span className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">Automated self-healing</span>
        </div>
        <div className="glass-panel p-5 rounded-xl flex flex-col">
          <span className="text-xs font-semibold text-slate-500 mb-1">OLLAMA</span>
          <div className="text-xl font-bold text-slate-200 mt-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
            CONNECTED
          </div>
          <span className="text-[10px] text-slate-500 mt-auto uppercase tracking-wider font-mono">model: qwen3:8b</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 65% - Live Workflow Activity */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Live Workflow Activity</h2>
          
          <div className="glass-panel rounded-xl overflow-hidden divide-y divide-slate-800/50">
            {executions.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">No recent activity</div>
            ) : (
              executions.map((exec, idx) => (
                <div key={exec.id || idx} className="p-4 flex items-center gap-4 hover:bg-slate-800/30 transition-colors">
                  <div className="shrink-0">
                    {exec.status === 'COMPLETED' ? (
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      </div>
                    ) : exec.status === 'FAILED' ? (
                      <div className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                        <AlertTriangle className="w-4 h-4 text-rose-400" />
                      </div>
                    ) : exec.status === 'RECOVERING' ? (
                      <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                        <RefreshCcw className="w-4 h-4 text-blue-400 animate-spin-slow" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-slate-700/50 flex items-center justify-center border border-slate-600/50">
                        <Activity className="w-4 h-4 text-slate-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-slate-200 truncate">Execution {exec.id.substring(0, 8)}</h4>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                      <span className={`px-1.5 py-0.5 rounded font-medium ${
                        exec.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400' :
                        exec.status === 'FAILED' ? 'bg-rose-500/10 text-rose-400' :
                        'bg-slate-800 text-slate-300'
                      }`}>
                        {exec.status}
                      </span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Just now</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right 35% - AI System Status & Perf */}
        <div className="space-y-6">
          
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">AI System Status</h2>
            <div className="glass-panel rounded-xl p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-slate-300">Ollama Engine</span>
                </div>
                <span className="text-xs font-medium text-emerald-400">READY</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-slate-300">Workflow Engine</span>
                </div>
                <span className="text-xs font-medium text-emerald-400">READY</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <RefreshCcw className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-slate-300">Recovery Engine</span>
                </div>
                <span className="text-xs font-medium text-emerald-400">READY</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              Execution Performance
              <span className="text-[9px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-500">DEMO DATA</span>
            </h2>
            <div className="glass-panel rounded-xl p-4 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={perfData}>
                  <defs>
                    <linearGradient id="colorTime" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                    itemStyle={{ color: '#e2e8f0' }}
                  />
                  <Area type="monotone" dataKey="time" stroke="#3b82f6" fillOpacity={1} fill="url(#colorTime)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
