# Cytoscape.js 错误修复指南

## 错误信息
```
Uncaught TypeError: p.nodeName.toLowerCase is not a function
at content-all.js:11:35963
```

## 问题分析

这个错误通常发生在 Cytoscape.js 尝试访问 DOM 元素时，但收到了非 DOM 对象。

### 常见原因

1. **容器元素不存在** - Cytoscape 初始化时找不到指定的容器
2. **传递了错误的容器参数** - 传递了选择器字符串而不是 DOM 元素
3. **容器元素尚未加载** - 在 DOM 加载完成前初始化 Cytoscape
4. **多次初始化** - 在同一个容器上多次初始化 Cytoscape

---

## 解决方案

### 方案1：确保容器元素存在（最常见）

**检查代码**：
```javascript
// ❌ 错误：容器可能不存在
const cy = cytoscape({
    container: document.getElementById('cy')
});

// ✅ 正确：先检查容器是否存在
const container = document.getElementById('cy');
if (!container) {
    console.error('Cytoscape container not found!');
    return;
}

const cy = cytoscape({
    container: container
});
```

### 方案2：等待 DOM 加载完成

**检查代码**：
```javascript
// ❌ 错误：可能在 DOM 加载前执行
const cy = cytoscape({
    container: document.getElementById('cy')
});

// ✅ 正确：等待 DOM 加载
document.addEventListener('DOMContentLoaded', () => {
    const cy = cytoscape({
        container: document.getElementById('cy')
    });
});

// 或使用 window.onload
window.addEventListener('load', () => {
    const cy = cytoscape({
        container: document.getElementById('cy')
    });
});
```

### 方案3：使用正确的容器参数

**检查代码**：
```javascript
// ❌ 错误：传递选择器字符串
const cy = cytoscape({
    container: '#cy'  // 某些版本可能不支持
});

// ✅ 正确：传递 DOM 元素
const cy = cytoscape({
    container: document.getElementById('cy')
});

// 或使用 querySelector
const cy = cytoscape({
    container: document.querySelector('#cy')
});
```

### 方案4：避免多次初始化

**检查代码**：
```javascript
// ❌ 错误：可能多次初始化
function initGraph() {
    const cy = cytoscape({
        container: document.getElementById('cy')
    });
}
initGraph();
initGraph(); // 第二次调用会出错

// ✅ 正确：使用单例模式
let cy = null;

function initGraph() {
    if (cy) {
        console.log('Graph already initialized');
        return cy;
    }
    
    cy = cytoscape({
        container: document.getElementById('cy')
    });
    
    return cy;
}
```

---

## 针对本项目的修复

### 检查主应用文件

查找 Cytoscape 初始化代码，通常在：
- `index.html`
- `js/app.js`
- `js/main.js`
- `js/graph.js`

### 修复步骤

1. **找到 Cytoscape 初始化代码**

```javascript
// 搜索类似这样的代码
const cy = cytoscape({
    container: document.getElementById('cy'),
    // ... 其他配置
});
```

2. **添加容器检查**

```javascript
// 修改为
function initializeCytoscape() {
    // 检查容器是否存在
    const container = document.getElementById('cy');
    if (!container) {
        console.error('❌ Cytoscape container #cy not found!');
        console.log('Available elements:', document.body.innerHTML.substring(0, 200));
        return null;
    }
    
    console.log('✅ Cytoscape container found');
    
    try {
        const cy = cytoscape({
            container: container,
            // ... 其他配置
        });
        
        console.log('✅ Cytoscape initialized successfully');
        return cy;
        
    } catch (error) {
        console.error('❌ Cytoscape initialization failed:', error);
        return null;
    }
}

// 在 DOM 加载后初始化
document.addEventListener('DOMContentLoaded', () => {
    const cy = initializeCytoscape();
    if (cy) {
        // 继续其他初始化
    }
});
```

3. **确保 HTML 中有容器元素**

```html
<!-- 在 index.html 或主应用 HTML 中 -->
<div id="cy" style="width: 100%; height: 600px;"></div>
```

---

## 调试步骤

### 步骤1：检查容器元素

在浏览器控制台执行：

```javascript
// 检查容器是否存在
const container = document.getElementById('cy');
console.log('Container:', container);
console.log('Container type:', typeof container);
console.log('Is DOM element:', container instanceof HTMLElement);
```

**预期输出**：
```
Container: <div id="cy">...</div>
Container type: object
Is DOM element: true
```

### 步骤2：检查 DOM 加载时机

```javascript
// 检查 DOM 是否已加载
console.log('Document ready state:', document.readyState);
console.log('Body exists:', !!document.body);
console.log('Container exists:', !!document.getElementById('cy'));
```

### 步骤3：查看完整错误堆栈

在控制台中展开错误，查看完整的调用堆栈，找到触发错误的具体代码位置。

---

## 快速修复脚本

在浏览器控制台执行以下脚本进行诊断：

