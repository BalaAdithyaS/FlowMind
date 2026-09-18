import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Brain, Target, Activity, Zap, RefreshCcw } from 'lucide-react';

const mockPerformanceData = [
  { epoch: '1', accuracy: 82, precision: 79 },
  { epoch: '2', accuracy: 85, precision: 83 },
  { epoch: '3', accuracy: 89, precision: 87 },
  { epoch: '4', accuracy: 91, precision: 90 },
  { epoch: '5', accuracy: 94, precision: 92 },
  { epoch: '6', accuracy: 95, precision: 94 },
  { epoch: '7', accuracy: 96.4, precision: 95 },
];

export default function Intelligence() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('http://localhost:8000/workflows/stats');
        if (response.ok) {
          const stats = await response.json();
          setData(stats.intent_distribution || []);
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
        <h1 className="text-3xl font-bold tracking-tight text-slate-100 flex items-center gap-3">
          <Brain className="w-8 h-8 text-blue-500" />
          Intelligence
        </h1>
        <p className="text-slate-400 mt-2 text-sm">Machine learning telemetry, predictions and model performance metrics.</p>
      </header>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-xl border-l-2 border-l-blue-500 relative overflow-hidden">
          <div className="absolute top-2 right-2 text-[8px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-500 font-bold uppercase tracking-widest">Synthetic</div>
          <span className="text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1.5 uppercase tracking-wider"><Target className="w-3.5 h-3.5" /> MODEL ACCURACY</span>
          <div className="text-3xl font-bold text-slate-200">96.4%</div>
        </div>
        <div className="glass-panel p-5 rounded-xl border-l-2 border-l-indigo-500 relative overflow-hidden">
          <div className="absolute top-2 right-2 text-[8px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-500 font-bold uppercase tracking-widest">Synthetic</div>
          <span className="text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1.5 uppercase tracking-wider"><Activity className="w-3.5 h-3.5" /> F1 SCORE</span>
          <div className="text-3xl font-bold text-slate-200">0.95</div>
        </div>
        <div className="glass-panel p-5 rounded-xl border-l-2 border-l-emerald-500 relative overflow-hidden">
          <div className="absolute top-2 right-2 text-[8px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-500 font-bold uppercase tracking-widest">Synthetic</div>
          <span className="text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1.5 uppercase tracking-wider"><Zap className="w-3.5 h-3.5" /> PREDICTED FAILURE RISK</span>
          <div className="text-3xl font-bold text-slate-200">2.1%</div>
        </div>
        <div className="glass-panel p-5 rounded-xl border-l-2 border-l-amber-500 relative overflow-hidden">
          <div className="absolute top-2 right-2 text-[8px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-500 font-bold uppercase tracking-widest">Synthetic</div>
          <span className="text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1.5 uppercase tracking-wider"><RefreshCcw className="w-3.5 h-3.5" /> RECOVERY LATENCY</span>
          <div className="text-3xl font-bold text-slate-200">1.2s</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Intent Classification (LIVE DATA) */}
        <div className="glass-panel rounded-xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Intent Classification</h3>
            <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold uppercase tracking-widest border border-emerald-500/20">LIVE TELEMETRY</span>
          </div>
          <div className="flex-1 min-h-[250px]">
            {data.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm border border-dashed border-slate-700/50 rounded-lg">
                No telemetry data available yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical" margin={{ left: 30, right: 20 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip 
                    cursor={{fill: '#1e293b'}} 
                    contentStyle={{backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px'}}
                    itemStyle={{ color: '#3b82f6' }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Model Performance (SYNTHETIC) */}
        <div className="glass-panel rounded-xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Model Training Performance</h3>
            <span className="text-[9px] bg-slate-800 text-slate-500 px-2 py-0.5 rounded font-bold uppercase tracking-widest">SYNTHETIC</span>
          </div>
          <div className="flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockPerformanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPrec" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="epoch" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10}} domain={['dataMin - 10', 'auto']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                />
                <Area type="monotone" dataKey="accuracy" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorAcc)" />
                <Area type="monotone" dataKey="precision" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorPrec)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
