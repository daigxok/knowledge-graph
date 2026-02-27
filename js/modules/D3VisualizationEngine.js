/**
 * D3VisualizationEngine
 * Handles all D3.js visualization logic including force simulation, rendering, and interactions
 */

const BOUNDS_PADDING = 55;
const LAYOUT_PADDING = 70;

export class D3VisualizationEngine {
    constructor(containerSelector, width, height, options = {}) {
        this.container = d3.select(containerSelector);
        
        if (this.container.empty()) {
            throw new Error(`Container element not found: ${containerSelector}`);
        }
        
        this.width = width;
        this.height = height;
        /** @type {import('./DomainDataManager.js').DomainDataManager|null} */
        this.domainManager = options.domainManager || null;
        
        this.svg = null;
        this.g = null;
        this.simulation = null;
        this.nodeElements = null;
        this.linkElements = null;
        this.labelElements = null;
        
        this.zoomBehavior = null;
        this.currentZoom = 1;
        
        this.initialize();
    }

    /** 画布中心（用于力导向与布局） */
    _center() {
        return { x: this.width / 2, y: this.height / 2 };
    }

    /** 节点边界 [xMin, xMax, yMin, yMax] */
    _bounds() {
        return {
            xMin: BOUNDS_PADDING,
            xMax: this.width - BOUNDS_PADDING,
            yMin: BOUNDS_PADDING,
            yMax: this.height - BOUNDS_PADDING
        };
    }

    /**
     * Initialize SVG and force simulation
     */
    initialize() {
        // Validate container
        if (!this.container || this.container.empty()) {
            throw new Error('Container element is not available');
        }
        
        // Create SVG
        this.svg = this.container.append('svg')
            .attr('width', this.width)
            .attr('height', this.height);
        
        if (!this.svg || this.svg.empty()) {
            throw new Error('Failed to create SVG element');
        }
        
        // Create zoom behavior（缩放时更新标签可见性）
        this.zoomBehavior = d3.zoom()
            .scaleExtent([0.1, 4])
            .on('zoom', (event) => {
                this.g.attr('transform', event.transform);
                this.currentZoom = event.transform.k;
                this.g.classed('zoomed-out', this.currentZoom < 0.65);
            });
        
        this.svg.call(this.zoomBehavior);
        
        this.g = this.svg.append('g').attr('class', 'graph-content');
        
        // Create groups for links and nodes
        this.linkGroup = this.g.append('g').attr('class', 'links');
        this.nodeGroup = this.g.append('g').attr('class', 'nodes');
        
        // Setup force simulation
        this.setupForceSimulation();
    }

    /**
     * Setup D3 force simulation（避免节点散开、飞出画布；无连线的节点也被拉向中心）
     */
    setupForceSimulation() {
        const c = this._center();
        this.simulation = d3.forceSimulation()
            .force('charge', d3.forceManyBody().strength(-180))
            .force('link', d3.forceLink().id(d => d.id).distance(72).strength(0.65))
            .force('center', d3.forceCenter(c.x, c.y).strength(0.2))
            .force('x', d3.forceX(c.x).strength(0.08))
            .force('y', d3.forceY(c.y).strength(0.08))
            .force('collision', d3.forceCollide().radius(d => this.getNodeRadius(d) + 4))
            .alphaDecay(0.03)
            .velocityDecay(0.4);
    }

    /**
     * 节点显示半径（与渲染用 r 一致）
     * @param {Object} node - Node object
     * @returns {number}
     */
    getNodeRadius(node) {
        return 8 + (node.importance || 3) * 2;
    }

