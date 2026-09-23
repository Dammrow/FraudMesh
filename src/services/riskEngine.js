// PARALLAX — Risk Engine
// Deterministically calculates individual, network, and blended risk scores
// from synthetic relationship data. All scoring is transparent and explainable.

import { CUSTOMERS, RETURN_CASES, DEVICES, ADDRESSES, PAYMENT_TOKENS, FRAUD_RING_ALPHA } from './syntheticData.js';

// ============================================================
// SIGNAL WEIGHTS (individual risk factors)
// ============================================================
const INDIVIDUAL_WEIGHTS = {
  returnRate: 25,       // % of orders returned
  returnVelocity: 15,   // returns per quarter
  refundValue: 15,      // INR refund amount
  returnLatency: 10,    // days between delivery and return request
  reasonRepeat: 15,     // same reason used multiple times
  skuRepeat: 10,        // same SKU returned multiple times
  accountAge: 10,       // newer accounts are higher risk
};

const NETWORK_WEIGHTS = {
  sharedDevice: 30,
  sharedAddress: 25,
  sharedPayment: 25,
  skuBurst: 10,
  evidenceReuse: 10,
};

// ============================================================
// INDIVIDUAL RISK CALCULATOR
// ============================================================
export function calculateIndividualRisk(caseData, customerData) {
  if (caseData.individualRisk !== undefined) {
    return {
      score: caseData.individualRisk,
      signals: _buildIndividualSignals(caseData, customerData),
    };
  }

  let score = 0;
  const customer = customerData || CUSTOMERS.find(c => c.id === caseData.customerId);
  if (!customer) return { score: 0, signals: [] };

  // Return rate signal (0–25 pts)
  const rrScore = Math.min(25, (customer.returnRate / 30) * 25);
  score += rrScore;

  // Refund value signal (0–15 pts) — high-value refunds are riskier
  const refundScore = Math.min(15, (caseData.refundAmount / 20000) * 15);
  score += refundScore;

  // Account age signal (0–10 pts) — newer accounts are riskier
  const ageScore = Math.max(0, 10 - (customer.accountAge / 365) * 10);
  score += ageScore;

  // Return reason repeat (simulated based on case data)
  if (caseData.reason === 'Item arrived damaged') score += 8;
  else if (caseData.reason === 'Defective product') score += 5;

  return {
    score: Math.round(Math.min(100, score)),
    signals: _buildIndividualSignals(caseData, customer),
  };
}

function _buildIndividualSignals(caseData, customer) {
  const c = customer || CUSTOMERS.find(c => c.id === caseData.customerId);
  if (!c) return [];

  return [
    { key: 'returnRate', label: 'Return rate', value: `${c.returnRate}%`, weight: c.returnRate > 15 ? 'high' : c.returnRate > 8 ? 'medium' : 'low', score: Math.round(Math.min(25, (c.returnRate / 30) * 25)) },
    { key: 'orderHistory', label: 'Return history', value: `${c.totalReturns} / ${c.totalOrders} orders`, weight: 'info', score: 0 },
    { key: 'refundValue', label: 'Refund value', value: `₹${caseData.refundAmount?.toLocaleString('en-IN')}`, weight: caseData.refundAmount > 10000 ? 'high' : caseData.refundAmount > 5000 ? 'medium' : 'low', score: Math.round(Math.min(15, (caseData.refundAmount / 20000) * 15)) },
    { key: 'returnReason', label: 'Return reason', value: caseData.reason, weight: caseData.reason === 'Item arrived damaged' ? 'medium' : 'low', score: caseData.reason === 'Item arrived damaged' ? 8 : 3 },
    { key: 'accountAge', label: 'Account age', value: `${c.accountAge} days`, weight: c.accountAge < 120 ? 'high' : c.accountAge < 300 ? 'medium' : 'low', score: Math.round(Math.max(0, 10 - (c.accountAge / 365) * 10)) },
  ];
}

// ============================================================
// NETWORK RISK CALCULATOR
// ============================================================
export function calculateNetworkRisk(caseData) {
  if (caseData.networkRisk !== undefined) {
    return {
      score: caseData.networkRisk,
      signals: _buildNetworkSignals(caseData),
      ringDetected: caseData.ringId !== null,
      ringId: caseData.ringId,
    };
  }

  // No pre-computed — return low risk
  return { score: 10, signals: [], ringDetected: false, ringId: null };
}

