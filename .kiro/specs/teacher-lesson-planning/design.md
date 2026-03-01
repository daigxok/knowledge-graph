# 设计文档：教师备课功能

## 概述

教师备课功能为高等数学学域知识图谱系统添加教师侧内容管理能力。本设计基于现有系统架构，扩展认证模块支持角色管理，新增节点编辑器和教案生成器，实现教师对知识图谱的创建、编辑和教学设计功能。

### 项目目标

1. 扩展Auth模块支持教师/学生角色区分
2. 实现可视化节点编辑器，支持创建和修改节点
3. 实现教案自动生成引擎，基于节点数据生成结构化教案
4. 提供教案模板系统和多格式导出功能
5. 实现数据持久化和备份机制
6. 确保权限控制和数据安全

### 技术栈

- 前端框架: 原生JavaScript (ES6+ Modules)
- 图谱可视化: D3.js v7.8.5
- 公式渲染: MathJax 3.2.2
- 数据格式: JSON
- 导出功能: jsPDF (PDF), markdown-it (Markdown), html2canvas (截图)
- 认证: 现有Auth.js模块（扩展）

### 与现有系统的集成

- 复用Auth.js模块，扩展支持角色管理
- 复用ExportManager模块，扩展支持教案导出
- 复用D3VisualizationEngine，添加编辑模式交互
- 保持与现有节点数据格式完全兼容
- 使用现有的UIController架构模式

## 架构

### 系统架构图

```
┌─────────────────────────────────────────────────────────────┐
│                     展示层 (Presentation)                    │
├─────────────────────────────────────────────────────────────┤
│  TeacherUI          │  NodeEditorUI    │  LessonPlanViewer  │
│  (教师界面)          │  (节点编辑器)     │  (教案查看器)       │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   控制层 (Controller)                        │
├─────────────────────────────────────────────────────────────┤
│  TeacherUIController  │  NodeEditorController               │
│  (教师界面控制)        │  (节点编辑控制)                      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   业务逻辑层 (Business Logic)                │
├─────────────────────────────────────────────────────────────┤
│  TeacherAuthManager │ NodeDataManager │ LessonPlanGenerator │
│  (角色权限管理)      │ (节点数据管理)   │ (教案生成引擎)       │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                     数据层 (Data)                            │
├─────────────────────────────────────────────────────────────┤
│  Auth.js (扩展)     │  nodes-extended-phase2.json            │
│  (用户认证+角色)     │  (节点数据文件)                         │
└─────────────────────────────────────────────────────────────┘
```

### 架构设计原则

1. **模块化**: 每个组件职责单一，便于测试和维护
2. **可扩展性**: 预留接口支持未来功能扩展
3. **向后兼容**: 不破坏现有学生侧功能
4. **权限隔离**: 教师功能与学生功能严格分离
5. **数据安全**: 所有数据操作需验证权限

## 组件和接口

### 1. TeacherAuthManager (教师认证管理器)

扩展现有Auth模块，添加角色管理功能。

#### 职责

- 管理用户角色（教师/学生）
- 验证用户权限
- 提供角色检查接口

#### 接口设计

```javascript
class TeacherAuthManager {
  /**
   * 注册用户（扩展支持角色）
   * @param {string} username - 用户名
   * @param {string} password - 密码
   * @param {string} role - 角色 ('teacher' | 'student')
   * @returns {Object} 注册结果
   */
  register(username, password, role = 'student') {}
  
  /**
   * 检查当前用户是否为教师
   * @returns {boolean}
   */
  isTeacher() {}
  
  /**
   * 要求教师权限，否则重定向
   * @param {string} redirectUrl - 重定向URL
   */
  requireTeacher(redirectUrl = 'index.html') {}
  
  /**
   * 获取当前用户角色
   * @returns {string} 'teacher' | 'student' | null
   */
  getUserRole() {}
}
```

#### 数据模型

```javascript
// 用户数据结构（扩展）
{
  username: string,
  passwordHash: string,
  role: 'teacher' | 'student',  // 新增字段
  createdAt: timestamp,
  lastLogin: timestamp
}
```

### 2. NodeEditor (节点编辑器)

提供节点创建和编辑的UI组件。

#### 职责

- 渲染节点编辑表单
- 验证表单输入
- 提供LaTeX公式预览
- 提供前置节点选择器
- 处理表单提交

#### 接口设计

