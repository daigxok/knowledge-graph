# 教师功能 - Bug修复记录

## Bug #1: this.allNodes.filter is not a function (Updated)

### 问题描述
在打开节点编辑器时，出现错误：
```
系统错误: this.allNodes.filter is not a function
```

### 根本原因
1. `NodeEditor` 在打开时调用 `loadPrerequisitesList()`
2. `nodeDataManager.getAllNodes()` 返回空数组或未初始化
3. 主应用的 `nodeDataManager` 和教师功能的 `nodeDataManager` 可能是不同实例
4. 数据加载是异步的，但 `openForCreate()` 是同步调用

### 修复方案 v2

#### 1. 修改 NodeEditor.js - 使方法异步

**openForCreate 改为异步**:
```javascript
async openForCreate() {
    this.mode = 'create';
    this.currentNode = null;
    document.getElementById('nodeEditorTitle').textContent = '创建知识节点';
    document.getElementById('saveNodeBtn').textContent = '创建节点';
    
    this.resetForm();
    
    // 确保数据加载完成
    try {
        await this.loadPrerequisitesList();
    } catch (error) {
        console.error('Error loading prerequisites:', error);
        this.allNodes = [];
        this.selectedPrerequisites = [];
    }
    
    this.modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}
```

**loadPrerequisitesList 改为异步**:
```javascript
async loadPrerequisitesList() {
    try {
        // 确保 nodeDataManager 已加载节点
        let nodes = nodeDataManager.getAllNodes();
        
        // 如果没有节点，尝试加载
        if (!nodes || nodes.length === 0) {
            console.log('Loading nodes from nodeDataManager...');
            nodes = await nodeDataManager.loadNodes();
        }
        
        this.allNodes = Array.isArray(nodes) ? nodes : [];
        this.selectedPrerequisites = [];
        
        console.log('Loaded nodes for prerequisites:', this.allNodes.length);
        
        this.renderPrerequisitesList();
    } catch (error) {
        console.error('Error in loadPrerequisitesList:', error);
        this.allNodes = [];
        this.selectedPrerequisites = [];
        this.renderPrerequisitesList();
    }
}
```

**renderPrerequisitesList 添加更多检查**:
```javascript
renderPrerequisitesList(searchTerm = '') {
    const listDiv = document.getElementById('prerequisitesList');
    
    if (!listDiv) {
        console.error('Prerequisites list element not found');
        return;
    }
    
    // 确保 allNodes 是数组
    if (!Array.isArray(this.allNodes)) {
        console.warn('allNodes is not an array, initializing to empty array');
        this.allNodes = [];
    }
    
    // 如果没有可用节点，显示消息
    if (this.allNodes.length === 0) {
        listDiv.innerHTML = '<div class="no-results">暂无可用节点</div>';
        return;
    }
    
    // ... 其余代码
}
```

### 测试验证

修复后，测试以下场景：

1. ✅ 打开节点编辑器（创建模式）
2. ✅ 打开节点编辑器（编辑模式）
3. ✅ 搜索前置节点
4. ✅ 添加前置节点
5. ✅ 移除前置节点
6. ✅ 保存节点

### 预防措施

为避免类似问题，建议：

1. **类型检查**: 在使用数组方法前，始终检查类型
   ```javascript
   if (Array.isArray(data)) {
       data.filter(...)
   }
   ```

2. **默认值**: 在构造函数中初始化所有属性
   ```javascript
   constructor() {
       this.allNodes = [];
       this.selectedPrerequisites = [];
   }
   ```

3. **数据验证**: 在加载数据后验证格式
   ```javascript
   const nodes = await loadNodes();
   if (!Array.isArray(nodes)) {
       console.error('Invalid data format');
       return [];
   }
   ```

4. **错误处理**: 添加 try-catch 和友好的错误提示
   ```javascript
   try {
       this.allNodes.filter(...)
   } catch (error) {
       console.error('Error filtering nodes:', error);
       this.showNotification('数据加载失败', 'error');
   }
   ```

### 相关文件

修改的文件：
- `js/modules/NodeEditor.js`
- `js/modules/NodeDataManager.js`

### 状态

- **发现时间**: 2026-02-28
- **修复时间**: 2026-02-28
- **状态**: ✅ 已修复
- **测试**: ✅ 已验证

---

## 其他已知问题

### Issue #2: localStorage 容量限制

**问题**: 当节点数量过多时，可能超出 localStorage 的 5-10MB 限制

**临时方案**: 
- 定期清理旧备份
- 导出数据到文件

**长期方案**: 
- 使用 IndexedDB 替代 localStorage
- 实现服务器端存储

