const fs = require('fs');
const path = require('path');

console.log('🔍 检测空间解析几何孤立节点\n');
console.log('='.repeat(60));

// 1. 读取节点和边数据
const nodesPath = path.join(__dirname, 'data/nodes.json');
const edgesPath = path.join(__dirname, 'data/edges.json');

let nodesData, edgesData;
try {
    nodesData = JSON.parse(fs.readFileSync(nodesPath, 'utf8'));
    edgesData = JSON.parse(fs.readFileSync(edgesPath, 'utf8'));
    console.log('✅ 数据文件读取成功\n');
} catch (error) {
    console.log('❌ 读取失败:', error.message);
    process.exit(1);
}

// 2. 获取所有空间几何节点
const spatialNodes = nodesData.nodes.filter(n => n.chapter === 'chapter-12');
console.log(`📊 chapter-12 节点总数: ${spatialNodes.length}\n`);

// 3. 构建边的连接关系
const nodeConnections = {};
spatialNodes.forEach(n => {
    nodeConnections[n.id] = {
        node: n,
        incomingEdges: [],
        outgoingEdges: [],
        totalEdges: 0
    };
});

// 4. 统计每个节点的边连接
edgesData.edges.forEach(edge => {
    if (nodeConnections[edge.source]) {
        nodeConnections[edge.source].outgoingEdges.push(edge);
        nodeConnections[edge.source].totalEdges++;
    }
    if (nodeConnections[edge.target]) {
        nodeConnections[edge.target].incomingEdges.push(edge);
        nodeConnections[edge.target].totalEdges++;
    }
});

// 5. 识别孤立节点和弱连接节点
const isolatedNodes = [];
const weaklyConnectedNodes = [];
const wellConnectedNodes = [];

Object.entries(nodeConnections).forEach(([id, conn]) => {
    if (conn.totalEdges === 0) {
        isolatedNodes.push(conn);
    } else if (conn.totalEdges <= 2) {
        weaklyConnectedNodes.push(conn);
    } else {
        wellConnectedNodes.push(conn);
    }
});

// 6. 输出结果
console.log('='.repeat(60));
console.log('📊 连接性统计\n');

console.log(`🔴 完全孤立节点: ${isolatedNodes.length} 个`);
console.log(`🟡 弱连接节点 (≤2条边): ${weaklyConnectedNodes.length} 个`);
console.log(`🟢 良好连接节点 (>2条边): ${wellConnectedNodes.length} 个`);

// 7. 详细列出孤立节点
if (isolatedNodes.length > 0) {
    console.log('\n' + '='.repeat(60));
    console.log('🔴 完全孤立节点详情\n');
    
    isolatedNodes.forEach((conn, i) => {
        console.log(`${i + 1}. ${conn.node.id}`);
        console.log(`   名称: ${conn.node.name}`);
        console.log(`   学域: ${conn.node.domains ? conn.node.domains.join(', ') : '未设置'}`);
        console.log(`   难度: ${conn.node.difficulty || '未设置'}`);
        console.log(`   前置知识: ${conn.node.prerequisites ? conn.node.prerequisites.length : 0} 个`);
        console.log('');
    });
}

// 8. 详细列出弱连接节点
if (weaklyConnectedNodes.length > 0) {
    console.log('='.repeat(60));
    console.log('🟡 弱连接节点详情\n');
    
    weaklyConnectedNodes.forEach((conn, i) => {
        console.log(`${i + 1}. ${conn.node.id}`);
        console.log(`   名称: ${conn.node.name}`);
        console.log(`   总边数: ${conn.totalEdges}`);
        console.log(`   入边: ${conn.incomingEdges.length} 条`);
        console.log(`   出边: ${conn.outgoingEdges.length} 条`);
        
        if (conn.incomingEdges.length > 0) {
            console.log('   入边来源:');
            conn.incomingEdges.forEach(e => {
                const sourceNode = nodesData.nodes.find(n => n.id === e.source);
                console.log(`     ← ${sourceNode ? sourceNode.name : e.source} (${e.type})`);
            });
        }
        
        if (conn.outgoingEdges.length > 0) {
            console.log('   出边目标:');
            conn.outgoingEdges.forEach(e => {
                const targetNode = nodesData.nodes.find(n => n.id === e.target);
                console.log(`     → ${targetNode ? targetNode.name : e.target} (${e.type})`);
            });
        }
        console.log('');
    });
}

