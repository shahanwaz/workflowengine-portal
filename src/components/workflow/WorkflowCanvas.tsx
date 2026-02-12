import { useState, useCallback, useRef, MouseEvent } from "react";
import { WorkflowNode, NodeConnection, NodeCategory } from "@/types/workflow";
import { nodeTemplates } from "@/data/nodeTemplates";
import { CanvasNode } from "./CanvasNode";
import { CanvasConnections } from "./CanvasConnections";
import { ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WorkflowCanvasProps {
  nodes: WorkflowNode[];
  connections: NodeConnection[];
  selectedNodeId: string | null;
  onSelectNode: (id: string | null) => void;
  onUpdateNode: (id: string, updates: Partial<WorkflowNode>) => void;
  onAddConnection: (conn: NodeConnection) => void;
  onDropNode: (type: string, category: NodeCategory, x: number, y: number) => void;
}

export function WorkflowCanvas({
  nodes,
  connections,
  selectedNodeId,
  onSelectNode,
  onUpdateNode,
  onAddConnection,
  onDropNode,
}: WorkflowCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  const handleCanvasMouseDown = (e: MouseEvent) => {
    if (e.target === canvasRef.current || (e.target as HTMLElement).classList.contains("workflow-grid-bg")) {
      onSelectNode(null);
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleCanvasMouseMove = (e: MouseEvent) => {
    if (isPanning) {
      setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
      return;
    }
    if (draggingNodeId) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        onUpdateNode(draggingNodeId, {
          x: e.clientX - rect.left - dragOffset.x - pan.x,
          y: e.clientY - rect.top - dragOffset.y - pan.y,
        });
      }
    }
  };

  const handleCanvasMouseUp = () => {
    setDraggingNodeId(null);
    setIsPanning(false);
    setConnectingFrom(null);
  };

  const handleNodeMouseDown = (id: string, e: MouseEvent) => {
    e.stopPropagation();
    const node = nodes.find((n) => n.id === id);
    if (!node) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left - pan.x - node.x,
        y: e.clientY - rect.top - pan.y - node.y,
      });
    }
    setDraggingNodeId(id);
    onSelectNode(id);
  };

  const handleConnectorStart = (nodeId: string) => {
    setConnectingFrom(nodeId);
  };

  const handleConnectorEnd = (nodeId: string) => {
    if (connectingFrom && connectingFrom !== nodeId) {
      onAddConnection({
        id: `conn-${Date.now()}`,
        sourceId: connectingFrom,
        targetId: nodeId,
      });
      setConnectingFrom(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData("nodeType");
    const category = e.dataTransfer.getData("nodeCategory") as NodeCategory;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect && type) {
      onDropNode(type, category, e.clientX - rect.left - pan.x, e.clientY - rect.top - pan.y);
    }
  };

  const handleZoom = (direction: "in" | "out") => {
    setZoom((prev) => {
      const newZoom = direction === "in" ? prev + 0.2 : Math.max(0.4, prev - 0.2);
      return newZoom;
    });
  };

  return (
    <div className="relative flex-1 flex flex-col">
      <div
        ref={canvasRef}
        className="flex-1 overflow-auto bg-canvas workflow-grid-bg cursor-grab active:cursor-grabbing"
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={handleCanvasMouseUp}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <div
          ref={contentRef}
          style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: "0 0" }}
          className="absolute inset-0"
        >
          <CanvasConnections nodes={nodes} connections={connections} />
          {nodes.map((node) => (
            <CanvasNode
              key={node.id}
              node={node}
              isSelected={selectedNodeId === node.id}
              onMouseDown={(e) => handleNodeMouseDown(node.id, e)}
              onConnectorStart={() => handleConnectorStart(node.id)}
              onConnectorEnd={() => handleConnectorEnd(node.id)}
            />
          ))}
        </div>

        {nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center text-muted-foreground">
              <p className="text-lg font-medium">Drag nodes from the sidebar</p>
              <p className="text-sm mt-1">to start building your workflow</p>
            </div>
          </div>
        )}
      </div>

      {/* Zoom Controls */}
      <div className="absolute top-3 right-3 flex gap-1 z-20 pointer-events-auto">
        <Button 
          variant="outline" 
          size="icon" 
          className="h-8 w-8" 
          onClick={() => handleZoom("in")}
          title="Zoom In"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          className="h-8 w-8" 
          onClick={() => handleZoom("out")}
          title="Zoom Out"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
      </div>

      {/* Zoom Level Display */}
      <div className="absolute bottom-12 right-3 text-xs text-muted-foreground bg-card/80 px-2 py-1 rounded border border-border pointer-events-none">
        {Math.round(zoom * 100)}%
      </div>
    </div>
  );
}
