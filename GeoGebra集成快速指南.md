# GeoGebra集成快速指南

## 🚀 快速开始（5分钟）

### 步骤1: 引入GeoGebra资源

在 `index.html` 的 `<head>` 部分添加：

```html
<!-- GeoGebra API -->
<script src="https://www.geogebra.org/apps/deployggb.js"></script>

<!-- GeoGebra样式 -->
<link rel="stylesheet" href="styles/geogebra.css">
```

在 `<body>` 结束前添加：

```html
<!-- GeoGebra集成模块 -->
<script type="module" src="js/modules/GeoGebraIntegration.js"></script>
```

### 步骤2: 运行脚本添加GeoGebra链接

```bash
node scripts/add-geogebra-links.js
```

### 步骤3: 在节点详情面板中集成

修改 `js/modules/EnhancedNodeDetailPanel.js`，在节点详情中添加GeoGebra部分：

```javascript
import geogebraIntegration from './GeoGebraIntegration.js';

// 在renderNodeDetails方法中添加
renderNodeDetails(node) {
    const html = `
        <div class="node-details">
            <!-- 现有内容 -->
            
            <!-- 添加GeoGebra部分 -->
            ${geogebraIntegration.getButtonsHTML(node)}
        </div>
    `;
    return html;
}
```

### 步骤4: 测试

1. 打开浏览器
2. 点击任意有GeoGebra演示的节点
3. 点击"嵌入式查看"或"全屏模式"按钮
4. 查看GeoGebra演示

---

## 📝 创建GeoGebra演示文件

### 方法1: 使用GeoGebra在线工具

1. 访问 https://www.geogebra.org/classic
2. 创建你的数学演示
3. 点击"文件" → "分享"
4. 获取材料ID（URL中的字符串）
5. 更新 `scripts/add-geogebra-links.js` 中的materialId

### 方法2: 使用GeoGebra桌面版

1. 下载GeoGebra桌面版
2. 创建演示文件
3. 导出为.ggb文件
4. 上传到GeoGebra.org
5. 获取材料ID

---

## 🎨 推荐的GeoGebra演示

### 高优先级（必须创建）

#### 1. 导数的定义
- 显示函数曲线
- 显示割线
- 滑动条控制Δx
- 观察割线变为切线的过程

#### 2. 空间向量
- 三维坐标系
- 两个可拖动的向量
- 显示向量和、差、数量积、向量积
- 实时计算结果

#### 3. 球面
- 三维球面
- 可调节半径
- 显示与平面的交线
- 显示与直线的交点

### 中优先级（建议创建）

#### 4. 极限的定义
- 函数图像
- ε和δ的可视化
- 动态调整观察极限过程

#### 5. 泰勒级数
- 原函数和泰勒多项式
- 滑动条控制项数
- 观察逼近效果

---

## 💡 GeoGebra演示设计技巧

### 1. 使用滑动条
```
// 创建滑动条控制参数
a = Slider[-5, 5, 0.1]
```

### 2. 添加文字说明
```
// 添加动态文字
Text["斜率 = " + Slope[f], (1, 2)]
```

### 3. 使用颜色区分
- 主要对象：蓝色
- 辅助对象：灰色
- 结果对象：红色

### 4. 设置合适的视图
- 2D: 使用代数视图 + 图形视图
- 3D: 使用3D图形视图
- 隐藏不必要的工具栏

---

## 🔧 常见问题

### Q1: GeoGebra加载失败
**A**: 检查网络连接，确保可以访问geogebra.org

### Q2: 材料ID无效
**A**: 确保材料已公开分享，检查ID是否正确

### Q3: 嵌入式显示不正常
**A**: 检查容器大小，调整width和height参数

### Q4: 移动端显示问题
**A**: 使用响应式设计，设置width为100%

---

## 📊 当前集成状态

### 已完成
- ✅ GeoGebra集成模块
- ✅ 样式文件
- ✅ 批量添加脚本
- ✅ 文档和指南

### 待完成
- ⏳ 创建实际的GeoGebra演示文件
- ⏳ 获取真实的材料ID
- ⏳ 更新节点数据
- ⏳ 测试和优化

---

## 🎯 优先级节点列表

### 立即创建（前5个）
1. node-derivative-def - 导数的定义
2. node-spatial-vector - 空间向量
3. node-vector-dot-product - 向量数量积
4. node-sphere - 球面
5. node-plane-equation - 平面方程

### 第二批（6-10）
6. node-limit-def - 极限的定义
7. node-integral-def - 积分的定义
8. node-vector-cross-product - 向量向量积
9. node-quadric-surfaces - 二次曲面
10. node-space-curve - 空间曲线

---

## 📞 获取帮助

### GeoGebra资源
- 官网: https://www.geogebra.org/
- 教程: https://www.geogebra.org/m/tutorials
- 论坛: https://help.geogebra.org/
- API文档: https://wiki.geogebra.org/en/Reference:GeoGebra_Apps_API

### 项目文档
- 详细方案: GeoGebra集成优化方案.md
- 代码文档: js/modules/GeoGebraIntegration.js
- 样式文档: styles/geogebra.css

---

**版本**: 1.0  
**更新日期**: 2026年3月1日  
**状态**: 待实施

**下一步**: 开始创建GeoGebra演示文件！
