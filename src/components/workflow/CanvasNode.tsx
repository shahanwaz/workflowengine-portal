import { WorkflowNode, NodeCategory } from "@/types/workflow";
import {
  Webhook, Clock, Mail, Radio, Globe, Send, Database, MessageSquare,
  Code, Filter, Shuffle, GitBranch, Github, Sheet, CreditCard, Sparkles,
  FileText, UserCheck, FileOutput, Smartphone, ClipboardCheck, Award, Receipt,
  GitMerge, Repeat, GitFork, Merge, CircleStop, Save, Undo2, Play,
} from "lucide-react";
import { MouseEvent } from "react";

const iconMap: Record<string, React.ElementType> = {
  Webhook, Clock, Mail, Radio, Globe, Send, Database, MessageSquare,
  Code, Filter, Shuffle, GitBranch, Github, Sheet, CreditCard, Sparkles,
  FileText, UserCheck, FileOutput, Smartphone, ClipboardCheck, Award, Receipt,
  GitMerge, Repeat, GitFork, Merge, CircleStop, Save, Undo2, Play,
};

const categoryStyles: Record<NodeCategory, string> = {
  trigger: "border-node-trigger bg-node-trigger-bg",
  action: "border-node-action bg-node-action-bg",
  function: "border-node-function bg-node-function-bg",
  integration: "border-node-integration bg-node-integration-bg",
  condition: "border-node-condition bg-node-condition-bg",
};

const categoryIconColor: Record<NodeCategory, string> = {
  trigger: "text-node-trigger",
  action: "text-node-action",
  function: "text-node-function",
  integration: "text-node-integration",
  condition: "text-node-condition",
};

interface CanvasNodeProps {
  node: WorkflowNode;
  isSelected: boolean;
  isDimmed?: boolean;
  onMouseDown: (e: MouseEvent) => void;
  onConnectorStart: () => void;
  onConnectorEnd: () => void;
}

export function CanvasNode({ node, isSelected, isDimmed, onMouseDown, onConnectorStart, onConnectorEnd }: CanvasNodeProps) {
  const Icon = iconMap[node.icon || "Code"] || Code;
  const isEndNode = node.type === "end";
  const isStartNode = node.type === "form-submission" && node.id === "er-1";
  const isGoBack = node.type === "go-back";

  // Special styles for start/end/go-back nodes
  let specialStyle = "";
  let specialIconStyle = "";
  let shapeClass = "rounded-xl";

  if (isEndNode) {
    specialStyle = "border-destructive/60 bg-destructive/10";
    specialIconStyle = "text-destructive";
    shapeClass = "rounded-full";
  } else if (isStartNode) {
    specialStyle = "border-primary bg-primary/10 ring-2 ring-primary/20";
    specialIconStyle = "text-primary";
  } else if (isGoBack) {
    specialStyle = "border-status-warning/60 bg-status-warning/10";
    specialIconStyle = "text-status-warning";
    shapeClass = "rounded-lg";
  }

  const baseStyle = specialStyle || categoryStyles[node.category];
  const iconStyle = specialIconStyle || categoryIconColor[node.category];

  return (
    <div
      className={`absolute select-none group transition-opacity duration-300 ${isSelected ? "z-20" : "z-10"}`}
      style={{
        left: node.x,
        top: node.y,
        opacity: isDimmed ? 0.3 : 1,
      }}
      onMouseDown={onMouseDown}
    >
      {/* Input connector */}
      <div
        className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-[10px] h-[10px] rounded-full border-2 border-canvas-connector bg-card cursor-crosshair hover:scale-150 hover:border-primary transition-all z-30"
        onMouseUp={(e) => { e.stopPropagation(); onConnectorEnd(); }}
      />

      {/* Node body */}
      <div
        className={`${shapeClass} border-2 px-5 py-3 min-w-[200px] shadow-sm transition-all duration-200 cursor-move
          ${baseStyle}
          ${isSelected
            ? "ring-2 ring-primary shadow-lg shadow-primary/20"
            : "hover:shadow-md"
          }`}
      >
        <div className="flex items-center gap-3">
          {isStartNode && (
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0">
              <Play className="h-3 w-3 text-primary-foreground ml-0.5" />
            </div>
          )}
          {isEndNode && (
            <div className="w-6 h-6 rounded-full bg-destructive/80 flex items-center justify-center shrink-0">
              <CircleStop className="h-3.5 w-3.5 text-destructive-foreground" />
            </div>
          )}
          {!isStartNode && !isEndNode && (
            <Icon className={`h-5 w-5 shrink-0 ${iconStyle}`} />
          )}
          <span className="text-sm font-medium truncate">{node.label}</span>
        </div>
      </div>

      {/* Output connector */}
      <div
        className="absolute -right-2.5 top-1/2 -translate-y-1/2 w-[10px] h-[10px] rounded-full border-2 border-canvas-connector bg-card cursor-crosshair hover:scale-150 hover:border-primary transition-all z-30"
        onMouseDown={(e) => { e.stopPropagation(); onConnectorStart(); }}
      />
    </div>
  );
}