    /**
     * Render the graph
     * @param {Array} nodes - Array of node objects
     * @param {Array} edges - Array of edge objects
     */
    render(nodes, edges) {
        // Clear existing elements
        this.linkGroup.selectAll('*').remove();
        this.nodeGroup.selectAll('*').remove();
        
        // CRITICAL FIX: Create a deep copy of nodes and edges to avoid mutation
        const nodesCopy = nodes.map(n => ({...n}));
        const edgesCopy = edges.map(e => ({...e}));
        
        // 按学域聚类初始布局，并将学域锚点写入节点（供力导向拉回离散节点）
        this._assignInitialPositionsByDomain(nodesCopy);
        nodesCopy.forEach(n => {
            n.domainAnchorX = n.x;
            n.domainAnchorY = n.y;
        });
        
        // Create a node lookup map for edge resolution
        const nodeMap = new Map(nodesCopy.map(n => [n.id, n]));
        
        // CRITICAL FIX: Convert edge source/target from string IDs to node object references
        // This is required by D3's force simulation
        edgesCopy.forEach(edge => {
            if (typeof edge.source === 'string') {
                edge.source = nodeMap.get(edge.source);
            }
            if (typeof edge.target === 'string') {
                edge.target = nodeMap.get(edge.target);
            }
            
            // Validate edge references
            if (!edge.source || !edge.target) {
                console.warn('Invalid edge reference:', edge);
            }
        });
        
        // Filter out invalid edges
        const validEdges = edgesCopy.filter(e => e.source && e.target);
        
        // Create links
        this.linkElements = this.linkGroup.selectAll('line')
            .data(validEdges)
            .enter()
            .append('line')
            .attr('class', d => `link ${d.type}`)
            .attr('stroke-width', d => Math.sqrt(d.strength * 3));
        
        // 节点类型标签（用于图谱图例与样式）
        const typeLabels = { concept: '概念', theorem: '定理', method: '方法', application: '应用' };
        // Create nodes（按类型加 node-type-*，有 relatedSkills 的节点加 has-skills）
        const nodeGroups = this.nodeGroup.selectAll('g')
            .data(nodesCopy)
            .enter()
            .append('g')
            .attr('class', d => {
                const type = d.type || 'concept';
                const hasSkills = d.relatedSkills && d.relatedSkills.length > 0;
                const parts = ['node', `node-type-${type}`];
                if (hasSkills) parts.push('has-skills');
                return parts.join(' ');
            })
            .attr('data-node-type', d => d.type || 'concept')
            .call(this.enableDrag());
        
        // Add circles to nodes（填充仍按学域，描边在 CSS 中按类型区分）
        nodeGroups.append('circle')
            .attr('r', d => this.getNodeRadius(d))
            .attr('fill', d => this.getNodeColor(d))
            .attr('stroke-width', 2);
        
        // Add labels to nodes
        nodeGroups.append('text')
            .attr('class', 'node-label')
            .attr('dy', -15)
            .text(d => d.name)
            .style('font-size', '12px')
            .style('text-anchor', 'middle');
        
        // 节点类型角标：在节点下方显示类型短标签，便于图谱上快速识别
        nodeGroups.append('text')
            .attr('class', 'node-type-badge')
            .attr('dy', 20)
            .attr('y', 0)
            .text(d => typeLabels[d.type || 'concept'] || '概念')
            .style('font-size', '9px')
            .style('text-anchor', 'middle')
            .style('pointer-events', 'none');
        
        // Skills 角标：有 relatedSkills 的节点显示小徽章
        nodeGroups.filter(d => d.relatedSkills && d.relatedSkills.length > 0)
            .append('text')
            .attr('class', 'node-skills-badge')
            .attr('dy', 32)
            .attr('y', 0)
            .text(d => `🎯${d.relatedSkills.length}`)
            .style('font-size', '10px')
            .style('text-anchor', 'middle')
            .style('pointer-events', 'none');
        
        this.nodeElements = nodeGroups;
        
        // Update simulation - set nodes first
        this.simulation.nodes(nodesCopy);
        
        // Get the link force and set links
        const linkForce = this.simulation.force('link');
        if (linkForce) {
            linkForce.links(validEdges);
        }
        
        // 将离散节点拉回学域簇：用节点学域锚点作为 forceX/forceY 目标
        const c = this._center();
        this.simulation.force('x', d3.forceX(d => (d.domainAnchorX != null ? d.domainAnchorX : c.x)).strength(0.06));
        this.simulation.force('y', d3.forceY(d => (d.domainAnchorY != null ? d.domainAnchorY : c.y)).strength(0.06));
        
        // Set tick handler
        this.simulation.on('tick', () => this.ticked());
        
        // Restart simulation
        this.simulation.alpha(1).restart();
    }

