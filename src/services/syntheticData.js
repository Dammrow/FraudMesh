// PARALLAX — Synthetic Data Service
// Realistic mock dataset for the PARALLAX prototype demonstration.
// All customer data, devices, addresses, orders, and evidence are entirely fictional.

export const PRODUCTS = [
  { sku: 'WH-204-ANC', name: 'Studio Pro Wireless Headphones', category: 'Electronics', price: 8499 },
  { sku: 'SP-901-BT', name: 'Portable Bluetooth Speaker', category: 'Electronics', price: 3299 },
  { sku: 'SM-X12-PRO', name: 'SmartWatch Pro X12', category: 'Electronics', price: 12499 },
  { sku: 'KB-550-WL', name: 'Mechanical Wireless Keyboard', category: 'Electronics', price: 5299 },
  { sku: 'CM-770-4K', name: '4K Webcam Pro', category: 'Electronics', price: 7199 },
  { sku: 'JK-LTH-01', name: 'Premium Leather Jacket', category: 'Apparel', price: 15999 },
  { sku: 'SN-RSN-BL', name: 'Running Sneakers Elite', category: 'Footwear', price: 6499 },
  { sku: 'BG-CAN-LG', name: 'Canvas Travel Backpack', category: 'Accessories', price: 2999 },
  { sku: 'MS-PAD-XL', name: 'XL Desk Mouse Pad', category: 'Electronics', price: 999 },
  { sku: 'LP-STD-15', name: 'Laptop Stand Premium', category: 'Electronics', price: 2499 },
];

export const DEVICES = [
  { id: 'DV-8842', model: 'iPhone 14 Pro', os: 'iOS 17.4', fingerprint: 'fp_a1b2c3d4e5f6' },
  { id: 'DV-9120', model: 'Google Pixel 7', os: 'Android 14', fingerprint: 'fp_b2c3d4e5f6a1' },
  { id: 'DV-7731', model: 'Samsung Galaxy S23', os: 'Android 13', fingerprint: 'fp_c3d4e5f6a1b2' },
  { id: 'DV-6654', model: 'iPhone 13', os: 'iOS 16.7', fingerprint: 'fp_d4e5f6a1b2c3' },
  { id: 'DV-5512', model: 'OnePlus 11', os: 'Android 13', fingerprint: 'fp_e5f6a1b2c3d4' },
  { id: 'DV-4423', model: 'iPad Pro 12.9"', os: 'iPadOS 17', fingerprint: 'fp_f6a1b2c3d4e5' },
  { id: 'DV-3310', model: 'Realme 11 Pro', os: 'Android 13', fingerprint: 'fp_a2b3c4d5e6f7' },
  { id: 'DV-2201', model: 'Motorola Edge 40', os: 'Android 13', fingerprint: 'fp_b3c4d5e6f7a2' },
];

export const ADDRESSES = [
  { id: 'ADDR-BLR-402', line1: 'Flat 402, Green Glen Apartments', city: 'Bangalore', state: 'Karnataka', pin: '560103' },
  { id: 'ADDR-BLR-215', line1: 'House 215, Koramangala 5th Block', city: 'Bangalore', state: 'Karnataka', pin: '560095' },
  { id: 'ADDR-MUM-908', line1: 'Flat 908, Seaside Towers, Andheri West', city: 'Mumbai', state: 'Maharashtra', pin: '400053' },
  { id: 'ADDR-MUM-314', line1: '314, Bandra Linking Road', city: 'Mumbai', state: 'Maharashtra', pin: '400050' },
  { id: 'ADDR-DEL-720', line1: 'B-720, Vasant Kunj Enclave', city: 'New Delhi', state: 'Delhi', pin: '110070' },
  { id: 'ADDR-DEL-101', line1: '101, Greater Kailash Part II', city: 'New Delhi', state: 'Delhi', pin: '110048' },
  { id: 'ADDR-CHN-530', line1: '530, T. Nagar, 3rd Cross St', city: 'Chennai', state: 'Tamil Nadu', pin: '600017' },
  { id: 'ADDR-HYD-207', line1: 'Flat 207, Hitech Residency, Madhapur', city: 'Hyderabad', state: 'Telangana', pin: '500081' },
];

