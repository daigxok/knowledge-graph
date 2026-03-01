/**
 * 生成空间解析几何知识节点
 * 基于空间解析几何知识节点清单.md
 */

const fs = require('fs');
const path = require('path');

// 空间解析几何节点数据
const spatialGeometryNodes = [
  // 模块1：空间向量代数
  {
    id: "node-spatial-coordinate-system",
    name: "空间直角坐标系",
    nameEn: "Spatial Coordinate System",
    chapter: "chapter-12",
    description: "三维空间中的坐标系建立，包括坐标轴、坐标平面和卦限",
    domains: ["domain-3"],
    traditionalChapter: "chapter-12",
    difficulty: 1,
    prerequisites: [],
    relatedSkills: ["空间几何可视化Skill", "概念可视化Skill"],
    keywords: ["坐标系", "三维空间", "坐标轴", "坐标平面"],
    importance: 5,
    estimatedStudyTime: 30,
    realWorldApplications: [
      { title: "三维建模", description: "计算机图形学中的三维坐标系统", industry: "计算机图形学" },
      { title: "GPS定位", description: "地理坐标系统的三维表示", industry: "导航定位" }
    ]
  },
  {
    id: "node-spatial-vector",
    name: "空间向量",
    nameEn: "Spatial Vector",
    chapter: "chapter-12",
    description: "空间中的有向线段，包括模、方向和单位向量",
    domains: ["domain-3", "domain-4"],
    traditionalChapter: "chapter-12",
    difficulty: 1,
    prerequisites: ["node-spatial-coordinate-system"],
    relatedSkills: ["空间几何可视化Skill", "概念可视化Skill"],
    keywords: ["向量", "模", "方向", "单位向量"],
    importance: 5,
    estimatedStudyTime: 45,
    realWorldApplications: [
      { title: "力的表示", description: "物理学中用向量表示力、速度、加速度", industry: "物理学" },
      { title: "机器人运动", description: "机器人的位移和速度向量", industry: "机器人" }
    ]
  },
  {
    id: "node-vector-dot-product",
    name: "向量数量积",
    nameEn: "Vector Dot Product",
    chapter: "chapter-12",
    description: "两向量的数量积运算，用于计算夹角和判断垂直",
    domains: ["domain-3"],
    traditionalChapter: "chapter-12",
    difficulty: 2,
    prerequisites: ["node-spatial-vector"],
    relatedSkills: ["空间几何可视化Skill"],
    keywords: ["数量积", "点积", "夹角", "垂直"],
    importance: 5,
    estimatedStudyTime: 45,
    realWorldApplications: [
      { title: "功的计算", description: "物理学中力与位移的数量积", industry: "物理学" },
      { title: "投影计算", description: "计算机图形学中的光照投影", industry: "计算机图形学" }
    ]
  },
  {
    id: "node-vector-cross-product",
    name: "向量向量积",
    nameEn: "Vector Cross Product",
    chapter: "chapter-12",
    description: "两向量的向量积运算，用于求法向量和计算面积",
    domains: ["domain-3"],
    traditionalChapter: "chapter-12",
    difficulty: 2,
    prerequisites: ["node-spatial-vector"],
    relatedSkills: ["空间几何可视化Skill"],
    keywords: ["向量积", "叉积", "法向量", "面积"],
    importance: 5,
    estimatedStudyTime: 45,
    realWorldApplications: [
      { title: "力矩计算", description: "物理学中力矩的向量表示", industry: "物理学" },
      { title: "法向量计算", description: "计算机图形学中表面法向量", industry: "计算机图形学" }
    ]
  },
  {
    id: "node-vector-mixed-product",
    name: "向量混合积",
    nameEn: "Vector Mixed Product",
    chapter: "chapter-12",
    description: "三个向量的混合积，用于判断共面和计算体积",
    domains: ["domain-3"],
    traditionalChapter: "chapter-12",
    difficulty: 3,
    prerequisites: ["node-vector-dot-product", "node-vector-cross-product"],
    relatedSkills: ["空间几何可视化Skill"],
    keywords: ["混合积", "共面", "体积"],
    importance: 4,
    estimatedStudyTime: 45,
    realWorldApplications: [
      { title: "体积计算", description: "平行六面体体积的计算", industry: "几何学" },
      { title: "共面判断", description: "判断三个向量是否共面", industry: "数学" }
    ]
  },
  
  // 模块2：空间平面与直线
  {
    id: "node-plane-equation",
    name: "平面方程",
    nameEn: "Plane Equation",
    chapter: "chapter-12",
    description: "空间平面的数学表示，包括点法式和一般式",
    domains: ["domain-3"],
    traditionalChapter: "chapter-12",
    difficulty: 2,
    prerequisites: ["node-spatial-vector", "node-vector-dot-product"],
    relatedSkills: ["空间几何可视化Skill"],
    keywords: ["平面", "点法式", "一般式", "法向量"],
    importance: 5,
    estimatedStudyTime: 60,
    realWorldApplications: [
      { title: "建筑设计", description: "建筑平面的数学表示", industry: "建筑工程" },
      { title: "裁剪算法", description: "计算机图形学中的平面裁剪", industry: "计算机图形学" }
    ]
  },
  {
    id: "node-line-equation",
    name: "空间直线方程",
    nameEn: "Line Equation in Space",
    chapter: "chapter-12",
    description: "空间直线的数学表示，包括参数式和对称式",
    domains: ["domain-3"],
    traditionalChapter: "chapter-12",
    difficulty: 2,
    prerequisites: ["node-spatial-vector"],
    relatedSkills: ["空间几何可视化Skill"],
    keywords: ["直线", "参数方程", "对称式", "方向向量"],
    importance: 5,
    estimatedStudyTime: 60,
    realWorldApplications: [
      { title: "光线追踪", description: "计算机图形学中的光线表示", industry: "计算机图形学" },
      { title: "轨迹规划", description: "机器人的直线运动轨迹", industry: "机器人" }
    ]
  },
  {
    id: "node-point-to-plane-distance",
    name: "点到平面距离",
    nameEn: "Point to Plane Distance",
    chapter: "chapter-12",
    description: "空间中点到平面的距离公式及其应用",
    domains: ["domain-3", "domain-4"],
    traditionalChapter: "chapter-12",
    difficulty: 2,
    prerequisites: ["node-plane-equation"],
    relatedSkills: ["空间几何可视化Skill"],
    keywords: ["距离", "点到平面", "公式"],
    importance: 4,
    estimatedStudyTime: 45,
    realWorldApplications: [
      { title: "碰撞检测", description: "游戏引擎中的碰撞检测算法", industry: "游戏开发" },
      { title: "定位误差", description: "GPS定位中的误差分析", industry: "导航定位" }
    ]
  },
  {
    id: "node-point-to-line-distance",
    name: "点到直线距离",
    nameEn: "Point to Line Distance",
    chapter: "chapter-12",
    description: "空间中点到直线的距离公式及其应用",
    domains: ["domain-3"],
    traditionalChapter: "chapter-12",
    difficulty: 2,
    prerequisites: ["node-line-equation", "node-vector-cross-product"],
    relatedSkills: ["空间几何可视化Skill"],
    keywords: ["距离", "点到直线", "公式"],
    importance: 4,
    estimatedStudyTime: 45,
    realWorldApplications: [
      { title: "路径偏离", description: "无人机偏离预定路径的距离", industry: "无人机" },
      { title: "最近点查找", description: "计算几何中的最近点问题", industry: "计算几何" }
    ]
  },
  {
    id: "node-skew-lines-distance",
    name: "异面直线距离",
    nameEn: "Skew Lines Distance",
    chapter: "chapter-12",
    description: "两条异面直线之间的距离计算",
    domains: ["domain-3"],
    traditionalChapter: "chapter-12",
    difficulty: 3,
    prerequisites: ["node-line-equation", "node-vector-mixed-product"],
    relatedSkills: ["空间几何可视化Skill"],
    keywords: ["异面直线", "距离", "公垂线"],
    importance: 3,
    estimatedStudyTime: 60,
    realWorldApplications: [
      { title: "管道设计", description: "两条不相交管道之间的最短距离", industry: "工程设计" },
      { title: "航线规划", description: "两条航线之间的最小间隔", industry: "航空" }
    ]
  },
  
  // 模块3：空间曲面与曲线
  {
    id: "node-sphere",
    name: "球面",
    nameEn: "Sphere",
    chapter: "chapter-12",
    description: "到定点距离为定值的点的轨迹，球面方程及其性质",
    domains: ["domain-3"],
    traditionalChapter: "chapter-12",
    difficulty: 1,
    prerequisites: ["node-spatial-coordinate-system"],
    relatedSkills: ["空间几何可视化Skill"],
    keywords: ["球面", "球心", "半径"],
    importance: 4,
    estimatedStudyTime: 30,
    realWorldApplications: [
      { title: "地球模型", description: "地球的球面近似模型", industry: "地理学" },
      { title: "碰撞检测", description: "游戏中的球形碰撞体", industry: "游戏开发" }
    ]
  },
  {
    id: "node-cylindrical-surface",
    name: "柱面",
    nameEn: "Cylindrical Surface",
    chapter: "chapter-12",
    description: "平行于某坐标轴的直线沿曲线移动形成的曲面",
    domains: ["domain-3"],
    traditionalChapter: "chapter-12",
    difficulty: 2,
    prerequisites: ["node-spatial-coordinate-system"],
    relatedSkills: ["空间几何可视化Skill"],
    keywords: ["柱面", "母线", "准线"],
    importance: 3,
    estimatedStudyTime: 45,
    realWorldApplications: [
      { title: "管道建模", description: "圆柱形管道的数学模型", industry: "工程设计" },
      { title: "柱体零件", description: "机械零件的柱面设计", industry: "机械工程" }
    ]
  },
  {
    id: "node-quadric-surfaces",
    name: "二次曲面",
    nameEn: "Quadric Surfaces",
    chapter: "chapter-12",
    description: "二次方程表示的空间曲面，包括椭球面、双曲面、抛物面等",
    domains: ["domain-3"],
    traditionalChapter: "chapter-12",
    difficulty: 3,
    prerequisites: ["node-spatial-coordinate-system"],
    relatedSkills: ["空间几何可视化Skill"],
    keywords: ["二次曲面", "椭球面", "双曲面", "抛物面"],
    importance: 4,
    estimatedStudyTime: 90,
    realWorldApplications: [
      { title: "卫星天线", description: "抛物面天线的数学模型", industry: "通信工程" },
      { title: "冷却塔", description: "双曲面冷却塔的结构设计", industry: "建筑工程" }
    ]
  },
  {
    id: "node-space-curve",
    name: "空间曲线",
    nameEn: "Space Curve",
    chapter: "chapter-12",
    description: "空间中的曲线，包括参数方程和一般方程表示",
    domains: ["domain-1", "domain-3"],
    traditionalChapter: "chapter-12",
    difficulty: 2,
    prerequisites: ["node-spatial-coordinate-system"],
    relatedSkills: ["空间几何可视化Skill", "推导动画Skill"],
    keywords: ["空间曲线", "参数方程", "轨迹"],
    importance: 4,
    estimatedStudyTime: 60,
    realWorldApplications: [
      { title: "飞行轨迹", description: "飞机或无人机的三维飞行路径", industry: "航空" },
      { title: "机械臂运动", description: "机械臂末端的运动轨迹", industry: "机器人" }
    ]
  },
  {
    id: "node-helix",
    name: "螺旋线",
    nameEn: "Helix",
    chapter: "chapter-12",
    description: "圆柱螺旋线，螺纹和弹簧的数学模型",
    domains: ["domain-3"],
    traditionalChapter: "chapter-12",
    difficulty: 2,
    prerequisites: ["node-space-curve"],
    relatedSkills: ["空间几何可视化Skill"],
    keywords: ["螺旋线", "螺距", "参数方程"],
    importance: 3,
    estimatedStudyTime: 45,
    realWorldApplications: [
      { title: "螺纹设计", description: "螺栓螺纹的数学模型", industry: "机械工程" },
      { title: "弹簧建模", description: "螺旋弹簧的几何模型", industry: "机械工程" }
    ]
  },
  
  // 应用节点
  {
    id: "node-3d-path-planning",
    name: "三维路径规划",
    nameEn: "3D Path Planning",
    chapter: "chapter-12",
    description: "在三维空间中规划最优路径，应用于无人机、机器人等",
    domains: ["domain-3", "domain-5"],
    traditionalChapter: "chapter-12",
    difficulty: 4,
    prerequisites: ["node-line-equation", "node-plane-equation", "node-point-to-plane-distance"],
    relatedSkills: ["空间几何可视化Skill", "H5P交互Skill"],
    keywords: ["路径规划", "避障", "优化"],
    importance: 5,
    estimatedStudyTime: 90,
    realWorldApplications: [
      { title: "无人机路径规划", description: "无人机在三维空间中的最优飞行路径", industry: "无人机" },
      { title: "机器人导航", description: "移动机器人的三维空间导航", industry: "机器人" }
    ]
  },
  {
    id: "node-satellite-orbit",
    name: "卫星轨道",
    nameEn: "Satellite Orbit",
    chapter: "chapter-12",
    description: "卫星在三维空间中的运行轨道，涉及空间曲线和优化",
    domains: ["domain-3", "domain-5"],
    traditionalChapter: "chapter-12",
    difficulty: 4,
    prerequisites: ["node-space-curve", "node-quadric-surfaces"],
    relatedSkills: ["空间几何可视化Skill", "推导动画Skill"],
    keywords: ["轨道", "卫星", "优化"],
    importance: 4,
    estimatedStudyTime: 90,
    realWorldApplications: [
      { title: "卫星轨道优化", description: "优化卫星轨道以最大化覆盖范围", industry: "航天航空" },
      { title: "轨道预测", description: "预测卫星的未来位置", industry: "航天航空" }
    ]
  },
  {
    id: "node-gps-error-analysis",
    name: "GPS定位误差分析",
    nameEn: "GPS Error Analysis",
    chapter: "chapter-12",
    description: "分析GPS定位系统在三维空间中的误差传播",
    domains: ["domain-4", "domain-5"],
    traditionalChapter: "chapter-12",
    difficulty: 4,
    prerequisites: ["node-spatial-vector", "node-point-to-plane-distance"],
    relatedSkills: ["空间几何Skill", "数值分析Skill"],
    keywords: ["GPS", "误差分析", "定位"],
    importance: 4,
    estimatedStudyTime: 90,
    realWorldApplications: [
      { title: "GPS精度评估", description: "评估GPS定位系统的精度", industry: "导航定位" },
      { title: "误差校正", description: "校正GPS定位误差", industry: "导航定位" }
    ]
  },
  {
    id: "node-robot-vision-localization",
    name: "机器人视觉定位",
    nameEn: "Robot Vision Localization",
    chapter: "chapter-12",
    description: "使用空间几何和数值方法处理三维视觉定位",
    domains: ["domain-4", "domain-5"],
    traditionalChapter: "chapter-12",
    difficulty: 4,
    prerequisites: ["node-spatial-coordinate-system", "node-spatial-vector"],
    relatedSkills: ["空间几何Skill", "H5P交互Skill"],
    keywords: ["视觉定位", "机器人", "不确定性"],
    importance: 4,
    estimatedStudyTime: 90,
    realWorldApplications: [
      { title: "机器人定位", description: "使用视觉系统定位机器人位置", industry: "机器人" },
      { title: "三维重建", description: "从多视角图像重建三维场景", industry: "计算机视觉" }
    ]
  }
];

