#!/usr/bin/env node
/**
 * 统计知识图谱中的节点总数
 */

const fs = require('fs');
const path = require('path');

console.log('\n' + '='.repeat(60));
console.log('📊 知识图谱节点统计');
console.log('='.repeat(60) + '\n');

try {
    // Phase 1 节点
    const phase1Path = './data/nodes.json';
    const phase1Data = JSON.parse(fs.readFileSync(phase1Path, 'utf8'));
    const phase1Count = phase1Data.nodes ? phase1Data.nodes.length : 0;
    
    console.log(`Phase 1 基础节点: ${phase1Count}`);
    
    // Phase 2 扩展节点
    const phase2Path = './data/nodes-extended-phase2.json';
    const phase2Data = JSON.parse(fs.readFileSync(phase2Path, 'utf8'));
    const phase2Count = phase2Data.data ? phase2Data.data.length : 0;
    
    console.log(`Phase 2 扩展节点: ${phase2Count}`);
    
    // 检查其他节点文件
    const otherFiles = [
        './data/nodes-extended-phase1.json',
        './data/nodes-extended-phase1-part2.json',
        './data/nodes-extended-phase1-part3.json',
        './data/nodes-extended-phase1-part4.json'
    ];
    
    let otherCount = 0;
    otherFiles.forEach(file => {
        if (fs.existsSync(file)) {
            try {
                const data = JSON.parse(fs.readFileSync(file, 'utf8'));
                const count = data.nodes ? data.nodes.length : (data.data ? data.data.length : 0);
                if (count > 0) {
                    console.log(`${path.basename(file)}: ${count}`);
                    otherCount += count;
                }
            } catch (e) {
                // 忽略解析错误
            }
        }
    });
    
    console.log('\n' + '-'.repeat(60));
    
    // 总计（假设 Phase 1 和 Phase 2 是主要数据源）
    const total = phase1Count + phase2Count;
    console.log(`\n总节点数: ${total}`);
    
    // 额外信息
    console.log('\n📈 详细信息:');
    console.log(`  - Phase 1 (基础数学概念): ${phase1Count} 个节点`);
    console.log(`  - Phase 2 (扩展内容): ${phase2Count} 个节点`);
    
    if (otherCount > 0) {
        console.log(`  - 其他扩展文件: ${otherCount} 个节点`);
        console.log(`  - 包含其他文件的总计: ${total + otherCount} 个节点`);
    }
    
    // 检查边数据
    console.log('\n🔗 边（关系）统计:');
    
    const edgesPath = './data/edges.json';
    if (fs.existsSync(edgesPath)) {
        const edgesData = JSON.parse(fs.readFileSync(edgesPath, 'utf8'));
        const edgesCount = edgesData.edges ? edgesData.edges.length : 0;
        console.log(`  - Phase 1 边: ${edgesCount}`);
    }
    
    const edges2Path = './data/edges-extended-phase2.json';
    if (fs.existsSync(edges2Path)) {
        const edges2Data = JSON.parse(fs.readFileSync(edges2Path, 'utf8'));
        const edges2Count = edges2Data.edges ? edges2Data.edges.length : 0;
        console.log(`  - Phase 2 边: ${edges2Count}`);
    }
    
    console.log('\n' + '='.repeat(60) + '\n');
    
} catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
}
