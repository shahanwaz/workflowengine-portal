import { nodeTemplates } from "@/data/nodeTemplates";
import { NodeCategory } from "@/types/workflow";
import {
  Webhook, Clock, Mail, Radio, Globe, Send, Database, MessageSquare,
  Code, Filter, Shuffle, GitBranch, Github, Sheet, CreditCard, Sparkles,
} from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  Webhook, Clock, Mail, Radio, Globe, Send, Database, MessageSquare,
  Code, Filter, Shuffle, GitBranch, Github, Sheet, CreditCard, Sparkles,
};

const categoryLabels: Record<NodeCategory, string> = {
  trigger: "Triggers",
  action: "Actions",
  function: "Functions",
  integration: "Integrations",
};

const categoryDotColor: Record<NodeCategory, string> = {
  trigger: "bg-node-trigger",
  action: "bg-node-action",
  function: "bg-node-function",
  integration: "bg-node-integration",
};

export function NodeLibrarySidebar() {
  const [search, setSearch] = useState("");

  const filtered = nodeTemplates.filter(
    (n) =>
      n.label.toLowerCase().includes(search.toLowerCase()) ||
      n.description.toLowerCase().includes(search.toLowerCase())
  );

  const grouped = (["trigger", "action", "function", "integration"] as NodeCategory[]).map((cat) => ({
    category: cat,
    nodes: filtered.filter((n) => n.category === cat),
  })).filter((g) => g.nodes.length > 0);

  const handleDragStart = (e: React.DragEvent, type: string, category: NodeCategory) => {
    e.dataTransfer.setData("nodeType", type);
    e.dataTransfer.setData("nodeCategory", category);
  };

  return (
    <div className="w-64 border-r border-border bg-card flex flex-col h-full">
      <div className="p-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search nodes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-4">
        {grouped.map(({ category, nodes }) => (
          <div key={category}>
            <div className="flex items-center gap-2 px-2 mb-2">
              <div className={`h-2 w-2 rounded-full ${categoryDotColor[category]}`} />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {categoryLabels[category]}
              </span>
            </div>
            <div className="space-y-0.5">
              {nodes.map((node) => {
                const Icon = iconMap[node.icon] || Code;
                return (
                  <div
                    key={node.type}
                    draggable
                    onDragStart={(e) => handleDragStart(e, node.type, node.category)}
                    className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-grab active:cursor-grabbing hover:bg-accent transition-colors"
                  >
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{node.label}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{node.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
