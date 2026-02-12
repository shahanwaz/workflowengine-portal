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

        const nodeWidth = 160;
        const nodeHeight = 44;
        const isBackward = target.x + nodeWidth <= source.x + nodeWidth; // target is to the left or same column

        let d: string;

        if (isBackward) {
          // "Go back" connection: route from left of source, loop around, arrive at left (start) of target
          const sx = source.x; // left edge of source
          const sy = source.y + nodeHeight / 2;
          const tx = target.x; // left edge (start) of target
          const ty = target.y + nodeHeight / 2;
          const offset = 30; // how far the loop extends to the left

          const loopX = Math.min(sx, tx) - offset;
          const loopTopY = Math.min(sy, ty) - 30;

          d = `M ${sx} ${sy} L ${loopX} ${sy} L ${loopX} ${ty} L ${tx} ${ty}`;
        } else {
          // Forward connection
          const sx = source.x + nodeWidth;
          const sy = source.y + nodeHeight / 2;
          const tx = target.x;
          const ty = target.y + nodeHeight / 2;

          const dy = Math.abs(ty - sy);
          const isAligned = dy < 10;

          if (isAligned) {
            d = `M ${sx} ${sy} L ${tx} ${ty}`;
          } else {
            const mx = (sx + tx) / 2;
            d = `M ${sx} ${sy} L ${mx} ${sy} L ${mx} ${ty} L ${tx} ${ty}`;
          }
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