export const PAYMENT_TOKENS = [
  { id: 'PT-9932', type: 'Visa', maskedPan: '****4422', gatewayHash: 'ghash_9932_v1' },
  { id: 'PT-7743', type: 'Mastercard', maskedPan: '****7813', gatewayHash: 'ghash_7743_mc' },
  { id: 'PT-5521', type: 'RuPay', maskedPan: '****9901', gatewayHash: 'ghash_5521_rp' },
  { id: 'PT-3308', type: 'UPI', maskedPan: 'user@okaxis', gatewayHash: 'ghash_3308_upi' },
  { id: 'PT-2214', type: 'Visa', maskedPan: '****2100', gatewayHash: 'ghash_2214_v2' },
  { id: 'PT-8819', type: 'Mastercard', maskedPan: '****3388', gatewayHash: 'ghash_8819_mc' },
];

// Synthetic damage evidence — perceptual hash similarity pairs
export const EVIDENCE = [
  {
    id: 'EVD-001', caseId: 'PX-2047', type: 'damage_photo',
    filename: 'damage_WH204_mehta_aug26.jpg',
    description: 'Headphone right ear cup cracked, cable fraying near jack',
    pHash: 'a1b2c3d4e5f67890',
    exifCamera: 'iPhone 14 Pro', exifFocalLength: '5.1mm', exifISO: '64',
    uploadedAt: '2026-08-26T14:22:11',
  },
  {
    id: 'EVD-002', caseId: 'PX-2011', type: 'damage_photo',
    filename: 'damage_WH204_rao_aug28.jpg',
    description: 'Headphone right ear cup cracked, cable fraying near 3.5mm jack',
    pHash: 'a1b2c3d4e5f67891',
    exifCamera: 'iPhone 14 Pro', exifFocalLength: '5.1mm', exifISO: '64',
    uploadedAt: '2026-08-28T10:08:47',
    similarTo: [{ evidenceId: 'EVD-001', similarity: 94.2 }],
  },
  {
    id: 'EVD-003', caseId: 'PX-1998', type: 'damage_photo',
    filename: 'damage_WH204_verma_aug30.jpg',
    description: 'Ear cup cracking along seam, cable distressed at plug',
    pHash: 'a1b2c3d4e5f67893',
    exifCamera: 'Google Pixel 7', exifFocalLength: '4.4mm', exifISO: '80',
    uploadedAt: '2026-08-30T08:34:22',
    similarTo: [{ evidenceId: 'EVD-001', similarity: 91.8 }, { evidenceId: 'EVD-002', similarity: 89.4 }],
  },
  {
    id: 'EVD-004', caseId: 'PX-2031', type: 'damage_photo',
    filename: 'damage_WH204_sen_sep01.jpg',
    description: 'Physical damage to left ear cushion, cable intact',
    pHash: 'b2c3d4e5f6789012',
    exifCamera: 'Samsung Galaxy S23', exifFocalLength: '6.2mm', exifISO: '100',
    uploadedAt: '2026-09-01T19:45:03',
    similarTo: [{ evidenceId: 'EVD-001', similarity: 88.6 }],
  },
];

// ============================================================
// FRAUD RING ALPHA — "The Audio Peripheral Loop"
// Four accounts individually appear legitimate (low-moderate return rates),
// but share device, address, payment token, repeated SKU, and evidence patterns.
// ============================================================
export const FRAUD_RING_ALPHA = {
  id: 'RING-001',
  name: 'Audio Peripheral Loop',
  status: 'active',
  detectedAt: '2026-09-02T18:33:00',
  memberIds: ['CUST-001', 'CUST-002', 'CUST-003', 'CUST-004'],
  sharedSignals: {
    devices: ['DV-8842', 'DV-9120'],
    addresses: ['ADDR-BLR-402'],
    paymentTokens: ['PT-9932'],
    skus: ['WH-204-ANC'],
    evidenceGroup: ['EVD-001', 'EVD-002', 'EVD-003', 'EVD-004'],
    activityWindow: '11 days',
    activityStart: '2026-08-26',
    activityEnd: '2026-09-05',
  },
  networkRisk: 86,
};

