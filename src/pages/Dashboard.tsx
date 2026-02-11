import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Activity, Zap, AlertTriangle, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatCard } from "@/components/workflow/StatCard";
import { WorkflowTable } from "@/components/workflow/WorkflowTable";
import { mockWorkflows, dashboardStats } from "@/data/mockData";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Dashboard = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [workflows, setWorkflows] = useState(mockWorkflows);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = workflows.filter(
    (wf) =>
      wf.name.toLowerCase().includes(search.toLowerCase()) ||
      wf.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  const handleDelete = () => {
    if (deleteId) {
      setWorkflows((prev) => prev.filter((w) => w.id !== deleteId));
      setDeleteId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            <h1 className="text-lg font-semibold">FlowForge</h1>
          </div>
          <Button onClick={() => navigate("/editor/new")} size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            New Workflow
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Workflows"
            value={dashboardStats.totalWorkflows}
            icon={<Workflow className="h-5 w-5" />}
          />
          <StatCard
            label="Active"
            value={dashboardStats.activeWorkflows}
            icon={<Activity className="h-5 w-5" />}
            accent="bg-status-success/15 text-status-success"
          />
          <StatCard
            label="Executions Today"
            value={dashboardStats.totalExecutionsToday}
            icon={<Zap className="h-5 w-5" />}
            accent="bg-status-running/15 text-status-running"
          />
          <StatCard
            label="Errors"
            value={dashboardStats.errorCount}
            icon={<AlertTriangle className="h-5 w-5" />}
            accent="bg-status-error/15 text-status-error"
          />
        </div>

        {/* Workflow List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold">Workflows</h2>
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search workflows..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {filtered.length > 0 ? (
            <WorkflowTable workflows={filtered} onDelete={setDeleteId} />
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <Workflow className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <p>No workflows found</p>
            </div>
          )}
        </div>
      </main>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Workflow</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the workflow and all its execution history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Dashboard;
