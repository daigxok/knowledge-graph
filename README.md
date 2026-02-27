# 高等数学学域知识图谱系统

## 项目概述

本系统是一个交互式的高等数学知识图谱可视化平台，旨在革新传统的线性章节教学模式，采用5大学域整合的范式，帮助学生从"记忆公式"转向"理解本质"。

### 核心创新

传统数学课程按12章线性呈现（极限→导数→积分→微分方程...），导致孤立的公式记忆。本系统将内容重组为5大学域：

1. **变化与逼近** - 极限论、导数论、微分学
2. **结构与累积** - 积分学、微分方程、级数论
3. **优化与决策** - 多元微积分、梯度方法、约束优化
4. **不确定性处理** - 级数收敛、泰勒展开、数值逼近
5. **真实问题建模** - 综合应用数学工具解决实际问题

## 技术栈

- **前端**: HTML5, CSS3, JavaScript (ES6+)
- **可视化**: D3.js v7.8.5 (力导向图)
- **数学渲染**: MathJax 3.2.2 (LaTeX公式)
- **集成**: higher_math_skills 系统
- **存储**: JSON数据文件, LocalStorage

## 项目结构

```
knowledge-graph/
├── index.html              # 主HTML文件
├── README.md              # 项目文档
├── styles/
│   └── main.css           # 主样式表
├── js/
│   ├── main.js            # 应用入口
│   └── modules/
│       ├── DomainDataManager.js      # 学域数据管理
│       ├── KnowledgeGraphEngine.js   # 知识图谱引擎
│       ├── D3VisualizationEngine.js  # D3可视化引擎
│       ├── FilterEngine.js           # 过滤引擎
│       ├── StateManager.js           # 状态管理
│       └── UIController.js           # UI控制器
└── data/
    ├── domains.json       # 5大学域定义
    ├── nodes.json         # 知识节点数据 (25个节点)
    └── edges.json         # 边关系数据 (39条边)
```

## 功能特性

### 已实现功能

✅ **基础架构**
- HTML5响应式布局
- CSS3样式系统（支持5种学域配色）
- ES6模块化JavaScript架构
- D3.js力导向图可视化
- MathJax LaTeX公式渲染

✅ **数据结构**
- 5大学域完整定义（包含核心思想、整合内容、真实场景）
- 25个知识节点（覆盖所有学域）
- 39条边关系（前置关系 + 跨学域关联）
- 12章传统章节映射

✅ **核心组件**
- DomainDataManager: 学域数据管理
- KnowledgeGraphEngine: 图结构管理
- D3VisualizationEngine: 可视化渲染
- FilterEngine: 多维度过滤
- StateManager: 状态持久化
- UIController: UI协调

✅ **交互功能**
- 缩放、平移、拖拽节点
- 学域筛选（5个学域）
- 章节筛选（12个章节）
- 难度范围筛选（1-5级）
- 关键词搜索（防抖300ms）
- 节点详情面板
- 跨学域视图模式

✅ **用户体验**
- 响应式设计（桌面/平板/移动）
- 加载指示器
- 通知提示系统
- 键盘快捷键支持
- LocalStorage状态保存

## 快速开始

### 1. 启动本地服务器

由于使用ES6模块，需要通过HTTP服务器访问：

```bash
# 使用Python 3
cd knowledge-graph
python -m http.server 8000

# 或使用Node.js http-server
npx http-server -p 8000
```

### 2. 访问应用

打开浏览器访问: `http://localhost:8000`

### 3. 探索知识图谱

- 使用鼠标拖拽节点
- 点击节点查看详情
- 使用侧边栏筛选功能
- 搜索框输入关键词
- 缩放控制按钮调整视图

## 数据说明

### 学域数据 (domains.json)

包含5个学域的完整定义：
- 基本信息（ID、名称、图标、颜色）
- 核心思想和描述
- 整合内容
- 典型问题
- 真实应用场景（每个学域3个场景）
- 关键技能

### 知识节点 (nodes.json)

25个知识节点，涵盖：
- Domain 1 (变化与逼近): 8个节点
- Domain 2 (结构与累积): 7个节点
- Domain 3 (优化与决策): 4个节点
- Domain 4 (不确定性处理): 4个节点
- Domain 5 (真实问题建模): 2个节点

每个节点包含：
- 基本信息（ID、名称、描述）
- 学域归属
- 传统章节映射
- 难度等级（1-5）
- 前置知识
- 相关技能
- LaTeX公式
- 关键词
- 重要性（1-5）
- 预计学习时间

### 边关系 (edges.json)

39条边，包括：
- 31条前置关系边（prerequisite）
- 8条跨学域关联边（cross-domain）

每条边包含：
- 源节点和目标节点
- 关系类型
- 强度（0-1）
- 描述

## 与 higher_math_skills 系统集成

本系统设计为与现有的 `higher_math_skills` 系统深度集成：

- 节点的 `relatedSkills` 字段链接到具体的Skill模块
- 支持动态加载Skill模块
- 详情面板显示相关Skill链接
- 未来将实现Skill模块的直接调用

## 浏览器兼容性

- Chrome 90+ ✅
- Firefox 88+ ✅
- Safari 14+ ✅
- Edge 90+ ✅

需要支持：
- ES6 Modules
- D3.js v7
- MathJax 3
- LocalStorage API

## 开发说明

### 添加新节点

编辑 `data/nodes.json`，添加节点对象：

```json
{
  "id": "node-new-concept",
  "name": "新概念",
  "nameEn": "New Concept",
  "description": "概念描述",
  "domains": ["domain-1"],
  "traditionalChapter": "chapter-1",
  "difficulty": 3,
  "prerequisites": ["node-prerequisite"],
  "relatedSkills": ["相关Skill"],
  "formula": "\\LaTeX公式",
  "keywords": ["关键词1", "关键词2"],
  "importance": 4,
  "estimatedStudyTime": 60
}
```

### 添加新边

编辑 `data/edges.json`，添加边对象：

```json
{
  "id": "edge-new",
  "source": "node-source-id",
  "target": "node-target-id",
  "type": "prerequisite",
  "strength": 0.8,
  "description": "关系描述"
}
```

### 修改学域配色

编辑 `styles/main.css` 中的CSS变量：

```css
:root {
    --domain-1-color: #667eea;
    --domain-2-color: #f093fb;
    /* ... */
}
```

## 下一步开发计划

根据 `tasks.md` 中的任务列表，后续将实现：

- [ ] Task 2: DomainDataManager 完整实现和测试
- [ ] Task 3: KnowledgeGraphEngine 完整实现和测试
- [ ] Task 4: 数据验证和错误处理
- [ ] Task 5-6: D3可视化增强和交互
- [ ] Task 7-8: 过滤引擎和搜索优化
- [ ] Task 10-11: 学习路径生成
- [ ] Task 12: Skill系统集成
- [ ] Task 18: 无障碍功能
- [ ] Task 19: 性能优化
- [ ] Task 22: 扩展数据到50+节点

## 许可证

本项目为教育用途开发。

## 联系方式

如有问题或建议，请联系项目维护者。

---

**版本**: 1.0.0 (Task 1 完成)  
**最后更新**: 2024
