import { useState, useEffect } from 'react';
import { GitBranch, Plus, Search, Filter, Play, MoreVertical } from 'lucide-react';

export default function Workflows() {
  const [workflows, setWorkflows] = useState<any[]>([]);

  useEffect(() => {
    const fetchWfs = async () => {
      try {
        const res = await fetch('http://localhost:8000/workflows/');
        if (res.ok) {
          const data = await res.json();
          setWorkflows(data);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchWfs();
  }, []);

  const handleRun = async (id: string) => {
    try {
      await fetch(`http://localhost:8000/workflows/${id}/run`, { method: "POST" });
      alert('Execution started!');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 h-full flex flex-col">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-100 flex items-center gap-3">
            <GitBranch className="w-8 h-8 text-blue-500" />
            Workflows
          </h1>
          <p className="text-slate-400 mt-2 text-sm">Manage, edit, and organize your automation pipelines.</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-blue-900/20">
          <Plus className="w-4 h-4" /> New Workflow
        </button>
      </header>

      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search workflows..." 
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
            <thead className="bg-[#0B101E] text-xs uppercase text-slate-500 font-semibold tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {workflows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">No workflows found. Create one in the Create Workflow tab.</td>
                </tr>
              ) : (
                workflows.map((wf) => (
                  <tr key={wf.id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-4 font-semibold text-slate-200">{wf.name}</td>
                    <td className="px-6 py-4 text-slate-400">{wf.description || 'No description provided.'}</td>
                    <td className="px-6 py-4 font-mono text-slate-500 text-xs">{wf.id.substring(0, 8)}...</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleRun(wf.id)}
                          className="flex items-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded text-xs font-semibold border border-emerald-500/20 transition-colors"
                        >
                          <Play className="w-3.5 h-3.5" /> Run
                        </button>
                        <button className="text-slate-400 hover:text-slate-200 p-1.5 rounded bg-slate-800 border border-slate-700 transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
