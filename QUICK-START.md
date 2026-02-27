# 🚀 Knowledge Graph System - 快速启动指南

## 📋 系统要求

- **浏览器**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **服务器**: Python 3.x 或 Node.js (用于本地开发)
- **网络**: 需要访问CDN (D3.js, MathJax)

---

## ⚡ 快速启动 (3步)

### 1️⃣ 启动本地服务器

**使用Python 3**:
```bash
cd knowledge-graph
python -m http.server 8000
```

**或使用Node.js**:
```bash
cd knowledge-graph
npx http-server -p 8000
```

### 2️⃣ 打开浏览器

访问: `http://localhost:8000`

### 3️⃣ 开始探索

- 🖱️ 拖拽节点移动
- 🔍 点击节点查看详情
- 🎯 使用侧边栏筛选
- 🔎 搜索框查找知识点

---

## 🎮 主要功能

### 📊 知识图谱可视化
- **力导向图**: 自动布局，节点间距合理
- **5大学域**: 不同颜色区分
- **39条关系**: 前置关系和跨学域关联

### 🔍 搜索和筛选
- **关键词搜索**: 实时搜索，防抖处理
- **学域筛选**: 选择1个或多个学域
- **章节筛选**: 按传统章节过滤
- **难度筛选**: 1-5级难度范围

### 📚 学习路径
- **自动生成**: 根据前置知识生成学习路径
- **步骤指示**: 显示学习步骤和原因
- **时间估计**: 预计学习时间
- **难度评估**: 路径平均难度

### 💾 状态保存
- **自动保存**: 学习进度自动保存
- **本地存储**: 使用localStorage
- **恢复功能**: 刷新页面后恢复状态

---

## 🎯 常见操作

### 查看节点详情
1. 点击图谱中的任意节点
2. 右侧面板显示详细信息
3. 包括: 描述、公式、难度、前置知识、相关技能

### 生成学习路径
1. 点击节点查看详情
2. 点击"生成学习路径"按钮
3. 查看推荐的学习步骤
4. 路径在图谱中高亮显示

### 使用过滤功能
1. **学域筛选**: 勾选想要的学域
2. **章节筛选**: 从下拉菜单选择章节
3. **难度筛选**: 调整难度范围滑块
4. **关键词搜索**: 输入关键词实时搜索

### 调整视图
- **放大**: 点击 `+` 按钮
- **缩小**: 点击 `−` 按钮
- **重置**: 点击 `⟲` 按钮
- **跨学域视图**: 点击 `🔗` 按钮

---

## 📁 项目结构

```
knowledge-graph/
├── index.html                 # 主页面
├── config.js                  # 配置文件
├── README.md                  # 项目文档
├── QUICK-START.md            # 本文件
├── SYSTEM-FIX-REPORT.md      # 修复报告
│
├── data/
│   ├── domains.json          # 5大学域定义
│   ├── nodes.json            # 25个知识节点
│   └── edges.json            # 39条边关系
│
├── js/
│   ├── main.js               # 应用入口
│   └── modules/
│       ├── DomainDataManager.js
│       ├── KnowledgeGraphEngine.js
│       ├── D3VisualizationEngine.js
│       ├── FilterEngine.js
│       ├── StateManager.js
│       ├── UIController.js
│       ├── LearningPathFinder.js
│       ├── SkillIntegrationManager.js
│       └── DataValidator.js
│
├── styles/
│   └── main.css              # 样式表
│
└── test-complete-system.html # 测试页面
```

---

## 🔧 配置说明

### 修改配置

编辑 `config.js` 文件:

```javascript
// 修改数据路径
setConfig('data.domains', './data/domains.json');

// 修改可视化参数
setConfig('visualization.forceSimulation.chargeStrength', -400);

// 启用/禁用功能
setConfig('features.learningPath', true);
```

### 常用配置

```javascript
// 调整力导向图参数
visualization.forceSimulation.chargeStrength: -300  // 节点斥力
visualization.forceSimulation.linkDistance: 100     // 边长度
visualization.forceSimulation.collisionRadius: 40   // 碰撞半径

// 调整UI尺寸
ui.sidebarWidth: 300          // 侧边栏宽度
ui.detailPanelWidth: 400      // 详情面板宽度

// 调整存储设置
storage.maxSize: 1048576      // 最大存储大小 (1MB)
storage.autoSave: true        // 自动保存
```

---

## 🧪 测试系统

访问测试页面: `http://localhost:8000/test-complete-system.html`

**测试项目**:
- ✅ 数据加载
- ✅ 模块初始化
- ✅ 过滤功能
- ✅ 学习路径生成
- ✅ Skill集成

---

## 🐛 常见问题

### Q: 页面加载很慢
**A**: 
- 检查网络连接
- 清除浏览器缓存
- 尝试其他浏览器

### Q: 公式显示不正确
**A**:
- 等待MathJax加载完成
- 刷新页面
- 检查浏览器控制台是否有错误

### Q: 学习路径生成失败
**A**:
- 检查节点是否有前置知识
- 查看浏览器控制台错误信息
- 尝试选择其他节点

### Q: 数据无法保存
**A**:
- 检查localStorage是否启用
- 检查存储空间是否充足
- 清除旧数据后重试

### Q: 跨域边不显示
**A**:
- 点击"跨学域视图"按钮
- 检查是否有跨域关系
- 查看数据文件中的cross-domain边

---

## 📊 系统状态检查

### 检查系统是否正常运行

1. **打开浏览器控制台** (F12)
2. **查看是否有错误信息**
3. **运行测试**: 访问 `test-complete-system.html`
4. **点击"Run All Tests"按钮**

### 预期结果

```
✅ Data Loading PASSED
✅ Core Modules PASSED
✅ Filter Engine PASSED
✅ Learning Path PASSED
✅ Skill Integration PASSED
```

---

## 🚀 性能优化建议

### 对于大数据集 (50+节点)

1. **启用虚拟化**:
```javascript
setConfig('performance.enableVirtualization', true);
```

2. **启用缓存**:
```javascript
setConfig('performance.enableCaching', true);
```

3. **调整力导向图参数**:
```javascript
setConfig('visualization.forceSimulation.chargeStrength', -200);
setConfig('visualization.forceSimulation.linkDistance', 80);
```

---

## 📚 学习资源

### 系统文档
- `README.md` - 完整项目文档
- `SYSTEM-FIX-REPORT.md` - 系统修复报告
- `config.js` - 配置说明

### 外部资源
- [D3.js 文档](https://d3js.org)
- [MathJax 文档](https://www.mathjax.org)
- [ES6 模块](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)

---

## 🤝 获取帮助

### 调试技巧

1. **打开浏览器开发者工具** (F12)
2. **查看Console标签页**
3. **查看Network标签页** (检查数据加载)
4. **查看Elements标签页** (检查DOM结构)

### 常用命令

```javascript
// 在浏览器控制台中运行

// 查看应用状态
window.knowledgeGraphApp

// 查看所有节点
window.knowledgeGraphApp.graphEngine.getAllNodes()

// 查看所有边
window.knowledgeGraphApp.graphEngine.getAllEdges()

// 查看当前过滤器
window.knowledgeGraphApp.filterEngine.getActiveFilters()

// 查看保存的状态
window.knowledgeGraphApp.stateManager.getState()
```

---

## 📞 支持

如有问题或建议，请:
1. 查看浏览器控制台错误信息
2. 运行测试页面诊断问题
3. 查看项目文档
4. 检查配置设置

---

**版本**: 2.0.0  
**最后更新**: 2026年2月21日  
**状态**: ✅ 生产就绪
