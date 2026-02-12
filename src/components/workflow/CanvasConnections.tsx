import { WorkflowNode, NodeConnection, ConnectionType } from "@/types/workflow";

interface CanvasConnectionsProps {
  nodes: WorkflowNode[];
  connections: NodeConnection[];
  selectedNodeId?: string | null;
}

const connectionColors: Record<ConnectionType, { stroke: string; label: string }> = {
  success: { stroke: "hsl(142, 60%, 45%)", label: "hsl(142, 60%, 35%)" },
  reject: { stroke: "hsl(0, 72%, 51%)", label: "hsl(0, 72%, 41%)" },
  revert: { stroke: "hsl(38, 92%, 50%)", label: "hsl(38, 82%, 40%)" },
  draft: { stroke: "hsl(220, 15%, 55%)", label: "hsl(220, 15%, 45%)" },
  fail: { stroke: "hsl(0, 72%, 51%)", label: "hsl(0, 72%, 41%)" },
  default: { stroke: "hsl(220, 15%, 55%)", label: "hsl(220, 15%, 45%)" },
};

export function CanvasConnections({ nodes, connections, selectedNodeId }: CanvasConnectionsProps) {
  const NODE_W = 180;
  const NODE_H = 48;

  const connectedIds = new Set<string>();
  if (selectedNodeId) {
    connections.forEach((c) => {
      if (c.sourceId === selectedNodeId || c.targetId === selectedNodeId) {
        connectedIds.add(c.id);
      }
    });
  }

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ width: "5000px", height: "5000px" }}>
      <defs>
        {/* Arrowheads per color */}
        {Object.entries(connectionColors).map(([type, { stroke }]) => (
          <marker
            key={type}
            id={`arrow-${type}`}
            markerWidth="12"
            markerHeight="8"
            refX="11"
            refY="4"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <polygon points="0 0, 12 4, 0 8" fill={stroke} />
          </marker>
        ))}
        {/* Glow filter for selected paths */}
        <filter id="conn-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {/* Animated dash for flow indication */}
        <style>{`
          .flow-path { stroke-dasharray: 8 4; animation: flowDash 1.5s linear infinite; }
          @keyframes flowDash { to { stroke-dashoffset: -24; } }
        `}</style>
      </defs>

      {connections.map((conn) => {
        const source = nodes.find((n) => n.id === conn.sourceId);
        const target = nodes.find((n) => n.id === conn.targetId);
        if (!source || !target) return null;

        const type: ConnectionType = conn.connectionType || "default";
        const colors = connectionColors[type];
        const isHighlighted = connectedIds.has(conn.id);
        const isDimmed = selectedNodeId && !isHighlighted;

        // Calculate connection points
        const isBackward = target.x + NODE_W / 2 < source.x;
        const isDownward = target.y > source.y + NODE_H;
        const isUpward = target.y + NODE_H < source.y;

        let d: string;

        if (isBackward) {
          // Backward: exit left, route above/below, enter left of target
          const sx = source.x;
          const sy = source.y + NODE_H / 2;
          const tx = target.x;
          const ty = target.y + NODE_H / 2;
          const loopX = Math.min(sx, tx) - 40;
          const routeY = Math.min(sy, ty) - 50;
          d = `M ${sx} ${sy} H ${loopX} V ${routeY} H ${tx + NODE_W / 2} V ${ty} H ${tx}`;
        } else if (isDownward || isUpward) {
          // Vertical: exit bottom/top of source, enter top/bottom of target
          const sx = source.x + NODE_W / 2;
          const sy = isDownward ? source.y + NODE_H : source.y;
          const tx = target.x + NODE_W / 2;
          const ty = isDownward ? target.y : target.y + NODE_H;
          const midY = (sy + ty) / 2;

          if (Math.abs(sx - tx) < 10) {
            d = `M ${sx} ${sy} V ${ty}`;
          } else {
            d = `M ${sx} ${sy} V ${midY} H ${tx} V ${ty}`;
          }
        } else {
          // Forward horizontal: exit right, enter left
          const sx = source.x + NODE_W;
          const sy = source.y + NODE_H / 2;
          const tx = target.x;
          const ty = target.y + NODE_H / 2;

          if (Math.abs(ty - sy) < 10) {
            d = `M ${sx} ${sy} H ${tx}`;
          } else {
            const mx = (sx + tx) / 2;
            d = `M ${sx} ${sy} H ${mx} V ${ty} H ${tx}`;
          }
        }

        // Label position (midpoint of path)
        const labelPos = getPathMidpoint(d);

        return (
          <g key={conn.id} className="group" style={{ opacity: isDimmed ? 0.25 : 1, transition: "opacity 0.3s" }}>
            {/* Hover hit area */}
            <path
              d={d}
              stroke="transparent"
              strokeWidth={16}
              fill="none"
              className="pointer-events-auto cursor-pointer"
            />
            {/* Highlight glow */}
            {isHighlighted && (
              <path
                d={d}
                stroke={colors.stroke}
                strokeWidth={4}
                fill="none"
                strokeLinejoin="round"
                strokeLinecap="round"
                filter="url(#conn-glow)"
                opacity={0.4}
              />
            )}
            {/* Main path */}
            <path
              d={d}
              stroke={colors.stroke}
              strokeWidth={isHighlighted ? 2.5 : 1.8}
              fill="none"
              strokeLinejoin="round"
              strokeLinecap="round"
              markerEnd={`url(#arrow-${type})`}
            />
            {/* Animated flow overlay on hover */}
            <path
              d={d}
              stroke={colors.stroke}
              strokeWidth={1.5}
              fill="none"
              strokeLinejoin="round"
              strokeLinecap="round"
              className="flow-path"
              opacity={0}
              style={{ opacity: 0 }}
            />
            {/* Label */}
            {conn.label && labelPos && (
              <g transform={`translate(${labelPos.x}, ${labelPos.y})`}>
                <rect
                  x={-conn.label.length * 3.5 - 6}
                  y={-9}
                  width={conn.label.length * 7 + 12}
                  height={18}
                  rx={4}
                  fill="hsl(0, 0%, 100%)"
                  stroke={colors.stroke}
                  strokeWidth={0.8}
                  opacity={0.95}
                />
                <text
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={10}
                  fontWeight={500}
                  fontFamily="Inter, sans-serif"
                  fill={colors.label}
                >
                  {conn.label}
                </text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function getPathMidpoint(d: string): { x: number; y: number } | null {
  // Parse simple M/H/V/L path commands to find midpoint
  const cmds = d.match(/[MHVL]\s*-?[\d.]+(?:\s+-?[\d.]+)?/gi);
  if (!cmds) return null;

  const points: { x: number; y: number }[] = [];
  let cx = 0, cy = 0;

  for (const cmd of cmds) {
    const type = cmd[0].toUpperCase();
    const nums = cmd.slice(1).trim().split(/\s+/).map(Number);
    if (type === "M" || type === "L") {
      cx = nums[0]; cy = nums[1];
    } else if (type === "H") {
      cx = nums[0];
    } else if (type === "V") {
      cy = nums[0];
    }
    points.push({ x: cx, y: cy });
  }

  if (points.length < 2) return null;

  // Get total length and find midpoint
  let totalLen = 0;
  const segments: { from: typeof points[0]; to: typeof points[0]; len: number }[] = [];
  for (let i = 1; i < points.length; i++) {
    const len = Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
    segments.push({ from: points[i - 1], to: points[i], len });
    totalLen += len;
  }

  let target = totalLen / 2;
  for (const seg of segments) {
    if (target <= seg.len) {
      const t = seg.len > 0 ? target / seg.len : 0;
      return {
        x: seg.from.x + (seg.to.x - seg.from.x) * t,
        y: seg.from.y + (seg.to.y - seg.from.y) * t,
      };
    }
    target -= seg.len;
  }

  return points[Math.floor(points.length / 2)];
}
