import { useState, useEffect } from 'react';
import { Activity, Clock, CheckCircle2, AlertTriangle, RefreshCcw, Search, Filter } from 'lucide-react';
import ExecutionMonitor from '../components/ExecutionMonitor';

export default function Executions() {
  const [executions, setExecutions] = useState<any[]>([]);
  const [selectedExec, setSelectedExec] = useState<string | null>(null);

  useEffect(() => {
    const fetchExecutions = async () => {
      try {
        const res = await fetch('http://localhost:8000/executions/');
        if (res.ok) {
          const data = await res.json();
          setExecutions(data.reverse());
        }
      } catch (e) {
        console.error(e);
      }
    };
    
    fetchExecutions();
    const int = setInterval(fetchExecutions, 3000);
    return () => clearInterval(int);
  }, []);

  return (
    <div className="flex h-full">
      {/* Table Section */}
      <div className={`flex-1 p-8 flex flex-col transition-all ${selectedExec ? 'lg:w-1/2 border-r border-slate-800' : 'w-full'}`}>
        <header className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-slate-100 flex items-center gap-3">
            <Activity className="w-7 h-7 text-blue-500" />
            Executions
          </h1>
          <p className="text-slate-400 mt-2 text-sm">Monitor workflow runs and automated self-healing timelines.</p>
        </header>

        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search executions..." 
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <button className="flex items-center gap-2 bg-slate-800 border border-slate-700 px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 transition-colors">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>

        <div className="flex-1 glass-panel rounded-xl overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#0B101E] text-xs uppercase text-slate-500 font-semibold tracking-wider">
                <tr>
                  <th className="px-6 py-4 border-b border-slate-800">Execution ID</th>
                  <th className="px-6 py-4 border-b border-slate-800">Status</th>
                  <th className="px-6 py-4 border-b border-slate-800">Workflow ID</th>
                  <th className="px-6 py-4 border-b border-slate-800">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {executions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500">No executions found.</td>
                  </tr>
                ) : (
                  executions.map((exec) => (
                    <tr 
                      key={exec.id} 
                      onClick={() => setSelectedExec(exec.id)}
                      className={`cursor-pointer transition-colors ${selectedExec === exec.id ? 'bg-blue-600/10' : 'hover:bg-slate-800/30'}`}
                    >
                      <td className="px-6 py-4 font-mono text-slate-300">
                        {exec.id?.substring(0, 8)}...
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-semibold uppercase tracking-wider
                          ${exec.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            exec.status === 'FAILED' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                            exec.status === 'RECOVERING' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                            'bg-slate-800 text-slate-300 border border-slate-700'
                          }`}>
                          {exec.status === 'COMPLETED' && <CheckCircle2 className="w-3 h-3" />}
                          {exec.status === 'FAILED' && <AlertTriangle className="w-3 h-3" />}
                          {exec.status === 'RECOVERING' && <RefreshCcw className="w-3 h-3 animate-spin-slow" />}
                          {exec.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-400 text-xs">
                        {exec.workflow_id?.substring(0, 8)}...
                      </td>
                      <td className="px-6 py-4 text-slate-400 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" /> Recent
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Side Panel Section */}
      {selectedExec && (
        <div className="w-full lg:w-1/3 bg-[#0F172A] border-l border-slate-800 flex flex-col">
          <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-[#0B101E]">
            <div>
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Execution Details</h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">{selectedExec}</p>
            </div>
            <button 
              onClick={() => setSelectedExec(null)}
              className="text-slate-500 hover:text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 transition-colors text-xs font-medium"
            >
              Close
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 bg-[#0F172A]">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Execution Timeline</h4>
            <ExecutionMonitor executionId={selectedExec} />
          </div>
        </div>
      )}
    </div>
  );
}
