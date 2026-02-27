# 🔍 知识图谱系统诊断工具

## 快速诊断步骤

### 1️⃣ 清除缓存（必须！）
```
Windows: Ctrl + Shift + Delete
Mac: Cmd + Shift + Delete
```
选择：
- ✅ 缓存的图片和文件
- ✅ Cookie 和其他网站数据
- 时间范围：全部时间

### 2️⃣ 硬刷新页面
```
Windows: Ctrl + Shift + R 或 Ctrl + F5
Mac: Cmd + Shift + R
```

### 3️⃣ 打开开发者工具
```
按 F12 或右键 → 检查
```

### 4️⃣ 检查控制台

#### ✅ 正常状态应该看到：
```
✓ Data validation passed: 5 domains, XX nodes, XX edges
✓ Knowledge Graph System initialized successfully
✅ 知识图谱加载成功！
```

#### ❌ 不应该看到的错误：
```
❌ Cannot create property 'vx' on string
❌ Cannot read properties of null (reading 'message')
❌ TypeError: ...
```

## 测试文件

### 🧪 完整测试页面
打开：`knowledge-graph/test-complete-fix.html`

这个页面提供：
- ✅ D3 力导向图修复测试
- ✅ 错误处理器修复测试
- ✅ 完整系统集成测试
- 📊 实时统计和控制台输出

### 🎯 主系统页面
打开：`knowledge-graph/index.html`

## 常见问题诊断

### 问题 1: 图谱不显示
**症状**：页面空白或只有背景

**检查**：
1. 打开控制台（F12）
2. 查看是否有红色错误
3. 检查 Network 标签，确认所有文件都加载成功（状态码 200）

**解决**：
- 清除缓存并硬刷新
- 确认所有 JSON 文件存在
- 检查文件路径是否正确

### 问题 2: D3 错误
**症状**：控制台显示 "Cannot create property 'vx'"

**原因**：旧版本代码仍在缓存中

**解决**：
1. 完全清除浏览器缓存
2. 关闭所有标签页
3. 重新打开浏览器
4. 硬刷新页面

### 问题 3: 错误处理器崩溃
**症状**：控制台显示 "Cannot read properties of null"

**原因**：旧版本错误处理代码

**解决**：
- 确认 `main.js` 已更新
- 清除缓存
- 硬刷新

### 问题 4: 节点不可拖动
**症状**：无法拖动节点

**检查**：
1. 确认力导向模拟正在运行
2. 检查控制台是否有错误
3. 确认节点元素已正确创建

**解决**：
- 等待几秒让模拟稳定
- 刷新页面
- 检查 D3VisualizationEngine.js 是否正确

## 性能检查

### 预期性能指标
- 📊 初始加载时间：< 2 秒
- 🎨 渲染时间：< 1 秒
- 🖱️ 交互响应：< 100ms
- 💾 内存使用：< 100MB

### 检查方法
1. 打开 Performance 标签
2. 点击录制按钮
3. 刷新页面
4. 停止录制
5. 查看时间线

## 浏览器兼容性

### ✅ 完全支持
- Chrome 90+
- Edge 90+
- Firefox 88+
- Safari 14+

### ⚠️ 部分支持
- Chrome 80-89
- Firefox 80-87

### ❌ 不支持
- IE 11 及以下
- 旧版移动浏览器

## 数据验证

### 检查数据文件
```javascript
// 在控制台运行
fetch('./data/domains.json').then(r => r.json()).then(console.log)
fetch('./data/nodes.json').then(r => r.json()).then(console.log)
fetch('./data/edges.json').then(r => r.json()).then(console.log)
```

### 预期结果
- domains.json: 5 个领域
- nodes.json: 至少 20 个节点
- edges.json: 至少 15 条边

## 调试技巧

### 1. 查看全局对象
```javascript
// 在控制台运行
window.knowledgeGraphApp
```

### 2. 检查 D3 选择
```javascript
// 查看节点
d3.selectAll('.node').size()

// 查看边
d3.selectAll('.link').size()
```

### 3. 检查力导向模拟
```javascript
// 查看模拟状态
window.knowledgeGraphApp.visualizationEngine.simulation.alpha()
```

### 4. 手动触发渲染
```javascript
window.knowledgeGraphApp.renderGraph()
```

## 报告问题

如果问题仍然存在，请提供：

1. **浏览器信息**
   - 浏览器名称和版本
   - 操作系统

2. **控制台输出**
   - 完整的错误信息
   - 截图

3. **Network 标签**
   - 失败的请求
   - 状态码

4. **重现步骤**
   - 详细的操作步骤
   - 预期行为 vs 实际行为

## 快速修复命令

### 重置所有状态
```javascript
// 清除本地存储
localStorage.clear();

// 重新加载
location.reload(true);
```

### 强制重新初始化
```javascript
// 停止当前模拟
if (window.knowledgeGraphApp) {
    window.knowledgeGraphApp.visualizationEngine.simulation.stop();
}

// 重新加载页面
location.reload(true);
```

## 成功标志

### ✅ 系统正常运行的标志：
1. 控制台无红色错误
2. 图谱节点可见并动画
3. 节点可以拖动
4. 缩放和平移正常工作
5. 点击节点显示详情面板
6. 搜索功能正常
7. 筛选功能正常

### 📊 性能正常的标志：
1. 页面加载快速（< 2秒）
2. 动画流畅（60 FPS）
3. 交互响应迅速
4. 内存使用稳定

## 下一步

如果所有测试通过：
1. ✅ 系统已修复并可以使用
2. 📚 查看用户指南了解功能
3. 🎨 开始探索知识图谱

如果仍有问题：
1. 📧 收集诊断信息
2. 📝 详细描述问题
3. 🔍 寻求技术支持