// ============================================================
// CUSTOMERS — 40 accounts total
// CUST-001 through CUST-004: Fraud Ring Alpha (appear individually normal)
// CUST-005+: mix of legitimate and independently suspicious customers
// ============================================================
export const CUSTOMERS = [
  // === FRAUD RING ALPHA MEMBERS ===
  {
    id: 'CUST-001', name: 'Aarav Mehta', email: 'aarav.mehta94@gmail.com',
    phone: '+91-98451-23456', joinedAt: '2026-04-12',
    city: 'Bangalore', addressId: 'ADDR-BLR-402',
    primaryDeviceId: 'DV-8842', paymentTokenId: 'PT-9932',
    totalOrders: 46, totalReturns: 4,
    returnRate: 8.7,   // ← appears normal (< 10% benchmark)
    avgOrderValue: 5200,
    accountAge: 162,
    notes: 'Ring Alpha — lead account',
  },
  {
    id: 'CUST-002', name: 'Sneha Rao', email: 'sneha.rao.blr@outlook.com',
    phone: '+91-97320-88741', joinedAt: '2026-05-03',
    city: 'Bangalore', addressId: 'ADDR-BLR-402', // same address as CUST-001
    primaryDeviceId: 'DV-8842', paymentTokenId: 'PT-7743', // same device as CUST-001
    totalOrders: 31, totalReturns: 3,
    returnRate: 9.7,   // ← appears normal (< 10% benchmark)
    avgOrderValue: 4800,
    accountAge: 141,
    notes: 'Ring Alpha — linked via shared device DV-8842 + address ADDR-BLR-402',
  },
  {
    id: 'CUST-003', name: 'Rohan Verma', email: 'rverma.works@yahoo.com',
    phone: '+91-90088-34512', joinedAt: '2026-03-22',
    city: 'Bangalore', addressId: 'ADDR-BLR-215',
    primaryDeviceId: 'DV-9120', paymentTokenId: 'PT-9932', // same payment token as CUST-001
    totalOrders: 28, totalReturns: 2,
    returnRate: 7.1,   // ← appears normal
    avgOrderValue: 6100,
    accountAge: 183,
    notes: 'Ring Alpha — linked via shared payment token PT-9932',
  },
  {
    id: 'CUST-004', name: 'Vikram Sen', email: 'vikramsen.in@proton.me',
    phone: '+91-91234-56789', joinedAt: '2026-04-28',
    city: 'Bangalore', addressId: 'ADDR-BLR-215', // same as CUST-003
    primaryDeviceId: 'DV-9120', paymentTokenId: 'PT-5521', // same device as CUST-003
    totalOrders: 19, totalReturns: 2,
    returnRate: 10.5,  // ← slightly above but not extreme
    avgOrderValue: 5700,
    accountAge: 146,
    notes: 'Ring Alpha — linked via shared device DV-9120 + address ADDR-BLR-215',
  },

  // === INDEPENDENT SUSPICIOUS (not ring members) ===
  {
    id: 'CUST-005', name: 'Priya Sharma', email: 'priya.sharma777@gmail.com',
    phone: '+91-98100-44231', joinedAt: '2025-11-14',
    city: 'Mumbai', addressId: 'ADDR-MUM-908', primaryDeviceId: 'DV-7731', paymentTokenId: 'PT-3308',
    totalOrders: 22, totalReturns: 5, returnRate: 22.7, avgOrderValue: 3800, accountAge: 311,
    notes: 'Independently suspicious — high individual return rate, repeated damage claims',
  },
  {
    id: 'CUST-006', name: 'Karan Joshi', email: 'kjoshi.tech@gmail.com',
    phone: '+91-77001-22334', joinedAt: '2025-09-05',
    city: 'New Delhi', addressId: 'ADDR-DEL-720', primaryDeviceId: 'DV-6654', paymentTokenId: 'PT-2214',
    totalOrders: 14, totalReturns: 4, returnRate: 28.6, avgOrderValue: 9200, accountAge: 381,
    notes: 'Independently suspicious — high-value returns, multiple electronics',
  },

  // === LEGITIMATE CUSTOMERS (fill data realism) ===
  {
    id: 'CUST-007', name: 'Ananya Iyer', email: 'ananya.iyer@yahoo.com',
    phone: '+91-90100-55433', joinedAt: '2025-06-20',
    city: 'Chennai', addressId: 'ADDR-CHN-530', primaryDeviceId: 'DV-5512', paymentTokenId: 'PT-8819',
    totalOrders: 83, totalReturns: 2, returnRate: 2.4, avgOrderValue: 4100, accountAge: 458,
    notes: 'Legitimate — very low return rate, long account tenure',
  },
  {
    id: 'CUST-008', name: 'Suresh Kumar', email: 'sureshk.home@rediffmail.com',
    phone: '+91-98887-11223', joinedAt: '2024-12-01',
    city: 'Hyderabad', addressId: 'ADDR-HYD-207', primaryDeviceId: 'DV-4423', paymentTokenId: 'PT-7743',
    totalOrders: 127, totalReturns: 6, returnRate: 4.7, avgOrderValue: 2800, accountAge: 659,
    notes: 'Legitimate — consistent purchase pattern, returns within policy',
  },
  {
    id: 'CUST-009', name: 'Meena Pillai', email: 'meena.p.blr@gmail.com',
    phone: '+91-99001-77654', joinedAt: '2026-01-10',
    city: 'Bangalore', addressId: 'ADDR-BLR-215', primaryDeviceId: 'DV-3310', paymentTokenId: 'PT-3308',
    totalOrders: 34, totalReturns: 1, returnRate: 2.9, avgOrderValue: 3200, accountAge: 254,
    notes: 'Legitimate',
  },
  {
    id: 'CUST-010', name: 'Raj Patel', email: 'rajpatel.shop@gmail.com',
    phone: '+91-91234-00001', joinedAt: '2025-08-14',
    city: 'Mumbai', addressId: 'ADDR-MUM-314', primaryDeviceId: 'DV-2201', paymentTokenId: 'PT-5521',
    totalOrders: 56, totalReturns: 3, returnRate: 5.4, avgOrderValue: 5500, accountAge: 403,
    notes: 'Legitimate',
  },
  {
    id: 'CUST-011', name: 'Deepa Nair', email: 'deepa.nair.mx@gmail.com',
    phone: '+91-98001-33445', joinedAt: '2025-07-22',
    city: 'Kochi', addressId: 'ADDR-CHN-530', primaryDeviceId: 'DV-6654', paymentTokenId: 'PT-8819',
    totalOrders: 41, totalReturns: 2, returnRate: 4.9, avgOrderValue: 3900, accountAge: 426,
    notes: 'Legitimate',
  },
  {
    id: 'CUST-012', name: 'Aditya Bose', email: 'aditya.bose.calc@gmail.com',
    phone: '+91-77889-22331', joinedAt: '2026-02-28',
    city: 'Kolkata', addressId: 'ADDR-DEL-101', primaryDeviceId: 'DV-7731', paymentTokenId: 'PT-2214',
    totalOrders: 19, totalReturns: 1, returnRate: 5.3, avgOrderValue: 7200, accountAge: 205,
    notes: 'Legitimate — newer account, reasonable pattern',
  },
  {
    id: 'CUST-013', name: 'Kavita Reddy', email: 'kavita.reddy.hyd@gmail.com',
    phone: '+91-90099-44001', joinedAt: '2024-10-18',
    city: 'Hyderabad', addressId: 'ADDR-HYD-207', primaryDeviceId: 'DV-5512', paymentTokenId: 'PT-7743',
    totalOrders: 94, totalReturns: 3, returnRate: 3.2, avgOrderValue: 4400, accountAge: 703,
    notes: 'Legitimate — loyal customer',
  },
  {
    id: 'CUST-014', name: 'Nikhil Desai', email: 'nikhil.d.pune@gmail.com',
    phone: '+91-99887-11001', joinedAt: '2025-04-10',
    city: 'Pune', addressId: 'ADDR-MUM-314', primaryDeviceId: 'DV-4423', paymentTokenId: 'PT-3308',
    totalOrders: 67, totalReturns: 4, returnRate: 6.0, avgOrderValue: 5100, accountAge: 530,
    notes: 'Legitimate',
  },
  {
    id: 'CUST-015', name: 'Shreya Gupta', email: 'shreya.gupta.del@gmail.com',
    phone: '+91-98455-77321', joinedAt: '2026-03-05',
    city: 'New Delhi', addressId: 'ADDR-DEL-720', primaryDeviceId: 'DV-3310', paymentTokenId: 'PT-9932',
    totalOrders: 23, totalReturns: 1, returnRate: 4.3, avgOrderValue: 6800, accountAge: 200,
    notes: 'Legitimate',
  },
  // Additional 25 lightweight customers (for dashboard realism)
  ...Array.from({ length: 25 }, (_, i) => {
    const names = ['Arjun Singh','Pooja Mehta','Sanjay Rao','Lakshmi Devi','Aryan Shah',
      'Preeti Jain','Vishal Kumar','Nisha Patel','Tarun Bhat','Divya Krishnan',
      'Gaurav Mishra','Swati Pandey','Harish Verma','Alka Chaudhary','Mohit Tyagi',
      'Ritu Malhotra','Siddharth Roy','Neha Kapoor','Manish Sharma','Farida Begum',
      'Rahul Das','Sunita Goel','Pavan Reddy','Sudha Nair','Vikrant Joshi'];
    return {
      id: `CUST-${String(i + 16).padStart(3, '0')}`,
      name: names[i],
      email: `${names[i].toLowerCase().replace(' ', '.')}.user@gmail.com`,
      phone: `+91-9${Math.floor(Math.random() * 9)}${String(Math.floor(Math.random() * 100000000)).padStart(8,'0')}`,
      joinedAt: '2025-06-01',
      city: ['Bangalore','Mumbai','Delhi','Chennai','Hyderabad','Pune','Kolkata'][i % 7],
      addressId: ADDRESSES[i % ADDRESSES.length].id,
      primaryDeviceId: DEVICES[i % DEVICES.length].id,
      paymentTokenId: PAYMENT_TOKENS[i % PAYMENT_TOKENS.length].id,
      totalOrders: 20 + (i * 3) % 80,
      totalReturns: (i * 2) % 7,
      returnRate: parseFloat((((i * 2) % 7) / (20 + (i * 3) % 80) * 100).toFixed(1)),
      avgOrderValue: 2500 + (i * 400) % 8000,
      accountAge: 90 + (i * 30) % 600,
      notes: 'Legitimate',
    };
  }),
];