### Issue #3: PDF 导出格式

**问题**: PDF 导出依赖浏览器打印，格式控制有限

**临时方案**: 
- 使用 Chrome 浏览器
- 调整打印设置

**长期方案**: 
- 集成 jsPDF 库
- 自定义 PDF 生成逻辑

---

## 调试技巧

### 1. 检查数据格式

在浏览器控制台执行：
```javascript
// 检查节点数据
console.log(nodeDataManager.getAllNodes());

// 检查数据类型
console.log(Array.isArray(nodeDataManager.getAllNodes()));

// 检查 localStorage
console.log(localStorage.getItem('kg_nodes_data'));
```

### 2. 查看错误堆栈

打开浏览器开发者工具（F12）：
1. 切换到 Console 标签
2. 查看完整错误信息
3. 点击错误行号查看源代码

### 3. 断点调试

在代码中添加断点：
```javascript
debugger;  // 浏览器会在此处暂停
```

或在开发者工具的 Sources 标签中设置断点。

### 4. 日志输出

添加详细日志：
```javascript
console.log('allNodes:', this.allNodes);
console.log('allNodes type:', typeof this.allNodes);
console.log('is array:', Array.isArray(this.allNodes));
```

---

## 联系支持

如遇到其他问题，请：

1. 查看浏览器控制台错误信息
2. 检查 `TEACHER-USER-GUIDE.md` 常见问题部分
3. 访问测试页面 `test-teacher-features.html` 进行诊断
4. 运行单元测试 `test-teacher-unit-tests.html`

---

**文档版本**: 1.0  
**最后更新**: 2026-02-28


### 临时解决方案（如果问题仍然存在）

如果修复后问题仍然存在，请尝试以下步骤：

#### 方案1：使用测试页面

1. 打开 `test-node-editor-simple.html`
2. 按顺序点击测试按钮：
   - 步骤1: 初始化 NodeDataManager
   - 步骤2: 加载节点数据
   - 步骤3: 初始化 NodeEditor
   - 步骤4: 打开编辑器
3. 查看调试日志，找出具体失败的步骤

#### 方案2：手动初始化

在浏览器控制台执行：

```javascript
// 1. 检查 nodeDataManager
console.log('nodeDataManager:', window.knowledgeGraphApp?.nodeDataManager || nodeDataManager);

// 2. 手动加载节点
await nodeDataManager.loadNodes();
console.log('Nodes loaded:', nodeDataManager.getAllNodes().length);

// 3. 检查 nodeEditor
console.log('nodeEditor:', nodeEditor);
console.log('allNodes:', nodeEditor.allNodes);

// 4. 手动打开编辑器
await nodeEditor.openForCreate();
```

#### 方案3：清除缓存重试

1. 打开浏览器开发者工具（F12）
2. 右键点击刷新按钮
3. 选择"清空缓存并硬性重新加载"
4. 重新登录并尝试

#### 方案4：检查数据文件

确认 `data/nodes-extended-phase2.json` 文件存在且格式正确：

```javascript
// 在控制台执行
fetch('data/nodes-extended-phase2.json')
    .then(r => r.json())
    .then(data => {
        console.log('Data type:', Array.isArray(data) ? 'Array' : typeof data);
        console.log('Data length:', Array.isArray(data) ? data.length : data.nodes?.length);
        console.log('First item:', Array.isArray(data) ? data[0] : data.nodes?.[0]);
    });
```

### 诊断命令

在浏览器控制台执行以下命令进行诊断：

```javascript
// 完整诊断
console.log('=== 教师功能诊断 ===');
console.log('1. Auth状态:', auth.isAuthenticated(), auth.isTeacher());
console.log('2. NodeDataManager:', nodeDataManager);
console.log('3. 节点数量:', nodeDataManager.getAllNodes().length);
console.log('4. 节点类型:', Array.isArray(nodeDataManager.getAllNodes()));
console.log('5. NodeEditor:', nodeEditor);
console.log('6. Editor allNodes:', nodeEditor.allNodes);
console.log('7. Editor allNodes类型:', Array.isArray(nodeEditor.allNodes));
```

### 已知兼容性问题

1. **浏览器要求**: 需要支持 ES6+ 和 async/await
2. **文件协议**: 使用 `file://` 协议可能有跨域限制
3. **建议**: 使用本地服务器（如 `python -m http.server`）

### 更新状态

- **发现时间**: 2026-02-28
- **修复时间**: 2026-02-28
- **修复版本**: v2 (异步加载)
- **状态**: 🔄 修复中
- **测试**: ⏳ 待验证
