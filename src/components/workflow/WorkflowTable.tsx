import { Workflow } from "@/types/workflow";
import { StatusBadge } from "./StatusBadge";
import { formatDistanceToNow } from "date-fns";
import { MoreHorizontal, Play, Trash2, Copy, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";

interface WorkflowTableProps {
  workflows: Workflow[];
  onDelete: (id: string) => void;
}

export function WorkflowTable({ workflows, onDelete }: WorkflowTableProps) {
  const navigate = useNavigate();

  return (
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
          {workflows.map((wf) => (
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
                {formatDistanceToNow(new Date(wf.lastRun), { addSuffix: true })}
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
                      onClick={() => onDelete(wf.id)}
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
  );
}
