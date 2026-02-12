import { NodeTemplate } from "@/types/workflow";

export const nodeTemplates: NodeTemplate[] = [
  // Triggers
  { type: "form-submission", label: "Form Submission", category: "trigger", description: "Trigger on form submit", icon: "FileText" },
  { type: "email-trigger", label: "Email Trigger", category: "trigger", description: "Trigger when email arrives", icon: "Mail" },
  { type: "approver", label: "Approver", category: "trigger", description: "Trigger on approval action", icon: "UserCheck" },
  { type: "pdf-generation", label: "PDF Generation", category: "trigger", description: "Generate PDF documents", icon: "FileOutput" },
  { type: "sms-trigger", label: "SMS Trigger", category: "trigger", description: "Trigger on SMS received", icon: "Smartphone" },
  { type: "payment-gateway", label: "Payment Gateway", category: "trigger", description: "Trigger on payment event", icon: "CreditCard" },
  { type: "test-report", label: "Test Report", category: "trigger", description: "Submit test reports", icon: "ClipboardCheck" },
  { type: "cert-manager", label: "Certificate Manager", category: "trigger", description: "Manage certificates", icon: "Award" },
  { type: "fees-submission", label: "Fees Submission", category: "trigger", description: "Submit fee payments", icon: "Receipt" },

  // Conditions
  { type: "if-else", label: "If / Else", category: "condition", description: "Branch based on condition", icon: "GitBranch" },
  { type: "switch", label: "Switch", category: "condition", description: "Multi-way branching", icon: "GitMerge" },
  { type: "loop", label: "Loop", category: "condition", description: "Repeat actions in a loop", icon: "Repeat" },
  { type: "parallel", label: "Parallel", category: "condition", description: "Run branches in parallel", icon: "GitFork" },
  { type: "merge", label: "Merge", category: "condition", description: "Merge parallel branches", icon: "Merge" },
  { type: "end", label: "End", category: "condition", description: "End the workflow", icon: "CircleStop" },
  { type: "draft-save", label: "Draft Save", category: "condition", description: "Save as draft", icon: "Save" },
  { type: "go-back", label: "Go Back", category: "condition", description: "Return to previous step", icon: "Undo2" },
];
