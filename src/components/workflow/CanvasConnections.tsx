import { WorkflowNode, NodeConnection } from "@/types/workflow";

interface CanvasConnectionsProps {
  nodes: WorkflowNode[];
  connections: NodeConnection[];
}

export function CanvasConnections({ nodes, connections }: CanvasConnectionsProps) {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ width: "5000px", height: "5000px" }}>
      {connections.map((conn) => {
        const source = nodes.find((n) => n.id === conn.sourceId);
        const target = nodes.find((n) => n.id === conn.targetId);
        if (!source || !target) return null;

        const sx = source.x + 160; // right side of node
        const sy = source.y + 22;  // vertical center
        const tx = target.x;       // left side of target
        const ty = target.y + 22;

        const mx = (sx + tx) / 2;

        return (
          <path
            key={conn.id}
            d={`M ${sx} ${sy} C ${mx} ${sy}, ${mx} ${ty}, ${tx} ${ty}`}
            stroke="hsl(var(--canvas-connector))"
            strokeWidth={2}
            fill="none"
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}
