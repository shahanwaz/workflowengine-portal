import { WorkflowStatus } from "@/types/workflow";
import { Activity, AlertTriangle, CheckCircle2, Pause, Loader2 } from "lucide-react";

interface StatusBadgeProps {
  status: WorkflowStatus;
}

const statusConfig: Record<WorkflowStatus, { label: string; className: string; Icon: React.ElementType }> = {
  active: {
    label: "Active",
    className: "bg-status-success/15 text-status-success border-status-success/30",
    Icon: CheckCircle2,
  },
  inactive: {
    label: "Inactive",
    className: "bg-muted text-muted-foreground border-border",
    Icon: Pause,
  },
  error: {
    label: "Error",
    className: "bg-status-error/15 text-status-error border-status-error/30",
    Icon: AlertTriangle,
  },
  running: {
    label: "Running",
    className: "bg-status-running/15 text-status-running border-status-running/30",
    Icon: Loader2,
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const { label, className, Icon } = statusConfig[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${className}`}>
      <Icon className={`h-3 w-3 ${status === "running" ? "animate-spin" : ""}`} />
      {label}
    </span>
  );
}
