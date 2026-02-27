/**
 * NodeRelationshipHighlighter - 节点关系高亮器
 * 实现节点关系的可视化高亮
 * Task 18.4: 实现节点关系高亮
 */

export class NodeRelationshipHighlighter {
    constructor(visualizationEngine, graphEngine) {
        this.visualizationEngine = visualizationEngine;
        this.graphEngine = graphEngine;
        this.currentHighlightedNode = null;
        this.highlightedElements = new Set();
    }

    /**
     * 高亮节点及其关系
     * @param {string} nodeId - 节点ID
     * @param {Object} options - 高亮选项
     */
    highlightNode(nodeId, options = {}) {
        const {
            showPrerequisites = true,
            showSuccessors = true,
            showRelatedEdges = true,
            animationDuration = 300
        } = options;

        // 清除之前的高亮
        this.clearHighlight();

        const node = this.graphEngine.getNodeById(nodeId);
        if (!node) {
            console.warn(`Node ${nodeId} not found`);
            return;
        }

        this.currentHighlightedNode = nodeId;

        // 获取相关节点
        const prerequisites = showPrerequisites ? this.graphEngine.getPrerequisites(nodeId) : [];
        const successors = showSuccessors ? this.graphEngine.getSuccessors(nodeId) : [];
        const relatedEdges = showRelatedEdges ? this.graphEngine.getRelatedEdges(nodeId) : [];

        // 高亮当前节点
        this.highlightCurrentNode(nodeId, animationDuration);

        // 高亮前置节点
        if (showPrerequisites) {
            this.highlightPrerequisites(prerequisites, animationDuration);
        }

        // 高亮后续节点
        if (showSuccessors) {
            this.highlightSuccessors(successors, animationDuration);
        }

        // 高亮相关边
        if (showRelatedEdges) {
            this.highlightEdges(relatedEdges, animationDuration);
        }

        // 淡化其他节点
        this.dimOtherNodes(nodeId, prerequisites, successors, animationDuration);

        console.log(`✨ Highlighted node ${nodeId}:`, {
            prerequisites: prerequisites.length,
            successors: successors.length,
            edges: relatedEdges.length
        });
    }

    /**
     * 高亮当前节点
     */
    highlightCurrentNode(nodeId, duration) {
        const svg = this.visualizationEngine.svg;
        if (!svg) return;

        const nodeElement = svg.select(`[data-node-id="${nodeId}"]`);
        if (nodeElement.empty()) return;

        nodeElement
            .transition()
            .duration(duration)
            .attr('r', 12)
            .style('stroke', '#ff6b6b')
            .style('stroke-width', 4)
            .style('filter', 'drop-shadow(0 0 8px rgba(255, 107, 107, 0.6))');

        this.highlightedElements.add(nodeId);
    }

    /**
     * 高亮前置节点（绿色）
     */
    highlightPrerequisites(prerequisites, duration) {
        const svg = this.visualizationEngine.svg;
        if (!svg) return;

        prerequisites.forEach(node => {
            const nodeElement = svg.select(`[data-node-id="${node.id}"]`);
            if (nodeElement.empty()) return;

            nodeElement
                .transition()
                .duration(duration)
                .attr('r', 10)
                .style('stroke', '#51cf66')
                .style('stroke-width', 3)
                .style('filter', 'drop-shadow(0 0 6px rgba(81, 207, 102, 0.5))');

            this.highlightedElements.add(node.id);
        });
    }

    /**
     * 高亮后续节点（蓝色）
     */
    highlightSuccessors(successors, duration) {
        const svg = this.visualizationEngine.svg;
        if (!svg) return;

        successors.forEach(node => {
            const nodeElement = svg.select(`[data-node-id="${node.id}"]`);
            if (nodeElement.empty()) return;

            nodeElement
                .transition()
                .duration(duration)
                .attr('r', 10)
                .style('stroke', '#4dabf7')
                .style('stroke-width', 3)
                .style('filter', 'drop-shadow(0 0 6px rgba(77, 171, 247, 0.5))');

            this.highlightedElements.add(node.id);
        });
    }

    /**
     * 高亮相关边
     */
    highlightEdges(edges, duration) {
        const svg = this.visualizationEngine.svg;
        if (!svg) return;

        edges.forEach(edge => {
            const edgeId = `${edge.source}-${edge.target}`;
            const edgeElement = svg.select(`[data-edge-id="${edgeId}"]`);
            if (edgeElement.empty()) return;

            // 根据边类型选择颜色
            let color = '#868e96';
            let width = 2;

            switch (edge.type) {
                case 'prerequisite':
                    color = '#51cf66';
                    width = 3;
                    break;
                case 'cross-domain':
                    color = '#ff6b6b';
                    width = 2.5;
                    break;
                case 'application':
                    color = '#4dabf7';
                    width = 2;
                    break;
            }

            edgeElement
                .transition()
                .duration(duration)
                .style('stroke', color)
                .style('stroke-width', width)
                .style('opacity', 1);

            this.highlightedElements.add(edgeId);
        });
    }

