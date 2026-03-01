const fs = require('fs');
const path = require('path');

console.log('🔍 空间几何节点诊断\n');
console.log('='.repeat(60));

// 1. 检查文件存在
const nodesPath = path.join(__dirname, 'data/nodes.json');
const edgesPath = path.join(__dirname, 'data/edges.json');

if (!fs.existsSync(nodesPath)) {
    console.log('❌ nodes.json 文件不存在！');
    process.exit(1);
}
console.log('✅ nodes.json 文件存在');

if (!fs.existsSync(edgesPath)) {
    console.log('❌ edges.json 文件不存在！');
    process.exit(1);
}
console.log('✅ edges.json 文件存在');

// 2. 读取并解析节点文件
let nodesData;
try {
    const content = fs.readFileSync(nodesPath, 'utf8');
    nodesData = JSON.parse(content);
    console.log('✅ nodes.json 格式正确');
} catch (error) {
    console.log('❌ nodes.json 解析失败:', error.message);
    process.exit(1);
}

// 3. 读取并解析边文件
let edgesData;
try {
    const content = fs.readFileSync(edgesPath, 'utf8');
    edgesData = JSON.parse(content);
    console.log('✅ edges.json 格式正确');
} catch (error) {
    console.log('❌ edges.json 解析失败:', error.message);
    process.exit(1);
}

console.log('\n' + '='.repeat(60));
console.log('📊 数据统计\n');

// 4. 检查节点数组
if (!nodesData.nodes || !Array.isArray(nodesData.nodes)) {
    console.log('❌ nodes 数组不存在或格式错误');
    process.exit(1);
}
console.log(`总节点数: ${nodesData.nodes.length}`);

// 5. 检查边数组
if (!edgesData.edges || !Array.isArray(edgesData.edges)) {
    console.log('❌ edges 数组不存在或格式错误');
    process.exit(1);
}
console.log(`总边数: ${edgesData.edges.length}`);

// 6. 检查空间几何节点
const spatialNodes = nodesData.nodes.filter(n => n.chapter === 'chapter-12');
console.log(`\nchapter-12 节点: ${spatialNodes.length} 个`);

if (spatialNodes.length < 19) {
    console.log('⚠️  空间几何节点数量不足！');
    console.log(`   预期: 至少19个新增节点`);
    console.log(`   实际: ${spatialNodes.length} 个`);
} else {
    console.log('✅ 空间几何节点数量正常');
}

// 7. 检查空间几何边
const spatialEdges = edgesData.edges.filter(e => 
    (e.source && e.source.includes('spatial')) || 
    (e.target && e.target.includes('spatial')) ||
    (e.source && e.source.includes('vector')) ||
    (e.target && e.target.includes('vector'))
);
console.log(`空间几何相关边: ${spatialEdges.length} 条`);

console.log('\n' + '='.repeat(60));
console.log('📝 空间几何节点列表\n');

// 8. 列出所有空间几何节点
spatialNodes.forEach((n, i) => {
    const domain = n.domains && n.domains.length > 0 ? n.domains[0] : '未分类';
    console.log(`${String(i + 1).padStart(2, ' ')}. ${n.id}`);
    console.log(`    名称: ${n.name}`);
    console.log(`    学域: ${domain}`);
    console.log(`    难度: ${n.difficulty || '未设置'}`);
    console.log('');
});

console.log('='.repeat(60));
console.log('🔑 关键节点检查\n');

// 9. 检查关键节点
const keyNodes = [
    { id: 'node-spatial-coordinate-system', name: '空间直角坐标系' },
    { id: 'node-spatial-vector', name: '空间向量' },
    { id: 'node-vector-dot-product', name: '向量数量积' },
    { id: 'node-vector-cross-product', name: '向量向量积' },
    { id: 'node-plane-equation', name: '平面方程' },
    { id: 'node-line-equation', name: '空间直线方程' },
    { id: 'node-sphere', name: '球面' },
    { id: 'node-quadric-surfaces', name: '二次曲面' },
    { id: 'node-3d-path-planning', name: '三维路径规划' },
    { id: 'node-satellite-orbit', name: '卫星轨道' }
];

