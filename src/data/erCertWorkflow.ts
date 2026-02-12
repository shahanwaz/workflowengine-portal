import { WorkflowNode, NodeConnection } from "@/types/workflow";

// ER Certification – Mandatory Certification workflow
// Structured grid layout: columns spaced 300px apart, rows at fixed Y positions

const COL = 300; // horizontal spacing between columns
const X0 = 80;   // first column X
const Y_MAIN = 280;     // main flow row
const Y_TOP = 80;       // revert/back row (above)
const Y_BOTTOM = 500;   // reject/draft row (below)
const Y_END = 660;      // end nodes row

const col = (n: number) => X0 + n * COL;

export const erCertNodes: WorkflowNode[] = [
  // ── Column 0: Form Submission ──
  {
    id: "er-1", type: "form-submission", label: "Form Submission", category: "trigger",
    x: col(0), y: Y_MAIN, icon: "FileText",
    config: {
      nodeType: "applicant",
      formJson: "MAND-ER-001",
      actions: [
        { action: "submit", level: "level-1", json: "Pre-Check-001" },
        { action: "draft-save", level: "save", json: "draft Save" },
      ],
    },
  },
  // Draft Save branch
  {
    id: "er-ds", type: "draft-save", label: "Draft Save", category: "condition",
    x: col(0), y: Y_BOTTOM, icon: "Save",
  },
  {
    id: "er-end-ds", type: "end", label: "End", category: "condition",
    x: col(0), y: Y_END, icon: "CircleStop",
  },

  // ── Column 1: Approver L1 ──
  {
    id: "er-2", type: "approver", label: "Approver (L1)", category: "trigger",
    x: col(1), y: Y_MAIN, icon: "UserCheck",
    config: {
      nodeType: "approver",
      actions: [
        { action: "approve", level: "applicant", json: "Level-1-Approve" },
        { action: "revert", level: "applicant", json: "Level-1-Revert" },
        { action: "reject", level: "applicant", json: "Level-1-Reject" },
      ],
    },
  },
  {
    id: "er-end-l1", type: "end", label: "End (Reject L1)", category: "condition",
    x: col(1), y: Y_BOTTOM, icon: "CircleStop",
  },

  // ── Column 2: Fees Submission ──
  {
    id: "er-3", type: "fees-submission", label: "Fees Submission", category: "trigger",
    x: col(2), y: Y_MAIN, icon: "Receipt",
    config: {
      nodeType: "applicant",
      actions: [
        { action: "submit", level: "payment-gateway", json: "Bharatkosh API" },
      ],
    },
  },

  // ── Column 3: Payment Gateway ──
  {
    id: "er-4", type: "payment-gateway", label: "Payment Gateway", category: "trigger",
    x: col(3), y: Y_MAIN, icon: "CreditCard",
    config: {
      nodeType: "integration",
      actions: [
        { action: "success", level: "applicant", json: "" },
        { action: "fail", level: "applicant", json: "" },
      ],
    },
  },

  // ── Column 4: Test Report ──
  {
    id: "er-5", type: "test-report", label: "Test Report", category: "trigger",
    x: col(4), y: Y_MAIN, icon: "ClipboardCheck",
    config: {
      nodeType: "applicant",
      actions: [
        { action: "submit", level: "level-2", json: "Level-2 Submit" },
      ],
    },
  },

  // ── Column 5: Approver L2 ──
  {
    id: "er-6", type: "approver", label: "Approver (L2)", category: "trigger",
    x: col(5), y: Y_MAIN, icon: "UserCheck",
    config: {
      nodeType: "approver",
      actions: [
        { action: "approve", level: "applicant", json: "Level-2-Approve" },
        { action: "revert", level: "applicant", json: "Level-2-Revert" },
        { action: "reject", level: "applicant", json: "Level-2-Reject" },
      ],
    },
  },
  {
    id: "er-end-l2", type: "end", label: "End (Reject L2)", category: "condition",
    x: col(5), y: Y_BOTTOM, icon: "CircleStop",
  },

  // ── Column 6: Approver L3 ──
  {
    id: "er-7", type: "approver", label: "Approver (L3)", category: "trigger",
    x: col(6), y: Y_MAIN, icon: "UserCheck",
    config: {
      nodeType: "approver",
      actions: [
        { action: "approve", level: "level-3", json: "Level-3-Approve" },
      ],
    },
  },

  // ── Column 7: Certificate Manager ──
  {
    id: "er-8", type: "cert-manager", label: "Certificate Manager", category: "trigger",
    x: col(7), y: Y_MAIN, icon: "Award",
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

  // ── Column 8: Final End ──
  {
    id: "er-end-final", type: "end", label: "End (Complete)", category: "condition",
    x: col(8), y: Y_MAIN, icon: "CircleStop",
  },

  // Reject from cert manager
  {
    id: "er-end-cm", type: "end", label: "End (Reject CM)", category: "condition",
    x: col(7), y: Y_BOTTOM, icon: "CircleStop",
  },

  // ── Go-back nodes (above main row) ──
  {
    id: "er-gb-l1", type: "go-back", label: "Back to Form", category: "condition",
    x: col(1), y: Y_TOP, icon: "Undo2",
  },
  {
    id: "er-gb-pay", type: "go-back", label: "Back to Fees", category: "condition",
    x: col(3), y: Y_BOTTOM, icon: "Undo2",
  },
  {
    id: "er-gb-test", type: "go-back", label: "Back to Test", category: "condition",
    x: col(5), y: Y_TOP, icon: "Undo2",
  },
  {
    id: "er-gb-test2", type: "go-back", label: "Back to Test", category: "condition",
    x: col(7), y: Y_TOP, icon: "Undo2",
  },
];

export const erCertConnections: NodeConnection[] = [
  // ── Main success flow (left → right) ──
  { id: "ec-1", sourceId: "er-1", targetId: "er-2", label: "Submit", connectionType: "success" },
  { id: "ec-2", sourceId: "er-2", targetId: "er-3", label: "Approve", connectionType: "success" },
  { id: "ec-3", sourceId: "er-3", targetId: "er-4", label: "Pay", connectionType: "success" },
  { id: "ec-4", sourceId: "er-4", targetId: "er-5", label: "Success", connectionType: "success" },
  { id: "ec-5", sourceId: "er-5", targetId: "er-6", label: "Submit", connectionType: "success" },
  { id: "ec-6", sourceId: "er-6", targetId: "er-7", label: "Approve", connectionType: "success" },
  { id: "ec-7", sourceId: "er-7", targetId: "er-8", label: "Approve", connectionType: "success" },
  { id: "ec-8", sourceId: "er-8", targetId: "er-end-final", label: "Certify", connectionType: "success" },

  // ── Draft Save branch ──
  { id: "ec-ds1", sourceId: "er-1", targetId: "er-ds", label: "Draft", connectionType: "draft" },
  { id: "ec-ds2", sourceId: "er-ds", targetId: "er-end-ds", connectionType: "draft" },

  // ── Reject paths ──
  { id: "ec-rej1", sourceId: "er-2", targetId: "er-end-l1", label: "Reject", connectionType: "reject" },
  { id: "ec-rej2", sourceId: "er-6", targetId: "er-end-l2", label: "Reject", connectionType: "reject" },
  { id: "ec-rej3", sourceId: "er-8", targetId: "er-end-cm", label: "Reject", connectionType: "reject" },

  // ── Revert paths ──
  { id: "ec-rev1", sourceId: "er-2", targetId: "er-gb-l1", label: "Revert", connectionType: "revert" },
  { id: "ec-rev1b", sourceId: "er-gb-l1", targetId: "er-1", connectionType: "revert" },

  { id: "ec-fail", sourceId: "er-4", targetId: "er-gb-pay", label: "Fail", connectionType: "fail" },
  { id: "ec-failb", sourceId: "er-gb-pay", targetId: "er-3", connectionType: "fail" },

  { id: "ec-rev2", sourceId: "er-6", targetId: "er-gb-test", label: "Revert", connectionType: "revert" },
  { id: "ec-rev2b", sourceId: "er-gb-test", targetId: "er-5", connectionType: "revert" },

  { id: "ec-rev3", sourceId: "er-8", targetId: "er-gb-test2", label: "Revert", connectionType: "revert" },
  { id: "ec-rev3b", sourceId: "er-gb-test2", targetId: "er-5", connectionType: "revert" },
];
