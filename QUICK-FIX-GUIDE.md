# 教师功能快速修复指南

## 🐛 问题：点击"➕"按钮时出错

如果你看到错误：`this.allNodes.filter is not a function`

## ✅ 快速解决方案

### 方案1：刷新页面并重试（最简单）

1. **硬刷新页面**：
   - Windows: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`
2. 重新登录
3. 开启备课模式
4. 再次点击"➕"按钮

### 方案2：使用测试页面

1. 打开 `test-node-editor-simple.html`
2. 按顺序点击按钮：
   ```
   1. 初始化 NodeDataManager
   2. 加载节点数据
   3. 初始化 NodeEditor
   4. 打开编辑器
   ```
3. 查看哪一步失败

### 方案3：手动初始化（在控制台）

1. 打开浏览器开发者工具（按 `F12`）
2. 切换到 Console 标签
3. 复制粘贴以下代码并回车：

```javascript
// 手动加载节点数据
await nodeDataManager.loadNodes();
console.log('✅ 节点已加载:', nodeDataManager.getAllNodes().length);

// 重新打开编辑器
await nodeEditor.openForCreate();
console.log('✅ 编辑器已打开');
```

### 方案4：使用本地服务器

如果使用 `file://` 协议打开文件，可能有跨域问题。

**使用 Python 启动服务器**：
```bash
# 在项目目录下执行
python -m http.server 8000

# 然后在浏览器访问
http://localhost:8000/landing.html
```

**使用 Node.js**：
```bash
npx http-server

# 然后访问显示的地址
```

## 🔍 诊断步骤

### 1. 检查是否是教师账号

在控制台执行：
```javascript
console.log('是否教师:', auth.isTeacher());
console.log('用户角色:', auth.getUserRole());
```

应该显示：
```
是否教师: true
用户角色: teacher
```

### 2. 检查节点数据

在控制台执行：
```javascript
console.log('节点数量:', nodeDataManager.getAllNodes().length);
console.log('是否数组:', Array.isArray(nodeDataManager.getAllNodes()));
```

应该显示节点数量 > 0

### 3. 检查编辑器状态

在控制台执行：
```javascript
console.log('编辑器:', nodeEditor);
console.log('allNodes:', nodeEditor.allNodes);
console.log('是否数组:', Array.isArray(nodeEditor.allNodes));
```

## 📝 完整诊断脚本

复制以下代码到控制台，一次性检查所有问题：

```javascript
console.log('=== 🔍 教师功能诊断 ===\n');

// 1. 认证检查
console.log('1️⃣ 认证状态');
console.log('  - 已登录:', auth.isAuthenticated());
console.log('  - 是教师:', auth.isTeacher());
console.log('  - 角色:', auth.getUserRole());
console.log('');

// 2. 数据管理器检查
console.log('2️⃣ NodeDataManager');
console.log('  - 实例存在:', !!nodeDataManager);
console.log('  - 节点数量:', nodeDataManager.getAllNodes().length);
console.log('  - 是数组:', Array.isArray(nodeDataManager.getAllNodes()));
console.log('');

// 3. 编辑器检查
console.log('3️⃣ NodeEditor');
console.log('  - 实例存在:', !!nodeEditor);
console.log('  - allNodes:', nodeEditor.allNodes?.length || 0);
console.log('  - 是数组:', Array.isArray(nodeEditor.allNodes));
console.log('');

// 4. 数据文件检查
console.log('4️⃣ 数据文件');
fetch('data/nodes-extended-phase2.json')
    .then(r => r.json())
    .then(data => {
        const isArray = Array.isArray(data);
        const count = isArray ? data.length : (data.nodes?.length || 0);
        console.log('  - 文件格式:', isArray ? '数组' : '对象');
        console.log('  - 节点数量:', count);
        console.log('  - 第一个节点:', isArray ? data[0]?.name : data.nodes?.[0]?.name);
    })
    .catch(err => {
        console.error('  - ❌ 文件加载失败:', err.message);
    });

console.log('\n=== 诊断完成 ===');
```

## 🆘 如果还是不行

### 最后的手段：重新初始化

在控制台执行：

```javascript
// 1. 清除所有数据
localStorage.clear();
console.log('✅ 已清除 localStorage');

// 2. 刷新页面
location.reload();

// 3. 重新注册教师账号
// 4. 重新尝试
```

## 📞 获取帮助

如果以上方法都不行，请：

1. 截图错误信息
2. 复制控制台的完整诊断输出
3. 记录浏览器类型和版本
4. 查看 `TEACHER-FEATURES-BUGFIX.md` 获取更多信息

## 🎯 预防措施

为避免此问题，建议：

1. ✅ 使用本地服务器而不是 `file://` 协议
2. ✅ 使用现代浏览器（Chrome、Firefox、Edge）
3. ✅ 确保 JavaScript 已启用
4. ✅ 定期清除浏览器缓存

---

**更新时间**: 2026-02-28  
**适用版本**: v1.0
