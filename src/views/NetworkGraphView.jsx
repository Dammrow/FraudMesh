import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { buildCaseGraph, getNodeColor, getNodeSize, getLinkColor, NODE_COLORS, NODE_TYPES } from '../services/graphEngine.js';
import { getCaseById, getCustomerById, FRAUD_RING_ALPHA } from '../services/syntheticData.js';

const LEGEND_ITEMS = [
  { type: 'customer', label: 'Customer Account', color: NODE_COLORS.customer },
  { type: 'customer_suspect', label: 'Suspect Account', color: NODE_COLORS.customer_suspect },
  { type: 'device', label: 'Device Fingerprint', color: NODE_COLORS.device },
  { type: 'address', label: 'Delivery Address', color: NODE_COLORS.address },
  { type: 'payment', label: 'Payment Token', color: NODE_COLORS.payment },
  { type: 'sku', label: 'Product SKU', color: NODE_COLORS.sku },
  { type: 'evidence', label: 'Evidence Item', color: NODE_COLORS.evidence },
];

export default function NetworkGraphView({ caseId, onViewCase }) {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [graphData, setGraphData] = useState(null);

  const caseData = getCaseById(caseId) || getCaseById('PX-2047');

  useEffect(() => {
    const data = buildCaseGraph(caseId || 'PX-2047');
    setGraphData(data);
  }, [caseId]);

  useEffect(() => {
    if (!graphData || !svgRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const w = container.clientWidth || 800;
    const h = container.clientHeight || 520;

    // Clear previous
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', w)
      .attr('height', h);

    // Defs: arrowhead
    const defs = svg.append('defs');
    ['device', 'address', 'payment', 'sku', 'evidence'].forEach(type => {
      defs.append('marker')
        .attr('id', `arrow-${type}`)
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 22).attr('refY', 0)
        .attr('markerWidth', 6).attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', getLinkColor({ type }));
    });

    // Deep copy nodes & links for simulation
    const nodes = graphData.nodes.map(n => ({ ...n }));
    const links = graphData.links.map(l => ({ ...l }));

    // Force simulation
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(d => {
        if (d.type === 'ring_member') return 100;
        if (d.type === 'sku' || d.type === 'evidence') return 90;
        return 110;
      }).strength(0.6))
      .force('charge', d3.forceManyBody().strength(-350))
      .force('center', d3.forceCenter(w / 2, h / 2))
      .force('collision', d3.forceCollide().radius(d => getNodeSize(d) + 14));

    // Draw links
    const link = svg.append('g').selectAll('line')
      .data(links).enter().append('line')
      .attr('stroke', d => getLinkColor(d))
      .attr('stroke-width', d => d.type === 'ring_member' ? 1.5 : 2)
      .attr('stroke-dasharray', d => d.type === 'ring_member' ? '5,4' : 'none')
      .attr('stroke-opacity', 0.65)
      .attr('marker-end', d => `url(#arrow-${d.type})`);

    // Link labels
    const linkLabel = svg.append('g').selectAll('text')
      .data(links).enter().append('text')
      .attr('font-size', '9.5px')
      .attr('fill', '#475467')
      .attr('text-anchor', 'middle')
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('font-weight', '500')
      .text(d => d.label || '');

    // Draw node groups
    const node = svg.append('g').selectAll('g')
      .data(nodes).enter().append('g')
      .attr('cursor', 'pointer')
      .call(d3.drag()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x; d.fy = d.y;
        })
        .on('drag', (event, d) => { d.fx = event.x; d.fy = event.y; })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null; d.fy = null;
        })
      )
      .on('click', (event, d) => {
        event.stopPropagation();
        setSelectedNode(d);
      });

    // Outer ring for target/suspect
    node.each(function(d) {
      if (d.isTarget || d.isSuspect) {
        d3.select(this).append('circle')
          .attr('r', getNodeSize(d) + 8)
          .attr('fill', 'none')
          .attr('stroke', getNodeColor(d))
          .attr('stroke-width', 1.5)
          .attr('stroke-opacity', 0.3)
          .attr('stroke-dasharray', '4,3');
      }
    });

    // White backing circle for maximum contrast
    node.append('circle')
      .attr('r', d => getNodeSize(d))
      .attr('fill', '#FFFFFF');

    // Colored tint circle
    node.append('circle')
      .attr('r', d => getNodeSize(d))
      .attr('fill', d => `${getNodeColor(d)}1E`)
      .attr('stroke', d => getNodeColor(d))
      .attr('stroke-width', d => d.isTarget ? 3 : 2)
      .attr('transition', 'all 0.3s ease');

    // Node icon/initials
    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('font-size', d => d.type === NODE_TYPES.CUSTOMER ? '11px' : '10px')
      .attr('fill', d => getNodeColor(d))
      .attr('font-weight', '700')
      .attr('font-family', 'Inter, sans-serif')
      .text(d => getNodeInitial(d));

    // Node labels
    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', d => getNodeSize(d) + 14)
      .attr('font-size', '10px')
      .attr('fill', '#1C1E23')
      .attr('font-family', 'Inter, sans-serif')
      .attr('font-weight', d => d.isTarget ? '700' : '600')
      .text(d => truncate(d.label, 18));

    // Target badge
    node.filter(d => d.isTarget).append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', -getNodeSize({ isTarget: true }) - 7)
      .attr('font-size', '8px')
      .attr('fill', 'var(--risk-ring)')
      .attr('font-family', 'Inter, sans-serif')
      .attr('font-weight', '700')
      .attr('letter-spacing', '0.08em')
      .text('PRIMARY TARGET');

    // Click on background to deselect
    svg.on('click', () => setSelectedNode(null));

    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x).attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x).attr('y2', d => d.target.y);

      linkLabel
        .attr('x', d => (d.source.x + d.target.x) / 2)
        .attr('y', d => (d.source.y + d.target.y) / 2);

      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    return () => simulation.stop();
  }, [graphData]);

  const ring = FRAUD_RING_ALPHA;

  return (
    <div>
      {/* Header */}
      <div className="content-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="code-tag">RING-001</span>
            <h1 className="font-serif" style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--parchment-100)' }}>
              Fraud Network Graph
            </h1>
            <span className="badge badge-ring">AUDIO PERIPHERAL LOOP</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '3px' }}>
            Interactive network visualization · Click nodes to inspect · Drag to explore
          </div>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={onViewCase}>Open Case File →</button>
      </div>

      <div className="content-body">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px' }}>

          {/* Graph */}
          <div>
            <div ref={containerRef} className="graph-container">
              <svg ref={svgRef} style={{ width: '100%', height: '100%' }} />
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '14px' }}>
              {LEGEND_ITEMS.map(item => (
                <div key={item.type} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{item.label}</span>
                </div>
              ))}
            </div>

            {/* Disclaimer */}
            <div style={{
              marginTop: '12px', padding: '10px 14px',
              background: 'rgba(197,160,89,0.05)', border: '1px solid rgba(197,160,89,0.15)',
              borderRadius: 'var(--radius-md)', fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5,
            }}>
              <strong style={{ color: 'var(--brass-200)' }}>Important: </strong>
              No single shared signal constitutes proof of fraud. Multiple correlated signals across independent dimensions increase network risk. All cases require human investigator review before any action is taken.
            </div>
          </div>

          {/* Right: Node Inspector + Ring Summary */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Node Inspector */}
            <div className="card-dossier" style={{ padding: '16px' }}>
              <div className="section-title" style={{ marginBottom: '12px' }}>
                {selectedNode ? 'Entity Inspector' : 'Select a Node'}
              </div>
              {selectedNode ? (
                <NodeInspector node={selectedNode} />
              ) : (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.857rem', padding: '12px 0' }}>
                  Click any node on the graph to inspect its properties and connections.
                </div>
              )}
            </div>

            {/* Ring Summary */}
            <div className="card" style={{ padding: '16px' }}>
              <div className="section-title" style={{ marginBottom: '12px' }}>Ring Alpha Summary</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { label: 'Linked Accounts', value: '4' },
                  { label: 'Shared Devices', value: '3' },
                  { label: 'Linked Addresses', value: '2' },
                  { label: 'Payment Token', value: '1' },
                  { label: 'Repeated SKU Returns', value: '5' },
                  { label: 'Similar Evidence Items', value: '3' },
                  { label: 'Evidence Similarity', value: '94.2%', highlight: true },
                  { label: 'Activity Window', value: '11 days' },
                  { label: 'Total Exposure', value: '₹33,996' },
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid var(--border-dim)' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{row.label}</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: row.highlight ? 'var(--risk-ring)' : 'var(--text-primary)', fontFamily: row.highlight ? 'var(--font-mono)' : 'inherit' }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NodeInspector({ node }) {
  const typeLabel = {
    customer: 'Customer Account',
    device: 'Device Fingerprint',
    address: 'Delivery Address',
    payment: 'Payment Token',
    sku: 'Product SKU',
    evidence: 'Evidence Item',
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: `${getNodeColor(node)}20`,
          border: `1.5px solid ${getNodeColor(node)}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.8rem', fontWeight: 700, color: getNodeColor(node),
        }}>
          {getNodeInitial(node)}
        </div>
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{node.label}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{typeLabel[node.type] || node.type}</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem' }}>
        <PropRow k="ID" v={node.id} mono />
        {node.email && <PropRow k="Email" v={node.email} />}
        {node.city && <PropRow k="City" v={node.city} />}
        {node.returnRate !== undefined && <PropRow k="Return Rate" v={`${node.returnRate}%`} />}
        {node.os && <PropRow k="OS" v={node.os} />}
        {node.fingerprint && <PropRow k="Fingerprint" v={node.fingerprint} mono />}
        {node.city && node.pin && <PropRow k="Pincode" v={node.pin} mono />}
        {node.type === 'payment' && <PropRow k="Type" v={node.type} />}
        {node.similarity && <PropRow k="Similarity" v={`${node.similarity}%`} highlight />}
        {node.caseId && <PropRow k="Case" v={node.caseId} mono />}
        {node.count && <PropRow k="Return Count" v={`${node.count} accounts`} />}
      </div>

      {node.isTarget && (
        <div style={{ marginTop: '12px', padding: '8px', background: 'var(--risk-ring-bg)', border: '1px solid var(--risk-ring-border)', borderRadius: 'var(--radius-sm)' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--risk-ring)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Primary Investigation Target
          </div>
        </div>
      )}
      {node.isSuspect && !node.isTarget && (
        <div style={{ marginTop: '12px', padding: '8px', background: 'var(--risk-ring-bg)', border: '1px solid var(--risk-ring-border)', borderRadius: 'var(--radius-sm)' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--risk-ring)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Ring Alpha Member
          </div>
        </div>
      )}
    </div>
  );
}

function PropRow({ k, v, mono, highlight }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
      <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>{k}</span>
      <span style={{
        color: highlight ? 'var(--risk-ring)' : 'var(--text-primary)',
        fontFamily: mono ? 'var(--font-mono)' : 'inherit',
        fontSize: mono ? '0.72rem' : 'inherit',
        textAlign: 'right', wordBreak: 'break-all',
        fontWeight: highlight ? 700 : 400,
      }}>{v}</span>
    </div>
  );
}

function getNodeInitial(node) {
  if (node.type === NODE_TYPES.CUSTOMER) return node.label?.charAt(0) || 'C';
  if (node.type === NODE_TYPES.DEVICE) return '◈';
  if (node.type === NODE_TYPES.ADDRESS) return '⌂';
  if (node.type === NODE_TYPES.PAYMENT) return '◆';
  if (node.type === NODE_TYPES.SKU) return '▣';
  if (node.type === NODE_TYPES.EVIDENCE) return '⬛';
  return '?';
}

function truncate(str, n) {
  if (!str) return '';
  return str.length > n ? str.slice(0, n) + '…' : str;
}
