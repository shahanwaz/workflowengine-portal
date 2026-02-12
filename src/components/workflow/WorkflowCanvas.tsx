import { useState, useCallback, useRef, MouseEvent, WheelEvent, useEffect } from "react";
import { WorkflowNode, NodeConnection, NodeCategory } from "@/types/workflow";
import { CanvasNode } from "./CanvasNode";
import { CanvasConnections } from "./CanvasConnections";
import { ZoomIn, ZoomOut, Maximize2, Grid3X3 } from "lucide-react";
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
  const dragStartRef = useRef<{ nodeX: number; nodeY: number; mouseX: number; mouseY: number } | null>(null);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [spaceHeld, setSpaceHeld] = useState(false);

  // Space key for panning
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !e.repeat) {
        e.preventDefault();
        setSpaceHeld(true);
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") setSpaceHeld(false);
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => { window.removeEventListener("keydown", onKeyDown); window.removeEventListener("keyup", onKeyUp); };
  }, []);

  // Connected node IDs for highlighting
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
      panStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    }
  };

  const handleCanvasMouseMove = (e: MouseEvent) => {
    if (isPanning || (spaceHeld && e.buttons === 1)) {
      if (!isPanning) {
        setIsPanning(true);
        panStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
      }
      setPan({ x: e.clientX - panStartRef.current.x, y: e.clientY - panStartRef.current.y });
      return;
    }
    if (draggingNodeId && dragStartRef.current) {
      const ds = dragStartRef.current;
      const dx = (e.clientX - ds.mouseX) / zoom;
      const dy = (e.clientY - ds.mouseY) / zoom;
      let newX = ds.nodeX + dx;
      let newY = ds.nodeY + dy;
      if (snapEnabled) {
        newX = snapToGrid(newX);
        newY = snapToGrid(newY);
      }
      onUpdateNode(draggingNodeId, { x: newX, y: newY });
    }
  };

  const handleCanvasMouseUp = () => {
    setDraggingNodeId(null);
    dragStartRef.current = null;
    setIsPanning(false);
    setConnectingFrom(null);
  };

  const handleNodeMouseDown = (id: string, e: MouseEvent) => {
    e.stopPropagation();
    if (spaceHeld) return; // allow panning through nodes
    const node = nodes.find((n) => n.id === id);
    if (!node) return;
    dragStartRef.current = {
      nodeX: node.x,
      nodeY: node.y,
      mouseX: e.clientX,
      mouseY: e.clientY,
    };
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

  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const delta = e.deltaY > 0 ? -0.08 : 0.08;
    const newZoom = Math.min(2.5, Math.max(0.2, zoom + delta));
    const scale = newZoom / zoom;

    // Zoom towards mouse position
    setPan({
      x: mouseX - (mouseX - pan.x) * scale,
      y: mouseY - (mouseY - pan.y) * scale,
    });
    setZoom(newZoom);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData("nodeType");
    const category = e.dataTransfer.getData("nodeCategory") as NodeCategory;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect && type) {
      let x = (e.clientX - rect.left - pan.x) / zoom;
      let y = (e.clientY - rect.top - pan.y) / zoom;
      if (snapEnabled) { x = snapToGrid(x); y = snapToGrid(y); }
      onDropNode(type, category, x, y);
    }
  };

  const handleZoom = (direction: "in" | "out") => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const delta = direction === "in" ? 0.2 : -0.2;
    const newZoom = Math.min(2.5, Math.max(0.2, zoom + delta));
    const scale = newZoom / zoom;
    setPan({ x: cx - (cx - pan.x) * scale, y: cy - (cy - pan.y) * scale });
    setZoom(newZoom);
  };

  const handleFitView = () => {
    if (nodes.length === 0) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const pad = 80;
    const minX = Math.min(...nodes.map((n) => n.x));
    const minY = Math.min(...nodes.map((n) => n.y));
    const maxX = Math.max(...nodes.map((n) => n.x + 200));
    const maxY = Math.max(...nodes.map((n) => n.y + 56));
    const contentW = maxX - minX + pad * 2;
    const contentH = maxY - minY + pad * 2;
    const newZoom = Math.min(1.2, rect.width / contentW, rect.height / contentH);
    setZoom(Math.max(0.2, newZoom));
    setPan({
      x: (rect.width - contentW * newZoom) / 2 + (pad - minX) * newZoom,
      y: (rect.height - contentH * newZoom) / 2 + (pad - minY) * newZoom,
    });
  };

  const cursorClass = spaceHeld
    ? "cursor-grab active:cursor-grabbing"
    : draggingNodeId
      ? "cursor-grabbing"
      : "cursor-default";

  return (
    <div className="relative flex-1 flex flex-col">
      <div
        ref={canvasRef}
        className={`flex-1 overflow-hidden bg-canvas workflow-grid-bg ${cursorClass}`}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={handleCanvasMouseUp}
        onWheel={handleWheel}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <div
          style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: "0 0" }}
          className="absolute inset-0"
        >
          {/* Connectors render below nodes */}
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

      {/* Controls */}
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
        <Button
          variant={snapEnabled ? "default" : "outline"}
          size="icon"
          className="h-8 w-8 bg-card/90 backdrop-blur-sm"
          onClick={() => setSnapEnabled(!snapEnabled)}
          title={snapEnabled ? "Snap to Grid: ON" : "Snap to Grid: OFF"}
        >
          <Grid3X3 className="h-4 w-4" />
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