keyNodes.forEach(({ id, name }) => {
    const node = nodesData.nodes.find(n => n.id === id);
    if (node) {
        console.log(`✅ ${name} (${id})`);
    } else {
        console.log(`❌ ${name} (${id}) - 未找到！`);
    }
});

console.log('\n' + '='.repeat(60));
console.log('🔗 边连接检查\n');

// 10. 检查关键边
const keyEdges = [
    { source: 'node-spatial-coordinate-system', target: 'node-spatial-vector' },
    { source: 'node-spatial-vector', target: 'node-vector-dot-product' },
    { source: 'node-plane-equation', target: 'node-3d-path-planning' }
];

keyEdges.forEach(({ source, target }) => {
    const edge = edgesData.edges.find(e => e.source === source && e.target === target);
    if (edge) {
        console.log(`✅ ${source} -> ${target}`);
        console.log(`   类型: ${edge.type}, 强度: ${edge.strength}`);
    } else {
        console.log(`❌ ${source} -> ${target} - 未找到！`);
    }
});

console.log('\n' + '='.repeat(60));
console.log('📅 文件信息\n');

// 11. 文件修改时间
const nodesStats = fs.statSync(nodesPath);
const edgesStats = fs.statSync(edgesPath);

console.log('nodes.json:');
console.log(`  最后修改: ${nodesStats.mtime.toLocaleString('zh-CN')}`);
console.log(`  文件大小: ${(nodesStats.size / 1024).toFixed(2)} KB`);

console.log('\nedges.json:');
console.log(`  最后修改: ${edgesStats.mtime.toLocaleString('zh-CN')}`);
console.log(`  文件大小: ${(edgesStats.size / 1024).toFixed(2)} KB`);

console.log('\n' + '='.repeat(60));
console.log('📊 学域分布统计\n');

// 12. 统计学域分布
const domainStats = {};
spatialNodes.forEach(n => {
    if (n.domains && n.domains.length > 0) {
        n.domains.forEach(d => {
            domainStats[d] = (domainStats[d] || 0) + 1;
        });
    } else {
        domainStats['未分类'] = (domainStats['未分类'] || 0) + 1;
    }
});

Object.entries(domainStats).forEach(([domain, count]) => {
    console.log(`  ${domain}: ${count} 个节点`);
});

console.log('\n' + '='.repeat(60));
console.log('📊 边类型统计\n');

// 13. 统计边类型
const edgeTypeStats = {};
spatialEdges.forEach(e => {
    edgeTypeStats[e.type] = (edgeTypeStats[e.type] || 0) + 1;
});

Object.entries(edgeTypeStats).forEach(([type, count]) => {
    console.log(`  ${type}: ${count} 条`);
});

console.log('\n' + '='.repeat(60));
console.log('✨ 诊断完成！\n');

// 14. 给出建议
console.log('💡 如果在浏览器中看不到节点，请尝试:\n');
console.log('1. 清除浏览器缓存');
console.log('   - Windows/Linux: Ctrl + F5');
console.log('   - Mac: Cmd + Shift + R');
console.log('');
console.log('2. 在浏览器控制台检查数据加载');
console.log('   - 按 F12 打开开发者工具');
console.log('   - 运行: console.log(window.graphData.nodes.length)');
console.log('');
console.log('3. 使用搜索功能');
console.log('   - 搜索"空间"、"向量"、"平面"等关键词');
console.log('');
console.log('4. 使用章节筛选');
console.log('   - 选择"第12章 空间解析几何"');
console.log('');
console.log('5. 重新启动开发服务器');
console.log('   - 停止当前服务器 (Ctrl+C)');
console.log('   - 重新运行: python -m http.server 8000');
console.log('');
console.log('='.repeat(60));
