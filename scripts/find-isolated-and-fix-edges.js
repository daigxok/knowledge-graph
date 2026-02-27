/**
 * 找出孤立节点（未出现在任何边中的节点）并按其 prerequisites 补边
 * 运行: node scripts/find-isolated-and-fix-edges.js
 */
const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
const nodesPath = path.join(dataDir, 'nodes.json');
const edgesPath = path.join(dataDir, 'edges.json');

const nodesData = JSON.parse(fs.readFileSync(nodesPath, 'utf8'));
const edgesData = JSON.parse(fs.readFileSync(edgesPath, 'utf8'));

const nodes = nodesData.nodes || [];
const edges = edgesData.edges || [];

const connectedIds = new Set();
edges.forEach(e => {
  if (e.source && typeof e.source === 'string') connectedIds.add(e.source);
  else if (e.source && e.source.id) connectedIds.add(e.source.id);
  if (e.target && typeof e.target === 'string') connectedIds.add(e.target);
  else if (e.target && e.target.id) connectedIds.add(e.target.id);
});

const isolated = nodes.filter(n => !connectedIds.has(n.id));
console.log('总节点数:', nodes.length);
console.log('边中出现的节点数:', connectedIds.size);
console.log('孤立节点数:', isolated.length);
console.log('孤立节点:', isolated.map(n => n.id).join(', '));

const existingPairs = new Set();
edges.forEach(e => {
  const s = typeof e.source === 'string' ? e.source : (e.source && e.source.id);
  const t = typeof e.target === 'string' ? e.target : (e.target && e.target.id);
  if (s && t) existingPairs.add(s + '->' + t);
});

const toAdd = [];
isolated.forEach(node => {
  const prereqs = node.prerequisites || [];
  prereqs.forEach(pid => {
    const key = pid + '->' + node.id;
    if (!existingPairs.has(key)) {
      toAdd.push({
        id: 'edge-fix-' + (edges.length + toAdd.length + 1),
        source: pid,
        target: node.id,
        type: 'prerequisite',
        strength: 0.9,
        description: (node.name || node.id) + ' 的前置知识'
      });
      existingPairs.add(key);
    }
  });
});

console.log('将添加的边数:', toAdd.length);
toAdd.forEach(e => console.log('  ', e.source, '->', e.target));

if (toAdd.length > 0) {
  const newEdges = [...edges, ...toAdd];
  const newMeta = { ...edgesData.metadata };
  newMeta.totalEdges = newEdges.length;
  const out = { edges: newEdges, metadata: newMeta };
  fs.writeFileSync(edgesPath, JSON.stringify(out, null, 2), 'utf8');
  console.log('已写入', edgesPath);
}
