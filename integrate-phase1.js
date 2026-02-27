/**
 * Phase 1 内容集成脚本
 * 将扩展节点合并到主数据文件
 */

const fs = require('fs');
const path = require('path');

async function integratePhase1() {
    console.log('🚀 开始集成 Phase 1 内容...\n');

    // 1. 读取现有数据
    const nodesPath = path.join(__dirname, 'data', 'nodes.json');
    const edgesPath = path.join(__dirname, 'data', 'edges.json');
    const phase1NodesPath = path.join(__dirname, 'data', 'nodes-extended-phase1.json');

    const existingNodes = JSON.parse(fs.readFileSync(nodesPath, 'utf8'));
    const existingEdges = JSON.parse(fs.readFileSync(edgesPath, 'utf8'));
    const phase1Data = JSON.parse(fs.readFileSync(phase1NodesPath, 'utf8'));

    console.log(`📊 现有节点数: ${existingNodes.nodes.length}`);
    console.log(`📊 Phase 1 新增节点数: ${phase1Data.newNodes.length}\n`);

    // 2. 合并节点
    const mergedNodes = {
        ...existingNodes,
        nodes: [...existingNodes.nodes, ...phase1Data.newNodes]
    };

    // 3. 生成新的边关系
    const newEdges = generateEdgesForPhase1(phase1Data.newNodes, existingNodes.nodes);
    const mergedEdges = {
        ...existingEdges,
        edges: [...existingEdges.edges, ...newEdges]
    };

    console.log(`✅ 合并后节点数: ${mergedNodes.nodes.length}`);
    console.log(`✅ 新增边数: ${newEdges.length}`);
    console.log(`✅ 合并后边数: ${mergedEdges.edges.length}\n`);

    // 4. 备份原文件
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    fs.writeFileSync(
        path.join(__dirname, 'data', `nodes.backup.${timestamp}.json`),
        JSON.stringify(existingNodes, null, 2)
    );
    fs.writeFileSync(
        path.join(__dirname, 'data', `edges.backup.${timestamp}.json`),
        JSON.stringify(existingEdges, null, 2)
    );
    console.log('💾 已备份原文件\n');

    // 5. 写入新文件
    fs.writeFileSync(nodesPath, JSON.stringify(mergedNodes, null, 2));
    fs.writeFileSync(edgesPath, JSON.stringify(mergedEdges, null, 2));
    console.log('✅ 已写入新数据\n');

    // 6. 生成报告
    generateIntegrationReport(existingNodes, phase1Data, mergedNodes, newEdges);

    console.log('🎉 Phase 1 内容集成完成！');
}

/**
 * 为Phase 1节点生成边关系
 */
function generateEdgesForPhase1(newNodes, existingNodes) {
    const edges = [];
    let edgeId = 1000; // 从1000开始避免冲突

    newNodes.forEach(node => {
        // 根据prerequisites生成边
        if (node.prerequisites && node.prerequisites.length > 0) {
            node.prerequisites.forEach(prereqId => {
                edges.push({
                    id: `edge-${edgeId++}`,
                    source: prereqId,
                    target: node.id,
                    type: "prerequisite",
                    strength: 0.8,
                    description: `${prereqId} 是 ${node.id} 的前置知识`
                });
            });
        }

        // 为同学域节点生成关联边
        const sameDomainNodes = existingNodes.filter(n => 
            n.domains && node.domains && 
            n.domains.some(d => node.domains.includes(d)) &&
            n.id !== node.id
        );

        // 选择最相关的2-3个节点建立弱关联
        sameDomainNodes.slice(0, 2).forEach(relatedNode => {
            edges.push({
                id: `edge-${edgeId++}`,
                source: relatedNode.id,
                target: node.id,
                type: "related",
                strength: 0.3,
                description: `${relatedNode.id} 与 ${node.id} 相关`
            });
        });
    });

    return edges;
}

/**
 * 生成集成报告
 */
function generateIntegrationReport(oldData, phase1Data, newData, newEdges) {
    const report = {
        timestamp: new Date().toISOString(),
        summary: {
            oldNodeCount: oldData.nodes.length,
            newNodeCount: phase1Data.newNodes.length,
            totalNodeCount: newData.nodes.length,
            newEdgeCount: newEdges.length
        },
        domainDistribution: {},
        difficultyDistribution: {},
        newNodes: phase1Data.newNodes.map(n => ({
            id: n.id,
            name: n.name,
            domains: n.domains,
            difficulty: n.difficulty
        }))
    };

    // 统计学域分布
    newData.nodes.forEach(node => {
        if (node.domains) {
            node.domains.forEach(domain => {
                report.domainDistribution[domain] = 
                    (report.domainDistribution[domain] || 0) + 1;
            });
        }
    });

    // 统计难度分布
    newData.nodes.forEach(node => {
        const diff = node.difficulty || 'unknown';
        report.difficultyDistribution[diff] = 
            (report.difficultyDistribution[diff] || 0) + 1;
    });

    // 写入报告
    fs.writeFileSync(
        path.join(__dirname, 'PHASE1-INTEGRATION-REPORT.json'),
        JSON.stringify(report, null, 2)
    );

    console.log('📊 集成报告:');
    console.log(`   原节点数: ${report.summary.oldNodeCount}`);
    console.log(`   新增节点: ${report.summary.newNodeCount}`);
    console.log(`   总节点数: ${report.summary.totalNodeCount}`);
    console.log(`   新增边数: ${report.summary.newEdgeCount}\n`);
    console.log('📄 详细报告已保存到: PHASE1-INTEGRATION-REPORT.json\n');
}

// 执行集成
if (require.main === module) {
    integratePhase1().catch(console.error);
}

module.exports = { integratePhase1 };