    /**
     * Get node color based on domain (from DomainDataManager when available)
     * @param {Object} node - Node object
     * @returns {string} Color hex code
     */
    getNodeColor(node) {
        if (node.domains && node.domains.length > 0) {
            const domainId = node.domains[0];
            if (this.domainManager && typeof this.domainManager.getDomainColor === 'function') {
                return this.domainManager.getDomainColor(domainId);
            }
            const fallback = {
                'domain-1': '#667eea', 'domain-2': '#f093fb', 'domain-3': '#4facfe',
                'domain-4': '#fa709a', 'domain-5': '#00f2fe'
            };
            return fallback[domainId] || '#999999';
        }
        return '#999999';
    }

    /**
     * 按学域分配初始位置（每次渲染都重算，确保无散点：全图/筛选后都紧凑成簇）
     * @param {Array} nodes - Node array (mutated in place)
     */
    _assignInitialPositionsByDomain(nodes) {
        const c = this._center();
        const maxR = Math.min(this.width, this.height) * 0.36 - LAYOUT_PADDING;
        if (nodes.length === 0) return;
        if (nodes.length === 1) {
            nodes[0].x = c.x;
            nodes[0].y = c.y;
            return;
        }
        const domainIds = ['domain-1', 'domain-2', 'domain-3', 'domain-4', 'domain-5'];
        const byDomain = new Map(domainIds.map(id => [id, []]));
        nodes.forEach(n => {
            if (!n.domains || !n.domains.length) n.domains = ['domain-1'];
            const did = n.domains[0];
            (byDomain.get(did) || byDomain.get('domain-1')).push(n);
        });
        const numDomainsUsed = domainIds.filter(id => (byDomain.get(id) || []).length > 0).length;
        const sectorSpan = (2 * Math.PI) / Math.max(numDomainsUsed, 1);
        let sectorIndex = 0;
        domainIds.forEach((domainId) => {
            const list = byDomain.get(domainId) || [];
            if (list.length === 0) return;
            const startAngle = sectorIndex * sectorSpan - Math.PI / 2 + sectorSpan / 2;
            sectorIndex += 1;
            const n = list.length;
            const clusterR = Math.min(maxR * 0.45, 90 + n * 3);
            list.forEach((node, i) => {
                const t = n > 1 ? i / (n - 1) : 0;
                const angle = startAngle + (t - 0.5) * sectorSpan * 0.7;
                const r = clusterR + (i % 2) * 12;
                node.x = c.x + r * Math.cos(angle);
                node.y = c.y + r * Math.sin(angle);
            });
        });
        nodes.forEach(node => {
            if (node.x == null || node.y == null) {
                const i = nodes.indexOf(node);
                const angle = (i / nodes.length) * 2 * Math.PI - Math.PI / 2;
                node.x = c.x + maxR * 0.4 * Math.cos(angle);
                node.y = c.y + maxR * 0.4 * Math.sin(angle);
            }
        });
    }

