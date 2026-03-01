const fs = require('fs');
const path = require('path');

console.log('🔗 合并空间几何边数据到 edges.json\n');

// 1. 读取现有的edges.json
const edgesPath = path.join(__dirname, 'data/edges.json');
let edgesData;
try {
    const content = fs.readFileSync(edgesPath, 'utf8');
    edgesData = JSON.parse(content);
    console.log('✅ 读取 edges.json 成功');
    console.log(`   现有边数: ${edgesData.edges.length}`);
} catch (error) {
    console.log('❌ 读取 edges.json 失败:', error.message);
    process.exit(1);
}

// 2. 读取空间几何边数据
const spatialEdgesPath = path.join(__dirname, 'data/spatial-geometry-edges.json');
let spatialEdges;
try {
    const content = fs.readFileSync(spatialEdgesPath, 'utf8');
    spatialEdges = JSON.parse(content);
    console.log('✅ 读取 spatial-geometry-edges.json 成功');
    console.log(`   空间几何边数: ${spatialEdges.length}`);
} catch (error) {
    console.log('❌ 读取 spatial-geometry-edges.json 失败:', error.message);
    process.exit(1);
}

// 3. 检查是否已经合并过
const existingSpatialEdges = edgesData.edges.filter(e => 
    e.source && e.source.includes('spatial') || 
    e.target && e.target.includes('spatial')
);

if (existingSpatialEdges.length > 0) {
    console.log(`\n⚠️  检测到已存在 ${existingSpatialEdges.length} 条空间几何边`);
    console.log('   是否需要重新合并？（这将删除现有的空间几何边）');
    // 移除现有的空间几何边
    edgesData.edges = edgesData.edges.filter(e => 
        !(e.source && e.source.includes('spatial')) && 
        !(e.target && e.target.includes('spatial'))
    );
    console.log(`   已移除现有空间几何边，剩余: ${edgesData.edges.length} 条`);
}

// 4. 为新边生成ID
const maxId = Math.max(
    ...edgesData.edges
        .map(e => e.id)
        .filter(id => id && id.startsWith('edge-'))
        .map(id => parseInt(id.replace('edge-', '')))
        .filter(n => !isNaN(n)),
    0
);

console.log(`\n📊 当前最大边ID: edge-${maxId}`);

// 5. 转换空间几何边格式并添加ID
const newEdges = spatialEdges.map((edge, index) => {
    const newId = maxId + index + 1;
    return {
        id: `edge-${newId}`,
        source: edge.source,
        target: edge.target,
        type: edge.type,
        strength: edge.type === 'prerequisite' ? 0.9 : 
                  edge.type === 'application' ? 0.8 : 0.6,
        description: edge.description || getDefaultDescription(edge)
    };
});

function getDefaultDescription(edge) {
    const sourceNode = edge.source.replace('node-', '').replace(/-/g, ' ');
    const targetNode = edge.target.replace('node-', '').replace(/-/g, ' ');
    
    if (edge.type === 'prerequisite') {
        return `${sourceNode}是${targetNode}的前置知识`;
    } else if (edge.type === 'application') {
        return `${sourceNode}应用于${targetNode}`;
    } else {
        return `${sourceNode}与${targetNode}相关`;
    }
}

// 6. 合并边数据
edgesData.edges.push(...newEdges);

console.log(`\n✅ 准备添加 ${newEdges.length} 条新边`);
console.log(`   合并后总边数: ${edgesData.edges.length}`);

// 7. 保存合并后的数据
try {
    fs.writeFileSync(edgesPath, JSON.stringify(edgesData, null, 2), 'utf8');
    console.log('\n✅ 成功保存到 edges.json');
} catch (error) {
    console.log('\n❌ 保存失败:', error.message);
    process.exit(1);
}

// 8. 验证结果
console.log('\n📋 新增边详情:');
newEdges.slice(0, 5).forEach(e => {
    console.log(`   ${e.id}: ${e.source} -> ${e.target} (${e.type})`);
});
if (newEdges.length > 5) {
    console.log(`   ... 还有 ${newEdges.length - 5} 条边`);
}

// 9. 统计边类型
const edgeTypes = {};
newEdges.forEach(e => {
    edgeTypes[e.type] = (edgeTypes[e.type] || 0) + 1;
});

console.log('\n📊 新增边类型统计:');
Object.entries(edgeTypes).forEach(([type, count]) => {
    console.log(`   ${type}: ${count} 条`);
});

console.log('\n✨ 合并完成！');
console.log('\n💡 下一步:');
console.log('   1. 清除浏览器缓存（Ctrl+F5）');
console.log('   2. 重新加载知识图谱页面');
console.log('   3. 搜索"空间"或"向量"查看新节点');
