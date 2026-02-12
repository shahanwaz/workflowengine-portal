export type WorkflowStatus = "active" | "inactive" | "error" | "running";

export interface Workflow {
  id: string;
  name: string;
  description: string;
  status: WorkflowStatus;
  lastRun: string;
  createdAt: string;
  owner: string;
  nodesCount: number;
  executionsToday: number;
  tags: string[];
  projectId: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  owner: string;
}

export type NodeCategory = "trigger" | "action" | "function" | "integration" | "condition";

export interface WorkflowNode {
  id: string;
  type: string;
  label: string;
  category: NodeCategory;
  x: number;
  y: number;
  config?: Record<string, unknown>;
  icon?: string;
}

export interface NodeConnection {
  id: string;
  sourceId: string;
  targetId: string;
}

export interface NodeTemplate {
  type: string;
  label: string;
  category: NodeCategory;
  description: string;
  icon: string;
}
