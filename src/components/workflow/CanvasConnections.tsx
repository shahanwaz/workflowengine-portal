import { WorkflowNode, NodeConnection, ConnectionType } from "@/types/workflow";

interface CanvasConnectionsProps {
  nodes: WorkflowNode[];
  connections: NodeConnection[];
  selectedNodeId?: string | null;
}

const connectionColors: Record<ConnectionType, string> = {
  success: "#22c55e",
  reject: "#ef4444",
  revert: "#f59e0b",
  draft: "#94a3b8",
  fail: "#ef4444",
  default: "#94a3b8",
};

const NODE_W = 200;
const NODE_H = 48;
const CORNER_R = 8;
const CONNECTOR_PAD = 20; // min distance from node before first bend

export function CanvasConnections({ nodes, connections, selectedNodeId }: CanvasConnectionsProps) {
  const connectedIds = new Set<string>();
  if (selectedNodeId) {
    connections.forEach((c) => {
      if (c.sourceId === selectedNodeId || c.targetId === selectedNodeId) connectedIds.add(c.id);
    });
  }

  // Index connections per source to offset parallel outputs
  const sourceOutputIndex = new Map<string, number>();
  const sourceOutputCount = new Map<string, number>();
  connections.forEach((c) => {
    sourceOutputCount.set(c.sourceId, (sourceOutputCount.get(c.sourceId) || 0) + 1);
  });
  const sourceCounter = new Map<string, number>();

  return (
    <svg className="absolute inset-0 pointer-events-none" style={{ width: "6000px", height: "4000px", overflow: "visible" }}>
      <defs>
        {Object.entries(connectionColors).map(([type, color]) => (
          <marker
            key={type}
            id={`arrow-${type}`}
            markerWidth="10"
            markerHeight="8"
            refX="9"
            refY="4"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M 0 1 L 8 4 L 0 7" fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
          </marker>
        ))}
      </defs>

      {connections.map((conn) => {
        const source = nodes.find((n) => n.id === conn.sourceId);
        const target = nodes.find((n) => n.id === conn.targetId);
        if (!source || !target) return null;

        const type: ConnectionType = conn.connectionType || "default";
        const color = connectionColors[type];
        const isHighlighted = connectedIds.has(conn.id);
        const isDimmed = !!selectedNodeId && !isHighlighted;

        // Track output index for this source
        const idx = sourceCounter.get(conn.sourceId) || 0;
        sourceCounter.set(conn.sourceId, idx + 1);
        const totalOutputs = sourceOutputCount.get(conn.sourceId) || 1;

        const d = computePath(source, target, idx, totalOutputs, nodes);

        return (
          <g key={conn.id} style={{ opacity: isDimmed ? 0.15 : 1, transition: "opacity 0.3s" }}>
            {/* Hit area */}
            <path d={d} stroke="transparent" strokeWidth={14} fill="none" className="pointer-events-auto cursor-pointer" />
            {/* Glow for highlighted */}
            {isHighlighted && (
              <path d={d} stroke={color} strokeWidth={5} fill="none" strokeLinejoin="round" strokeLinecap="round" opacity={0.2} />
            )}
            {/* Main path */}
            <path
              d={d}
              stroke={color}
              strokeWidth={isHighlighted ? 2.2 : 1.6}
              fill="none"
              strokeLinejoin="round"
              strokeLinecap="round"
              markerEnd={`url(#arrow-${type})`}
            />
            {/* Label */}
            {conn.label && <ConnectionLabel d={d} label={conn.label} color={color} />}
          </g>
        );
      })}
    </svg>
  );
}

