import { Workflow, Project } from "@/types/workflow";

export const mockProjects: Project[] = [
  {
    id: "proj-mtcte",
    name: "MTCTE Portal",
    description: "Mandatory Testing and Certification of Telecom Equipment portal",
    createdAt: "2026-01-01T09:00:00Z",
    owner: "Admin",
  },
];

export const mockWorkflows: Workflow[] = [
  {
    id: "er-cert",
    name: "Mandatory Certification - ER Certification",
    description: "End-to-end ER certification workflow with multi-level approvals, payment gateway, and certificate generation",
    status: "active",
    lastRun: "2026-02-12T06:00:00Z",
    createdAt: "2026-02-01T09:00:00Z",
    owner: "Admin",
    nodesCount: 16,
    executionsToday: 8,
    tags: ["certification", "mandatory", "ER"],
    projectId: "proj-mtcte",
  },
];

export const dashboardStats = {
  totalWorkflows: 1,
  activeWorkflows: 1,
  totalExecutionsToday: 8,
  errorCount: 0,
};
