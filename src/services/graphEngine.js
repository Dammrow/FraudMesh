// PARALLAX — Graph Engine
// Builds node-link graph data structures from synthetic relationship data.
// Designed to power a D3 force-directed graph visualization.

import { CUSTOMERS, RETURN_CASES, DEVICES, ADDRESSES, PAYMENT_TOKENS, FRAUD_RING_ALPHA, EVIDENCE } from './syntheticData.js';

export const NODE_TYPES = {
  CUSTOMER: 'customer',
  DEVICE: 'device',
  ADDRESS: 'address',
  PAYMENT: 'payment',
  SKU: 'sku',
  EVIDENCE: 'evidence',
};

export const NODE_COLORS = {
  customer: '#1E40AF',
  customer_suspect: '#DC2626',
  customer_target: '#991B1B',
  device: '#B8860B',
  address: '#0F766E',
  payment: '#6D28D9',
  sku: '#0369A1',
  evidence: '#C2410C',
};

export const NODE_SIZES = {
  customer: 24,
  customer_target: 30,
  device: 18,
  address: 18,
  payment: 18,
  sku: 16,
  evidence: 14,
};

export const LINK_TYPES = {
  DEVICE: 'device',
  ADDRESS: 'address',
  PAYMENT: 'payment',
  SKU: 'sku',
  EVIDENCE: 'evidence',
  RING_MEMBER: 'ring_member',
};

export const LINK_COLORS = {
  device: '#B8860B',
  address: '#0F766E',
  payment: '#6D28D9',
  sku: '#0369A1',
  evidence: '#C2410C',
  ring_member: 'rgba(153,27,27,0.5)',
};