function computePath(
  source: WorkflowNode,
  target: WorkflowNode,
  outputIndex: number,
  totalOutputs: number,
  _allNodes: WorkflowNode[]
): string {
  const sCx = source.x + NODE_W / 2;
  const sCy = source.y + NODE_H / 2;
  const tCx = target.x + NODE_W / 2;
  const tCy = target.y + NODE_H / 2;

  const goingRight = tCx > sCx + NODE_W / 2;
  const goingDown = tCy > sCy + 10;
  const goingUp = tCy < sCy - 10;
  const goingLeft = tCx <= sCx - NODE_W / 2;
  const sameRow = !goingDown && !goingUp;

  // Offset for multiple outputs from same node
  const spreadTotal = (totalOutputs - 1) * 12;
  const offsetY = -spreadTotal / 2 + outputIndex * 12;

  if (goingRight && sameRow) {
    // Simple horizontal: right of source → left of target
    const sx = source.x + NODE_W;
    const sy = sCy + offsetY;
    const tx = target.x;
    const ty = tCy;
    if (Math.abs(sy - ty) < 5) {
      return `M ${sx} ${sy} L ${tx} ${ty}`;
    }
    const mx = (sx + tx) / 2;
    return roundedPath([
      { x: sx, y: sy }, { x: mx, y: sy }, { x: mx, y: ty }, { x: tx, y: ty }
    ]);
  }

  if (goingRight && goingDown) {
    // Forward + down: exit right or bottom
    const sx = source.x + NODE_W;
    const sy = sCy + offsetY;
    const tx = target.x + NODE_W / 2;
    const ty = target.y;

    // Route: right, then down to left of target, then right into target
    const tx2 = target.x;
    const mx = sx + CONNECTOR_PAD;
    if (tx2 > mx + 20) {
      return roundedPath([
        { x: sx, y: sy }, { x: mx, y: sy }, { x: mx, y: tCy }, { x: tx2, y: tCy }
      ]);
    }
    // go down from bottom of source, then right
    const sx2 = sCx;
    const sy2 = source.y + NODE_H;
    const midY = (sy2 + ty) / 2;
    return roundedPath([
      { x: sx2, y: sy2 }, { x: sx2, y: midY }, { x: tx, y: midY }, { x: tx, y: ty }
    ]);
  }

  if (goingRight && goingUp) {
    // Forward + up
    const sx = source.x + NODE_W;
    const sy = sCy + offsetY;
    const tx = target.x;
    const ty = tCy;
    const mx = (sx + tx) / 2;
    return roundedPath([
      { x: sx, y: sy }, { x: mx, y: sy }, { x: mx, y: ty }, { x: tx, y: ty }
    ]);
  }

  if (goingLeft) {
    // Backward: loop around above or below
    const sx = source.x; // exit left
    const sy = sCy + offsetY;
    const tx = target.x; // enter left
    const ty = tCy;

    // Route above both nodes
    const topY = Math.min(source.y, target.y) - 50 - outputIndex * 16;
    const loopX = Math.min(sx, tx) - 30 - outputIndex * 10;

    return roundedPath([
      { x: sx, y: sy },
      { x: loopX, y: sy },
      { x: loopX, y: topY },
      { x: tx + NODE_W / 2, y: topY },
      { x: tx + NODE_W / 2, y: target.y },
    ]);
  }

  // Same column, going down
  if (goingDown) {
    const sx = sCx + offsetY;
    const sy = source.y + NODE_H;
    const tx = tCx;
    const ty = target.y;
    if (Math.abs(sx - tx) < 5) {
      return `M ${sx} ${sy} L ${tx} ${ty}`;
    }
    const midY = (sy + ty) / 2;
    return roundedPath([
      { x: sx, y: sy }, { x: sx, y: midY }, { x: tx, y: midY }, { x: tx, y: ty }
    ]);
  }

  // Same column, going up
  if (goingUp) {
    const sx = sCx + offsetY;
    const sy = source.y;
    const tx = tCx;
    const ty = target.y + NODE_H;
    if (Math.abs(sx - tx) < 5) {
      return `M ${sx} ${sy} L ${tx} ${ty}`;
    }
    const midY = (sy + ty) / 2;
    return roundedPath([
      { x: sx, y: sy }, { x: sx, y: midY }, { x: tx, y: midY }, { x: tx, y: ty }
    ]);
  }

  // Fallback
  return `M ${source.x + NODE_W} ${sCy} L ${target.x} ${tCy}`;
}

/** Build an SVG path through waypoints with rounded corners */
function roundedPath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return "";
  if (pts.length === 2) return `M ${pts[0].x} ${pts[0].y} L ${pts[1].x} ${pts[1].y}`;

  let d = `M ${pts[0].x} ${pts[0].y}`;

  for (let i = 1; i < pts.length - 1; i++) {
    const prev = pts[i - 1];
    const curr = pts[i];
    const next = pts[i + 1];

    const d1 = Math.hypot(curr.x - prev.x, curr.y - prev.y);
    const d2 = Math.hypot(next.x - curr.x, next.y - curr.y);
    const r = Math.min(CORNER_R, d1 / 2, d2 / 2);

    // Point before corner
    const ratio1 = r / d1;
    const bx = curr.x - (curr.x - prev.x) * ratio1;
    const by = curr.y - (curr.y - prev.y) * ratio1;

    // Point after corner
    const ratio2 = r / d2;
    const ax = curr.x + (next.x - curr.x) * ratio2;
    const ay = curr.y + (next.y - curr.y) * ratio2;

    d += ` L ${bx} ${by} Q ${curr.x} ${curr.y} ${ax} ${ay}`;
  }

  const last = pts[pts.length - 1];
  d += ` L ${last.x} ${last.y}`;

  return d;
}

function ConnectionLabel({ d, label, color }: { d: string; label: string; color: string }) {
  const pos = getPathMidpoint(d);
  if (!pos) return null;

  const w = label.length * 6.5 + 16;

  return (
    <g transform={`translate(${pos.x}, ${pos.y})`}>
      <rect x={-w / 2} y={-10} width={w} height={20} rx={4} fill="white" stroke={color} strokeWidth={0.7} opacity={0.95} />
      <text textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight={500} fontFamily="Inter, sans-serif" fill={color}>
        {label}
      </text>
    </g>
  );
}

function getPathMidpoint(d: string): { x: number; y: number } | null {
  const cmds = d.match(/[MLQC]\s*-?[\d.]+[\s,]-?[\d.]+/gi);
  if (!cmds) return null;

  const points: { x: number; y: number }[] = [];
  for (const cmd of cmds) {
    const nums = cmd.slice(1).trim().split(/[\s,]+/).map(Number);
    if (nums.length >= 2) {
      points.push({ x: nums[nums.length - 2], y: nums[nums.length - 1] });
    }
  }

  if (points.length < 2) return null;

  let totalLen = 0;
  const segs: { from: typeof points[0]; to: typeof points[0]; len: number }[] = [];
  for (let i = 1; i < points.length; i++) {
    const len = Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
    segs.push({ from: points[i - 1], to: points[i], len });
    totalLen += len;
  }

  let target = totalLen / 2;
  for (const seg of segs) {
    if (target <= seg.len && seg.len > 0) {
      const t = target / seg.len;
      return {
        x: seg.from.x + (seg.to.x - seg.from.x) * t,
        y: seg.from.y + (seg.to.y - seg.from.y) * t,
      };
    }
    target -= seg.len;
  }
  return points[Math.floor(points.length / 2)];
}
