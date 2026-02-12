import { WorkflowNode } from "@/types/workflow";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

const nodeTypeOptions = [
  { value: "approver", label: "Approver" },
  { value: "applicant", label: "Applicant" },
  { value: "cert-manager", label: "Cert Manager" },
  { value: "integration", label: "Integration" },
  { value: "cab", label: "CAB" },
];

export function NodePropertiesPanel({ node, onUpdate, onClose }: NodePropertiesPanelProps) {
  const configType = (node.config?.nodeType as string) || "";
  const formJson = (node.config?.formJson as string) || "";
  const rule = (node.config?.rule as string) || "";

  const updateConfig = (key: string, value: string) => {
    onUpdate(node.id, {
      config: { ...node.config, [key]: value },
    });
  };

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
          <Select value={configType} onValueChange={(v) => updateConfig("nodeType", v)}>
            <SelectTrigger className="h-8 text-sm">
              <SelectValue placeholder="Select type..." />
            </SelectTrigger>
            <SelectContent>
              {nodeTypeOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Category</Label>
          <div className="text-sm capitalize bg-muted px-3 py-1.5 rounded-md">{categoryLabel[node.category]}</div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Form JSON</Label>
          <Input
            value={formJson}
            onChange={(e) => updateConfig("formJson", e.target.value)}
            placeholder="https://formio.example.com/form/..."
            className="h-8 text-sm"
          />
          <p className="text-[10px] text-muted-foreground">Link to Form.io platform form definition</p>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Rule</Label>
          <Textarea
            value={rule}
            onChange={(e) => updateConfig("rule", e.target.value)}
            placeholder="Define rule logic..."
            className="text-sm min-h-[80px] resize-y"
          />
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
      </div>
    </div>
  );
}