// ============================================================
// RETURN CASES — core cases for the demo
// ============================================================
export const RETURN_CASES = [
  // === FRAUD RING ALPHA CASES ===
  {
    id: 'PX-2047',
    customerId: 'CUST-001',
    sku: 'WH-204-ANC',
    orderDate: '2026-08-21',
    deliveryDate: '2026-08-24',
    returnRequestedAt: '2026-08-26T14:18:00',
    refundAmount: 8499,
    reason: 'Item arrived damaged',
    status: 'under_investigation',
    evidenceIds: ['EVD-001'],
    ringId: 'RING-001',
    individualRisk: 42,
    networkRisk: 86,
    finalRisk: 91,
    isHeroCase: true,
    timeline: [
      { date: '2026-08-12', event: 'Account created', type: 'account' },
      { date: '2026-08-21', event: 'Order placed — Studio Pro Wireless Headphones (₹8,499)', type: 'order' },
      { date: '2026-08-24', event: 'Order delivered to ADDR-BLR-402', type: 'delivery' },
      { date: '2026-08-26', event: 'Return requested — reason: "Item arrived damaged"', type: 'return' },
      { date: '2026-08-26', event: 'Damage evidence uploaded (EVD-001)', type: 'evidence' },
      { date: '2026-08-27', event: 'Refund of ₹8,499 requested', type: 'refund' },
      { date: '2026-08-28', event: 'Linked account (Sneha Rao) returns same SKU WH-204-ANC', type: 'network_alert' },
      { date: '2026-08-30', event: 'Third linked account (Rohan Verma) submits similar claim', type: 'network_alert' },
      { date: '2026-09-01', event: 'Fourth linked account (Vikram Sen) submits matching claim', type: 'network_alert' },
      { date: '2026-09-02', event: 'PARALLAX network correlation detected — Ring Alpha flagged', type: 'system' },
      { date: '2026-09-03', event: 'Case escalated for human investigation', type: 'escalation' },
    ],
  },
  {
    id: 'PX-2011',
    customerId: 'CUST-002',
    sku: 'WH-204-ANC',
    orderDate: '2026-08-23',
    deliveryDate: '2026-08-27',
    returnRequestedAt: '2026-08-28T10:05:00',
    refundAmount: 8499,
    reason: 'Item arrived damaged',
    status: 'under_investigation',
    evidenceIds: ['EVD-002'],
    ringId: 'RING-001',
    individualRisk: 38,
    networkRisk: 84,
    finalRisk: 88,
    timeline: [],
  },
  {
    id: 'PX-1998',
    customerId: 'CUST-003',
    sku: 'WH-204-ANC',
    orderDate: '2026-08-24',
    deliveryDate: '2026-08-29',
    returnRequestedAt: '2026-08-30T08:31:00',
    refundAmount: 8499,
    reason: 'Product not as described',
    status: 'under_investigation',
    evidenceIds: ['EVD-003'],
    ringId: 'RING-001',
    individualRisk: 35,
    networkRisk: 82,
    finalRisk: 87,
    timeline: [],
  },
  {
    id: 'PX-2031',
    customerId: 'CUST-004',
    sku: 'WH-204-ANC',
    orderDate: '2026-08-27',
    deliveryDate: '2026-09-01',
    returnRequestedAt: '2026-09-01T19:42:00',
    refundAmount: 8499,
    reason: 'Item arrived damaged',
    status: 'pending_review',
    evidenceIds: ['EVD-004'],
    ringId: 'RING-001',
    individualRisk: 44,
    networkRisk: 80,
    finalRisk: 85,
    timeline: [],
  },

  // === INDEPENDENT SUSPICIOUS ===
  {
    id: 'PX-2019',
    customerId: 'CUST-005',
    sku: 'SM-X12-PRO',
    orderDate: '2026-08-15',
    deliveryDate: '2026-08-18',
    returnRequestedAt: '2026-08-20T16:00:00',
    refundAmount: 12499,
    reason: 'Defective product',
    status: 'pending_review',
    evidenceIds: [],
    ringId: null,
    individualRisk: 71,
    networkRisk: 22,
    finalRisk: 66,
    timeline: [],
  },
  {
    id: 'PX-2003',
    customerId: 'CUST-006',
    sku: 'JK-LTH-01',
    orderDate: '2026-08-10',
    deliveryDate: '2026-08-13',
    returnRequestedAt: '2026-08-14T09:30:00',
    refundAmount: 15999,
    reason: 'Size mismatch',
    status: 'approved',
    evidenceIds: [],
    ringId: null,
    individualRisk: 58,
    networkRisk: 15,
    finalRisk: 53,
    timeline: [],
  },

  // === NORMAL CASES ===
  {
    id: 'PX-1977',
    customerId: 'CUST-007',
    sku: 'BG-CAN-LG',
    orderDate: '2026-08-01',
    deliveryDate: '2026-08-04',
    returnRequestedAt: '2026-08-06T11:20:00',
    refundAmount: 2999,
    reason: 'Changed mind',
    status: 'approved',
    evidenceIds: [],
    ringId: null,
    individualRisk: 12,
    networkRisk: 5,
    finalRisk: 11,
    timeline: [],
  },
  {
    id: 'PX-1985',
    customerId: 'CUST-008',
    sku: 'MS-PAD-XL',
    orderDate: '2026-08-05',
    deliveryDate: '2026-08-08',
    returnRequestedAt: '2026-08-09T14:10:00',
    refundAmount: 999,
    reason: 'Received wrong item',
    status: 'approved',
    evidenceIds: [],
    ringId: null,
    individualRisk: 8,
    networkRisk: 3,
    finalRisk: 7,
    timeline: [],
  },
  {
    id: 'PX-2055',
    customerId: 'CUST-009',
    sku: 'LP-STD-15',
    orderDate: '2026-09-01',
    deliveryDate: '2026-09-04',
    returnRequestedAt: '2026-09-05T10:00:00',
    refundAmount: 2499,
    reason: 'Quality not as expected',
    status: 'pending_review',
    evidenceIds: [],
    ringId: null,
    individualRisk: 28,
    networkRisk: 9,
    finalRisk: 26,
    timeline: [],
  },
  {
    id: 'PX-2060',
    customerId: 'CUST-010',
    sku: 'KB-550-WL',
    orderDate: '2026-09-03',
    deliveryDate: '2026-09-06',
    returnRequestedAt: '2026-09-07T13:45:00',
    refundAmount: 5299,
    reason: 'Defective keys',
    status: 'pending_review',
    evidenceIds: [],
    ringId: null,
    individualRisk: 33,
    networkRisk: 11,
    finalRisk: 31,
    timeline: [],
  },
];

