import { CheckCircle2, Loader2, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { useExecutionWebSocket } from '../hooks/useExecutionWebSocket';

export default function ExecutionMonitor({ executionId }: { executionId: string }) {
  const { executionState: execution, events, isConnected, isReconnecting } = useExecutionWebSocket(executionId);

  if (!execution) return <div className="text-gray-400 animate-pulse">Loading execution status...</div>;

  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">Execution Monitor</h3>
        <div className="flex items-center gap-2 text-sm">
          {isConnected ? (
            <span className="flex items-center gap-1 text-green-400">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              LIVE
            </span>
          ) : isReconnecting ? (
            <span className="flex items-center gap-1 text-yellow-400">
              <RefreshCw className="w-3 h-3 animate-spin" />
              Reconnecting...
            </span>
          ) : (
            <span className="flex items-center gap-1 text-red-400">
              <span className="w-2 h-2 rounded-full bg-red-400"></span>
              Disconnected
            </span>
          )}
        </div>
      </div>
      
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
          <div className="flex gap-4">
            <button 
              onClick={() => {
                fetch(`http://localhost:8000/executions/${executionId}/approve`, { method: 'POST' });
                // We don't fetchCurrentState here because WS will broadcast APPROVAL_GRANTED instantly
              }}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-medium shadow-md transition-colors"
            >
              Approve & Continue
            </button>
            <button 
              onClick={() => {
                fetch(`http://localhost:8000/executions/${executionId}/reject`, { method: 'POST' });
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-medium shadow-md transition-colors"
            >
              Reject & Abort
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-400 border-b border-gray-700 pb-2">Timeline</h4>
        <div className="bg-gray-900/50 rounded-lg p-4 font-mono text-sm h-64 overflow-y-auto">
          {events.length === 0 && execution.events && execution.events.length > 0 && (
            // Show historical events if we just connected and have no WS events yet
            execution.events.map((e: any, i: number) => (
              <div key={`hist-${i}`} className="mb-2 text-gray-500">
                <span className="text-gray-600">[{new Date(e.timestamp).toLocaleTimeString()}]</span> {e.type}
              </div>
            ))
          )}
          {events.map((e, i) => (
            <div key={i} className={`mb-2 ${
              e.event.includes('FAILED') ? 'text-red-400' :
              e.event.includes('RECOVERY') ? 'text-yellow-400' :
              e.event.includes('COMPLETED') ? 'text-green-400' :
              'text-blue-300'
            }`}>
              <span className="text-gray-500">[{new Date(e.timestamp).toLocaleTimeString()}]</span>{' '}
              {e.event.includes('FAILED') && <XCircle className="inline w-3 h-3 mr-1" />}
              {e.event.includes('RECOVERY') && <AlertTriangle className="inline w-3 h-3 mr-1" />}
              {e.event.includes('COMPLETED') && <CheckCircle2 className="inline w-3 h-3 mr-1" />}
              {e.event.includes('STARTED') && <Loader2 className="inline w-3 h-3 mr-1 animate-spin" />}
              {e.event} {e.step_id ? `- ${e.step_id}` : ''}
            </div>
          ))}
          {['RUNNING', 'RECOVERING'].includes(execution.status) && (
            <div className="flex items-center gap-2 text-gray-500 mt-4 animate-pulse">
              <Loader2 className="w-3 h-3 animate-spin" />
              Listening for events...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
