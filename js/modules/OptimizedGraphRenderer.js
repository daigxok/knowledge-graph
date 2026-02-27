/**
 * OptimizedGraphRenderer - 优化的图谱渲染器
 * 支持虚拟化渲染、视口裁剪和性能优化
 * Task 18.2: 更新图谱渲染逻辑
 */

export class OptimizedGraphRenderer {
    constructor(d3VisualizationEngine) {
        this.visualizationEngine = d3VisualizationEngine;
        this.viewport = { x: 0, y: 0, width: 0, height: 0, scale: 1 };
        this.renderMode = 'full'; // 'full' | 'optimized' | 'minimal'
        this.nodeThreshold = 100; // 节点数超过此值时启用优化
        this.edgeSimplificationThreshold = 100;
        this.visibleNodes = new Set();
        this.visibleEdges = new Set();
        this.lastFrameTime = 0;
        this.targetFPS = 60;
        this.frameInterval = 1000 / this.targetFPS;
    }

    /**
     * 渲染图谱（带优化）
     * @param {Array} nodes - 节点数组
     * @param {Array} edges - 边数组
     */
    render(nodes, edges) {
        const startTime = performance.now();
        
        // 根据节点数量选择渲染模式
        this.selectRenderMode(nodes.length);
        
        if (this.renderMode === 'optimized' || this.renderMode === 'minimal') {
            this.renderOptimized(nodes, edges);
        } else {
            this.renderFull(nodes, edges);
        }
        
        const renderTime = performance.now() - startTime;
        console.log(`🎨 Rendered ${nodes.length} nodes in ${renderTime.toFixed(2)}ms (mode: ${this.renderMode})`);
        
        // 检查性能
        this.checkPerformance(renderTime);
    }

    /**
     * 选择渲染模式
     * @param {number} nodeCount - 节点数量
     */
    selectRenderMode(nodeCount) {
        if (nodeCount <= this.nodeThreshold) {
            this.renderMode = 'full';
        } else if (nodeCount <= this.nodeThreshold * 2) {
            this.renderMode = 'optimized';
        } else {
            this.renderMode = 'minimal';
        }
        
        console.log(`📊 Render mode: ${this.renderMode} (${nodeCount} nodes)`);
    }

    /**
     * 完整渲染（所有节点和边）
     * @param {Array} nodes - 节点数组
     * @param {Array} edges - 边数组
     */
    renderFull(nodes, edges) {
        this.visualizationEngine.render(nodes, edges);
    }

    /**
     * 优化渲染（视口裁剪 + 边简化）
     * @param {Array} nodes - 节点数组
     * @param {Array} edges - 边数组
     */
    renderOptimized(nodes, edges) {
        // 更新视口
        this.updateViewport();
        
        // 视口裁剪：只渲染视口内的节点
        const visibleNodes = this.getVisibleNodes(nodes);
        this.visibleNodes = new Set(visibleNodes.map(n => n.id));
        
        // 边简化：只渲染连接可见节点的边
        const visibleEdges = this.getVisibleEdges(edges, this.visibleNodes);
        this.visibleEdges = new Set(visibleEdges.map(e => e.id));
        
        console.log(`👁️ Visible: ${visibleNodes.length}/${nodes.length} nodes, ${visibleEdges.length}/${edges.length} edges`);
        
        // 渲染可见元素
        this.visualizationEngine.render(visibleNodes, visibleEdges);
    }

    /**
     * 更新视口信息
     */
    updateViewport() {
        const svg = this.visualizationEngine.svg;
        if (!svg) return;
        
        const transform = this.visualizationEngine.currentTransform || { x: 0, y: 0, k: 1 };
        const container = svg.node().parentElement;
        
        this.viewport = {
            x: -transform.x / transform.k,
            y: -transform.y / transform.k,
            width: container.clientWidth / transform.k,
            height: container.clientHeight / transform.k,
            scale: transform.k
        };
    }

    /**
     * 获取视口内的节点
     * @param {Array} nodes - 所有节点
     * @returns {Array} 视口内的节点
     */
    getVisibleNodes(nodes) {
        const margin = 100; // 视口外边距，提前加载周边节点
        
        return nodes.filter(node => {
            if (!node.x || !node.y) return true; // 未定位的节点保留
            
            return (
                node.x >= this.viewport.x - margin &&
                node.x <= this.viewport.x + this.viewport.width + margin &&
                node.y >= this.viewport.y - margin &&
                node.y <= this.viewport.y + this.viewport.height + margin
            );
        });
    }

    /**
     * 获取可见的边
     * @param {Array} edges - 所有边
     * @param {Set} visibleNodeIds - 可见节点ID集合
     * @returns {Array} 可见的边
     */
    getVisibleEdges(edges, visibleNodeIds) {
        return edges.filter(edge => {
            const sourceId = typeof edge.source === 'object' ? edge.source.id : edge.source;
            const targetId = typeof edge.target === 'object' ? edge.target.id : edge.target;
            
            return visibleNodeIds.has(sourceId) && visibleNodeIds.has(targetId);
        });
    }

    /**
     * 检查渲染性能
     * @param {number} renderTime - 渲染时间（毫秒）
     */
    checkPerformance(renderTime) {
        const fps = 1000 / renderTime;
        
        if (fps < this.targetFPS * 0.8) {
            console.warn(`⚠️ Low FPS: ${fps.toFixed(1)} (target: ${this.targetFPS})`);
            
            // 自动降级渲染模式
            if (this.renderMode === 'full') {
                this.renderMode = 'optimized';
                console.log('🔄 Switched to optimized mode');
            } else if (this.renderMode === 'optimized') {
                this.renderMode = 'minimal';
                console.log('🔄 Switched to minimal mode');
            }
        }
    }

    /**
     * 节流渲染（限制帧率）
     * @param {Function} renderFn - 渲染函数
     */
    throttledRender(renderFn) {
        const now = performance.now();
        const elapsed = now - this.lastFrameTime;
        
        if (elapsed >= this.frameInterval) {
            this.lastFrameTime = now;
            renderFn();
        } else {
            // 延迟到下一帧
            requestAnimationFrame(() => this.throttledRender(renderFn));
        }
    }

    /**
     * 简化边的渲染（节点数>100时）
     * @param {Array} edges - 边数组
     * @returns {Array} 简化后的边
     */
    simplifyEdges(edges) {
        if (edges.length <= this.edgeSimplificationThreshold) {
            return edges;
        }
        
        // 只保留重要的边（prerequisite类型）
        const importantEdges = edges.filter(edge => edge.type === 'prerequisite');
        
        console.log(`🔧 Simplified edges: ${edges.length} → ${importantEdges.length}`);
        
        return importantEdges;
    }

    /**
     * 获取性能统计
     * @returns {Object}
     */
    getPerformanceStats() {
        return {
            renderMode: this.renderMode,
            visibleNodes: this.visibleNodes.size,
            visibleEdges: this.visibleEdges.size,
            viewport: this.viewport,
            targetFPS: this.targetFPS
        };
    }

    /**
     * 设置渲染质量
     * @param {string} quality - 'high' | 'medium' | 'low'
     */
    setRenderQuality(quality) {
        switch (quality) {
            case 'high':
                this.nodeThreshold = 150;
                this.targetFPS = 60;
                break;
            case 'medium':
                this.nodeThreshold = 100;
                this.targetFPS = 45;
                break;
            case 'low':
                this.nodeThreshold = 50;
                this.targetFPS = 30;
                break;
        }
        
        console.log(`🎨 Render quality set to: ${quality}`);
    }
}
