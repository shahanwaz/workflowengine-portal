import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus, Search, ArrowLeft, Trash2, Workflow, MoreHorizontal, Settings, Play, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mockWorkflows, mockProjects } from "@/data/mockData";
import { Workflow as WorkflowType } from "@/types/workflow";
import { StatusBadge } from "@/components/workflow/StatusBadge";
import { formatDistanceToNow } from "date-fns";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Zap } from "lucide-react";

const ProjectWorkflows = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const project = mockProjects.find((p) => p.id === projectId);

  const [search, setSearch] = useState("");
  const [workflows, setWorkflows] = useState<WorkflowType[]>(
    mockWorkflows.filter((w) => w.projectId === projectId)
  );
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");

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

  const handleAdd = () => {
    if (!newName.trim()) return;
    const newWf: WorkflowType = {
      id: `wf-${Date.now()}`,
      name: newName.trim(),
      description: newDesc.trim(),
      status: "inactive",
      lastRun: "",
      createdAt: new Date().toISOString(),
      owner: "You",
      nodesCount: 0,
      executionsToday: 0,
      tags: [],
      projectId: projectId || "",
    };
    setWorkflows((prev) => [...prev, newWf]);
    setNewName("");
    setNewDesc("");
    setAddOpen(false);
  };

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Project not found</p>
          <Button onClick={() => navigate("/")}>Back to Projects</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Zap className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-semibold leading-tight">{project.name}</h1>
                <p className="text-xs text-muted-foreground">{project.description}</p>
              </div>
            </div>
          </div>
          <Button onClick={() => setAddOpen(true)} size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            New Workflow
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Search */}
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

        {/* Workflow Table */}
        {filtered.length > 0 ? (
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left font-medium text-muted-foreground px-4 py-3">Name</th>
                  <th className="text-left font-medium text-muted-foreground px-4 py-3">Status</th>
                  <th className="text-left font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">Last Run</th>
                  <th className="text-left font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell">Owner</th>
                  <th className="text-left font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell">Runs Today</th>
                  <th className="text-right font-medium text-muted-foreground px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((wf) => (
                  <tr
                    key={wf.id}
                    className="border-b border-border last:border-0 hover:bg-muted/30 cursor-pointer transition-colors"
                    onClick={() => navigate(`/editor/${wf.id}`)}
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">{wf.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{wf.description}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={wf.status} />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                      {wf.lastRun ? formatDistanceToNow(new Date(wf.lastRun), { addSuffix: true }) : "Never"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{wf.owner}</td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="font-mono text-xs">{wf.executionsToday}</span>
                    </td>
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/editor/${wf.id}`)}>
                            <Settings className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Play className="mr-2 h-4 w-4" /> Run Now
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="mr-2 h-4 w-4" /> Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setDeleteId(wf.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <Workflow className="h-12 w-12 mx-auto mb-3 opacity-40" />
            <p>No workflows found</p>
          </div>
        )}
      </main>

      {/* Add Workflow Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Workflow</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Workflow Name</Label>
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. ER Certification" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Brief description..." rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={!newName.trim()}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

export default ProjectWorkflows;