    /**
     * Tick function for force simulation（限制在画布内；稳定后停止以节省 CPU）
     */
    ticked() {
        const b = this._bounds();
        this.simulation.nodes().forEach(n => {
            if (n.x == null || n.y == null) return;
            n.x = Math.max(b.xMin, Math.min(b.xMax, n.x));
            n.y = Math.max(b.yMin, Math.min(b.yMax, n.y));
        });
        if (this.linkElements) {
            this.linkElements
                .attr('x1', d => d.source.x)
                .attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x)
                .attr('y2', d => d.target.y);
        }
        if (this.nodeElements) {
            this.nodeElements
                .attr('transform', d => `translate(${d.x ?? 0},${d.y ?? 0})`);
        }
        if (this.simulation.alpha() < 0.02) {
            this.simulation.stop();
        }
    }

    /**
     * Enable drag behavior
     * @returns {Function} D3 drag behavior
     */
    enableDrag() {
        const b = this._bounds();
        const clamp = (x, y) => ({
            x: Math.max(b.xMin, Math.min(b.xMax, x)),
            y: Math.max(b.yMin, Math.min(b.yMax, y))
        });
        return d3.drag()
            .on('start', (event, d) => {
                if (!event.active) this.simulation.alphaTarget(0.3).restart();
                const c = clamp(d.x, d.y);
                d.fx = c.x;
                d.fy = c.y;
            })
            .on('drag', (event, d) => {
                const c = clamp(event.x, event.y);
                d.fx = c.x;
                d.fy = c.y;
            })
            .on('end', (event, d) => {
                if (!event.active) this.simulation.alphaTarget(0);
                d.fx = null;
                d.fy = null;
            });
    }

    /**
     * Zoom in
     */
    zoomIn() {
        this.svg.transition().duration(300).call(
            this.zoomBehavior.scaleBy, 1.3
        );
    }

    /**
     * Zoom out
     */
    zoomOut() {
        this.svg.transition().duration(300).call(
            this.zoomBehavior.scaleBy, 0.7
        );
    }

    /**
     * Reset view to initial state
     */
    resetView() {
        this.svg.transition().duration(500).call(
            this.zoomBehavior.transform,
            d3.zoomIdentity
        );
    }

    /**
     * Fit graph to view（防止散点导致缩放异常）
     */
    fitToView() {
        const nodes = this.simulation.nodes();
        if (nodes.length === 0) return;
        const minX = d3.min(nodes, d => d.x);
        const maxX = d3.max(nodes, d => d.x);
        const minY = d3.min(nodes, d => d.y);
        const maxY = d3.max(nodes, d => d.y);
        const graphWidth = Math.max(maxX - minX, 1);
        const graphHeight = Math.max(maxY - minY, 1);
        const padding = 40;
        const scale = Math.min(
            (this.width - padding * 2) / graphWidth,
            (this.height - padding * 2) / graphHeight,
            2
        ) * 0.92;
        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;
        const transform = d3.zoomIdentity
            .translate(this.width / 2, this.height / 2)
            .scale(scale)
            .translate(-centerX, -centerY);
        this.svg.transition().duration(750).call(
            this.zoomBehavior.transform,
            transform
        );
    }

    /**
     * Highlight nodes
     * @param {Array} nodeIds - Array of node IDs to highlight
     */
    highlightNodes(nodeIds) {
        this.nodeElements.classed('highlighted', d => nodeIds.includes(d.id));
    }

    /**
     * Fade non-related nodes
     * @param {string} nodeId - Node ID to keep visible
     */
    fadeNonRelated(nodeId) {
        this.nodeElements.classed('faded', d => d.id !== nodeId);
        this.linkElements.classed('faded', d => 
            d.source.id !== nodeId && d.target.id !== nodeId
        );
    }

    /**
     * Clear all highlights
     */
    clearHighlights() {
        this.nodeElements.classed('highlighted', false);
        this.nodeElements.classed('faded', false);
        this.nodeElements.classed('path-node', false);
        this.linkElements.classed('highlighted', false);
        this.linkElements.classed('faded', false);
        this.linkElements.classed('path-link', false);
        
        // Remove path progress indicators
        this.nodeGroup.selectAll('.path-indicator').remove();
    }

    /**
     * Highlight a learning path
     * @param {Array} path - Array of node objects or LearningPath.steps
     */
    highlightPath(path) {
        // Clear existing highlights first
        this.clearHighlights();
        
        if (!path || path.length === 0) return;
        
        // Extract node IDs from path
        // Path can be either array of nodes or LearningPath.steps
        const pathNodeIds = path.map(item => {
            if (item.node) {
                // LearningPath.steps format: { node: nodeId, order: 1, ... }
                return item.node;
            } else if (item.id) {
                // Direct node format: { id: nodeId, ... }
                return item.id;
            } else if (typeof item === 'string') {
                // Just node ID string
                return item;
            }
            return null;
        }).filter(id => id !== null);
        
        if (pathNodeIds.length === 0) return;
        
        // Highlight path nodes with special class
        this.nodeElements.classed('path-node', d => pathNodeIds.includes(d.id));
        
        // Fade non-path nodes
        this.nodeElements.classed('faded', d => !pathNodeIds.includes(d.id));
        
        // Highlight edges that connect consecutive path nodes
        this.linkElements.classed('path-link', d => {
            const sourceIndex = pathNodeIds.indexOf(d.source.id);
            const targetIndex = pathNodeIds.indexOf(d.target.id);
            
            // Check if this edge connects consecutive nodes in the path
            return (sourceIndex !== -1 && targetIndex !== -1 && 
                    Math.abs(sourceIndex - targetIndex) === 1);
        });
        
        // Fade non-path edges
        this.linkElements.classed('faded', d => {
            const sourceIndex = pathNodeIds.indexOf(d.source.id);
            const targetIndex = pathNodeIds.indexOf(d.target.id);
            return !(sourceIndex !== -1 && targetIndex !== -1 && 
                     Math.abs(sourceIndex - targetIndex) === 1);
        });
        
        // Add path progress indicators (numbered badges)
        this.addPathProgressIndicators(pathNodeIds);
    }

    /**
     * Add progress indicators to path nodes
     * @param {Array} pathNodeIds - Array of node IDs in path order
     * @private
     */
    addPathProgressIndicators(pathNodeIds) {
        // Remove existing indicators
        this.nodeGroup.selectAll('.path-indicator').remove();
        
        // Create a map of nodeId to step number for quick lookup
        const nodeToStepMap = new Map();
        pathNodeIds.forEach((nodeId, index) => {
            nodeToStepMap.set(nodeId, index + 1);
        });
        
        // Add numbered indicators to each path node
        pathNodeIds.forEach((nodeId, index) => {
            const nodeElement = this.nodeElements.filter(d => d.id === nodeId);
            
            if (!nodeElement.empty()) {
                const nodeData = nodeElement.datum();
                
                // Create indicator group with data binding
                const indicator = this.nodeGroup.append('g')
                    .attr('class', 'path-indicator')
                    .attr('data-node-id', nodeId)
                    .attr('data-step', index + 1)
                    .attr('transform', `translate(${nodeData.x},${nodeData.y})`);
                
                // Add circle background
                indicator.append('circle')
                    .attr('r', 12)
                    .attr('cx', 15)
                    .attr('cy', -15)
                    .attr('fill', '#4CAF50')
                    .attr('stroke', '#fff')
                    .attr('stroke-width', 2);
                
                // Add step number
                indicator.append('text')
                    .attr('x', 15)
                    .attr('y', -15)
                    .attr('dy', '0.35em')
                    .attr('text-anchor', 'middle')
                    .attr('fill', '#fff')
                    .attr('font-size', '10px')
                    .attr('font-weight', 'bold')
                    .text(index + 1);
            }
        });
        
        // Update indicator positions on each simulation tick
        const updateIndicators = () => {
            this.nodeGroup.selectAll('.path-indicator').each(function() {
                const nodeId = d3.select(this).attr('data-node-id');
                const nodeElement = this.nodeElements ? this.nodeElements.filter(d => d.id === nodeId) : null;
                
                if (nodeElement && !nodeElement.empty()) {
                    const nodeData = nodeElement.datum();
                    d3.select(this).attr('transform', `translate(${nodeData.x},${nodeData.y})`);
                }
            }.bind(this));
        };
        
        // Register the update function with the simulation
        this.simulation.on('tick.pathIndicators', updateIndicators);
    }

    /**
     * Resize visualization
     * @param {number} width - New width
     * @param {number} height - New height
     */
    resize(width, height) {
        this.width = width;
        this.height = height;
        this.svg.attr('width', width).attr('height', height);
        const c = this._center();
        this.simulation
            .force('center', d3.forceCenter(c.x, c.y))
            .force('x', d3.forceX(c.x).strength(0.08))
            .force('y', d3.forceY(c.y).strength(0.08));
        this.simulation.alpha(0.3).restart();
    }

    /**
     * Register node click handler
     * @param {Function} callback - Callback function
     */
    onNodeClick(callback) {
        if (!this.nodeElements) {
            console.warn('Node elements not initialized yet');
            return;
        }
        this.nodeElements.on('click', (event, d) => {
            event.stopPropagation();
            callback(d);
        });
    }

    /**
     * Register node double-click handler（双击节点快捷打开 Skill 运用）
     */
    onNodeDblClick(callback) {
        if (!this.nodeElements) return;
        this.nodeElements.on('dblclick', (event, d) => {
            event.stopPropagation();
            callback(d);
        });
    }

    /**
     * Register node hover handler
     * @param {Function} callback - Callback function
     */
    onNodeHover(callback) {
        if (!this.nodeElements) {
            console.warn('Node elements not initialized yet');
            return;
        }
        this.nodeElements.on('mouseenter', (event, d) => {
            callback(d, event);
        }).on('mouseleave', () => {
            callback(null);
        });
    }
}
