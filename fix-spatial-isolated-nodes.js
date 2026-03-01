const fs = require('fs');
const path = require('path');

console.log('🔧 修复空间解析几何弱连接节点\n');
console.log('='.repeat(60));

// 1. 读取现有数据
const edgesPath = path.join(__dirname, 'data/edges.json');
let edgesData;
try {
    edgesData = JSON.parse(fs.readFileSync(edgesPath, 'utf8'));
    console.log('✅ 读取 edges.json 成功');
    console.log(`   现有边数: ${edgesData.edges.length}\n`);
} catch (error) {
    console.log('❌ 读取失败:', error.message);
    process.exit(1);
}

// 2. 获取当前最大边ID
const maxId = Math.max(
    ...edgesData.edges
        .map(e => e.id)
        .filter(id => id && id.startsWith('edge-'))
        .map(id => parseInt(id.replace('edge-', '')))
        .filter(n => !isNaN(n)),
    0
);

console.log(`📊 当前最大边ID: edge-${maxId}\n`);

// 3. 定义需要添加的新边
const newEdges = [
    // 为弱连接节点添加与其他章节的前置关系
    {
        source: 'node-function-basic',
        target: 'node-spatial-coordinate-system',
        type: 'prerequisite',
        strength: 0.7,
        description: '函数概念是理解空间坐标系的基础'
    },
    {
        source: 'node-limit-def',
        target: 'node-space-curve',
        type: 'prerequisite',
        strength: 0.8,
        description: '极限概念用于空间曲线的切线'
    },
    
    // 为曲面节点添加应用边
    {
        source: 'node-sphere',
        target: 'node-3d-path-planning',
        type: 'application',
        strength: 0.7,
        description: '球面用于三维路径规划中的障碍物建模'
    },
    {
        source: 'node-cylindrical-surface',
        target: 'node-3d-path-planning',
        type: 'application',
        strength: 0.6,
        description: '柱面用于管道和柱状障碍物建模'
    },
    {
        source: 'node-sphere',
        target: 'node-gps-error-analysis',
        type: 'application',
        strength: 0.8,
        description: '球面用于GPS误差范围的几何表示'
    },
    
    // 为距离计算节点添加应用边
    {
        source: 'node-point-to-line-distance',
        target: 'node-3d-path-planning',
        type: 'application',
        strength: 0.8,
        description: '点到直线距离用于路径偏离计算'
    },
    {
        source: 'node-point-to-line-distance',
        target: 'node-robot-vision-localization',
        type: 'application',
        strength: 0.7,
        description: '点到直线距离用于机器人视觉定位'
    },
    {
        source: 'node-skew-lines-distance',
        target: 'node-3d-path-planning',
        type: 'application',
        strength: 0.7,
        description: '异面直线距离用于航线规划'
    },
    
    // 为螺旋线添加应用边
    {
        source: 'node-helix',
        target: 'node-3d-path-planning',
        type: 'application',
        strength: 0.6,
        description: '螺旋线用于螺旋上升路径规划'
    },
    {
        source: 'node-helix',
        target: 'node-satellite-orbit',
        type: 'related',
        strength: 0.5,
        description: '螺旋线与卫星螺旋轨道相关'
    },
    
    // 为应用节点添加与其他章节的关联
    {
        source: 'node-satellite-orbit',
        target: 'node-ode-second-order',
        type: 'related',
        strength: 0.7,
        description: '卫星轨道运动由二阶微分方程描述'
    },
    {
        source: 'node-gps-error-analysis',
        target: 'node-probability-basic',
        type: 'related',
        strength: 0.8,
        description: 'GPS误差分析需要概率统计方法'
    },
    {
        source: 'node-robot-vision-localization',
        target: 'node-optimization-algorithms',
        type: 'related',
        strength: 0.8,
        description: '机器人视觉定位使用优化算法'
    },
    
    // 增强内部连接
    {
        source: 'node-sphere',
        target: 'node-quadric-surfaces',
        type: 'prerequisite',
        strength: 0.9,
        description: '球面是最简单的二次曲面'
    },
    {
        source: 'node-cylindrical-surface',
        target: 'node-quadric-surfaces',
        type: 'related',
        strength: 0.7,
        description: '柱面与二次曲面相关'
    },
    {
        source: 'node-point-to-line-distance',
        target: 'node-skew-lines-distance',
        type: 'prerequisite',
        strength: 0.8,
        description: '点到直线距离是计算异面直线距离的基础'
    },
    
    // 添加与多元微积分的联系
    {
        source: 'node-partial-derivative',
        target: 'node-plane-equation',
        type: 'related',
        strength: 0.7,
        description: '偏导数用于求平面的法向量'
    },
    {
        source: 'node-partial-derivative',
        target: 'node-quadric-surfaces',
        type: 'related',
        strength: 0.8,
        description: '偏导数用于分析二次曲面的性质'
    },
    
    // 添加与积分的联系
    {
        source: 'node-double-integral',
        target: 'node-sphere',
        type: 'related',
        strength: 0.7,
        description: '二重积分用于计算球面的面积'
    },
    {
        source: 'node-double-integral',
        target: 'node-cylindrical-surface',
        type: 'related',
        strength: 0.7,
        description: '二重积分用于计算柱面的面积'
    }
];