// 生成边（知识关联）
const spatialGeometryEdges = [
  // 基础前置关系
  { source: "node-spatial-coordinate-system", target: "node-spatial-vector", type: "prerequisite" },
  { source: "node-spatial-vector", target: "node-vector-dot-product", type: "prerequisite" },
  { source: "node-spatial-vector", target: "node-vector-cross-product", type: "prerequisite" },
  { source: "node-vector-dot-product", target: "node-vector-mixed-product", type: "prerequisite" },
  { source: "node-vector-cross-product", target: "node-vector-mixed-product", type: "prerequisite" },
  
  // 平面和直线
  { source: "node-spatial-vector", target: "node-plane-equation", type: "prerequisite" },
  { source: "node-vector-dot-product", target: "node-plane-equation", type: "prerequisite" },
  { source: "node-spatial-vector", target: "node-line-equation", type: "prerequisite" },
  { source: "node-plane-equation", target: "node-point-to-plane-distance", type: "prerequisite" },
  { source: "node-line-equation", target: "node-point-to-line-distance", type: "prerequisite" },
  { source: "node-vector-cross-product", target: "node-point-to-line-distance", type: "prerequisite" },
  { source: "node-line-equation", target: "node-skew-lines-distance", type: "prerequisite" },
  { source: "node-vector-mixed-product", target: "node-skew-lines-distance", type: "prerequisite" },
  
  // 曲面和曲线
  { source: "node-spatial-coordinate-system", target: "node-sphere", type: "prerequisite" },
  { source: "node-spatial-coordinate-system", target: "node-cylindrical-surface", type: "prerequisite" },
  { source: "node-spatial-coordinate-system", target: "node-quadric-surfaces", type: "prerequisite" },
  { source: "node-spatial-coordinate-system", target: "node-space-curve", type: "prerequisite" },
  { source: "node-space-curve", target: "node-helix", type: "prerequisite" },
  
  // 应用关系
  { source: "node-line-equation", target: "node-3d-path-planning", type: "application" },
  { source: "node-plane-equation", target: "node-3d-path-planning", type: "application" },
  { source: "node-point-to-plane-distance", target: "node-3d-path-planning", type: "application" },
  { source: "node-space-curve", target: "node-satellite-orbit", type: "application" },
  { source: "node-quadric-surfaces", target: "node-satellite-orbit", type: "application" },
  { source: "node-spatial-vector", target: "node-gps-error-analysis", type: "application" },
  { source: "node-point-to-plane-distance", target: "node-gps-error-analysis", type: "application" },
  { source: "node-spatial-coordinate-system", target: "node-robot-vision-localization", type: "application" },
  { source: "node-spatial-vector", target: "node-robot-vision-localization", type: "application" },
  
  // 跨学域关系
  { source: "node-space-curve", target: "node-derivative", type: "related", description: "空间曲线的切线需要导数" },
  { source: "node-vector-dot-product", target: "node-gradient", type: "related", description: "梯度是向量数量积的推广" },
  { source: "node-plane-equation", target: "node-lagrange-multiplier", type: "related", description: "平面可作为约束条件" }
];

