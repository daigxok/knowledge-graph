# Knowledge Graph System - API 参考文档

## 📚 目录

1. [DomainDataManager](#domaindatamanager)
2. [KnowledgeGraphEngine](#knowledgegraphengine)
3. [D3VisualizationEngine](#d3visualizationengine)
4. [FilterEngine](#filterengine)
5. [StateManager](#statemanager)
6. [UIController](#uicontroller)
7. [LearningPathFinder](#learningpathfinder)
8. [SkillIntegrationManager](#skillintegrationmanager)
9. [DataValidator](#datavalidator)
10. [Config](#config)

---

## DomainDataManager

管理5大学域的数据和元数据。

### 构造函数

```javascript
new DomainDataManager(domainData)
```

**参数**:
- `domainData` (Object) - 包含domains和traditionalChapters的对象

### 方法

#### getAllDomains()
获取所有学域。

```javascript
const domains = domainManager.getAllDomains();
// 返回: Array<Domain>
```

#### getDomainById(domainId)
根据ID获取学域。

```javascript
const domain = domainManager.getDomainById('domain-1');
// 返回: Domain | null
```

#### getScenariosByDomain(domainId)
获取学域的真实应用场景。

```javascript
const scenarios = domainManager.getScenariosByDomain('domain-1');
// 返回: Array<Scenario>
```

#### getAllChapters()
获取所有传统章节。

```javascript
const chapters = domainManager.getAllChapters();
// 返回: Array<Chapter>
```

#### getChapterById(chapterId)
根据ID获取章节。

```javascript
const chapter = domainManager.getChapterById('chapter-1');
// 返回: Chapter | null
```

#### getDomainsByChapter(chapterId)
获取章节所属的学域。

```javascript
const domains = domainManager.getDomainsByChapter('chapter-1');
// 返回: Array<string> (domain IDs)
```

#### getDomainColor(domainId)
获取学域的颜色。

```javascript
const color = domainManager.getDomainColor('domain-1');
// 返回: '#667eea'
```

#### getDomainIcon(domainId)
获取学域的图标。

```javascript
const icon = domainManager.getDomainIcon('domain-1');
// 返回: '📈'
```

---

## KnowledgeGraphEngine

管理知识图谱的图结构和关系。

### 构造函数

```javascript
new KnowledgeGraphEngine(nodes, edges)
```

**参数**:
- `nodes` (Array) - 知识节点数组
- `edges` (Array) - 边关系数组

### 方法

#### getAllNodes()
获取所有节点。

```javascript
const nodes = graphEngine.getAllNodes();
// 返回: Array<Node>
```

#### getAllEdges()
获取所有边。

```javascript
const edges = graphEngine.getAllEdges();
// 返回: Array<Edge>
```

#### getNode(nodeId)
根据ID获取节点。

```javascript
const node = graphEngine.getNode('node-limit-def');
// 返回: Node | null
```

#### getNeighbors(nodeId)
获取节点的邻接节点。

```javascript
const neighbors = graphEngine.getNeighbors('node-limit-def');
// 返回: Array<Node>
```

#### getEdgesBetween(nodeId1, nodeId2)
获取两个节点之间的边。

```javascript
const edges = graphEngine.getEdgesBetween('node-1', 'node-2');
// 返回: Array<Edge>
```

#### getCrossDomainLinks()
获取所有跨学域边。

```javascript
const crossDomainEdges = graphEngine.getCrossDomainLinks();
// 返回: Array<Edge>
```

#### getNodesByMultipleDomains()
获取属于多个学域的节点。

```javascript
const multiDomainNodes = graphEngine.getNodesByMultipleDomains();
// 返回: Array<Node>
```

#### addNode(node)
添加节点。

```javascript
graphEngine.addNode({
    id: 'node-new',
    name: '新节点',
    // ... 其他属性
});
```

#### removeNode(nodeId)
删除节点。

```javascript
graphEngine.removeNode('node-new');
```

#### addEdge(edge)
添加边。

```javascript
graphEngine.addEdge({
    id: 'edge-new',
    source: 'node-1',
    target: 'node-2',
    type: 'prerequisite',
    strength: 0.8
});
```

#### removeEdge(edgeId)
删除边。

```javascript
graphEngine.removeEdge('edge-new');
```

#### getPrerequisites(nodeId)
获取节点的前置知识。

```javascript
const prerequisites = graphEngine.getPrerequisites('node-derivative-def');
// 返回: Array<Node>
```

#### getDependents(nodeId)
获取依赖于该节点的节点。

```javascript
const dependents = graphEngine.getDependents('node-limit-def');
// 返回: Array<Node>
```

#### hasPath(startId, endId)
检查两个节点之间是否存在路径。

```javascript
const hasPath = graphEngine.hasPath('node-1', 'node-5');
// 返回: boolean
```

---

## D3VisualizationEngine

处理D3.js可视化和交互。

### 构造函数

```javascript
new D3VisualizationEngine(containerSelector, width, height)
```

**参数**:
- `containerSelector` (string) - 容器选择器 (e.g., '#graphCanvas')
- `width` (number) - 宽度
- `height` (number) - 高度

### 方法

#### render(nodes, edges)
渲染图谱。

```javascript
visualizationEngine.render(nodes, edges);
```

#### zoomIn()
放大视图。

```javascript
visualizationEngine.zoomIn();
```

#### zoomOut()
缩小视图。

```javascript
visualizationEngine.zoomOut();
```

#### resetView()
重置视图。

```javascript
visualizationEngine.resetView();
```

#### fitToView()
适应视图。

```javascript
visualizationEngine.fitToView();
```

#### highlightNodes(nodeIds)
高亮节点。

```javascript
visualizationEngine.highlightNodes(['node-1', 'node-2']);
```

#### fadeNonRelated(nodeId)
淡化无关节点。

```javascript
visualizationEngine.fadeNonRelated('node-1');
```

#### clearHighlights()
清除所有高亮。

```javascript
visualizationEngine.clearHighlights();
```

#### highlightPath(path)
高亮学习路径。

```javascript
visualizationEngine.highlightPath(learningPath.steps);
```

#### resize(width, height)
调整大小。

```javascript
visualizationEngine.resize(800, 600);
```

#### onNodeClick(callback)
注册节点点击处理器。

```javascript
visualizationEngine.onNodeClick((node) => {
    console.log('Clicked node:', node);
});
```

#### onNodeHover(callback)
注册节点悬停处理器。

```javascript
visualizationEngine.onNodeHover((node, event) => {
    if (node) {
        console.log('Hovering over:', node);
    }
});
```

---

## FilterEngine

处理多维度过滤。

### 构造函数

```javascript
new FilterEngine(graphEngine)
```

**参数**:
- `graphEngine` (KnowledgeGraphEngine) - 知识图谱引擎实例

### 方法

#### filterByDomain(domainIds)
按学域过滤。

```javascript
const nodes = filterEngine.filterByDomain(['domain-1', 'domain-2']);
// 返回: Array<Node>
```

#### filterByChapter(chapterIds)
按章节过滤。

```javascript
const nodes = filterEngine.filterByChapter(['chapter-1']);
// 返回: Array<Node>
```

#### filterByDifficulty(minDiff, maxDiff)
按难度过滤。

```javascript
const nodes = filterEngine.filterByDifficulty(1, 3);
// 返回: Array<Node>
```

#### filterByKeyword(keyword)
按关键词过滤。

```javascript
const nodes = filterEngine.filterByKeyword('极限');
// 返回: Array<Node>
```

#### applyFilters(filters)
应用多个过滤器。

```javascript
const nodes = filterEngine.applyFilters({
    domains: ['domain-1'],
    chapters: ['chapter-1'],
    difficultyRange: [1, 3],
    searchKeyword: '极限',
    showCrossDomainOnly: false
});
// 返回: Array<Node>
```

#### clearFilters()
清除所有过滤器。

```javascript
filterEngine.clearFilters();
```

#### getActiveFilters()
获取当前活跃的过滤器。

```javascript
const filters = filterEngine.getActiveFilters();
// 返回: Object
```

#### setActiveFilters(filters)
设置活跃的过滤器。

```javascript
filterEngine.setActiveFilters({
    domains: ['domain-1']
});
```

#### getFilteredEdges(visibleNodes)
获取过滤后的边。

```javascript
const edges = filterEngine.getFilteredEdges(visibleNodes);
// 返回: Array<Edge>
```

---

## StateManager

管理应用状态和用户偏好。

### 构造函数

```javascript
new StateManager()
```

### 方法

#### getState()
获取当前状态。

```javascript
const state = stateManager.getState();
// 返回: Object
```

#### setState(newState)
设置状态。

```javascript
stateManager.setState({
    currentView: { zoomLevel: 1.5 }
});
```

#### resetState()
重置状态。

```javascript
stateManager.resetState();
```

#### saveToLocalStorage()
保存到localStorage。

```javascript
stateManager.saveToLocalStorage();
```

#### loadFromLocalStorage()
从localStorage加载。

```javascript
const state = stateManager.loadFromLocalStorage();
// 返回: Object | null
```

#### markNodeAsCompleted(nodeId)
标记节点为已完成。

```javascript
stateManager.markNodeAsCompleted('node-limit-def');
```

#### getCompletedNodes()
获取已完成的节点。

```javascript
const completed = stateManager.getCompletedNodes();
// 返回: Array<string> (node IDs)
```

#### getProgress()
获取学习进度。

```javascript
const progress = stateManager.getProgress();
// 返回: { completedCount, studyTime, currentPath }
```

#### updateStudyTime(seconds)
更新学习时间。

```javascript
stateManager.updateStudyTime(300); // 5分钟
```

#### setCurrentPath(pathId)
设置当前学习路径。

```javascript
stateManager.setCurrentPath('path-123');
```

#### updateView(viewState)
更新视图状态。

```javascript
stateManager.updateView({
    zoomLevel: 1.5,
    selectedNodeId: 'node-1'
});
```

#### updateFilters(filters)
更新过滤器。

```javascript
stateManager.updateFilters({
    domains: ['domain-1']
});
```

#### updatePreferences(preferences)
更新用户偏好。

```javascript
stateManager.updatePreferences({
    theme: 'dark',
    showLabels: true
});
```

#### exportState()
导出状态为JSON。

```javascript
const json = stateManager.exportState();
// 返回: string (JSON)
```

#### importState(stateJSON)
从JSON导入状态。

```javascript
stateManager.importState(jsonString);
```

---

## UIController

协调所有UI组件和交互。

### 构造函数

```javascript
new UIController(components)
```

**参数**:
- `components` (Object) - 包含所有模块实例的对象

### 方法

#### showNotification(message, type)
显示通知。

```javascript
uiController.showNotification('操作成功', 'success');
// type: 'success', 'error', 'info'
```

#### updateStats(stats)
更新统计信息。

```javascript
uiController.updateStats({
    totalNodes: 25,
    completedNodes: 5
});
```

#### showDetailPanel()
显示详情面板。

```javascript
uiController.showDetailPanel();
```

#### hideDetailPanel()
隐藏详情面板。

```javascript
uiController.hideDetailPanel();
```

#### clearAllFilters()
清除所有过滤器。

```javascript
uiController.clearAllFilters();
```

#### toggleCrossDomainView()
切换跨学域视图。

```javascript
uiController.toggleCrossDomainView();
```

---

## LearningPathFinder

生成推荐的学习路径。

### 构造函数

```javascript
new LearningPathFinder(graphEngine)
```

**参数**:
- `graphEngine` (KnowledgeGraphEngine) - 知识图谱引擎实例

### 方法

#### generatePath(targetNodeId, currentKnowledge)
生成学习路径。

```javascript
const path = learningPathFinder.generatePath('node-derivative-def', []);
// 返回: LearningPath
```

**返回值**:
```javascript
{
    id: 'path-123',
    targetNode: 'node-derivative-def',
    steps: [
        {
            node: Node,
            order: 1,
            reason: '基础知识',
            estimatedTime: 45
        },
        // ...
    ],
    totalTime: 300,
    difficulty: 3.5,
    domains: ['domain-1']
}
```

#### generateDomainPath(domainId)
生成学域学习路径。

```javascript
const path = learningPathFinder.generateDomainPath('domain-1');
// 返回: LearningPath
```

#### findAlternativePaths(targetNodeId, count)
查找替代路径。

```javascript
const paths = learningPathFinder.findAlternativePaths('node-derivative-def', 3);
// 返回: Array<LearningPath>
```

#### getPathDifficulty(path)
获取路径难度。

```javascript
const difficulty = learningPathFinder.getPathDifficulty(path);
// 返回: number (1-5)
```

#### getPathEstimatedTime(path)
获取路径预计时间。

```javascript
const time = learningPathFinder.getPathEstimatedTime(path);
// 返回: number (分钟)
```

---

## SkillIntegrationManager

管理与higher_math_skills系统的集成。

### 构造函数

```javascript
new SkillIntegrationManager(skillRegistryPath)
```

**参数**:
- `skillRegistryPath` (string, optional) - Skill注册表路径

### 方法

#### loadSkillRegistry()
加载Skill注册表。

```javascript
await skillManager.loadSkillRegistry();
```

#### getSkillsByNode(nodeId)
获取节点相关的Skill。

```javascript
const skills = skillManager.getSkillsByNode('node-limit-def');
// 返回: Array<Skill>
```

#### getSkillsByDomain(domainId)
获取学域相关的Skill。

```javascript
const skills = skillManager.getSkillsByDomain('domain-1');
// 返回: Array<Skill>
```

#### activateSkill(skillId, container)
激活Skill。

```javascript
await skillManager.activateSkill('gradient-visualization-skill', containerElement);
```

#### deactivateSkill(skillId)
停用Skill。

```javascript
skillManager.deactivateSkill('gradient-visualization-skill');
```

#### getSkillInfo(skillId)
获取Skill信息。

```javascript
const info = skillManager.getSkillInfo('gradient-visualization-skill');
// 返回: Skill | null
```

#### isSkillAvailable(skillId)
检查Skill是否可用。

```javascript
const available = skillManager.isSkillAvailable('gradient-visualization-skill');
// 返回: boolean
```

#### getAllSkills()
获取所有Skill。

```javascript
const skills = skillManager.getAllSkills();
// 返回: Array<Skill>
```

#### getSkillsByType(type)
按类型获取Skill。

```javascript
const skills = skillManager.getSkillsByType('visualization');
// 返回: Array<Skill>
// type: 'visualization', 'animation', 'interaction', 'application'
```

---

## DataValidator

验证数据完整性和一致性。

### 函数

#### validateDomainData(domain)
验证学域数据。

```javascript
try {
    validateDomainData(domain);
    console.log('Domain data is valid');
} catch (error) {
    console.error('Validation error:', error.message);
}
```

#### validateNodeData(node)
验证节点数据。

```javascript
try {
    validateNodeData(node);
    console.log('Node data is valid');
} catch (error) {
    console.error('Validation error:', error.message);
}
```

#### validateEdgeData(edge)
验证边数据。

```javascript
try {
    validateEdgeData(edge);
    console.log('Edge data is valid');
} catch (error) {
    console.error('Validation error:', error.message);
}
```

#### detectCircularPrerequisites(nodes)
检测循环前置知识。

```javascript
try {
    detectCircularPrerequisites(nodes);
    console.log('No circular prerequisites');
} catch (error) {
    console.error('Circular dependency:', error.message);
}
```

#### validateNodeReferences(nodes)
验证节点引用。

```javascript
try {
    validateNodeReferences(nodes);
    console.log('All references are valid');
} catch (error) {
    console.error('Invalid reference:', error.message);
}
```

#### validateGraphData(data)
验证完整的图数据。

```javascript
const result = validateGraphData({
    domains: domainsData,
    nodes: nodesData,
    edges: edgesData
});

if (result.success) {
    console.log('Validation passed:', result.stats);
} else {
    console.error('Validation failed:', result.errors);
}
```

---

## Config

配置管理系统。

### 函数

#### getConfig(path, defaultValue)
获取配置值。

```javascript
const chargeStrength = getConfig('visualization.forceSimulation.chargeStrength', -300);
```

#### setConfig(path, value)
设置配置值。

```javascript
setConfig('visualization.forceSimulation.chargeStrength', -400);
```

#### mergeConfig(customConfig)
合并配置。

```javascript
mergeConfig({
    visualization: {
        forceSimulation: {
            chargeStrength: -400
        }
    }
});
```

### 配置对象

```javascript
CONFIG = {
    data: {
        domains: './data/domains.json',
        nodes: './data/nodes.json',
        edges: './data/edges.json'
    },
    skills: {
        registryPath: '../../higher_math_skills/skill_registry.js',
        enabled: true,
        lazyLoad: true
    },
    visualization: {
        forceSimulation: {
            chargeStrength: -300,
            linkDistance: 100,
            linkStrength: 0.5,
            collisionRadius: 40,
            alphaDecay: 0.02,
            velocityDecay: 0.4
        },
        zoom: {
            minScale: 0.1,
            maxScale: 4,
            duration: 300
        }
    },
    ui: {
        sidebarWidth: 300,
        detailPanelWidth: 400,
        searchDebounceMs: 300,
        notificationDuration: 3000,
        animationDuration: 300
    },
    storage: {
        enabled: true,
        key: 'knowledgeGraphState',
        maxSize: 1048576,
        autoSave: true
    },
    performance: {
        enableVirtualization: false,
        enableCaching: true,
        cacheExpiry: 3600000,
        maxNodesForFullRender: 100
    },
    features: {
        crossDomainView: true,
        learningPath: true,
        skillIntegration: true,
        dataValidation: true,
        errorBoundary: true
    },
    logging: {
        enabled: true,
        level: 'info',
        logToConsole: true,
        logToStorage: false
    }
}
```

---

## 数据类型定义

### Domain
```javascript
{
    id: string,
    name: string,
    nameEn: string,
    coreIdea: string,
    description: string,
    integratedContent: string[],
    traditionalChapters: string[],
    typicalProblems: string[],
    realWorldScenarios: Scenario[],
    color: string,
    icon: string,
    keySkills: string[]
}
```

### Node
```javascript
{
    id: string,
    name: string,
    nameEn: string,
    description: string,
    domains: string[],
    traditionalChapter: string,
    difficulty: number (1-5),
    prerequisites: string[],
    relatedSkills: string[],
    formula: string,
    keywords: string[],
    importance: number (1-5),
    estimatedStudyTime: number
}
```

### Edge
```javascript
{
    id: string,
    source: string,
    target: string,
    type: 'prerequisite' | 'cross-domain',
    strength: number (0-1),
    description: string
}
```

### LearningPath
```javascript
{
    id: string,
    targetNode: string,
    steps: PathStep[],
    totalTime: number,
    difficulty: number,
    domains: string[]
}
```

### PathStep
```javascript
{
    node: Node,
    order: number,
    reason: string,
    estimatedTime: number
}
```

---

**版本**: 2.0.0  
**最后更新**: 2026年2月21日
