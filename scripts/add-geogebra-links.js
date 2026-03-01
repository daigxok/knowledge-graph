const fs = require('fs');
const path = require('path');

console.log('🔗 为节点添加GeoGebra链接\n');
console.log('='.repeat(60));

// GeoGebra材料ID映射（示例数据，实际使用时需要替换为真实的材料ID）
const geogebraMapping = {
    // Chapter 1-3: 变化与逼近
    'node-function-basic': {
        materialId: 'example123',  // 需要替换为实际ID
        type: '2d',
        description: '函数的图像和性质：定义域、值域、单调性、奇偶性动态演示'
    },
    'node-limit-def': {
        materialId: 'example456',
        type: '2d',
        description: '极限的ε-δ定义可视化：动态调整ε和δ观察极限过程'
    },
    'node-derivative-def': {
        materialId: 'example789',
        type: '2d',
        description: '导数的几何意义：切线斜率的动态演示，观察Δx→0的过程'
    },
    'node-integral-def': {
        materialId: 'exampleabc',
        type: '2d',
        description: '定积分的定义：黎曼和可视化，观察分割越来越细的过程'
    },
    
    // Chapter 12: 空间解析几何
    'node-spatial-coordinate-system': {
        materialId: 'spatial001',
        type: '3d',
        description: '空间直角坐标系：三维坐标系的建立，点的坐标表示'
    },
    'node-spatial-vector': {
        materialId: 'spatial002',
        type: '3d',
        description: '空间向量：向量的表示、加减运算、数乘运算的三维可视化'
    },
    'node-vector-dot-product': {
        materialId: 'spatial003',
        type: '3d',
        description: '向量数量积：投影、夹角的几何意义，动态调整向量观察变化'
    },
    'node-vector-cross-product': {
        materialId: 'spatial004',
        type: '3d',
        description: '向量向量积：叉积的几何意义，右手法则，面积计算'
    },
    'node-vector-mixed-product': {
        materialId: 'spatial005',
        type: '3d',
        description: '向量混合积：体积计算，共面判断的几何意义'
    },
    'node-plane-equation': {
        materialId: 'spatial006',
        type: '3d',
        description: '平面方程：平面的各种表示形式，平面间的位置关系'
    },
    'node-line-equation': {
        materialId: 'spatial007',
        type: '3d',
        description: '空间直线方程：直线的参数方程和对称式方程，直线间的位置关系'
    },
    'node-point-to-plane-distance': {
        materialId: 'spatial008',
        type: '3d',
        description: '点到平面距离：距离公式的几何意义，最短距离的可视化'
    },
    'node-point-to-line-distance': {
        materialId: 'spatial009',
        type: '3d',
        description: '点到直线距离：距离公式，垂足的位置'
    },
    'node-sphere': {
        materialId: 'spatial010',
        type: '3d',
        description: '球面：球面方程，球面与平面、直线的交线'
    },
    'node-cylindrical-surface': {
        materialId: 'spatial011',
        type: '3d',
        description: '柱面：柱面的生成，各种柱面的形状'
    },
    'node-quadric-surfaces': {
        materialId: 'spatial012',
        type: '3d',
        description: '二次曲面：椭球面、双曲面、抛物面等各种二次曲面'
    },
    'node-space-curve': {
        materialId: 'spatial013',
        type: '3d',
        description: '空间曲线：参数方程表示的空间曲线，切线和法平面'
    },
    'node-helix': {
        materialId: 'spatial014',
        type: '3d',
        description: '螺旋线：圆柱螺旋线的参数方程，螺距的调节'
    },
    
    // 其他重要节点
    'node-taylor-series': {
        materialId: 'series001',
        type: '2d',
        description: '泰勒级数：函数的泰勒展开，逼近效果的可视化'
    },
    'node-fourier-series': {
        materialId: 'series002',
        type: '2d',
        description: '傅里叶级数：周期函数的傅里叶展开，谐波叠加'
    },
    'node-gradient': {
        materialId: 'multi001',
        type: '3d',
        description: '梯度：梯度向量场，方向导数，等高线'
    },
    'node-curvature': {
        materialId: 'curve001',
        type: '2d',
        description: '曲率：曲线的弯曲程度，曲率圆'
    }
};

