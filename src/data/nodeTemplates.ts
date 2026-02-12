import { NodeTemplate } from "@/types/workflow";

export const nodeTemplates: NodeTemplate[] = [
  // Triggers
  { type: "form-submission", label: "Form Submission", category: "trigger", description: "Trigger on form submit", icon: "FileText" },
  { type: "email-trigger", label: "Email Trigger", category: "trigger", description: "Trigger when email arrives", icon: "Mail" },
  { type: "approver", label: "Approver", category: "trigger", description: "Trigger on approval action", icon: "UserCheck" },
  { type: "pdf-generation", label: "PDF Generation", category: "trigger", description: "Generate PDF documents", icon: "FileOutput" },
  { type: "sms-trigger", label: "SMS Trigger", category: "trigger", description: "Trigger on SMS received", icon: "Smartphone" },
];
