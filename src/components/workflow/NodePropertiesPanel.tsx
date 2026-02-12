import { WorkflowNode } from "@/types/workflow";
import { X, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface NodeAction {
  action: string;
  level: string;
  json: string;
}

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

const actionOptions = [
  { value: "approve", label: "Approve" },
  { value: "reject", label: "Reject" },
  { value: "revert", label: "Revert" },
  { value: "submit", label: "Submit" },
  { value: "draft-save", label: "Draft Save" },
  { value: "success", label: "Success" },
  { value: "fail", label: "Fail" },
];

const levelOptions = [
  { value: "level-1", label: "Level-1" },
  { value: "level-2", label: "Level-2" },
  { value: "level-3", label: "Level-3" },
  { value: "applicant", label: "Applicant" },
  { value: "no-action", label: "No. Action" },
];

export function NodePropertiesPanel({ node, onUpdate, onClose }: NodePropertiesPanelProps) {
  const configType = (node.config?.nodeType as string) || "";
  const formJson = (node.config?.formJson as string) || "";
  const actions = (node.config?.actions as NodeAction[]) || [];

  const updateConfig = (key: string, value: unknown) => {
    onUpdate(node.id, {
      config: { ...node.config, [key]: value },
    });
  };

  const addAction = () => {
    updateConfig("actions", [...actions, { action: "", level: "", json: "" }]);
  };

  const updateAction = (index: number, field: keyof NodeAction, value: string) => {
    const updated = actions.map((a, i) => (i === index ? { ...a, [field]: value } : a));
    updateConfig("actions", updated);
  };

  const removeAction = (index: number) => {
    updateConfig("actions", actions.filter((_, i) => i !== index));
  };

  return (
    <div className="w-80 border-l border-border bg-card flex flex-col h-full">
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
          <Label className="text-xs text-muted-foreground">Form JSON ID</Label>
          <Input
            value={formJson}
            onChange={(e) => updateConfig("formJson", e.target.value)}
            placeholder="https://formio.example.com/form/..."
            className="h-8 text-sm"
          />
          <p className="text-[10px] text-muted-foreground">Link to Form.io platform form definition</p>
        </div>

        {/* Actions Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Actions</Label>
            <Button variant="outline" size="icon" className="h-6 w-6" onClick={addAction}>
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>

          {actions.length === 0 && (
            <p className="text-[11px] text-muted-foreground italic">No actions added. Click + to add one.</p>
          )}

          {actions.map((act, i) => (
            <div key={i} className="border border-border rounded-lg p-2.5 space-y-2 bg-muted/40">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-muted-foreground">Action {i + 1}</span>
                <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => removeAction(i)}>
                  <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground">Action</span>
                  <Select value={act.action} onValueChange={(v) => updateAction(i, "action", v)}>
                    <SelectTrigger className="h-7 text-xs">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {actionOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground">Level</span>
                  <Select value={act.level} onValueChange={(v) => updateAction(i, "level", v)}>
                    <SelectTrigger className="h-7 text-xs">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {levelOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground">JSON</span>
                <Input
                  value={act.json}
                  onChange={(e) => updateAction(i, "json", e.target.value)}
                  placeholder="JSON config..."
                  className="h-7 text-xs"
                />
              </div>
            </div>
          ))}
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