    /**
     * 淡化其他节点
     */
    dimOtherNodes(currentNodeId, prerequisites, successors, duration) {
        const svg = this.visualizationEngine.svg;
        if (!svg) return;

        const highlightedIds = new Set([
            currentNodeId,
            ...prerequisites.map(n => n.id),
            ...successors.map(n => n.id)
        ]);

        // 淡化所有未高亮的节点
        svg.selectAll('.node')
            .filter(function() {
                const nodeId = this.getAttribute('data-node-id');
                return !highlightedIds.has(nodeId);
            })
            .transition()
            .duration(duration)
            .style('opacity', 0.2);

        // 淡化所有未高亮的边
        svg.selectAll('.edge')
            .filter(function() {
                const edgeId = this.getAttribute('data-edge-id');
                return !Array.from(this.highlightedElements).includes(edgeId);
            })
            .transition()
            .duration(duration)
            .style('opacity', 0.1);
    }

    /**
     * 清除高亮
     */
    clearHighlight(duration = 300) {
        const svg = this.visualizationEngine.svg;
        if (!svg) return;

        // 恢复所有节点
        svg.selectAll('.node')
            .transition()
            .duration(duration)
            .attr('r', 8)
            .style('stroke-width', 2)
            .style('opacity', 1)
            .style('filter', 'none');

        // 恢复所有边
        svg.selectAll('.edge')
            .transition()
            .duration(duration)
            .style('stroke', '#dee2e6')
            .style('stroke-width', 1)
            .style('opacity', 0.6);

        this.highlightedElements.clear();
        this.currentHighlightedNode = null;

        console.log('🔄 Highlight cleared');
    }

    /**
     * 切换高亮
     */
    toggleHighlight(nodeId, options) {
        if (this.currentHighlightedNode === nodeId) {
            this.clearHighlight();
        } else {
            this.highlightNode(nodeId, options);
        }
    }

    /**
     * 高亮学习路径
     */
    highlightLearningPath(path, duration = 300) {
        this.clearHighlight();

        const svg = this.visualizationEngine.svg;
        if (!svg) return;

        // 高亮路径中的所有节点
        path.forEach((node, index) => {
            const nodeElement = svg.select(`[data-node-id="${node.id}"]`);
            if (nodeElement.empty()) return;

            // 根据在路径中的位置设置不同的颜色
            const progress = index / (path.length - 1);
            const color = this.interpolateColor('#51cf66', '#4dabf7', progress);

            nodeElement
                .transition()
                .duration(duration)
                .delay(index * 50)
                .attr('r', 10)
                .style('stroke', color)
                .style('stroke-width', 3)
                .style('filter', `drop-shadow(0 0 6px ${color})`);

            this.highlightedElements.add(node.id);
        });

        // 高亮路径中的边
        for (let i = 0; i < path.length - 1; i++) {
            const source = path[i].id;
            const target = path[i + 1].id;
            const edgeId = `${source}-${target}`;
            const edgeElement = svg.select(`[data-edge-id="${edgeId}"]`);

            if (!edgeElement.empty()) {
                edgeElement
                    .transition()
                    .duration(duration)
                    .delay(i * 50)
                    .style('stroke', '#4dabf7')
                    .style('stroke-width', 3)
                    .style('opacity', 1);

                this.highlightedElements.add(edgeId);
            }
        }

        // 淡化其他元素
        const pathNodeIds = new Set(path.map(n => n.id));
        svg.selectAll('.node')
            .filter(function() {
                const nodeId = this.getAttribute('data-node-id');
                return !pathNodeIds.has(nodeId);
            })
            .transition()
            .duration(duration)
            .style('opacity', 0.2);

        console.log(`✨ Highlighted learning path with ${path.length} nodes`);
    }

    /**
     * 颜色插值
     */
    interpolateColor(color1, color2, factor) {
        const c1 = this.hexToRgb(color1);
        const c2 = this.hexToRgb(color2);

        const r = Math.round(c1.r + (c2.r - c1.r) * factor);
        const g = Math.round(c1.g + (c2.g - c1.g) * factor);
        const b = Math.round(c1.b + (c2.b - c1.b) * factor);

        return `rgb(${r}, ${g}, ${b})`;
    }

    /**
     * 十六进制转RGB
     */
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    }

    /**
     * 获取当前高亮的节点
     */
    getCurrentHighlightedNode() {
        return this.currentHighlightedNode;
    }

    /**
     * 检查节点是否被高亮
     */
    isHighlighted(nodeId) {
        return this.highlightedElements.has(nodeId);
    }
}
