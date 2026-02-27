const fs = require('fs');

const nodes = JSON.parse(fs.readFileSync('data/nodes.json', 'utf8'));
const edges = JSON.parse(fs.readFileSync('data/edges.json', 'utf8'));

console.log('📊 当前数据状态\n');
console.log('节点总数:', nodes.nodes.length);
console.log('边总数:', edges.edges.length);

const domains = {};
nodes.nodes.forEach(n => {
    if(n.domains) {
        n.domains.forEach(d => {
            domains[d] = (domains[d] || 0) + 1;
        });
    }
});

console.log('\n学域分布:');
Object.entries(domains).sort().forEach(([k, v]) => {
    console.log(`  ${k}: ${v}个节点`);
});

// 检查Phase1节点
const phase1Nodes = nodes.nodes.filter(n => 
    n.id.includes('sequence') || 
    n.id.includes('infinitesimal') ||
    n.id.includes('uniform-continuity')
);

console.log('\n✅ Phase1节点示例:');
phase1Nodes.slice(0, 5).forEach(n => {
    console.log(`  - ${n.id}: ${n.name}`);
});

console.log('\n是否包含Phase1节点:', phase1Nodes.length > 0 ? '是' : '否');
