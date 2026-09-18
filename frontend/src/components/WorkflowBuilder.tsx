import { useState, useCallback, useEffect, memo } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  Panel,
  useNodesState,
  useEdgesState,
  addEdge,
  Handle,
  Position,
  type Node,
  type Edge,
  type OnSelectionChangeParams
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Plus, X, Trash2, Zap, Brain, Wrench, GitBranch, ShieldCheck, PlayCircle, StopCircle } from 'lucide-react';

const getNodeTypeStyle = (tool: string) => {
  if (tool === 'trigger') return { color: '#8b5cf6', icon: Zap, label: 'TRIGGER' };
  if (tool === 'ai' || tool === 'planner') return { color: '#d946ef', icon: Brain, label: 'AI PROCESS' };
  if (tool === 'condition') return { color: '#eab308', icon: GitBranch, label: 'CONDITION' };
  if (tool === 'approval') return { color: '#10b981', icon: ShieldCheck, label: 'APPROVAL' };
  return { color: '#3b82f6', icon: Wrench, label: 'TOOL' };
};

const CustomNode = memo(({ data, isConnectable }: any) => {
  const tInfo = getNodeTypeStyle(data.stepData?.tool || 'tool');
  const Icon = tInfo.icon;

  return (
    <div className="bg-[#0F172A] border border-slate-700 rounded-lg shadow-xl min-w-[200px] overflow-hidden">
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} className="w-3 h-3 bg-slate-600 border-2 border-[#0F172A]" />
      
      <div className="px-3 py-1.5 flex items-center gap-2 border-b border-slate-700" style={{ backgroundColor: `${tInfo.color}15` }}>
        <Icon className="w-3.5 h-3.5" style={{ color: tInfo.color }} />
        <span className="text-[10px] font-bold tracking-wider" style={{ color: tInfo.color }}>{tInfo.label}</span>
      </div>
      
      <div className="p-3">
        <div className="font-semibold text-slate-200 text-sm">{data.stepData?.name || 'Unknown Step'}</div>
        <div className="text-xs text-slate-500 mt-1 font-mono">{data.stepData?.tool}.{data.stepData?.action}</div>
      </div>

      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} className="w-3 h-3 bg-slate-600 border-2 border-[#0F172A]" />
    </div>
  );
});

const TriggerNode = memo(({ data, isConnectable }: any) => {
  return (
    <div className="bg-[#0F172A] border-2 border-[#8b5cf6] rounded-lg shadow-xl min-w-[200px] overflow-hidden">
      <div className="px-3 py-1.5 flex items-center gap-2 border-b border-slate-700 bg-[#8b5cf6]/10">
        <PlayCircle className="w-3.5 h-3.5 text-[#8b5cf6]" />
        <span className="text-[10px] font-bold tracking-wider text-[#8b5cf6]">TRIGGER</span>
      </div>
      <div className="p-3">
        <div className="font-semibold text-slate-200 text-sm">Workflow Start</div>
        <div className="text-xs text-slate-500 mt-1 font-mono">Type: {data.triggerData?.type || 'manual'}</div>
      </div>
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} className="w-3 h-3 bg-[#8b5cf6] border-2 border-[#0F172A]" />
    </div>
  );
});

const nodeTypes = {
  custom: CustomNode,
  triggerNode: TriggerNode
};

interface WorkflowBuilderProps {
  initialWorkflow: any;
  onChange: (workflow: any) => void;
}