function _buildNetworkSignals(caseData) {
  if (!caseData.ringId) {
    return [{ key: 'isolated', label: 'No network connections detected', severity: 'info', score: 0 }];
  }

  const ring = FRAUD_RING_ALPHA;
  const customer = CUSTOMERS.find(c => c.id === caseData.customerId);
  if (!customer) return [];

  const signals = [];

  // Shared device signal
  const sharedDeviceCount = ring.memberIds
    .filter(id => id !== customer.id)
    .filter(id => {
      const other = CUSTOMERS.find(c => c.id === id);
      return other && other.primaryDeviceId === customer.primaryDeviceId;
    }).length;

  if (sharedDeviceCount > 0) {
    signals.push({
      key: 'sharedDevice',
      label: `Shared hardware fingerprint with ${sharedDeviceCount} other account${sharedDeviceCount > 1 ? 's' : ''}`,
      detail: `Device ${customer.primaryDeviceId} — multiple return claimants on same physical device`,
      severity: 'critical',
      score: 30,
    });
  }

  // Shared address signal
  const sharedAddressCount = ring.memberIds
    .filter(id => id !== customer.id)
    .filter(id => {
      const other = CUSTOMERS.find(c => c.id === id);
      return other && other.addressId === customer.addressId;
    }).length;

  if (sharedAddressCount > 0) {
    signals.push({
      key: 'sharedAddress',
      label: `Delivery address shared with ${sharedAddressCount} other account${sharedAddressCount > 1 ? 's' : ''}`,
      detail: `${ADDRESSES.find(a => a.id === customer.addressId)?.line1}`,
      severity: 'high',
      score: 25,
    });
  }

  // Shared payment token
  const sharedPaymentCount = ring.memberIds
    .filter(id => id !== customer.id)
    .filter(id => {
      const other = CUSTOMERS.find(c => c.id === id);
      return other && other.paymentTokenId === customer.paymentTokenId;
    }).length;

  if (sharedPaymentCount > 0) {
    signals.push({
      key: 'sharedPayment',
      label: `Payment gateway token shared with ${sharedPaymentCount} account under separate names`,
      detail: `Token ${customer.paymentTokenId} — same encrypted card identifier, different billing names`,
      severity: 'critical',
      score: 25,
    });
  }

  // SKU burst
  signals.push({
    key: 'skuBurst',
    label: `Same SKU (WH-204-ANC) returned across 4 accounts within ${ring.sharedSignals.activityWindow}`,
    detail: 'Activity window: 26 Aug — 05 Sep 2026. Consistent return reason: "damage".',
    severity: 'high',
    score: 10,
  });

  // Evidence similarity
  signals.push({
    key: 'evidenceReuse',
    label: 'Similar damage evidence detected — 94.2% perceptual hash similarity',
    detail: 'Structural similarity analysis between EVD-001, EVD-002, EVD-003. Same crack pattern geometry.',
    severity: 'critical',
    score: 10,
  });

  // Activity clustering
  signals.push({
    key: 'activityCluster',
    label: 'Return activity cluster: 4 returns in 11-day window',
    detail: `Concentrated between ${ring.sharedSignals.activityStart} and ${ring.sharedSignals.activityEnd}.`,
    severity: 'high',
    score: 0,
  });

  return signals;
}

// ============================================================
// FINAL / BLENDED RISK CALCULATOR
// ============================================================
export function calculateFinalRisk(individualScore, networkScore) {
  if (networkScore >= 70) {
    // Network risk dominates when strong ring signal detected
    // Non-linear escalation: individual below-threshold but network high = escalate
    const base = Math.max(individualScore, 0.4 * individualScore + 0.6 * networkScore);
    const networkBoost = networkScore >= 80 ? 8 : networkScore >= 70 ? 4 : 0;
    return Math.round(Math.min(100, base + networkBoost));
  }
  // Weighted blend: 60% individual, 40% network for medium network risk
  return Math.round(Math.min(100, individualScore * 0.6 + networkScore * 0.4));
}

// ============================================================
// RISK LABEL HELPERS
// ============================================================
export function getRiskLabel(score) {
  if (score >= 80) return 'CRITICAL';
  if (score >= 60) return 'HIGH';
  if (score >= 35) return 'MEDIUM';
  return 'LOW';
}

export function getRiskClass(score) {
  if (score >= 80) return 'ring';
  if (score >= 60) return 'high';
  if (score >= 35) return 'medium';
  return 'low';
}

export function getRiskColor(score) {
  if (score >= 80) return 'var(--risk-ring)';
  if (score >= 60) return 'var(--risk-high)';
  if (score >= 35) return 'var(--risk-medium)';
  return 'var(--risk-low)';
}

export function getExplainabilitySignals(caseData) {
  const networkSignals = _buildNetworkSignals(caseData).filter(s => s.severity !== 'info');
  const individualSignals = _buildIndividualSignals(caseData, null).filter(s => s.weight === 'high' || s.weight === 'medium');

  return [
    ...networkSignals.map(s => ({ ...s, domain: 'network' })),
    ...individualSignals.map(s => ({ ...s, domain: 'individual', severity: s.weight })),
  ];
}
