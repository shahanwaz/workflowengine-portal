import { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { WorkflowNode, NodeConnection, NodeCategory } from "@/types/workflow";
import { nodeTemplates } from "@/data/nodeTemplates";
import { WorkflowCanvas } from "@/components/workflow/WorkflowCanvas";
import { NodeLibrarySidebar } from "@/components/workflow/NodeLibrarySidebar";
import { NodePropertiesPanel } from "@/components/workflow/NodePropertiesPanel";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Play, Undo2, Redo2, Zap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { erCertNodes, erCertConnections } from "@/data/erCertWorkflow";

const WorkflowEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === "new";
  const isErCert = id === "er-cert";

  const getInitialName = () => {
    if (isNew) return "Untitled Workflow";
    if (isErCert) return "Mandatory Certification - ER Certification";
    return "Email Welcome Sequence";
  };

  const [workflowName, setWorkflowName] = useState(getInitialName());
  const [nodes, setNodes] = useState<WorkflowNode[]>(isErCert ? erCertNodes : isNew ? [] : []);
  const [connections, setConnections] = useState<NodeConnection[]>(isErCert ? erCertConnections : isNew ? [] : []);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  const handleUpdateNode = useCallback((id: string, updates: Partial<WorkflowNode>) => {
    setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, ...updates } : n)));
  }, []);

  const handleAddConnection = useCallback((conn: NodeConnection) => {
    setConnections((prev) => {
      const exists = prev.some((c) => c.sourceId === conn.sourceId && c.targetId === conn.targetId);
      return exists ? prev : [...prev, conn];
    });
  }, []);

  const handleDropNode = useCallback((type: string, category: NodeCategory, x: number, y: number) => {
    const template = nodeTemplates.find((t) => t.type === type);
    if (!template) return;
    const newNode: WorkflowNode = {
      id: `n-${Date.now()}`,
      type,
      label: template.label,
      category,
      x,
      y,
      icon: template.icon,
    };
    setNodes((prev) => [...prev, newNode]);
    setSelectedNodeId(newNode.id);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Editor toolbar */}
      <header className="h-12 border-b border-border bg-card/80 backdrop-blur-sm flex items-center justify-between px-3 z-30 shrink-0">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="h-6 w-6 rounded bg-primary flex items-center justify-center">
            <Zap className="h-3 w-3 text-primary-foreground" />
          </div>
          <Input
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            className="h-7 w-56 text-sm font-medium border-transparent bg-transparent hover:bg-muted focus:bg-card"
          />
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Redo2 className="h-4 w-4" />
          </Button>
          <div className="w-px h-5 bg-border mx-1" />
          <Button variant="outline" size="sm" className="h-8 gap-1.5">
            <Play className="h-3.5 w-3.5" />
            Test
          </Button>
          <Button size="sm" className="h-8 gap-1.5">
            <Save className="h-3.5 w-3.5" />
            Save
          </Button>
        </div>
      </header>

      {/* Editor body */}
      <div className="flex flex-1 min-h-0">
        <NodeLibrarySidebar />
        <WorkflowCanvas
          nodes={nodes}
          connections={connections}
          selectedNodeId={selectedNodeId}
          onSelectNode={setSelectedNodeId}
          onUpdateNode={handleUpdateNode}
          onAddConnection={handleAddConnection}
          onDropNode={handleDropNode}
        />
        {selectedNode && (
          <NodePropertiesPanel
            node={selectedNode}
            onUpdate={handleUpdateNode}
            onClose={() => setSelectedNodeId(null)}
          />
        )}
      </div>
    </div>
  );
};

export default WorkflowEditor;