// Pre-computed dashboard summary for Overview Dashboard
export const DASHBOARD_SUMMARY = {
  totalReturnsAnalyzed: 1482,
  suspiciousReturns: 64,
  highRiskCases: 14,
  fraudRingsDetected: 3,
  potentialExposureINR: 1248900,
  awaitingHumanReview: 7,
  riskDistribution: {
    low: 84.2,
    medium: 11.1,
    high: 3.2,
    ring: 1.5,
  },
};

export const RECENT_ALERTS = [
  { id: 'ALT-001', type: 'ring', message: 'Coordinated return activity detected across 4 accounts', caseId: 'PX-2047', timestamp: '2026-09-03T14:33:00', severity: 'critical' },
  { id: 'ALT-002', type: 'evidence', message: 'Repeated identical damage evidence detected — 94.2% perceptual match', caseId: 'PX-2011', timestamp: '2026-09-02T18:31:00', severity: 'high' },
  { id: 'ALT-003', type: 'device', message: 'Shared hardware fingerprint across 3 distinct accounts', caseId: 'PX-1998', timestamp: '2026-09-02T18:32:00', severity: 'high' },
  { id: 'ALT-004', type: 'velocity', message: 'Return velocity burst — 4 returns of SKU WH-204-ANC within 11 days', caseId: 'PX-2031', timestamp: '2026-09-01T20:00:00', severity: 'medium' },
  { id: 'ALT-005', type: 'payment', message: 'Shared payment identifier across 2 distinct shipping names', caseId: 'PX-1998', timestamp: '2026-09-02T18:35:00', severity: 'medium' },
];