// ============================================================
// Build graph for a specific case (and its ring if applicable)
// ============================================================
export function buildCaseGraph(caseId) {
  const caseData = RETURN_CASES.find(c => c.id === caseId);
  if (!caseData) return { nodes: [], links: [] };

  const primaryCustomer = CUSTOMERS.find(c => c.id === caseData.customerId);
  if (!primaryCustomer) return { nodes: [], links: [] };

  const nodes = new Map();
  const links = [];

  // Helper to add a node (deduplicates by id)
  const addNode = (id, type, label, data = {}, isTarget = false) => {
    if (!nodes.has(id)) {
      nodes.set(id, {
        id,
        type,
        label,
        isTarget,
        isSuspect: caseData.ringId && FRAUD_RING_ALPHA.memberIds.includes(data.customerId || id),
        ...data,
      });
    }
  };

  // Helper to add a link
  const addLink = (source, target, type, label = '') => {
    // Avoid duplicate links
    const key = `${source}-${target}-${type}`;
    const keyRev = `${target}-${source}-${type}`;
    if (!links.find(l => (l.source === source && l.target === target && l.type === type) ||
                         (l.source === target && l.target === source && l.type === type))) {
      links.push({ source, target, type, label });
    }
  };

  // Add primary customer as target node
  addNode(
    primaryCustomer.id,
    NODE_TYPES.CUSTOMER,
    primaryCustomer.name,
    { email: primaryCustomer.email, city: primaryCustomer.city, returnRate: primaryCustomer.returnRate, customerId: primaryCustomer.id },
    true
  );

  // If this case belongs to a ring, add all ring members + shared entities
  if (caseData.ringId) {
    const ring = FRAUD_RING_ALPHA;

    // Add all ring member customers
    ring.memberIds.forEach(memberId => {
      const member = CUSTOMERS.find(c => c.id === memberId);
      if (!member) return;
      addNode(
        member.id,
        NODE_TYPES.CUSTOMER,
        member.name,
        { email: member.email, city: member.city, returnRate: member.returnRate, customerId: member.id },
        member.id === primaryCustomer.id
      );
    });

    // Add shared devices
    ring.sharedSignals.devices.forEach(deviceId => {
      const device = DEVICES.find(d => d.id === deviceId);
      if (!device) return;
      addNode(deviceId, NODE_TYPES.DEVICE, device.model, { os: device.os, fingerprint: device.fingerprint });

      // Link device to customers that use it
      ring.memberIds.forEach(memberId => {
        const member = CUSTOMERS.find(c => c.id === memberId);
        if (member && member.primaryDeviceId === deviceId) {
          addLink(memberId, deviceId, LINK_TYPES.DEVICE, 'uses device');
        }
      });
    });

    // Add shared addresses
    ring.sharedSignals.addresses.forEach(addrId => {
      const addr = ADDRESSES.find(a => a.id === addrId);
      if (!addr) return;
      addNode(addrId, NODE_TYPES.ADDRESS, addr.line1.split(',')[0], { city: addr.city, pin: addr.pin });

      ring.memberIds.forEach(memberId => {
        const member = CUSTOMERS.find(c => c.id === memberId);
        if (member && member.addressId === addrId) {
          addLink(memberId, addrId, LINK_TYPES.ADDRESS, 'delivery address');
        }
      });
    });

    // Add secondary address (ADDR-BLR-215 used by CUST-003 and CUST-004)
    const secondaryAddrId = 'ADDR-BLR-215';
    const secondaryAddr = ADDRESSES.find(a => a.id === secondaryAddrId);
    if (secondaryAddr) {
      addNode(secondaryAddrId, NODE_TYPES.ADDRESS, secondaryAddr.line1.split(',')[0], { city: secondaryAddr.city, pin: secondaryAddr.pin });
      ['CUST-003', 'CUST-004'].forEach(memberId => {
        addLink(memberId, secondaryAddrId, LINK_TYPES.ADDRESS, 'delivery address');
      });
    }

    // Add shared payment tokens
    ring.sharedSignals.paymentTokens.forEach(ptId => {
      const pt = PAYMENT_TOKENS.find(p => p.id === ptId);
      if (!pt) return;
      addNode(ptId, NODE_TYPES.PAYMENT, `${pt.type} ${pt.maskedPan}`, { type: pt.type });

      ring.memberIds.forEach(memberId => {
        const member = CUSTOMERS.find(c => c.id === memberId);
        if (member && member.paymentTokenId === ptId) {
          addLink(memberId, ptId, LINK_TYPES.PAYMENT, 'payment token');
        }
      });
    });

    // Add SKU node
    const skuId = 'SKU-WH-204-ANC';
    addNode(skuId, NODE_TYPES.SKU, 'Studio Pro Headphones (WH-204-ANC)', { count: 4 });
    ring.memberIds.forEach(memberId => {
      addLink(memberId, skuId, LINK_TYPES.SKU, 'returned');
    });

    // Add evidence nodes
    ring.sharedSignals.evidenceGroup.forEach(evdId => {
      const evd = EVIDENCE.find(e => e.id === evdId);
      if (!evd) return;
      const caseRef = RETURN_CASES.find(c => c.id === evd.caseId);
      const custId = caseRef?.customerId;
      addNode(evdId, NODE_TYPES.EVIDENCE, `Damage Photo (${evd.caseId})`, {
        caseId: evd.caseId,
        similarity: evd.similarTo ? Math.max(...evd.similarTo.map(s => s.similarity)) : null,
      });
      if (custId) {
        addLink(custId, evdId, LINK_TYPES.EVIDENCE, 'submitted evidence');
      }
    });
  } else {
    // Non-ring case: just show the customer and their entities
    const device = DEVICES.find(d => d.id === primaryCustomer.primaryDeviceId);
    if (device) {
      addNode(primaryCustomer.primaryDeviceId, NODE_TYPES.DEVICE, device.model, { os: device.os });
      addLink(primaryCustomer.id, primaryCustomer.primaryDeviceId, LINK_TYPES.DEVICE);
    }
    const addr = ADDRESSES.find(a => a.id === primaryCustomer.addressId);
    if (addr) {
      addNode(primaryCustomer.addressId, NODE_TYPES.ADDRESS, addr.line1.split(',')[0], { city: addr.city });
      addLink(primaryCustomer.id, primaryCustomer.addressId, LINK_TYPES.ADDRESS);
    }
  }

  return {
    nodes: Array.from(nodes.values()),
    links,
  };
}

// ============================================================
// Build mini overview graph for dashboard ring cluster preview
// ============================================================
export function buildRingOverviewGraph(ringId) {
  const ring = FRAUD_RING_ALPHA;
  const nodes = [];
  const links = [];

  ring.memberIds.forEach((id, i) => {
    const c = CUSTOMERS.find(c => c.id === id);
    nodes.push({ id, type: 'customer', label: c?.name || id, angle: (i * 90 * Math.PI) / 180 });
  });

  // Add central ring node
  nodes.push({ id: 'center', type: 'ring_center', label: 'RING-001' });
  ring.memberIds.forEach(id => {
    links.push({ source: id, target: 'center', type: 'ring_member' });
  });

  return { nodes, links };
}

export function getNodeColor(node) {
  if (node.isTarget) return NODE_COLORS.customer_target;
  if (node.type === NODE_TYPES.CUSTOMER && node.isSuspect) return NODE_COLORS.customer_suspect;
  return NODE_COLORS[node.type] || '#888';
}

export function getNodeSize(node) {
  if (node.isTarget) return NODE_SIZES.customer_target;
  return NODE_SIZES[node.type] || 14;
}

export function getLinkColor(link) {
  return LINK_COLORS[link.type] || 'rgba(255,255,255,0.15)';
}