```javascript
class NodeEditor {
  /**
   * 打开节点编辑器
   * @param {Object|null} node - 要编辑的节点，null表示创建新节点
   */
  open(node = null) {}
  
  /**
   * 关闭编辑器
   */
  close() {}
  
  /**
   * 验证表单数据
   * @param {Object} formData - 表单数据
   * @returns {Object} { valid: boolean, errors: string[] }
   */
  validate(formData) {}
  
  /**
   * 渲染LaTeX公式预览
   * @param {string} latex - LaTeX公式
   */
  renderFormulaPreview(latex) {}
  
  /**
   * 获取表单数据
   * @returns {Object} 节点数据对象
   */
  getFormData() {}
}
```

### 3. NodeDataManager (节点数据管理器)

管理节点数据的CRUD操作和持久化。

#### 职责

- 创建新节点
- 更新现有节点
- 删除节点
- 保存数据到JSON文件
- 创建数据备份
- 检测数据冲突

#### 接口设计

```javascript
class NodeDataManager {
  /**
   * 创建新节点
   * @param {Object} nodeData - 节点数据
   * @returns {Promise<Object>} 创建的节点（包含生成的ID）
   */
  async createNode(nodeData) {}
  
  /**
   * 更新节点
   * @param {string} nodeId - 节点ID
   * @param {Object} updates - 更新的字段
   * @returns {Promise<Object>} 更新后的节点
   */
  async updateNode(nodeId, updates) {}
  
  /**
   * 删除节点
   * @param {string} nodeId - 节点ID
   * @returns {Promise<boolean>} 是否成功
   */
  async deleteNode(nodeId) {}
  
  /**
   * 保存所有节点数据
   * @returns {Promise<boolean>} 是否成功
   */
  async saveNodes() {}
  
  /**
   * 创建数据备份
   * @returns {Promise<string>} 备份文件名
   */
  async createBackup() {}
  
  /**
   * 从备份恢复
   * @param {string} backupFile - 备份文件名
   * @returns {Promise<boolean>} 是否成功
   */
  async restoreFromBackup(backupFile) {}
  
  /**
   * 生成唯一节点ID
   * @param {string} domainId - 所属领域ID
   * @param {string} name - 节点名称
   * @returns {string} 节点ID
   */
  generateNodeId(domainId, name) {}
  
  /**
   * 检测循环依赖
   * @param {string} nodeId - 节点ID
   * @param {string[]} prerequisites - 前置节点ID数组
   * @returns {boolean} 是否存在循环依赖
   */
  detectCircularDependency(nodeId, prerequisites) {}
}
```

### 4. LessonPlanGenerator (教案生成器)

基于节点数据生成结构化教案。

#### 职责

- 收集节点数据
- 应用教案模板
- 生成教案内容
- 支持自定义模板

#### 接口设计

```javascript
class LessonPlanGenerator {
  /**
   * 生成单个节点的教案
   * @param {Object} node - 节点数据
   * @param {Object} template - 教案模板（可选）
   * @returns {Object} 教案对象
   */
  generate(node, template = null) {}
  
  /**
   * 批量生成教案
   * @param {Object[]} nodes - 节点数组
   * @param {Object} template - 教案模板（可选）
   * @returns {Object} 合并的教案对象
   */
  generateBatch(nodes, template = null) {}
  
  /**
   * 获取默认模板
   * @returns {Object} 默认教案模板
   */
  getDefaultTemplate() {}
  
  /**
   * 保存自定义模板
   * @param {string} name - 模板名称
   * @param {Object} template - 模板对象
   */
  saveTemplate(name, template) {}
  
  /**
   * 加载自定义模板
   * @param {string} name - 模板名称
   * @returns {Object|null} 模板对象
   */
  loadTemplate(name) {}
}
```

### 5. LessonPlanTemplate (教案模板)

定义教案的结构和格式。

#### 数据模型

```javascript
{
  metadata: {
    title: string,           // 教案标题
    nodeId: string,          // 节点ID
    generatedDate: string,   // 生成日期
    difficulty: number,      // 难度等级
    importance: number,      // 重要性
    estimatedHours: number   // 预计课时
  },
  sections: [
    {
      title: string,         // 章节标题
      content: string,       // 章节内容
      order: number          // 显示顺序
    }
  ],
  footer: {
    generator: string,       // 生成工具
    version: string          // 版本号
  }
}
```

#### 默认模板结构

```javascript
const defaultTemplate = {
  sections: [
    { title: '教学目标', field: 'objectives', order: 1 },
    { title: '知识点概述', field: 'description', order: 2 },
    { title: '前置知识', field: 'prerequisites', order: 3 },
    { title: '核心内容', field: 'coreContent', order: 4 },
    { title: '关键公式', field: 'formula', order: 5 },
    { title: '教学重点', field: 'keywords', order: 6 },
    { title: '预计课时', field: 'estimatedStudyTime', order: 7 },
    { title: '实际应用', field: 'realWorldApplications', order: 8 },
    { title: '扩展主题', field: 'advancedTopics', order: 9 }
  ]
};
```