export default function WorkflowBuilder({ initialWorkflow, onChange }: WorkflowBuilderProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [initialized, setInitialized] = useState(false);

  const onConnect = useCallback((params: any) => {
    setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#475569', strokeWidth: 2 } }, eds));
  }, [setEdges]);

  // Initial load
  useEffect(() => {
    if (!initialWorkflow || initialized) return;

    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];

    newNodes.push({
      id: 'trigger',
      type: 'triggerNode',
      position: { x: 250, y: 50 },
      data: { triggerData: initialWorkflow.trigger }
    });

    let currentY = 200;
    initialWorkflow.steps?.forEach((step: any) => {
      newNodes.push({
        id: step.id,
        type: 'custom',
        position: { x: 250, y: currentY },
        data: { stepData: step }
      });
      
      if (step.depends_on && step.depends_on.length > 0) {
        step.depends_on.forEach((depId: string) => {
          newEdges.push({
            id: `e-${depId}-${step.id}`,
            source: depId,
            target: step.id,
            animated: true,
            style: { stroke: '#475569', strokeWidth: 2 }
          });
        });
      } else {
        newEdges.push({
          id: `e-trigger-${step.id}`,
          source: 'trigger',
          target: step.id,
          animated: true,
          style: { stroke: '#475569', strokeWidth: 2 }
        });
      }
      currentY += 150;
    });

    setNodes(newNodes);
    setEdges(newEdges);
    setInitialized(true);
  }, [initialWorkflow, initialized, setNodes, setEdges]);

  // Sync back to parent when nodes/edges change
  useEffect(() => {
    if (!initialized) return;

    const triggerNode = nodes.find(n => n.id === 'trigger');
    const stepNodes = nodes.filter(n => n.id !== 'trigger');

    const steps = stepNodes.map(node => {
      const sData = node.data.stepData as any;
      const dependencies = edges
        .filter(e => e.target === node.id && e.source !== 'trigger')
        .map(e => e.source);

      return {
        id: node.id,
        name: sData.name,
        action: sData.action,
        tool: sData.tool,
        depends_on: dependencies,
        inputs: sData.inputs || {}
      };
    });

    onChange({
      name: initialWorkflow.name,
      description: initialWorkflow.description,
      trigger: triggerNode?.data.triggerData || { type: 'manual', config: {} },
      steps: steps
    });
  }, [nodes, edges, initialized]);

  const handleSelection = useCallback(({ nodes }: OnSelectionChangeParams) => {
    setSelectedNode(nodes.length > 0 ? nodes[0] : null);
  }, []);

  const addStep = () => {
    const id = `step_${Math.floor(Math.random() * 10000)}`;
    const newNode: Node = {
      id,
      type: 'custom',
      position: { x: 400, y: 200 },
      data: {
        stepData: { id, name: 'New Step', tool: 'tasks', action: 'create_task', inputs: {} }
      }
    };
    setNodes(nds => [...nds, newNode]);
  };

  const updateSelectedNode = (field: string, value: string) => {
    if (!selectedNode) return;
    
    setNodes(nds => nds.map(node => {
      if (node.id === selectedNode.id) {
        const newData = { ...node.data };
        newData.stepData = { ...(newData.stepData as any), [field]: value };
        return { ...node, data: newData };
      }
      return node;
    }));
  };

  const deleteSelected = () => {
    if (!selectedNode) return;
    setNodes(nds => nds.filter(n => n.id !== selectedNode.id));
    setEdges(eds => eds.filter(e => e.source !== selectedNode.id && e.target !== selectedNode.id));
    setSelectedNode(null);
  };

  return (
    <div style={{ width: '100%', height: '100%' }} className="relative bg-[#0B101E]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onSelectionChange={handleSelection}
        fitView
        className="bg-[#0B101E]"
      >
        <Controls style={{ background: '#1e293b', fill: '#fff', border: 'none' }} className="border-slate-800" />
        <Background gap={16} size={1} color="#1e293b" />

        <Panel position="top-right" className="m-4">
          <button 
            onClick={addStep}
            className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shadow-lg"
          >
            <Plus className="w-4 h-4" /> Add Step
          </button>
        </Panel>
      </ReactFlow>

      {/* Slide-over Edit Panel */}
      {selectedNode && selectedNode.id !== 'trigger' && (
        <div className="absolute right-0 top-0 h-full w-80 bg-[#0F172A]/95 backdrop-blur-md border-l border-slate-800 shadow-2xl flex flex-col z-10 transition-transform">
          <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-[#0B101E]/50">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Configure Node</h3>
            <button onClick={() => setSelectedNode(null)} className="text-slate-500 hover:text-slate-300 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-5 flex-1 overflow-y-auto">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Step Name</label>
              <input 
                type="text" 
                value={(selectedNode.data.stepData as any)?.name || ''} 
                onChange={(e) => updateSelectedNode('name', e.target.value)}
                className="w-full bg-[#0B101E] border border-slate-700 rounded-lg p-2.5 text-slate-200 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Integration Tool</label>
              <input 
                type="text" 
                value={(selectedNode.data.stepData as any)?.tool || ''} 
                onChange={(e) => updateSelectedNode('tool', e.target.value)}
                className="w-full bg-[#0B101E] border border-slate-700 rounded-lg p-2.5 text-slate-200 text-sm font-mono focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</label>
              <input 
                type="text" 
                value={(selectedNode.data.stepData as any)?.action || ''} 
                onChange={(e) => updateSelectedNode('action', e.target.value)}
                className="w-full bg-[#0B101E] border border-slate-700 rounded-lg p-2.5 text-slate-200 text-sm font-mono focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>
          </div>

          <div className="p-4 bg-[#0B101E]/50 border-t border-slate-800 mt-auto">
            <button 
              onClick={deleteSelected}
              className="w-full flex items-center justify-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 py-2.5 rounded-lg text-sm font-medium transition-colors border border-rose-500/20"
            >
              <Trash2 className="w-4 h-4" /> Delete Node
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
