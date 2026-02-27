/**
 * OptimizedDataLoader - 优化的数据加载器
 * 支持Phase 1和Phase 2数据加载，带缓存机制
 * Task 18.1: 更新数据加载逻辑
 */

export class OptimizedDataLoader {
    constructor() {
        this.cache = new Map();
        this.loadStartTime = null;
        this.loadEndTime = null;
    }

    /**
     * 加载所有数据（Phase 1 + Phase 2）
     * @returns {Promise<Object>} 包含domains, nodes, edges, applications, skills的对象
     */
    async loadAllData() {
        this.loadStartTime = performance.now();
        
        try {
            // 并行加载所有数据文件
            const [
                domainsData,
                phase1Nodes,
                phase2Nodes,
                phase1Edges,
                phase2Edges,
                phase2Applications,
                phase2Skills
            ] = await Promise.all([
                this.loadWithCache('./data/domains.json'),
                this.loadWithCache('./data/nodes.json'),
                this.loadWithCache('./data/nodes-extended-phase2.json'),
                this.loadWithCache('./data/edges.json'),
                this.loadWithCache('./data/edges-extended-phase2.json'),
                this.loadWithCache('./data/applications-extended-phase2.json'),
                this.loadWithCache('./data/skills-content-phase2.json')
            ]);

            // 合并Phase 1和Phase 2的节点
            const allNodes = this.mergeNodes(phase1Nodes, phase2Nodes);
            
            // 合并Phase 1和Phase 2的边
            const allEdges = this.mergeEdges(phase1Edges, phase2Edges);
            
            this.loadEndTime = performance.now();
            const loadTime = this.loadEndTime - this.loadStartTime;
            
            console.log(`✅ Data loaded in ${loadTime.toFixed(2)}ms`);
            console.log(`  - Domains: ${domainsData.domains?.length || 0}`);
            console.log(`  - Nodes: ${allNodes.length} (Phase1: ${phase1Nodes.nodes?.length || 0}, Phase2: ${phase2Nodes.data?.length || 0})`);
            console.log(`  - Edges: ${allEdges.length} (Phase1: ${phase1Edges.edges?.length || 0}, Phase2: ${phase2Edges.data?.length || 0})`);
            console.log(`  - Applications: ${phase2Applications.data?.length || 0}`);
            console.log(`  - Skills: ${phase2Skills.data?.length || 0}`);
            
            return {
                domains: domainsData.domains || [],
                nodes: allNodes,
                edges: allEdges,
                applications: phase2Applications.data || [],
                skills: phase2Skills.data || [],
                metadata: {
                    loadTime,
                    phase1NodeCount: phase1Nodes.nodes?.length || 0,
                    phase2NodeCount: phase2Nodes.data?.length || 0,
                    totalNodeCount: allNodes.length
                }
            };
            
        } catch (error) {
            console.error('❌ Failed to load data:', error);
            throw new Error(`数据加载失败: ${error.message}`);
        }
    }

    /**
     * 带缓存的JSON加载
     * @param {string} url - 文件URL
     * @returns {Promise<Object>}
     */
    async loadWithCache(url) {
        // 检查缓存
        if (this.cache.has(url)) {
            console.log(`📦 Using cached data for ${url}`);
            return this.cache.get(url);
        }

        // 加载数据
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to load ${url}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // 存入缓存
        this.cache.set(url, data);
        
        return data;
    }

    /**
     * 合并Phase 1和Phase 2的节点
     * @param {Object} phase1Data - Phase 1节点数据
     * @param {Object} phase2Data - Phase 2节点数据
     * @returns {Array} 合并后的节点数组
     */
    mergeNodes(phase1Data, phase2Data) {
        const phase1Nodes = phase1Data.nodes || [];
        const phase2Nodes = phase2Data.data || [];
        
        // 合并节点，Phase 2节点添加标记
        const allNodes = [
            ...phase1Nodes.map(node => ({ ...node, phase: 'phase1' })),
            ...phase2Nodes.map(node => ({ ...node, phase: 'phase2' }))
        ];
        
        // 去重（基于ID）
        const uniqueNodes = [];
        const seenIds = new Set();
        
        for (const node of allNodes) {
            if (!seenIds.has(node.id)) {
                seenIds.add(node.id);
                uniqueNodes.push(node);
            }
        }
        
        return uniqueNodes;
    }

    /**
     * 合并Phase 1和Phase 2的边
     * @param {Object} phase1Data - Phase 1边数据
     * @param {Object} phase2Data - Phase 2边数据
     * @returns {Array} 合并后的边数组
     */
    mergeEdges(phase1Data, phase2Data) {
        const phase1Edges = phase1Data.edges || [];
        const phase2Edges = phase2Data.data || [];
        
        // 合并边
        const allEdges = [
            ...phase1Edges.map(edge => ({ ...edge, phase: 'phase1' })),
            ...phase2Edges.map(edge => ({ ...edge, phase: 'phase2' }))
        ];
        
        // 去重（基于source-target对）
        const uniqueEdges = [];
        const seenPairs = new Set();
        
        for (const edge of allEdges) {
            const pairKey = `${edge.source}-${edge.target}`;
            if (!seenPairs.has(pairKey)) {
                seenPairs.add(pairKey);
                uniqueEdges.push(edge);
            }
        }
        
        return uniqueEdges;
    }

    /**
     * 清除缓存
     */
    clearCache() {
        this.cache.clear();
        console.log('🗑️ Cache cleared');
    }

    /**
     * 获取加载性能指标
     * @returns {Object}
     */
    getPerformanceMetrics() {
        if (!this.loadStartTime || !this.loadEndTime) {
            return null;
        }
        
        return {
            loadTime: this.loadEndTime - this.loadStartTime,
            cacheSize: this.cache.size,
            cachedUrls: Array.from(this.cache.keys())
        };
    }

    /**
     * 预加载数据（用于提前缓存）
     * @param {string[]} urls - 要预加载的URL列表
     */
    async preloadData(urls) {
        console.log(`🔄 Preloading ${urls.length} files...`);
        
        const promises = urls.map(url => this.loadWithCache(url));
        await Promise.all(promises);
        
        console.log(`✅ Preloaded ${urls.length} files`);
    }
}
