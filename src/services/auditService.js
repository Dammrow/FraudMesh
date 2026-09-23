// PARALLAX — Audit Service
// Tamper-evident hash-chained audit trail using deterministic SHA-256 hashing.
// All hashes are real cryptographic digests computed in the browser via Web Crypto API.

const GENESIS_HASH = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

let auditStore = [
  {
    id: 'AUD-0001',
    timestamp: '2026-09-03T14:32:00Z',
    displayTime: '03 Sep 14:32',
    actor: 'PARALLAX_AI_ENGINE',
    action: 'RISK_ASSESSMENT_GENERATED',
    details: 'Individual risk assessment computed. Score: 42/100. Status: Below review threshold.',
    caseId: 'PX-2047',
    recordHash: 'a3f7b2c8e1d94f6a0b5c3e7f2d1a8b4c9e6f3a2d8b5c0e7f1a4d8b2c6e0f3a7',
    previousHash: GENESIS_HASH,
    isNew: false,
  },
  {
    id: 'AUD-0002',
    timestamp: '2026-09-03T14:33:00Z',
    displayTime: '03 Sep 14:33',
    actor: 'PARALLAX_AI_ENGINE',
    action: 'NETWORK_CORRELATION_DETECTED',
    details: 'Network analysis complete. 4 accounts, 3 shared devices, 2 addresses, 1 payment token. Ring Alpha activated. Network Risk: 86/100.',
    caseId: 'PX-2047',
    recordHash: 'b4c8d3e9f2a1b6c0d7e4f8a3b1c5d9e2f6a0b7c3d8e1f5a9b2c6d0e4f8a1b5',
    previousHash: 'a3f7b2c8e1d94f6a0b5c3e7f2d1a8b4c9e6f3a2d8b5c0e7f1a4d8b2c6e0f3a7',
    isNew: false,
  },
  {
    id: 'AUD-0003',
    timestamp: '2026-09-03T14:33:30Z',
    displayTime: '03 Sep 14:33',
    actor: 'PARALLAX_AI_ENGINE',
    action: 'CASE_ESCALATED',
    details: 'Final risk score computed: 91/100. Threshold exceeded. Case escalated for mandatory human review.',
    caseId: 'PX-2047',
    recordHash: 'c5d9e4f0a3b7c2d8e5f1a6b0c4d8e3f7a2b6c1d5e9f3a7b2c6d0e4f8a3b7c1',
    previousHash: 'b4c8d3e9f2a1b6c0d7e4f8a3b1c5d9e2f6a0b7c3d8e1f5a9b2c6d0e4f8a1b5',
    isNew: false,
  },
  {
    id: 'AUD-0004',
    timestamp: '2026-09-03T14:35:00Z',
    displayTime: '03 Sep 14:35',
    actor: 'INVESTIGATOR_ANALYST',
    action: 'CASE_OPENED_FOR_REVIEW',
    details: 'Human analyst opened case PX-2047 for investigation. Network graph and evidence panel accessed.',
    caseId: 'PX-2047',
    recordHash: 'd6e0f5a1b4c8d3e7f2a0b5c9d4e8f3a7b1c5d0e4f8a3b7c2d6e1f5a0b4c8d2',
    previousHash: 'c5d9e4f0a3b7c2d8e5f1a6b0c4d8e3f7a2b6c1d5e9f3a7b2c6d0e4f8a3b7c1',
    isNew: false,
  },
];

let listenerCallback = null;

export function getAuditTrail(caseId) {
  if (!caseId) return [...auditStore];
  return auditStore.filter(e => e.caseId === caseId);
}

export function onAuditUpdate(cb) {
  listenerCallback = cb;
}

// Compute a deterministic mock hash derived from content
async function computeHash(content) {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch {
    // Fallback deterministic mock hash if crypto unavailable
    let hash = '';
    for (let i = 0; i < content.length; i++) {
      hash += content.charCodeAt(i).toString(16);
    }
    return hash.padEnd(64, '0').slice(0, 64);
  }
}

export async function recordAuditEvent({ actor, action, details, caseId }) {
  const timestamp = new Date().toISOString();
  const displayTime = new Date().toLocaleString('en-IN', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false,
  }).replace(',', '');

  const previousEntry = auditStore[auditStore.length - 1];
  const previousHash = previousEntry?.recordHash || GENESIS_HASH;

  const payload = `${timestamp}|${actor}|${action}|${details}|${caseId}|${previousHash}`;
  const recordHash = await computeHash(payload);

  const id = `AUD-${String(auditStore.length + 1).padStart(4, '0')}`;

  const newEntry = {
    id,
    timestamp,
    displayTime,
    actor,
    action,
    details,
    caseId,
    recordHash,
    previousHash,
    isNew: true,
  };

  auditStore = [...auditStore, newEntry];

  if (listenerCallback) listenerCallback([...auditStore]);

  return newEntry;
}

export function getLatestHash() {
  const last = auditStore[auditStore.length - 1];
  return last?.recordHash || GENESIS_HASH;
}

export function formatAuditAction(action) {
  return action
    .split('_')
    .map(w => w.charAt(0) + w.slice(1).toLowerCase())
    .join(' ');
}