### 6. TeacherUIController (教师界面控制器)

管理教师专用UI元素和交互。

#### 职责

- 显示/隐藏教师功能按钮
- 管理备课模式切换
- 处理节点选择事件
- 协调各组件交互

#### 接口设计

```javascript
class TeacherUIController {
  /**
   * 初始化教师界面
   */
  initialize() {}
  
  /**
   * 切换备课模式
   * @param {boolean} enabled - 是否启用备课模式
   */
  toggleTeacherMode(enabled) {}
  
  /**
   * 显示教师功能按钮
   */
  showTeacherControls() {}
  
  /**
   * 隐藏教师功能按钮
   */
  hideTeacherControls() {}
  
  /**
   * 处理节点选择
   * @param {Object} node - 选中的节点
   */
  onNodeSelected(node) {}
  
  /**
   * 打开节点编辑器
   * @param {Object|null} node - 要编辑的节点
   */
  openNodeEditor(node = null) {}
  
  /**
   * 打开教案生成器
   * @param {Object} node - 节点数据
   */
  openLessonPlanGenerator(node) {}
}
```

### 7. LessonPlanExporter (教案导出器)

扩展现有ExportManager，添加教案导出功能。

#### 接口设计

```javascript
class LessonPlanExporter {
  /**
   * 导出为Markdown
   * @param {Object} lessonPlan - 教案对象
   * @returns {string} Markdown文本
   */
  exportToMarkdown(lessonPlan) {}
  
  /**
   * 导出为PDF
   * @param {Object} lessonPlan - 教案对象
   * @returns {Promise<Blob>} PDF文件
   */
  async exportToPDF(lessonPlan) {}
  
  /**
   * 导出为HTML
   * @param {Object} lessonPlan - 教案对象
   * @returns {string} HTML文本
   */
  exportToHTML(lessonPlan) {}
  
  /**
   * 触发文件下载
   * @param {string} content - 文件内容
   * @param {string} filename - 文件名
   * @param {string} mimeType - MIME类型
   */
  downloadFile(content, filename, mimeType) {}
}
```

## 数据模型

### Node (节点) - 扩展现有模型

```javascript
{
  // 现有字段
  id: string,                    // 节点ID
  name: string,                  // 中文名称
  nameEn: string,                // 英文名称
  description: string,           // 描述
  domains: string[],             // 所属领域
  traditionalChapter: string,    // 传统章节
  difficulty: number,            // 难度 (1-5)
  prerequisites: string[],       // 前置节点ID
  relatedSkills: string[],       // 相关技能
  formula: string,               // LaTeX公式
  keywords: string[],            // 关键词
  importance: number,            // 重要性 (1-5)
  estimatedStudyTime: number,    // 预计学习时间（分钟）
  
  // 新增字段（可选）
  createdBy: string,             // 创建者用户名
  createdAt: timestamp,          // 创建时间
  lastModifiedBy: string,        // 最后修改者
  lastModifiedAt: timestamp,     // 最后修改时间
  version: number                // 版本号
}
```

### LessonPlan (教案)

```javascript
{
  metadata: {
    title: string,
    nodeId: string,
    nodeName: string,
    generatedDate: string,
    generatedBy: string,
    difficulty: number,
    importance: number,
    estimatedHours: number
  },
  sections: [
    {
      title: string,
      content: string,
      order: number
    }
  ],
  footer: {
    generator: 'Knowledge Graph System - Teacher Edition',
    version: '1.0.0'
  }
}
```

## 用户界面设计

### 教师模式切换

在header中添加备课模式开关：

```html
<div class="teacher-mode-toggle">
  <label>
    <input type="checkbox" id="teacherModeSwitch">
    <span>备课模式</span>
  </label>
</div>
```

### 节点编辑器界面

模态对话框形式，包含以下部分：

1. **基本信息**
   - 中文名称（必填）
   - 英文名称（必填）
   - 所属领域（多选，必填）
   - 难度等级（1-5滑块）
   - 重要性（1-5滑块）

2. **内容编辑**
   - 描述（多行文本框，必填）
   - LaTeX公式（带实时预览）
   - 关键词（标签输入）

3. **关系设置**
   - 前置节点选择器（多选下拉框）
   - 相关技能选择器

4. **学习信息**
   - 预计学习时间（数字输入，分钟）

5. **操作按钮**
   - 保存
   - 取消
   - 预览

### 教案查看器界面

