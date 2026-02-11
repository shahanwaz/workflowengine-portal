import { NodeTemplate } from "@/types/workflow";

export const nodeTemplates: NodeTemplate[] = [
  // Triggers
  { type: "webhook", label: "Webhook", category: "trigger", description: "Trigger on HTTP request", icon: "Webhook" },
  { type: "schedule", label: "Schedule", category: "trigger", description: "Run on a cron schedule", icon: "Clock" },
  { type: "email-trigger", label: "Email Received", category: "trigger", description: "Trigger when email arrives", icon: "Mail" },
  { type: "event", label: "Event Listener", category: "trigger", description: "Listen for system events", icon: "Radio" },
  
  // Actions
  { type: "http-request", label: "HTTP Request", category: "action", description: "Make an API call", icon: "Globe" },
  { type: "send-email", label: "Send Email", category: "action", description: "Send an email message", icon: "Send" },
  { type: "database-query", label: "Database Query", category: "action", description: "Execute a SQL query", icon: "Database" },
  { type: "slack-message", label: "Slack Message", category: "action", description: "Post to Slack channel", icon: "MessageSquare" },
  
  // Functions
  { type: "code", label: "Code", category: "function", description: "Run custom JavaScript", icon: "Code" },
  { type: "filter", label: "Filter", category: "function", description: "Filter items by condition", icon: "Filter" },
  { type: "transform", label: "Transform", category: "function", description: "Transform data shape", icon: "Shuffle" },
  { type: "switch", label: "Switch", category: "function", description: "Route by conditions", icon: "GitBranch" },
  
  // Integrations
  { type: "github", label: "GitHub", category: "integration", description: "GitHub API operations", icon: "Github" },
  { type: "google-sheets", label: "Google Sheets", category: "integration", description: "Read/write spreadsheets", icon: "Sheet" },
  { type: "stripe", label: "Stripe", category: "integration", description: "Payment operations", icon: "CreditCard" },
  { type: "openai", label: "OpenAI", category: "integration", description: "AI completions & embeddings", icon: "Sparkles" },
];
