// PARALLAX — Case State Manager
// Reactive case state and review status management.
// Uses a simple pub/sub pattern — no external state library required for prototype.

import { RETURN_CASES, CUSTOMERS, getCustomerById, getCaseById } from './syntheticData.js';
import { calculateIndividualRisk, calculateNetworkRisk, calculateFinalRisk } from './riskEngine.js';

// ============================================================
// CASE STATE STORE
// ============================================================
let caseStates = {};
let listeners = new Set();

// Initialize all cases with their computed state
RETURN_CASES.forEach(c => {
  caseStates[c.id] = {
    ...c,
    reviewStatus: c.status,
    reviewDecision: null,
    reviewNotes: '',
    reviewedBy: null,
    reviewedAt: null,
    isLoading: false,
  };
});

export function getAllCases() {
  return Object.values(caseStates);
}

export function getCaseState(caseId) {
  return caseStates[caseId] || null;
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notify() {
  listeners.forEach(fn => fn({ ...caseStates }));
}

// ============================================================
// REVIEW DECISION ACTIONS
// ============================================================
export const DECISIONS = {
  APPROVE: { key: 'APPROVE', label: 'Approve Refund', shortLabel: 'Approved', nextStatus: 'approved', className: 'decision-approve' },
  HOLD: { key: 'HOLD', label: 'Investigation Hold', shortLabel: 'On Hold', nextStatus: 'on_hold', className: 'decision-hold' },
  REJECT: { key: 'REJECT', label: 'Reject Refund Claim', shortLabel: 'Rejected', nextStatus: 'rejected', className: 'decision-reject' },
  CONFIRM_FRAUD: { key: 'CONFIRM_FRAUD', label: 'Confirm Fraud Ring', shortLabel: 'Confirmed Fraud', nextStatus: 'confirmed_fraud', className: 'decision-confirm-fraud' },
  LEGITIMATE: { key: 'LEGITIMATE', label: 'Mark as Legitimate', shortLabel: 'Legitimate', nextStatus: 'approved', className: 'decision-legitimate' },
};

export function submitReview({ caseId, decision, notes, reviewerName = 'Analyst' }) {
  const existing = caseStates[caseId];
  if (!existing) return null;

  const decisionDef = DECISIONS[decision];
  if (!decisionDef) return null;

  caseStates = {
    ...caseStates,
    [caseId]: {
      ...existing,
      reviewDecision: decision,
      reviewNotes: notes,
      reviewedBy: reviewerName,
      reviewedAt: new Date().toISOString(),
      reviewStatus: decisionDef.nextStatus,
      status: decisionDef.nextStatus,
    },
  };

  notify();
  return caseStates[caseId];
}

// ============================================================
// DEMO FLOW STATE
// ============================================================
let demoStep = 0;
let demoListeners = new Set();
const DEMO_STEPS = [
  { step: 0, label: 'Overview Dashboard', view: 'dashboard', description: 'Explore the PARALLAX monitoring dashboard. Note 3 active fraud rings, 14 high-risk cases.' },
  { step: 1, label: 'Open Investigation', view: 'investigation', description: 'Open Case #PX-2047. Observe individual customer risk: 42/100 — below review threshold.' },
  { step: 2, label: 'Network Analysis', view: 'investigation', phase: 'running', description: 'Run Network Investigation. Watch PARALLAX correlate devices, addresses, payment tokens.' },
  { step: 3, label: 'Fraud Network Graph', view: 'network', description: 'Inspect the interactive network graph. See how 4 accounts are interconnected.' },
  { step: 4, label: 'Case Dossier', view: 'casefile', description: 'Review the full forensic case file. Examine evidence similarity (94.2%) and timeline.' },
  { step: 5, label: 'Human Review', view: 'review', description: 'Submit a reviewer decision. Observe the live status update and audit entry creation.' },
  { step: 6, label: 'Audit Trail', view: 'audit', description: 'Inspect the tamper-evident cryptographic audit chain sealing the reviewer decision.' },
];

export function getDemoSteps() { return DEMO_STEPS; }
export function getCurrentDemoStep() { return demoStep; }
export function getCurrentDemoStepData() { return DEMO_STEPS[demoStep] || DEMO_STEPS[0]; }

export function advanceDemoStep() {
  if (demoStep < DEMO_STEPS.length - 1) {
    demoStep++;
    demoListeners.forEach(fn => fn(demoStep));
  }
  return demoStep;
}

export function setDemoStep(step) {
  demoStep = Math.max(0, Math.min(step, DEMO_STEPS.length - 1));
  demoListeners.forEach(fn => fn(demoStep));
  return demoStep;
}

export function subscribeDemoStep(listener) {
  demoListeners.add(listener);
  return () => demoListeners.delete(listener);
}

// ============================================================
// STATUS HELPERS
// ============================================================
export function getStatusLabel(status) {
  const labels = {
    approved: 'Approved',
    rejected: 'Rejected',
    on_hold: 'On Hold',
    under_investigation: 'Under Investigation',
    pending_review: 'Pending Review',
    confirmed_fraud: 'Confirmed Fraud',
  };
  return labels[status] || status;
}

export function getStatusClass(status) {
  const classes = {
    approved: 'badge-low',
    rejected: 'badge-high',
    on_hold: 'badge-medium',
    under_investigation: 'badge-ring',
    pending_review: 'badge-neutral',
    confirmed_fraud: 'badge-ring',
  };
  return classes[status] || 'badge-neutral';
}
