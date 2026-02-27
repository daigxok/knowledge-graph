# 🚀 快速开始 - 系统集成使用指南

**适用于**: Phase 2 系统集成（Tasks 15-17）  
**更新日期**: 2026-02-25

---

## 📦 安装和运行

### 1. 运行集成测试

```bash
node scripts/test-system-integration.js
```

**预期输出**:
- ✅ 加载75个节点
- ✅ 加载92条边
- ✅ 加载100个应用案例
- ✅ 所有功能测试通过

---

## 💻 使用示例

### 示例1: 使用NodeManager

```javascript
const NodeManager = require('./scripts/node-manager');

// 1. 创建实例
const nodeManager = new NodeManager();

// 2. 加载数据
nodeManager.loadNodes([
  'data/nodes-extended-phase1.json',
  'data/nodes-extended-phase2.json'
]);

nodeManager.loadEdges([
  'data/edges-extended-phase2.json'
]);

nodeManager.loadApplications([
  'data/applications-extended-phase2.json'
]);

// 3. 查询节点
const node = nodeManager.getNodeById('node-domain-1-curvature-1772027700608-0');
console.log(node.name); // "曲率"

// 4. 按domain查询
const domain1Nodes = nodeManager.getNodesByDomain('domain-1');
console.log(`Domain-1有${domain1Nodes.length}个节点`);

// 5. 搜索
const results = nodeManager.searchNodes('曲率');
console.log(`找到${results.length}个结果`);

// 6. 获取统计
const stats = nodeManager.getStats();
console.log(stats);
```

---

### 示例2: 使用LearningPathEngine

```javascript
const LearningPathEngine = require('./scripts/learning-path-engine');

// 1. 创建实例（需要NodeManager）
const pathEngine = new LearningPathEngine(nodeManager);

// 2. 分析用户水平
const completedNodes = [
  'node-domain-1-curvature-1772027700608-0',
  'node-domain-1-function-plotting-1772027700609-1'
];

const userLevel = pathEngine.analyzeUserLevel(completedNodes);
console.log(`用户水平: ${userLevel.level}`);
console.log(`平均难度: ${userLevel.averageDifficulty}`);
console.log(`建议难度: ${userLevel.suggestedDifficulty}`);

// 3. 获取推荐
const recommendations = pathEngine.recommendNextNodes(completedNodes, 5);
console.log(`推荐${recommendations.length}个节点:`);
for (const rec of recommendations) {
  console.log(`- ${rec.node.name} (分数: ${rec.score.toFixed(2)})`);
  console.log(`  理由: ${rec.reason}`);
}

// 4. 计算学习路径
const targetNodeId = 'node-domain-1-taylor-expansion-1772027700609-3';
const pathResult = pathEngine.calculatePath(null, targetNodeId, completedNodes);

console.log(`路径节点数: ${pathResult.totalNodes}`);
console.log(`预计时间: ${pathResult.estimatedTime.hours}小时`);
console.log(`路径:`);
for (const node of pathResult.path) {
  console.log(`  → ${node.name}`);
}
```

---

### 示例3: 使用SearchFilterEngine

```javascript
const SearchFilterEngine = require('./scripts/search-filter-engine');

// 1. 创建实例并构建索引
const searchEngine = new SearchFilterEngine(nodeManager);
searchEngine.buildIndex();

// 2. 全文搜索
const searchResults = searchEngine.fullTextSearch('曲率 微分');
console.log(`搜索结果: ${searchResults.length}个`);
for (const node of searchResults) {
  console.log(`- ${node.name}`);
}

// 3. 多条件过滤
const filters = {
  domains: ['domain-1', 'domain-2'],
  minDifficulty: 3,
  maxDifficulty: 5,
  minImportance: 4
};

const filteredNodes = searchEngine.applyFilters(filters);
console.log(`过滤后: ${filteredNodes.length}个节点`);

// 4. 获取统计信息
const stats = searchEngine.getFilterStats(filters);
console.log('统计信息:');
console.log(`- 总节点数: ${stats.totalNodes}`);
console.log(`- 平均难度: ${stats.averageDifficulty.toFixed(2)}`);
console.log('- 按Domain分布:', stats.byDomain);
console.log('- 按Difficulty分布:', stats.byDifficulty);

// 5. 获取热门关键词
const keywords = searchEngine.getPopularKeywords(10);
console.log('热门关键词:');
for (const item of keywords) {
  console.log(`- ${item.keyword}: ${item.count}次`);
}

// 6. 获取热门行业
const industries = searchEngine.getPopularIndustries(10);
console.log('热门行业:');
for (const item of industries) {
  console.log(`- ${item.industry}: ${item.count}个案例`);
}
```

---

## 🎯 常见使用场景

### 场景1: 新用户开始学习

```javascript
// 1. 分析用户水平（新用户，无已完成节点）
const userLevel = pathEngine.analyzeUserLevel([]);
// 结果: { level: 'beginner', suggestedDifficulty: 1 }

// 2. 推荐入门节点
const recommendations = pathEngine.recommendNextNodes([], 5);
// 返回5个难度为1的节点

// 3. 选择一个节点开始学习
const chosenNode = recommendations[0].node;

// 4. 查看相关应用案例
const apps = nodeManager.getRelatedApplications(chosenNode.id);
```