export const ACTIVE_RINGS = [
  {
    id: 'RING-001', name: 'Audio Peripheral Loop',
    accounts: 4, sharedDevices: 3, linkedAddresses: 2,
    paymentTokens: 1, repeatedSku: 5, similarEvidence: 3,
    activityWindow: 11, totalExposure: 33996,
    status: 'active', risk: 91,
  },
  {
    id: 'RING-002', name: 'Luxury Apparel Burst',
    accounts: 3, sharedDevices: 2, linkedAddresses: 1,
    paymentTokens: 0, repeatedSku: 3, similarEvidence: 0,
    activityWindow: 18, totalExposure: 47997,
    status: 'monitoring', risk: 72,
  },
  {
    id: 'RING-003', name: 'Electronics Serial Return',
    accounts: 2, sharedDevices: 1, linkedAddresses: 1,
    paymentTokens: 1, repeatedSku: 2, similarEvidence: 0,
    activityWindow: 25, totalExposure: 25998,
    status: 'monitoring', risk: 58,
  },
];

export function getCustomerById(id) {
  return CUSTOMERS.find(c => c.id === id);
}

export function getCaseById(id) {
  return RETURN_CASES.find(c => c.id === id);
}

export function getEvidenceForCase(caseId) {
  return EVIDENCE.filter(e => e.caseId === caseId);
}