// 主函数
function generateSpatialGeometryNodes() {
  console.log('🚀 开始生成空间解析几何节点...\n');
  
  // 读取现有节点数据
  const nodesPath = path.join(__dirname, '../data/nodes.json');
  let fileData;
  let existingNodes;
  
  try {
    const fileContent = fs.readFileSync(nodesPath, 'utf8');
    fileData = JSON.parse(fileContent);
    existingNodes = fileData.nodes || [];
  } catch (error) {
    console.error('❌ 读取nodes.json失败:', error.message);
    return;
  }
  
  // 检查数据结构
  if (!Array.isArray(existingNodes)) {
    console.error('❌ nodes.json格式错误：nodes应该是数组');
    return;
  }
  
  // 检查是否已存在空间几何节点
  const existingSpatialNodes = existingNodes.filter(node => 
    node.id && node.id.startsWith('node-spatial') || 
    node.id && (node.id.includes('vector') || node.id.includes('plane') || node.id.includes('line'))
  );
  
  console.log(`📊 现有空间几何相关节点: ${existingSpatialNodes.length}个`);
  console.log(`➕ 准备添加新节点: ${spatialGeometryNodes.length}个\n`);
  
  // 添加新节点（避免重复）
  let addedCount = 0;
  spatialGeometryNodes.forEach(newNode => {
    const exists = existingNodes.some(node => node.id === newNode.id);
    if (!exists) {
      existingNodes.push(newNode);
      addedCount++;
      console.log(`✅ 添加节点: ${newNode.id} - ${newNode.name}`);
    } else {
      console.log(`⏭️  跳过已存在节点: ${newNode.id}`);
    }
  });
  
  // 保存更新后的数据
  fileData.nodes = existingNodes;
  try {
    fs.writeFileSync(nodesPath, JSON.stringify(fileData, null, 2), 'utf8');
    console.log(`\n✅ 成功添加 ${addedCount} 个新节点到 nodes.json`);
  } catch (error) {
    console.error('\n❌ 保存nodes.json失败:', error.message);
    return;
  }
  
  // 生成边数据文件
  const edgesOutputPath = path.join(__dirname, '../data/spatial-geometry-edges.json');
  try {
    fs.writeFileSync(edgesOutputPath, JSON.stringify(spatialGeometryEdges, null, 2), 'utf8');
    console.log(`✅ 生成边数据文件: spatial-geometry-edges.json (${spatialGeometryEdges.length}条边)`);
  } catch (error) {
    console.error('❌ 保存边数据失败:', error.message);
  }
  
  // 统计信息
  console.log('\n📈 统计信息:');
  console.log(`  - 总节点数: ${existingNodes.length}`);
  console.log(`  - 新增节点: ${addedCount}`);
  console.log(`  - 生成边数: ${spatialGeometryEdges.length}`);
  console.log(`  - chapter-12节点: ${existingNodes.filter(n => n.chapter === 'chapter-12').length}`);
  
  console.log('\n✨ 空间解析几何节点生成完成！');
  console.log('\n📝 下一步:');
  console.log('  1. 运行 node count-nodes.js 查看更新后的节点统计');
  console.log('  2. 将 spatial-geometry-edges.json 中的边合并到 edges.json');
  console.log('  3. 在知识图谱界面中查看新增的空间几何节点');
}

// 执行生成
generateSpatialGeometryNodes();