```javascript
// Cytoscape 错误诊断脚本
(function() {
    console.log('=== Cytoscape 错误诊断 ===\n');
    
    // 1. 检查 Cytoscape 是否加载
    console.log('1. Cytoscape 库:');
    console.log('   已加载:', typeof cytoscape !== 'undefined');
    
    // 2. 检查容器元素
    console.log('\n2. 容器元素:');
    const container = document.getElementById('cy');
    console.log('   #cy 存在:', !!container);
    
    if (container) {
        console.log('   类型:', container.constructor.name);
        console.log('   是否为 HTMLElement:', container instanceof HTMLElement);
        console.log('   尺寸:', {
            width: container.offsetWidth,
            height: container.offsetHeight
        });
    } else {
        console.log('   ❌ 容器不存在！');
        console.log('   可用的 ID 元素:', 
            Array.from(document.querySelectorAll('[id]'))
                .map(el => el.id)
                .slice(0, 10)
        );
    }
    
    // 3. 检查 DOM 状态
    console.log('\n3. DOM 状态:');
    console.log('   readyState:', document.readyState);
    console.log('   body 存在:', !!document.body);
    
    // 4. 检查现有 Cytoscape 实例
    console.log('\n4. Cytoscape 实例:');
    if (window.cy) {
        console.log('   全局 cy 存在:', true);
        console.log('   节点数:', window.cy.nodes().length);
        console.log('   边数:', window.cy.edges().length);
    } else {
        console.log('   全局 cy 不存在');
    }
    
    // 5. 建议
    console.log('\n5. 建议:');
    if (!container) {
        console.log('   ❌ 需要在 HTML 中添加 <div id="cy"></div>');
    } else if (container.offsetWidth === 0 || container.offsetHeight === 0) {
        console.log('   ⚠️ 容器尺寸为 0，需要设置 width 和 height');
    } else if (typeof cytoscape === 'undefined') {
        console.log('   ❌ Cytoscape 库未加载');
    } else {
        console.log('   ✅ 环境正常，可以初始化 Cytoscape');
    }
    
    console.log('\n=== 诊断完成 ===');
})();
```

---

## 预防措施

### 1. 使用防御性编程

```javascript
function safeCytoscapeInit(containerId, options = {}) {
    // 检查 Cytoscape 库
    if (typeof cytoscape === 'undefined') {
        console.error('Cytoscape library not loaded');
        return null;
    }
    
    // 检查容器
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container #${containerId} not found`);
        return null;
    }
    
    // 检查容器尺寸
    if (container.offsetWidth === 0 || container.offsetHeight === 0) {
        console.warn('Container has zero dimensions');
    }
    
    // 初始化
    try {
        return cytoscape({
            container: container,
            ...options
        });
    } catch (error) {
        console.error('Cytoscape initialization failed:', error);
        return null;
    }
}
```

### 2. 添加错误边界

```javascript
window.addEventListener('error', (event) => {
    if (event.message.includes('nodeName.toLowerCase')) {
        console.error('Cytoscape DOM error detected!');
        console.error('This usually means the container element is missing or invalid');
        event.preventDefault();
    }
});
```

### 3. 延迟初始化

```javascript
// 确保 DOM 完全加载
function initWhenReady() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCytoscape);
    } else {
        initCytoscape();
    }
}

function initCytoscape() {
    // 再次确认容器存在
    const container = document.getElementById('cy');
    if (!container) {
        console.error('Container still not found, retrying...');
        setTimeout(initCytoscape, 100);
        return;
    }
    
    // 初始化 Cytoscape
    const cy = cytoscape({
        container: container
    });
}
```

---

## 常见问题

### Q: 错误仍然出现怎么办？

A: 
1. 清除浏览器缓存
2. 检查是否有多个 Cytoscape 版本冲突
3. 查看完整的错误堆栈
4. 检查是否有其他 JavaScript 错误

### Q: 如何找到初始化 Cytoscape 的代码？

A: 在控制台搜索：
```javascript
// 搜索所有脚本中的 cytoscape 调用
Array.from(document.scripts).forEach(script => {
    if (script.src) console.log(script.src);
});
```

### Q: 容器存在但仍然报错？

A: 检查容器是否被正确传递：
```javascript
const container = document.getElementById('cy');
console.log('Container:', container);
console.log('nodeName:', container.nodeName); // 应该是 "DIV"
console.log('toLowerCase:', typeof container.nodeName.toLowerCase); // 应该是 "function"
```

---

## 总结

这个错误的核心原因是 Cytoscape 期望接收一个 DOM 元素，但收到了其他类型的值。

**关键检查点**：
1. ✅ 容器元素存在
2. ✅ DOM 已完全加载
3. ✅ 传递正确的参数类型
4. ✅ 避免多次初始化

**最佳实践**：
- 始终检查容器是否存在
- 在 DOMContentLoaded 后初始化
- 使用 try-catch 捕获错误
- 添加详细的日志输出

---

**文档版本**: 1.0.0  
**创建日期**: 2026-02-28  
**适用于**: Cytoscape.js 相关错误
