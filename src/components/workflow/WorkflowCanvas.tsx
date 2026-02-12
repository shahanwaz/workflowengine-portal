import { useState, useCallback, useRef, MouseEvent } from "react";
import { WorkflowNode, NodeConnection, NodeCategory } from "@/types/workflow";
import { CanvasNode } from "./CanvasNode";
import { CanvasConnections } from "./CanvasConnections";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const GRID_SIZE = 20;
const snapToGrid = (val: number) => Math.round(val / GRID_SIZE) * GRID_SIZE;

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
  nodes, connections, selectedNodeId, onSelectNode, onUpdateNode, onAddConnection, onDropNode,
}: WorkflowCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  // Determine which nodes are connected to selected
  const connectedNodeIds = new Set<string>();
  if (selectedNodeId) {
    connectedNodeIds.add(selectedNodeId);
    connections.forEach((c) => {
      if (c.sourceId === selectedNodeId) connectedNodeIds.add(c.targetId);
      if (c.targetId === selectedNodeId) connectedNodeIds.add(c.sourceId);
    });
  }

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
        const rawX = (e.clientX - rect.left - dragOffset.x - pan.x) / zoom;
        const rawY = (e.clientY - rect.top - dragOffset.y - pan.y) / zoom;
        onUpdateNode(draggingNodeId, {
          x: snapToGrid(rawX),
          y: snapToGrid(rawY),
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
        x: e.clientX - rect.left - pan.x - node.x * zoom,
        y: e.clientY - rect.top - pan.y - node.y * zoom,
      });
    }
    setDraggingNodeId(id);
    onSelectNode(id);
  };

  const handleConnectorStart = (nodeId: string) => setConnectingFrom(nodeId);

  const handleConnectorEnd = (nodeId: string) => {
    if (connectingFrom && connectingFrom !== nodeId) {
      onAddConnection({ id: `conn-${Date.now()}`, sourceId: connectingFrom, targetId: nodeId });
      setConnectingFrom(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData("nodeType");
    const category = e.dataTransfer.getData("nodeCategory") as NodeCategory;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect && type) {
      const x = snapToGrid((e.clientX - rect.left - pan.x) / zoom);
      const y = snapToGrid((e.clientY - rect.top - pan.y) / zoom);
      onDropNode(type, category, x, y);
    }
  };

  const handleZoom = (direction: "in" | "out") => {
    setZoom((prev) => Math.min(2, Math.max(0.3, direction === "in" ? prev + 0.15 : prev - 0.15)));
  };

  const handleFitView = () => {
    if (nodes.length === 0) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const minX = Math.min(...nodes.map((n) => n.x));
    const minY = Math.min(...nodes.map((n) => n.y));
    const maxX = Math.max(...nodes.map((n) => n.x + 180));
    const maxY = Math.max(...nodes.map((n) => n.y + 48));
    const contentW = maxX - minX + 120;
    const contentH = maxY - minY + 120;
    const newZoom = Math.min(1, rect.width / contentW, rect.height / contentH);
    setZoom(Math.max(0.3, newZoom));
    setPan({
      x: (rect.width - contentW * newZoom) / 2 - minX * newZoom + 60 * newZoom,
      y: (rect.height - contentH * newZoom) / 2 - minY * newZoom + 60 * newZoom,
    });
  };

  return (
    <div className="relative flex-1 flex flex-col">
      <div
        ref={canvasRef}
        className="flex-1 overflow-hidden bg-canvas workflow-grid-bg cursor-grab active:cursor-grabbing"
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={handleCanvasMouseUp}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <div
          style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: "0 0" }}
          className="absolute inset-0"
        >
          <CanvasConnections nodes={nodes} connections={connections} selectedNodeId={selectedNodeId} />
          {nodes.map((node) => (
            <CanvasNode
              key={node.id}
              node={node}
              isSelected={selectedNodeId === node.id}
              isDimmed={!!selectedNodeId && !connectedNodeIds.has(node.id)}
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
      <div className="absolute top-3 right-3 flex gap-1 z-20">
        <Button variant="outline" size="icon" className="h-8 w-8 bg-card/90 backdrop-blur-sm" onClick={() => handleZoom("in")} title="Zoom In">
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" className="h-8 w-8 bg-card/90 backdrop-blur-sm" onClick={() => handleZoom("out")} title="Zoom Out">
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" className="h-8 w-8 bg-card/90 backdrop-blur-sm" onClick={handleFitView} title="Fit View">
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Zoom Level */}
      <div className="absolute bottom-3 right-3 text-xs text-muted-foreground bg-card/90 backdrop-blur-sm px-2 py-1 rounded border border-border">
        {Math.round(zoom * 100)}%
      </div>

      {/* Flow legend */}
      <div className="absolute bottom-3 left-3 flex gap-3 text-[10px] font-medium bg-card/90 backdrop-blur-sm px-3 py-1.5 rounded border border-border z-20">
        <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-status-success rounded" /> Success</span>
        <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-destructive rounded" /> Reject</span>
        <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-status-warning rounded" /> Revert</span>
        <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-muted-foreground rounded" /> Draft</span>
      </div>
    </div>
  );
}