全屏模态对话框，包含：

1. **工具栏**
   - 编辑按钮
   - 导出按钮（Markdown/PDF/HTML）
   - 关闭按钮

2. **教案内容区**
   - 元数据显示
   - 各章节内容
   - 页脚信息

3. **侧边栏**
   - 目录导航
   - 模板选择

## 数据流

### 节点创建流程

```
用户点击"添加节点" 
  → TeacherUIController.openNodeEditor(null)
  → NodeEditor.open(null) 显示空表单
  → 用户填写表单
  → 用户点击"保存"
  → NodeEditor.validate() 验证数据
  → NodeEditor.getFormData() 获取表单数据
  → NodeDataManager.createNode(data) 创建节点
  → NodeDataManager.generateNodeId() 生成ID
  → NodeDataManager.saveNodes() 保存到JSON
  → NodeDataManager.createBackup() 创建备份
  → Graph_Visualizer 刷新显示
  → 显示成功提示
```

### 节点编辑流程

```
用户点击节点 
  → Graph_Visualizer 高亮节点
  → TeacherUIController.onNodeSelected(node)
  → 显示"编辑节点"按钮
  → 用户点击"编辑节点"
  → TeacherUIController.openNodeEditor(node)
  → NodeEditor.open(node) 预填充表单
  → 用户修改表单
  → 用户点击"保存"
  → NodeEditor.validate() 验证数据
  → NodeDataManager.updateNode(id, updates)
  → NodeDataManager.detectCircularDependency() 检测循环
  → NodeDataManager.saveNodes() 保存
  → NodeDataManager.createBackup() 备份
  → Graph_Visualizer 刷新
  → 显示成功提示
```

### 教案生成流程

```
用户选中节点
  → 用户点击"生成教案"
  → TeacherUIController.openLessonPlanGenerator(node)
  → LessonPlanGenerator.generate(node)
  → 收集节点数据
  → 应用默认模板或自定义模板
  → 生成教案对象
  → LessonPlanViewer 显示教案
  → 用户点击"导出"
  → 选择导出格式
  → LessonPlanExporter.exportTo[Format]()
  → 生成文件
  → 触发浏览器下载
```

## 错误处理

### 权限错误

```javascript
class PermissionError extends Error {
  constructor(message) {
    super(message);
    this.name = 'PermissionError';
  }
}

// 使用示例
if (!TeacherAuthManager.isTeacher()) {
  throw new PermissionError('只有教师可以编辑节点');
}
```

### 数据验证错误

```javascript
class ValidationError extends Error {
  constructor(message, errors) {
    super(message);
    this.name = 'ValidationError';
    this.errors = errors;  // 错误详情数组
  }
}

// 使用示例
const validation = NodeEditor.validate(formData);
if (!validation.valid) {
  throw new ValidationError('表单验证失败', validation.errors);
}
```

### 数据冲突错误

```javascript
class DataConflictError extends Error {
  constructor(message, conflictDetails) {
    super(message);
    this.name = 'DataConflictError';
    this.conflictDetails = conflictDetails;
  }
}

// 使用示例
if (detectConflict()) {
  throw new DataConflictError('数据已被其他用户修改', {
    nodeId: 'node-xxx',
    lastModified: timestamp
  });
}
```

## 性能考虑

### 数据加载优化

- 使用懒加载，仅在需要时加载完整节点数据
- 缓存已加载的节点数据
- 使用Web Worker处理大量数据操作

### UI响应优化

- 使用防抖处理表单输入事件
- LaTeX公式预览使用节流
- 大型教案生成使用异步处理并显示进度

### 数据保存优化

- 批量保存而非每次修改都保存
- 使用IndexedDB作为本地缓存
- 实现自动保存草稿功能

## 安全考虑

### 权限验证

- 所有数据修改操作前验证用户角色
- 使用HTTPS传输数据（生产环境）
- 实现操作日志记录

### 数据保护

- 定期自动备份
- 保留操作历史记录
- 实现数据恢复功能

### 输入验证

- 前端验证所有用户输入
- 防止XSS攻击（转义HTML）
- 防止LaTeX注入攻击

## 测试策略

### 单元测试

- TeacherAuthManager角色管理功能
- NodeDataManager CRUD操作
- LessonPlanGenerator教案生成逻辑
- 数据验证函数

### 集成测试

- 完整的节点创建流程
- 完整的节点编辑流程
- 完整的教案生成和导出流程
- 权限控制集成测试

### 用户测试

- 教师用户创建节点测试
- 教师用户编辑节点测试
- 教案生成和导出测试
- 学生用户权限隔离测试
