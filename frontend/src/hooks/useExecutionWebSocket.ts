import { useState, useEffect, useRef, useCallback } from 'react';

export interface WSEvent {
  event: string;
  execution_id: string;
  step_id?: string;
  timestamp: string;
  data: any;
}

export function useExecutionWebSocket(executionId: string) {
  const [executionState, setExecutionState] = useState<any>(null);
  const [events, setEvents] = useState<WSEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);

  // Fallback REST fetch to ensure we don't miss anything during reconnect
  const fetchCurrentState = useCallback(async () => {
    try {
      const res = await fetch(`http://localhost:8000/executions/${executionId}`);
      if (res.ok) {
        const data = await res.json();
        setExecutionState(data);
      }
    } catch (e) {
      console.error("Failed to fetch REST state", e);
    }
  }, [executionId]);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(`ws://localhost:8000/ws/executions/${executionId}`);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      setIsReconnecting(false);
      // Fetch state immediately on connect/reconnect in case we missed events
      fetchCurrentState();
    };

    ws.onmessage = (message) => {
      try {
        const event: WSEvent = JSON.parse(message.data);
        setEvents((prev) => [...prev, event]);
        
        // Optimistically update execution state based on event
        setExecutionState((prev: any) => {
          if (!prev) return prev;
          const next = { ...prev };
          
          if (event.event === 'WORKFLOW_COMPLETED') next.status = 'COMPLETED';
          if (event.event === 'WORKFLOW_FAILED') next.status = 'FAILED';
          if (event.event === 'APPROVAL_REQUIRED') next.status = 'WAITING_APPROVAL';
          if (event.event === 'APPROVAL_GRANTED') next.status = 'RUNNING';
          if (event.event === 'APPROVAL_REJECTED') next.status = 'FAILED';
          
          if (event.step_id) {
            const step = next.steps?.find((s: any) => s.id === event.step_id);
            if (step) {
              if (event.event === 'STEP_STARTED') step.status = 'RUNNING';
              if (event.event === 'STEP_COMPLETED') step.status = 'SUCCESS';
              if (event.event === 'STEP_FAILED') step.status = 'FAILED';
              if (event.event === 'RECOVERY_STARTED') step.status = 'RECOVERING';
              if (event.event === 'RECOVERY_COMPLETED') step.status = 'SUCCESS'; // Or RUNNING depending on step
            } else {
              // If step wasn't in state (e.g. out of sync), do a quick REST sync
              fetchCurrentState();
            }
          }
          
          return next;
        });
      } catch (e) {
        console.error("Error parsing WS message", e);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      setIsReconnecting(true);
      // Attempt reconnect after 2 seconds
      reconnectTimeoutRef.current = window.setTimeout(() => {
        connect();
      }, 2000);
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [executionId, fetchCurrentState]);

  useEffect(() => {
    // Initial fetch to paint UI instantly while WS connects
    fetchCurrentState();
    connect();

    return () => {
      if (reconnectTimeoutRef.current) window.clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect, fetchCurrentState]);

  return { executionState, events, isConnected, isReconnecting, fetchCurrentState };
}
