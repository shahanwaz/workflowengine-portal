import { WorkflowNode } from "@/types/workflow";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface NodePropertiesPanelProps {
  node: WorkflowNode;
  onUpdate: (id: string, updates: Partial<WorkflowNode>) => void;
  onClose: () => void;
}

const categoryLabel: Record<string, string> = {
  trigger: "Trigger",
  action: "Action",
  function: "Function",
  integration: "Integration",
};

export function NodePropertiesPanel({ node, onUpdate, onClose }: NodePropertiesPanelProps) {
  return (
    <div className="w-72 border-l border-border bg-card flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold">Node Properties</h3>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Label</Label>
          <Input
            value={node.label}
            onChange={(e) => onUpdate(node.id, { label: e.target.value })}
            className="h-8 text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Type</Label>
          <div className="text-sm font-mono bg-muted px-3 py-1.5 rounded-md">{node.type}</div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Category</Label>
          <div className="text-sm capitalize bg-muted px-3 py-1.5 rounded-md">{categoryLabel[node.category]}</div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Position</Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[11px] text-muted-foreground">X</span>
              <Input value={Math.round(node.x)} readOnly className="h-8 text-sm font-mono" />
            </div>
            <div>
              <span className="text-[11px] text-muted-foreground">Y</span>
              <Input value={Math.round(node.y)} readOnly className="h-8 text-sm font-mono" />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Configure this node's settings to define its behavior in the workflow.
          </p>
        </div>
      </div>
    </div>
  );
}