---

### 场景2: 用户寻找特定主题

```javascript
// 1. 搜索关键词
const results = searchEngine.fullTextSearch('曲率 微分几何');

// 2. 如果结果太多，应用过滤
const filtered = searchEngine.applyFilters({
  domains: ['domain-1'],
  minDifficulty: 3,
  maxDifficulty: 4
});

// 3. 查看节点详情
const node = filtered[0];
console.log(node.name);
console.log(node.description);
console.log(node.realWorldApplications);
```

---

### 场景3: 规划学习路径

```javascript
// 1. 用户想学习某个高级主题
const targetNodeId = 'node-domain-2-field-theory-1772027700623-22';

// 2. 计算从当前水平到目标的路径
const completedNodes = ['node-1', 'node-2', 'node-3'];
const path = pathEngine.calculatePath(null, targetNodeId, completedNodes);

// 3. 显示路径信息
console.log(`需要学习${path.totalNodes}个节点`);
console.log(`预计时间: ${path.estimatedTime.hours}小时`);
console.log(`约${path.estimatedTime.days}天完成`);

// 4. 显示路径详情
for (const node of path.path) {
  console.log(`${node.name} (${node.estimatedStudyTime}分钟)`);
}
```

---

### 场景4: 探索应用案例

```javascript
// 1. 按行业过滤应用案例
const aiApps = searchEngine.filterApplicationsByIndustry([
  '人工智能',
  '机器学习',
  '深度学习'
]);

console.log(`AI相关应用案例: ${aiApps.length}个`);

// 2. 查看案例详情
for (const app of aiApps) {
  console.log(`\n${app.title}`);
  console.log(`行业: ${app.industry}`);
  console.log(`描述: ${app.description}`);
  console.log(`相关节点: ${app.relatedNodes.join(', ')}`);
}

// 3. 找到相关节点
const relatedNodes = app.relatedNodes.map(id => 
  nodeManager.getNodeById(id)
);
```

---

## 📊 API快速参考

### NodeManager API

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `loadNodes` | filePaths[] | this | 加载节点数据 |
| `loadEdges` | filePaths[] | this | 加载边数据 |
| `loadApplications` | filePaths[] | this | 加载应用案例 |
| `getNodeById` | id | Node\|null | 按ID查询 |
| `getNodesByDomain` | domain | Node[] | 按Domain查询 |
| `getNodesByDifficulty` | difficulty | Node[] | 按难度查询 |
| `searchNodes` | keyword | Node[] | 关键词搜索 |
| `getPrerequisites` | nodeId | Node[] | 获取前置节点 |
| `getSuccessors` | nodeId | Node[] | 获取后续节点 |
| `getStats` | - | Object | 获取统计信息 |

### LearningPathEngine API

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `analyzeUserLevel` | completedIds[] | Object | 分析用户水平 |
| `recommendNextNodes` | completedIds[], limit | Recommendation[] | 推荐节点 |
| `calculatePath` | startId, targetId, completedIds[] | Object | 计算路径 |
| `estimatePathTime` | nodes[] | Object | 估算时间 |

### SearchFilterEngine API

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `buildIndex` | - | this | 构建搜索索引 |
| `fullTextSearch` | query | Node[] | 全文搜索 |
| `applyFilters` | filters | Node[] | 应用过滤 |
| `getFilterStats` | filters | Object | 获取统计 |
| `getPopularKeywords` | limit | Object[] | 热门关键词 |
| `getPopularIndustries` | limit | Object[] | 热门行业 |

---

## 🔧 配置选项

### 过滤器配置

```javascript
const filters = {
  // Domain过滤
  domains: ['domain-1', 'domain-2'],
  
  // 难度范围
  minDifficulty: 1,
  maxDifficulty: 5,
  
  // 学习时长范围（分钟）
  minStudyTime: 30,
  maxStudyTime: 120,
  
  // 关键词
  keywords: ['微分', '积分'],
  
  // 最小重要性
  minImportance: 4,
  
  // 应用行业
  industries: ['人工智能', '金融']
};
```

---

## 🐛 常见问题

### Q1: 数据加载失败？
**A**: 检查文件路径是否正确，确保JSON文件存在且格式正确。

### Q2: 搜索结果为空？
**A**: 确保已调用`buildIndex()`构建搜索索引。

### Q3: 推荐节点不合理？
**A**: 检查已完成节点列表是否正确，系统会根据用户水平推荐。

### Q4: 路径计算错误？
**A**: 确保目标节点ID正确，检查节点的前置关系是否完整。

---

## 📚 更多资源

- **详细文档**: `SYSTEM-INTEGRATION-COMPLETE.md`
- **进度更新**: `PROGRESS-UPDATE-2026-02-25.md`
- **会话总结**: `SESSION-SUMMARY.md`
- **测试代码**: `scripts/test-system-integration.js`

---

## 🎯 下一步

1. 运行测试验证功能
2. 尝试不同的使用场景
3. 准备前端集成（Task 18）
4. 考虑性能优化需求

---

**文档版本**: 1.0  
**最后更新**: 2026-02-25  
**维护者**: Kiro AI Assistant

---

🚀 **开始使用系统集成功能！**