// 读取nodes.json
const nodesPath = path.join(__dirname, '../data/nodes.json');
let nodesData;

try {
    const content = fs.readFileSync(nodesPath, 'utf8');
    nodesData = JSON.parse(content);
    console.log('✅ 读取 nodes.json 成功');
    console.log(`   总节点数: ${nodesData.nodes.length}\n`);
} catch (error) {
    console.log('❌ 读取失败:', error.message);
    process.exit(1);
}

// 统计
let addedCount = 0;
let skippedCount = 0;
let updatedCount = 0;

// 添加GeoGebra信息
nodesData.nodes.forEach(node => {
    if (geogebraMapping[node.id]) {
        const ggbInfo = geogebraMapping[node.id];
        
        // 检查是否已有GeoGebra信息
        if (node.geogebra && node.geogebra.enabled) {
            console.log(`⚠️  ${node.name} 已有GeoGebra信息，跳过`);
            skippedCount++;
            return;
        }
        
        // 添加GeoGebra信息
        node.geogebra = {
            enabled: true,
            materialId: ggbInfo.materialId,
            url: `https://www.geogebra.org/m/${ggbInfo.materialId}`,
            embedUrl: `https://www.geogebra.org/material/iframe/id/${ggbInfo.materialId}`,
            type: ggbInfo.type,
            description: ggbInfo.description
        };
        
        console.log(`✅ ${node.name} - 已添加GeoGebra链接`);
        addedCount++;
    }
});

console.log('\n' + '='.repeat(60));
console.log('📊 统计结果\n');
console.log(`新增: ${addedCount} 个节点`);
console.log(`跳过: ${skippedCount} 个节点`);
console.log(`总计: ${addedCount + skippedCount} 个节点有GeoGebra演示`);

// 保存更新后的数据
try {
    fs.writeFileSync(nodesPath, JSON.stringify(nodesData, null, 2), 'utf8');
    console.log('\n✅ 成功保存到 nodes.json');
} catch (error) {
    console.log('\n❌ 保存失败:', error.message);
    process.exit(1);
}

// 生成报告
console.log('\n' + '='.repeat(60));
console.log('📋 GeoGebra集成报告\n');

const nodesWithGGB = nodesData.nodes.filter(n => n.geogebra && n.geogebra.enabled);

console.log(`有GeoGebra演示的节点: ${nodesWithGGB.length} 个\n`);

// 按章节分组
const byChapter = {};
nodesWithGGB.forEach(node => {
    const chapter = node.chapter || node.traditionalChapter || 'unknown';
    if (!byChapter[chapter]) {
        byChapter[chapter] = [];
    }
    byChapter[chapter].push(node);
});

console.log('按章节分布:');
Object.entries(byChapter).forEach(([chapter, nodes]) => {
    console.log(`  ${chapter}: ${nodes.length} 个节点`);
});

// 按类型分组
const by2D = nodesWithGGB.filter(n => n.geogebra.type === '2d').length;
const by3D = nodesWithGGB.filter(n => n.geogebra.type === '3d').length;

console.log('\n按类型分布:');
console.log(`  2D演示: ${by2D} 个`);
console.log(`  3D演示: ${by3D} 个`);

console.log('\n' + '='.repeat(60));
console.log('💡 下一步\n');
console.log('1. 在GeoGebra.org创建实际的演示文件');
console.log('2. 获取真实的材料ID');
console.log('3. 运行此脚本更新节点数据');
console.log('4. 在index.html中引入GeoGebra样式和脚本');
console.log('5. 测试GeoGebra集成功能');

console.log('\n✨ 完成！');