// 9. 列出良好连接的节点
if (wellConnectedNodes.length > 0) {
    console.log('='.repeat(60));
    console.log('🟢 良好连接节点概览\n');
    
    wellConnectedNodes.forEach((conn, i) => {
        console.log(`${i + 1}. ${conn.node.name} (${conn.node.id})`);
        console.log(`   总边数: ${conn.totalEdges} (入: ${conn.incomingEdges.length}, 出: ${conn.outgoingEdges.length})`);
    });
}

// 10. 分析与其他章节的连接
console.log('\n' + '='.repeat(60));
console.log('🔗 与其他章节的连接分析\n');

const crossChapterEdges = [];
edgesData.edges.forEach(edge => {
    const sourceNode = nodesData.nodes.find(n => n.id === edge.source);
    const targetNode = nodesData.nodes.find(n => n.id === edge.target);
    
    if (sourceNode && targetNode) {
        const sourceIsSpatial = sourceNode.chapter === 'chapter-12';
        const targetIsSpatial = targetNode.chapter === 'chapter-12';
        
        if (sourceIsSpatial !== targetIsSpatial) {
            crossChapterEdges.push({
                edge,
                sourceNode,
                targetNode,
                direction: sourceIsSpatial ? 'spatial→other' : 'other→spatial'
            });
        }
    }
});

console.log(`跨章节边总数: ${crossChapterEdges.length} 条\n`);

const spatialToOther = crossChapterEdges.filter(e => e.direction === 'spatial→other');
const otherToSpatial = crossChapterEdges.filter(e => e.direction === 'other→spatial');

console.log(`空间几何 → 其他章节: ${spatialToOther.length} 条`);
if (spatialToOther.length > 0) {
    spatialToOther.forEach(e => {
        console.log(`  ${e.sourceNode.name} → ${e.targetNode.name} (${e.edge.type})`);
    });
}

console.log(`\n其他章节 → 空间几何: ${otherToSpatial.length} 条`);
if (otherToSpatial.length > 0) {
    otherToSpatial.forEach(e => {
        console.log(`  ${e.sourceNode.name} → ${e.targetNode.name} (${e.edge.type})`);
    });
}

// 11. 建议
console.log('\n' + '='.repeat(60));
console.log('💡 修复建议\n');

if (isolatedNodes.length > 0) {
    console.log('🔴 完全孤立节点需要添加边连接：');
    isolatedNodes.forEach(conn => {
        console.log(`  - ${conn.node.name}:`);
        console.log(`    建议添加前置关系边（从基础节点指向它）`);
        console.log(`    建议添加应用关系边（从它指向应用节点）`);
    });
    console.log('');
}

if (weaklyConnectedNodes.length > 0) {
    console.log('🟡 弱连接节点建议增强连接：');
    weaklyConnectedNodes.forEach(conn => {
        console.log(`  - ${conn.node.name} (当前${conn.totalEdges}条边):`);
        if (conn.incomingEdges.length === 0) {
            console.log(`    ⚠️  缺少前置知识边`);
        }
        if (conn.outgoingEdges.length === 0) {
            console.log(`    ⚠️  缺少后续应用边`);
        }
    });
    console.log('');
}

if (otherToSpatial.length === 0) {
    console.log('⚠️  空间几何节点与其他章节缺少前置连接');
    console.log('   建议：添加从基础章节（如向量、函数）到空间几何的边');
    console.log('');
}

console.log('='.repeat(60));
console.log('✨ 检测完成！\n');

// 12. 生成修复脚本的数据
if (isolatedNodes.length > 0 || weaklyConnectedNodes.length > 0) {
    console.log('💾 生成修复数据...\n');
    
    const fixData = {
        isolatedNodes: isolatedNodes.map(c => ({
            id: c.node.id,
            name: c.node.name,
            chapter: c.node.chapter,
            domains: c.node.domains,
            prerequisites: c.node.prerequisites
        })),
        weaklyConnectedNodes: weaklyConnectedNodes.map(c => ({
            id: c.node.id,
            name: c.node.name,
            totalEdges: c.totalEdges,
            incomingCount: c.incomingEdges.length,
            outgoingCount: c.outgoingEdges.length
        })),
        suggestions: []
    };
    
    // 保存到文件
    fs.writeFileSync(
        'spatial-isolated-nodes-report.json',
        JSON.stringify(fixData, null, 2),
        'utf8'
    );
    
    console.log('✅ 修复数据已保存到: spatial-isolated-nodes-report.json');
}
