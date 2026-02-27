/**
 * Phase 1 集成验证脚本
 * 验证所有数据完整性和系统功能
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Phase 1 集成验证\n');
console.log('='.repeat(60));

// 1. 读取数据文件
const nodesData = JSON.parse(fs.readFileSync('data/nodes.json', 'utf8'));
const edgesData = JSON.parse(fs.readFileSync('data/edges.json', 'utf8'));
const domainsData = JSON.parse(fs.readFileSync('data/domains.json', 'utf8'));

const nodes = nodesData.nodes;
const edges = edgesData.edges;
const domains = domainsData.domains;

console.log('\n📊 数据统计');
console.log('-'.repeat(60));
console.log(`节点总数: ${nodes.length}`);
console.log(`边总数: ${edges.length}`);
console.log(`学域数: ${domains.length}`);

// 2. 验证节点完整性
console.log('\n✅ 节点完整性检查');
console.log('-'.repeat(60));

const nodeIds = new Set();
const duplicates = [];
const missingFields = [];

nodes.forEach(node => {
    // 检查重复ID
    if (nodeIds.has(node.id)) {
        duplicates.push(node.id);
    }
    nodeIds.add(node.id);
    
    // 检查必需字段
    const required = ['id', 'name', 'description', 'domains', 'difficulty'];
    const missing = required.filter(field => !node[field]);
    if (missing.length > 0) {
        missingFields.push({ id: node.id, missing });
    }
});

console.log(`✓ 节点ID唯一性: ${duplicates.length === 0 ? '通过' : '失败'}`);
if (duplicates.length > 0) {
    console.log(`  重复ID: ${duplicates.join(', ')}`);
}

console.log(`✓ 必需字段完整性: ${missingFields.length === 0 ? '通过' : '失败'}`);
if (missingFields.length > 0) {
    console.log(`  缺失字段的节点: ${missingFields.length}个`);
}

// 3. 验证边关系
console.log('\n✅ 边关系检查');
console.log('-'.repeat(60));

const edgeIds = new Set();
const edgeDuplicates = [];
const invalidEdges = [];

edges.forEach(edge => {
    // 检查重复边ID
    if (edgeIds.has(edge.id)) {
        edgeDuplicates.push(edge.id);
    }
    edgeIds.add(edge.id);
    
    // 检查边引用的节点是否存在
    if (!nodeIds.has(edge.source)) {
        invalidEdges.push({ edge: edge.id, issue: `source节点不存在: ${edge.source}` });
    }
    if (!nodeIds.has(edge.target)) {
        invalidEdges.push({ edge: edge.id, issue: `target节点不存在: ${edge.target}` });
    }
});

console.log(`✓ 边ID唯一性: ${edgeDuplicates.length === 0 ? '通过' : '失败'}`);
console.log(`✓ 边引用有效性: ${invalidEdges.length === 0 ? '通过' : '失败'}`);
if (invalidEdges.length > 0) {
    console.log(`  无效边: ${invalidEdges.length}个`);
    invalidEdges.slice(0, 5).forEach(e => console.log(`    - ${e.edge}: ${e.issue}`));
}

// 4. 学域分布
console.log('\n📈 学域分布');
console.log('-'.repeat(60));

const domainStats = {};
domains.forEach(d => {
    domainStats[d.id] = {
        name: d.name,
        count: 0
    };
});

nodes.forEach(node => {
    if (node.domains) {
        node.domains.forEach(domainId => {
            if (domainStats[domainId]) {
                domainStats[domainId].count++;
            }
        });
    }
});

Object.entries(domainStats).forEach(([id, stats]) => {
    console.log(`${stats.name} (${id}): ${stats.count}个节点`);
});

// 5. 难度分布
console.log('\n📊 难度分布');
console.log('-'.repeat(60));

const difficultyStats = {};
nodes.forEach(node => {
    const diff = node.difficulty || 'unknown';
    difficultyStats[diff] = (difficultyStats[diff] || 0) + 1;
});

Object.entries(difficultyStats).sort((a, b) => a[0] - b[0]).forEach(([level, count]) => {
    const stars = '⭐'.repeat(parseInt(level) || 0);
    console.log(`难度 ${level} ${stars}: ${count}个节点`);
});

// 6. Phase1节点识别
console.log('\n🆕 Phase 1 新增节点');
console.log('-'.repeat(60));

const phase1Keywords = [
    'sequence', 'infinitesimal', 'uniform', 'properties',
    'existence', 'discontinuity', 'special', 'geometric',
    'physical', 'implicit', 'parametric', 'logarithmic',
    'higher', 'curvature', 'rolle'
];

const phase1Nodes = nodes.filter(node => 
    phase1Keywords.some(keyword => node.id.includes(keyword))
);

console.log(`识别到 ${phase1Nodes.length} 个Phase1节点:`);
phase1Nodes.slice(0, 10).forEach(node => {
    console.log(`  - ${node.id}: ${node.name}`);
});
if (phase1Nodes.length > 10) {
    console.log(`  ... 还有 ${phase1Nodes.length - 10} 个节点`);
}

// 7. 连接性分析
console.log('\n🔗 知识网络连接性');
console.log('-'.repeat(60));

const nodeConnections = {};
nodes.forEach(node => {
    nodeConnections[node.id] = { in: 0, out: 0 };
});

edges.forEach(edge => {
    if (nodeConnections[edge.source]) {
        nodeConnections[edge.source].out++;
    }
    if (nodeConnections[edge.target]) {
        nodeConnections[edge.target].in++;
    }
});

const isolatedNodes = Object.entries(nodeConnections)
    .filter(([id, conn]) => conn.in === 0 && conn.out === 0);

const rootNodes = Object.entries(nodeConnections)
    .filter(([id, conn]) => conn.in === 0 && conn.out > 0);

const leafNodes = Object.entries(nodeConnections)
    .filter(([id, conn]) => conn.in > 0 && conn.out === 0);

console.log(`孤立节点: ${isolatedNodes.length}个`);
console.log(`根节点 (无前置): ${rootNodes.length}个`);
console.log(`叶节点 (无后续): ${leafNodes.length}个`);
console.log(`平均连接数: ${(edges.length * 2 / nodes.length).toFixed(2)}`);

// 8. 最终总结
console.log('\n' + '='.repeat(60));
console.log('📋 验证总结');
console.log('='.repeat(60));

const allChecks = [
    { name: '节点ID唯一性', pass: duplicates.length === 0 },
    { name: '节点字段完整性', pass: missingFields.length === 0 },
    { name: '边ID唯一性', pass: edgeDuplicates.length === 0 },
    { name: '边引用有效性', pass: invalidEdges.length === 0 },
    { name: 'Phase1节点存在', pass: phase1Nodes.length > 0 },
    { name: '知识网络连通', pass: isolatedNodes.length < nodes.length * 0.1 }
];

const passedChecks = allChecks.filter(c => c.pass).length;
const totalChecks = allChecks.length;

allChecks.forEach(check => {
    const status = check.pass ? '✅' : '❌';
    console.log(`${status} ${check.name}`);
});

console.log('\n' + '='.repeat(60));
console.log(`总体评分: ${passedChecks}/${totalChecks} (${(passedChecks/totalChecks*100).toFixed(1)}%)`);

if (passedChecks === totalChecks) {
    console.log('\n🎉 恭喜！Phase 1 集成验证全部通过！');
    console.log('✅ 系统已准备就绪，可以启动测试');
} else {
    console.log('\n⚠️  发现问题，请检查上述失败项');
}

console.log('\n📝 下一步操作:');
console.log('  1. 启动本地服务器: python -m http.server 8000');
console.log('  2. 打开浏览器: http://localhost:8000');
console.log('  3. 测试所有功能');
console.log('='.repeat(60));
