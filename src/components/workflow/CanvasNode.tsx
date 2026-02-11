import { WorkflowNode, NodeCategory } from "@/types/workflow";
import {
  Webhook, Clock, Mail, Radio, Globe, Send, Database, MessageSquare,
  Code, Filter, Shuffle, GitBranch, Github, Sheet, CreditCard, Sparkles,
} from "lucide-react";
import { MouseEvent } from "react";

const iconMap: Record<string, React.ElementType> = {
  Webhook, Clock, Mail, Radio, Globe, Send, Database, MessageSquare,
  Code, Filter, Shuffle, GitBranch, Github, Sheet, CreditCard, Sparkles,
};

const categoryStyles: Record<NodeCategory, string> = {
  trigger: "border-node-trigger bg-node-trigger-bg",
  action: "border-node-action bg-node-action-bg",
  function: "border-node-function bg-node-function-bg",
  integration: "border-node-integration bg-node-integration-bg",
};

const categoryIconColor: Record<NodeCategory, string> = {
  trigger: "text-node-trigger",
  action: "text-node-action",
  function: "text-node-function",
  integration: "text-node-integration",
};

interface CanvasNodeProps {
  node: WorkflowNode;
  isSelected: boolean;
  onMouseDown: (e: MouseEvent) => void;
  onConnectorStart: () => void;
  onConnectorEnd: () => void;
}

export function CanvasNode({ node, isSelected, onMouseDown, onConnectorStart, onConnectorEnd }: CanvasNodeProps) {
  const Icon = iconMap[node.icon || "Code"] || Code;

  return (
    <div
      className={`absolute select-none group ${isSelected ? "z-20" : "z-10"}`}
      style={{ left: node.x, top: node.y }}
      onMouseDown={onMouseDown}
    >
      {/* Input connector */}
      <div
        className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-canvas-connector bg-card cursor-crosshair hover:scale-125 transition-transform z-30"
        onMouseUp={(e) => { e.stopPropagation(); onConnectorEnd(); }}
      />

      {/* Node body */}
      <div
        className={`rounded-xl border-2 px-4 py-3 min-w-[160px] shadow-sm transition-shadow cursor-move
          ${categoryStyles[node.category]}
          ${isSelected ? "ring-2 ring-ring shadow-lg" : "hover:shadow-md"}`}
      >
        <div className="flex items-center gap-2.5">
          <Icon className={`h-5 w-5 ${categoryIconColor[node.category]}`} />
          <span className="text-sm font-medium truncate">{node.label}</span>
        </div>
      </div>

      {/* Output connector */}
      <div
        className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-canvas-connector bg-card cursor-crosshair hover:scale-125 transition-transform z-30"
        onMouseDown={(e) => { e.stopPropagation(); onConnectorStart(); }}
      />
    </div>
  );
}