console.log('='.repeat(60));
console.log('📝 准备添加的新边\n');

// 4. 为新边生成ID并添加到数据中
const edgesToAdd = newEdges.map((edge, index) => {
    const newId = maxId + index + 1;
    return {
        id: `edge-${newId}`,
        ...edge
    };
});

console.log(`新增边数: ${edgesToAdd.length} 条\n`);

// 5. 按类型分类显示
const edgesByType = {};
edgesToAdd.forEach(e => {
    if (!edgesByType[e.type]) {
        edgesByType[e.type] = [];
    }
    edgesByType[e.type].push(e);
});

Object.entries(edgesByType).forEach(([type, edges]) => {
    console.log(`${type}: ${edges.length} 条`);
    edges.forEach(e => {
        console.log(`  ${e.id}: ${e.source} → ${e.target}`);
    });
    console.log('');
});

// 6. 检查是否有重复的边
console.log('='.repeat(60));
console.log('🔍 检查重复边\n');

let duplicateCount = 0;
const edgesToAddFiltered = [];

edgesToAdd.forEach(newEdge => {
    const isDuplicate = edgesData.edges.some(existingEdge => 
        existingEdge.source === newEdge.source && 
        existingEdge.target === newEdge.target
    );
    
    if (isDuplicate) {
        console.log(`⚠️  跳过重复边: ${newEdge.source} → ${newEdge.target}`);
        duplicateCount++;
    } else {
        edgesToAddFiltered.push(newEdge);
    }
});

if (duplicateCount === 0) {
    console.log('✅ 没有重复边');
} else {
    console.log(`\n⚠️  发现 ${duplicateCount} 条重复边，已跳过`);
}

console.log(`\n实际添加: ${edgesToAddFiltered.length} 条新边`);

// 7. 合并边数据
edgesData.edges.push(...edgesToAddFiltered);

console.log('\n' + '='.repeat(60));
console.log('📊 更新后统计\n');
console.log(`原有边数: ${edgesData.edges.length - edgesToAddFiltered.length}`);
console.log(`新增边数: ${edgesToAddFiltered.length}`);
console.log(`总边数: ${edgesData.edges.length}`);

// 8. 保存更新后的数据
try {
    fs.writeFileSync(edgesPath, JSON.stringify(edgesData, null, 2), 'utf8');
    console.log('\n✅ 成功保存到 edges.json');
} catch (error) {
    console.log('\n❌ 保存失败:', error.message);
    process.exit(1);
}

// 9. 生成修复报告
console.log('\n' + '='.repeat(60));
console.log('📋 修复报告\n');

console.log('✅ 已修复的弱连接节点:');
const fixedNodes = [
    'node-sphere',
    'node-cylindrical-surface',
    'node-point-to-line-distance',
    'node-skew-lines-distance',
    'node-helix',
    'node-satellite-orbit',
    'node-gps-error-analysis',
    'node-robot-vision-localization',
    'node-quadric-surfaces'
];

fixedNodes.forEach(nodeId => {
    const relatedEdges = edgesToAddFiltered.filter(e => 
        e.source === nodeId || e.target === nodeId
    );
    if (relatedEdges.length > 0) {
        console.log(`\n  ${nodeId}:`);
        console.log(`    新增 ${relatedEdges.length} 条边`);
        relatedEdges.forEach(e => {
            const direction = e.source === nodeId ? '→' : '←';
            const otherNode = e.source === nodeId ? e.target : e.source;
            console.log(`      ${direction} ${otherNode} (${e.type})`);
        });
    }
});

console.log('\n' + '='.repeat(60));
console.log('✨ 修复完成！\n');

console.log('💡 下一步:');
console.log('   1. 运行 node find-isolated-spatial-nodes.js 验证修复结果');
console.log('   2. 运行 node count-nodes.js 查看统计');
console.log('   3. 清除浏览器缓存（Ctrl+F5）');
console.log('   4. 重新加载知识图谱页面');
