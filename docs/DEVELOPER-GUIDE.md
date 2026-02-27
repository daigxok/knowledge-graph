# Phase 2 开发者文档

**版本**: 2.0.0  
**目标读者**: 开发者、贡献者  
**技术栈**: JavaScript, D3.js, Node.js

---

## 📋 目录

1. [项目结构](#项目结构)
2. [数据格式](#数据格式)
3. [核心模块](#核心模块)
4. [扩展指南](#扩展指南)
5. [API参考](#api参考)
6. [测试指南](#测试指南)

---

## 📁 项目结构

```
project-root/
├── data/                          # 数据文件
│   ├── nodes.json                 # Phase 1 节点
│   ├── nodes-extended-phase2.json # Phase 2 节点
│   ├── edges.json                 # Phase 1 边
│   ├── edges-extended-phase2.json # Phase 2 边
│   ├── applications-extended-phase2.json # 应用案例
│   ├── skills-content-phase2.json # Skills 内容
│   └── domains.json               # 学域定义
├── js/
│   ├── modules/                   # 核心模块
│   │   ├── OptimizedDataLoader.js
│   │   ├── OptimizedGraphRenderer.js
│   │   ├── EnhancedNodeDetailPanel.js
│   │   ├── NodeRelationshipHighlighter.js
│   │   ├── LanguageManager.js
│   │   ├── LanguageSwitcher.js
│   │   ├── ExportManager.js
│   │   ├── ShareDialog.js
│   │   ├── MobileGestureHandler.js
│   │   ├── MobileUIAdapter.js
│   │   └── visualizations/       # 可视化组件
│   │       ├── CurvatureVisualizer.js
│   │       ├── VectorFieldVisualizer.js
│   │       ├── PDEVisualizer.js
│   │       ├── OptimizationVisualizer.js
│   │       └── ProbabilityVisualizer.js
│   ├── i18n/                      # 国际化
│   │   └── translations.js
│   └── main.js                    # 主入口
├── scripts/                       # 工具脚本
│   ├── node-manager.js
│   ├── learning-path-engine.js
│   ├── search-filter-engine.js
│   ├── content-generator.js
│   └── data-validator.js
├── tests/                         # 测试文件
│   ├── property-tests.js
│   ├── unit-tests.js
│   └── run-all-tests.sh
├── styles/                        # 样式文件
│   ├── main.css
│   ├── language-switcher.css
│   └── mobile-responsive.css
├── docs/                          # 文档
│   ├── PHASE2-FEATURES.md
│   ├── USER-GUIDE.md
│   ├── DEVELOPER-GUIDE.md
│   └── FAQ.md
└── index.html                     # 主页面
```

---

## 📊 数据格式

### 节点数据 (Node)

```json
{
  "id": "node-001",
  "name": "函数极限",
  "nameEn": "Function Limit",
  "description": "研究函数在某点附近的变化趋势",
  "descriptionEn": "Study the trend of function changes near a point",
  "domains": ["domain-1"],
  "difficulty": 2,
  "estimatedStudyTime": 45,
  "prerequisites": ["node-000"],
  "relatedSkills": ["skill-001"],
  "keywords": ["极限", "趋近", "无穷小"],
  "keywordsEn": ["limit", "approach", "infinitesimal"],
  "chapter": "第一章",
  "formula": "\\lim_{x \\to a} f(x) = L",
  "applications": ["app-001", "app-002"],
  "visualization": {
    "type": "curvature",
    "config": {}
  }
}
```

**字段说明**:
- `id`: 唯一标识符
- `name/nameEn`: 中英文名称
- `description/descriptionEn`: 中英文描述
- `domains`: 所属学域数组
- `difficulty`: 难度等级 (1-5)
- `estimatedStudyTime`: 预计学习时间（分钟）
- `prerequisites`: 前置节点ID数组
- `relatedSkills`: 相关技能ID数组
- `keywords/keywordsEn`: 关键词数组
- `chapter`: 传统章节
- `formula`: LaTeX公式
- `applications`: 应用案例ID数组
- `visualization`: 可视化配置

---

### 边数据 (Edge)

```json
{
  "source": "node-001",
  "target": "node-002",
  "type": "prerequisite",
  "strength": 0.8,
  "description": "前置关系"
}
```

**字段说明**:
- `source`: 源节点ID
- `target`: 目标节点ID
- `type`: 关系类型 (prerequisite/cross-domain/application)
- `strength`: 关系强度 (0-1)
- `description`: 关系描述

---

### 应用案例数据 (Application)

```json
{
  "id": "app-001",
  "title": "神经网络训练中的梯度下降",
  "titleEn": "Gradient Descent in Neural Network Training",
  "description": "使用梯度下降优化神经网络参数",
  "descriptionEn": "Optimize neural network parameters using gradient descent",
  "industry": "AI",
  "relatedNodes": ["node-050", "node-051"],
  "problem": "如何训练神经网络...",
  "modeling": "定义损失函数...",
  "solution": "使用梯度下降算法...",
  "code": "// Python code\nimport numpy as np\n...",
  "visualization": {
    "type": "optimization",
    "data": []
  },
  "impact": "广泛应用于深度学习..."
}
```

---

### Skills 内容数据

```json
{
  "skillId": "skill-001",
  "name": "函数极限与连续",
  "advancedTopics": [
    {
      "title": "一致连续性",
      "content": "...",
      "examples": []
    }
  ],
  "advancedExercises": [
    {
      "id": "ex-001",
      "question": "证明...",
      "hint": "提示...",
      "solution": "解答...",
      "difficulty": 4,
      "topics": ["一致连续性"]
    }
  ],
  "projects": [
    {
      "title": "数值计算极限",
      "description": "...",
      "requirements": [],
      "code": "..."
    }
  ]
}
```

---

## 🔧 核心模块

### 1. OptimizedDataLoader

**功能**: 高效加载和缓存数据

```javascript
import { OptimizedDataLoader } from './js/modules/OptimizedDataLoader.js';

const loader = new OptimizedDataLoader();

// 加载所有数据
const data = await loader.loadAllData();

// 访问数据
const nodes = data.nodes;
const edges = data.edges;
const applications = data.applications;
```

**关键方法**:
- `loadAllData()`: 加载所有数据文件
- `loadNodes()`: 仅加载节点数据
- `loadEdges()`: 仅加载边数据
- `clearCache()`: 清除缓存

---

### 2. OptimizedGraphRenderer

**功能**: 高性能图谱渲染

```javascript
import { OptimizedGraphRenderer } from './js/modules/OptimizedGraphRenderer.js';

const renderer = new OptimizedGraphRenderer('#graphCanvas');

// 渲染图谱
renderer.render(nodes, edges);

// 更新视图
renderer.updateView();

// 高亮节点
renderer.highlightNode(nodeId);
```

**关键方法**:
- `render(nodes, edges)`: 渲染图谱
- `updateView()`: 更新视图
- `highlightNode(id)`: 高亮节点
- `zoomTo(x, y, scale)`: 缩放到指定位置

---

### 3. LanguageManager

**功能**: 多语言管理

```javascript
import { languageManager } from './js/modules/LanguageManager.js';

// 切换语言
languageManager.switchLanguage('en');

// 获取翻译
const text = languageManager.translate('app.title');

// 获取节点名称
const nodeName = languageManager.getNodeName(node);

// 监听语言变更
languageManager.onLanguageChange((lang) => {
  console.log('Language changed to:', lang);
});
```

---

### 4. ExportManager

**功能**: 导出功能

```javascript
import { ExportManager } from './js/modules/ExportManager.js';

const exporter = new ExportManager();

// 导出为 PDF
await exporter.exportToPDF(content, 'learning-path.pdf');

// 导出为 Markdown
await exporter.exportToMarkdown(nodes, 'nodes.md');

// 导出为 PNG
await exporter.exportToPNG(element, 'graph.png');

// 导出为 JSON
await exporter.exportToJSON(data, 'progress.json');
```

---

## 🔨 扩展指南

### 添加新节点

1. **创建节点数据**

```json
{
  "id": "node-new",
  "name": "新概念",
  "nameEn": "New Concept",
  "description": "详细描述",
  "descriptionEn": "Detailed description",
  "domains": ["domain-1"],
  "difficulty": 3,
  "estimatedStudyTime": 60,
  "prerequisites": ["node-001"],
  "relatedSkills": [],
  "keywords": ["关键词1", "关键词2"],
  "keywordsEn": ["keyword1", "keyword2"],
  "formula": "LaTeX公式",
  "applications": []
}
```

2. **添加到数据文件**

将节点添加到 `data/nodes-extended-phase2.json`

3. **运行验证**

```bash
node scripts/data-validator.js
```

---

### 添加新的可视化

1. **创建可视化类**

```javascript
// js/modules/visualizations/MyVisualizer.js
export class MyVisualizer {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
  }
  
  render(data, config) {
    // 实现可视化逻辑
  }
  
  update(newData) {
    // 更新可视化
  }
  
  destroy() {
    // 清理资源
  }
}
```

2. **注册可视化**

在 `js/modules/visualizations/index.js` 中导出：

```javascript
export { MyVisualizer } from './MyVisualizer.js';
```

3. **在节点中使用**

```json
{
  "visualization": {
    "type": "my-visualizer",
    "config": {
      "param1": "value1"
    }
  }
}
```

---

### 添加新的应用案例

1. **创建案例数据**

```json
{
  "id": "app-new",
  "title": "案例标题",
  "titleEn": "Case Title",
  "description": "案例描述",
  "industry": "行业名称",
  "relatedNodes": ["node-001"],
  "problem": "问题背景",
  "modeling": "数学建模",
  "solution": "求解方法",
  "code": "// 代码实现\n...",
  "visualization": {},
  "impact": "实际影响"
}
```

2. **添加到数据文件**

将案例添加到 `data/applications-extended-phase2.json`

3. **关联到节点**

在节点的 `applications` 数组中添加案例ID

---

### 添加新的翻译

1. **编辑翻译文件**

`js/i18n/translations.js`:

```javascript
export const translations = {
  zh: {
    'new.key': '中文翻译'
  },
  en: {
    'new.key': 'English Translation'
  }
};
```

2. **在HTML中使用**

```html
<span data-i18n="new.key">默认文本</span>
```

3. **在JavaScript中使用**

```javascript
const text = languageManager.translate('new.key');
```

---

## 📚 API参考

### NodeManager

```javascript
class NodeManager {
  // 加载节点
  loadNodes(files: string[]): Promise<Node[]>
  
  // 获取节点
  getNodeById(id: string): Node | null
  
  // 按学域获取
  getNodesByDomain(domain: string): Node[]
  
  // 按难度获取
  getNodesByDifficulty(min: number, max: number): Node[]
  
  // 搜索节点
  searchNodes(query: string): Node[]
  
  // 获取前置节点
  getPrerequisites(nodeId: string): Node[]
  
  // 获取后续节点
  getSuccessors(nodeId: string): Node[]
}
```

---

### LearningPathEngine

```javascript
class LearningPathEngine {
  // 分析用户水平
  analyzeUserLevel(completedNodes: string[]): number
  
  // 推荐下一步节点
  recommendNextNodes(completedNodes: string[], count: number): Node[]
  
  // 计算学习路径
  calculatePath(startId: string, targetId: string): string[]
  
  // 估算学习时间
  estimatePathTime(path: string[]): number
}
```

---

### SearchFilterEngine

```javascript
class SearchFilterEngine {
  // 应用过滤条件
  applyFilters(nodes: Node[], filters: FilterOptions): Node[]
  
  // 全文搜索
  fullTextSearch(nodes: Node[], query: string): Node[]
  
  // 按行业过滤应用
  filterApplicationsByIndustry(apps: Application[], industry: string): Application[]
  
  // 获取过滤统计
  getFilterStats(nodes: Node[]): FilterStats
}
```

---

## 🧪 测试指南

### 运行测试

```bash
# 运行所有测试
bash tests/run-all-tests.sh

# 仅属性测试
node tests/property-tests.js

# 仅单元测试
node tests/unit-tests.js
```

### 编写测试

**属性测试示例**:

```javascript
function testPropertyN_Description(data) {
  const { nodes } = data;
  
  nodes.forEach((node, index) => {
    assert(
      condition,
      `Node ${index} (${node.id}) error message`
    );
  });
  
  console.log(`   Verified ${nodes.length} nodes`);
}
```

**单元测试示例**:

```javascript
function testModule_Function() {
  const module = new Module();
  const result = module.function(input);
  
  assertEqual(result, expected, 'Error message');
}
```

---

## 🔍 调试技巧

### 1. 浏览器开发者工具

- **Console**: 查看日志和错误
- **Network**: 检查数据加载
- **Performance**: 分析性能瓶颈
- **Elements**: 检查DOM结构

### 2. 数据验证

```bash
# 验证所有数据
node scripts/data-validator.js

# 验证特定文件
node scripts/validate-phase2-data.js
```

### 3. 性能分析

```javascript
// 测量执行时间
console.time('operation');
// ... 代码 ...
console.timeEnd('operation');

// 内存使用
console.log(performance.memory);
```

---

## 📝 代码规范

### JavaScript

- 使用 ES6+ 语法
- 使用 ES Modules
- 驼峰命名法
- 详细的注释
- JSDoc 文档

### 文件组织

- 一个文件一个类
- 相关功能分组
- 清晰的目录结构

### 提交规范

```
feat: 添加新功能
fix: 修复bug
docs: 更新文档
test: 添加测试
refactor: 重构代码
style: 代码格式
perf: 性能优化
```

---

## 🚀 部署指南

### 1. 构建准备

```bash
# 验证数据
node scripts/data-validator.js

# 运行测试
bash tests/run-all-tests.sh

# 检查性能
node scripts/performance-test.js
```

### 2. 优化资源

- 压缩JavaScript文件
- 压缩CSS文件
- 优化图片资源
- 启用Gzip压缩

### 3. 部署到服务器

```bash
# 复制文件到服务器
scp -r * user@server:/path/to/deploy

# 配置Web服务器
# Nginx/Apache配置
```

---

## 📞 支持

### 文档资源
- **功能介绍**: `docs/PHASE2-FEATURES.md`
- **用户指南**: `docs/USER-GUIDE.md`
- **FAQ**: `docs/FAQ.md`

### 技术支持
- 查看GitHub Issues
- 阅读源代码注释
- 运行测试用例

---

**文档版本**: 1.0.0  
**最后更新**: 2026-02-27  
**维护者**: Kiro AI Assistant

---

🔧 **Happy Coding!** 💻
