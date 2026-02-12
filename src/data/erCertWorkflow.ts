import { WorkflowNode, NodeConnection } from "@/types/workflow";

// ER Certification – Mandatory Certification workflow
// Nodes positioned in a logical flow left-to-right, top-to-bottom

export const erCertNodes: WorkflowNode[] = [
  // 1. Form Submission (Applicant)
  {
    id: "er-1", type: "form-submission", label: "Form Submission", category: "trigger",
    x: 80, y: 250, icon: "FileText",
    config: {
      nodeType: "applicant",
      formJson: "MAND-ER-001",
      actions: [
        { action: "submit", level: "level-1", json: "Pre-Check-001" },
        { action: "draft-save", level: "save", json: "draft Save" },
      ],
    },
  },

  // 2. Draft Save → End
  {
    id: "er-ds", type: "draft-save", label: "Draft Save", category: "condition",
    x: 80, y: 450, icon: "Save",
  },
  {
    id: "er-end-ds", type: "end", label: "End", category: "condition",
    x: 80, y: 600, icon: "CircleStop",
  },

  // 3. Approver (Level-1)
  {
    id: "er-2", type: "approver", label: "Approver (L1)", category: "trigger",
    x: 380, y: 250, icon: "UserCheck",
    config: {
      nodeType: "approver",
      actions: [
        { action: "approve", level: "applicant", json: "Level-1-Approve" },
        { action: "revert", level: "applicant", json: "Level-1-Revert" },
        { action: "reject", level: "applicant", json: "Level-1-Reject" },
      ],
    },
  },

  // 6. End (reject from L1)
  {
    id: "er-end-l1", type: "end", label: "End (Reject L1)", category: "condition",
    x: 380, y: 450, icon: "CircleStop",
  },

  // 4. Fees Submission
  {
    id: "er-3", type: "fees-submission", label: "Fees Submission", category: "trigger",
    x: 680, y: 250, icon: "Receipt",
    config: {
      nodeType: "applicant",
      actions: [
        { action: "submit", level: "payment-gateway", json: "Bharatkosh API" },
      ],
    },
  },

  // 7. Payment Gateway
  {
    id: "er-4", type: "payment-gateway", label: "Payment Gateway", category: "trigger",
    x: 980, y: 250, icon: "CreditCard",
    config: {
      nodeType: "integration",
      actions: [
        { action: "success", level: "applicant", json: "" },
        { action: "fail", level: "applicant", json: "" },
      ],
    },
  },

  // 8. Test Report
  {
    id: "er-5", type: "test-report", label: "Test Report", category: "trigger",
    x: 1280, y: 250, icon: "ClipboardCheck",
    config: {
      nodeType: "applicant",
      actions: [
        { action: "submit", level: "level-2", json: "Level-2 Submit" },
      ],
    },
  },

  // 10. Approver (Level-2)
  {
    id: "er-6", type: "approver", label: "Approver (L2)", category: "trigger",
    x: 1580, y: 250, icon: "UserCheck",
    config: {
      nodeType: "approver",
      actions: [
        { action: "approve", level: "applicant", json: "Level-2-Approve" },
        { action: "revert", level: "applicant", json: "Level-2-Revert" },
        { action: "reject", level: "applicant", json: "Level-2-Reject" },
      ],
    },
  },

  // 13. End (reject from L2)
  {
    id: "er-end-l2", type: "end", label: "End (Reject L2)", category: "condition",
    x: 1580, y: 450, icon: "CircleStop",
  },

  // 11. Approver (Level-3)
  {
    id: "er-7", type: "approver", label: "Approver (L3)", category: "trigger",
    x: 1880, y: 250, icon: "UserCheck",
    config: {
      nodeType: "approver",
      actions: [
        { action: "approve", level: "level-3", json: "Level-3-Approve" },
      ],
    },
  },

  // 14. Certificate Manager
  {
    id: "er-8", type: "cert-manager", label: "Certificate Manager", category: "trigger",
    x: 2180, y: 250, icon: "Award",
    config: {
      nodeType: "cert-manager",
      actions: [
        { action: "approve", level: "cert-gen", json: "Cert Gen" },
        { action: "revert", level: "applicant", json: "Level-3-Revert" },
        { action: "reject", level: "applicant", json: "Level-3-Reject" },
        { action: "revert", level: "applicant", json: "Level-3-Revert-Val" },
      ],
    },
  },

  // End (final)
  {
    id: "er-end-final", type: "end", label: "End (Complete)", category: "condition",
    x: 2480, y: 250, icon: "CircleStop",
  },

  // End (reject from cert manager)
  {
    id: "er-end-cm", type: "end", label: "End (Reject CM)", category: "condition",
    x: 2180, y: 450, icon: "CircleStop",
  },

  // Go-back labels (visual markers for revert flows)
  {
    id: "er-gb-l1", type: "go-back", label: "Back to Form", category: "condition",
    x: 380, y: 100, icon: "Undo2",
  },
  {
    id: "er-gb-pay", type: "go-back", label: "Back to Fees", category: "condition",
    x: 980, y: 450, icon: "Undo2",
  },
  {
    id: "er-gb-test", type: "go-back", label: "Back to Test Report", category: "condition",
    x: 1580, y: 100, icon: "Undo2",
  },
  {
    id: "er-gb-test2", type: "go-back", label: "Back to Test Report", category: "condition",
    x: 2180, y: 100, icon: "Undo2",
  },
];

