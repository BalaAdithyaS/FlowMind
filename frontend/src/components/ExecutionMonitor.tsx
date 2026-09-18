import { useState, useEffect } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';

export default function ExecutionMonitor({ executionId }: { executionId: string }) {
  const [execution, setExecution] = useState<any>(null);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`http://localhost:8000/executions/${executionId}`);
        if (response.ok) {
          const data = await response.json();
          setExecution(data);
          
          if (['COMPLETED', 'FAILED', 'CANCELLED'].includes(data.status)) {
            clearInterval(interval);
          }
        }
      } catch (e) {
        console.error(e);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [executionId]);

  if (!execution) return <div className="text-gray-400 animate-pulse">Loading execution status...</div>;

  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
      <h3 className="text-xl font-semibold mb-4">Execution Monitor</h3>
      <div className="flex items-center space-x-3 mb-6">
        <span className="text-gray-400">Status:</span>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          execution.status === 'COMPLETED' ? 'bg-green-900 text-green-300' :
          execution.status === 'FAILED' ? 'bg-red-900 text-red-300' :
          execution.status === 'WAITING_APPROVAL' ? 'bg-yellow-900 text-yellow-300 animate-pulse' :
          'bg-blue-900 text-blue-300'
        }`}>
          {execution.status}
        </span>
      </div>

      {execution.status === 'WAITING_APPROVAL' && (
        <div className="mb-6 p-4 bg-yellow-900/40 border border-yellow-600 rounded-lg flex flex-col gap-4 shadow-lg shadow-yellow-900/20">
          <p className="text-yellow-200 font-medium">⚠️ Action Requires Manual Approval</p>
          <p className="text-sm text-yellow-100/70">{execution.error}</p>
          <div className="flex gap-4">
            <button 
              onClick={() => fetch(`http://localhost:8000/executions/${executionId}/approve`, { method: 'POST' })}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-medium shadow-md transition-colors"
            >
              Approve & Continue
            </button>
            <button 
              onClick={() => fetch(`http://localhost:8000/executions/${executionId}/reject`, { method: 'POST' })}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-medium shadow-md transition-colors"
            >
              Reject & Abort
            </button>
          </div>
        </div>
      )}

      {execution.error && execution.status !== 'WAITING_APPROVAL' && (
        <div className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-lg">
          <p className="text-red-200 text-sm font-mono whitespace-pre-wrap">{execution.error}</p>
        </div>
      )}

      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-400 border-b border-gray-700 pb-2">Completed Steps</h4>
        <ul className="space-y-2">
          {execution.completed_steps.map((stepId: string) => (
            <li key={stepId} className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>Step: {stepId}</span>
              <span className="text-xs text-gray-500 ml-auto">
                {JSON.stringify(execution.results[stepId])}
              </span>
            </li>
          ))}
        </ul>
        {['RUNNING', 'RECOVERING'].includes(execution.status) && (
          <div className="flex items-center gap-2 text-sm text-gray-400 mt-4">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Executing...</span>
          </div>
        )}
      </div>
    </div>
  );
}
