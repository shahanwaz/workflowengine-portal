import { WorkflowNode, NodeConnection } from "@/types/workflow";

interface CanvasConnectionsProps {
  nodes: WorkflowNode[];
  connections: NodeConnection[];
}

export function CanvasConnections({ nodes, connections }: CanvasConnectionsProps) {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ width: "5000px", height: "5000px" }}>
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="#000000" />
        </marker>
      </defs>
      {connections.map((conn) => {
        const source = nodes.find((n) => n.id === conn.sourceId);
        const target = nodes.find((n) => n.id === conn.targetId);
        if (!source || !target) return null;

        const sx = source.x + 160;
        const sy = source.y + 22;
        const tx = target.x;
        const ty = target.y + 22;

        // Determine if elbow is needed (when nodes aren't roughly aligned)
        const dx = Math.abs(tx - sx);
        const dy = Math.abs(ty - sy);
        const isAligned = dy < 10; // roughly on same row

        let d: string;
        if (isAligned) {
          // Straight horizontal line
          d = `M ${sx} ${sy} L ${tx} ${ty}`;
        } else {
          // Elbow connector: go right to midpoint, then vertical, then horizontal to target
          const mx = (sx + tx) / 2;
          d = `M ${sx} ${sy} L ${mx} ${sy} L ${mx} ${ty} L ${tx} ${ty}`;
        }

        return (
          <path
            key={conn.id}
            d={d}
            stroke="#000000"
            strokeWidth={2}
            fill="none"
            strokeLinejoin="round"
            strokeLinecap="round"
            markerEnd="url(#arrowhead)"
          />
        );
      })}
    </svg>
  );
}