export const erCertConnections: NodeConnection[] = [
  // Main flow: Form → Approver L1 → Fees → Payment → Test Report → Approver L2 → Approver L3 → Cert Manager → End
  { id: "ec-1", sourceId: "er-1", targetId: "er-2" },
  { id: "ec-2", sourceId: "er-2", targetId: "er-3" },
  { id: "ec-3", sourceId: "er-3", targetId: "er-4" },
  { id: "ec-4", sourceId: "er-4", targetId: "er-5" },
  { id: "ec-5", sourceId: "er-5", targetId: "er-6" },
  { id: "ec-6", sourceId: "er-6", targetId: "er-7" },
  { id: "ec-7", sourceId: "er-7", targetId: "er-8" },
  { id: "ec-8", sourceId: "er-8", targetId: "er-end-final" },

  // Draft Save branch
  { id: "ec-ds1", sourceId: "er-1", targetId: "er-ds" },
  { id: "ec-ds2", sourceId: "er-ds", targetId: "er-end-ds" },

  // Reject from L1 → End
  { id: "ec-rej1", sourceId: "er-2", targetId: "er-end-l1" },

  // Revert from L1 → Back to Form
  { id: "ec-rev1", sourceId: "er-2", targetId: "er-gb-l1" },
  { id: "ec-rev1b", sourceId: "er-gb-l1", targetId: "er-1" },

  // Payment fail → Back to Fees
  { id: "ec-fail", sourceId: "er-4", targetId: "er-gb-pay" },
  { id: "ec-failb", sourceId: "er-gb-pay", targetId: "er-3" },

  // Reject from L2 → End
  { id: "ec-rej2", sourceId: "er-6", targetId: "er-end-l2" },

  // Revert from L2 → Back to Test Report
  { id: "ec-rev2", sourceId: "er-6", targetId: "er-gb-test" },
  { id: "ec-rev2b", sourceId: "er-gb-test", targetId: "er-5" },

  // Reject from Cert Manager → End
  { id: "ec-rej3", sourceId: "er-8", targetId: "er-end-cm" },

  // Revert from Cert Manager → Back to Test Report
  { id: "ec-rev3", sourceId: "er-8", targetId: "er-gb-test2" },
  { id: "ec-rev3b", sourceId: "er-gb-test2", targetId: "er-5" },
];
