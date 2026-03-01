/**
 * GeoGebra Integration Module
 * 集成GeoGebra动态数学可视化到知识图谱系统
 */

class GeoGebraIntegration {
    constructor() {
        this.applets = new Map();
        this.currentApplet = null;
        this.isGGBLoaded = false;
        this.loadGGBScript();
    }

    /**
     * 加载GeoGebra脚本
     */
    loadGGBScript() {
        if (window.GGBApplet) {
            this.isGGBLoaded = true;
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://www.geogebra.org/apps/deployggb.js';
            script.onload = () => {
                this.isGGBLoaded = true;
                console.log('✅ GeoGebra script loaded');
                resolve();
            };
            script.onerror = () => {
                console.error('❌ Failed to load GeoGebra script');
                reject(new Error('Failed to load GeoGebra'));
            };
            document.head.appendChild(script);
        });
    }

    /**
     * 嵌入GeoGebra应用
     * @param {string} containerId - 容器ID
     * @param {object} config - 配置对象
     */
    async embedApplet(containerId, config) {
        if (!this.isGGBLoaded) {
            await this.loadGGBScript();
        }

        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container ${containerId} not found`);
            return null;
        }

        // 清空容器
        container.innerHTML = '';

        // 默认参数
        const defaultParams = {
            appName: config.type === '3d' ? '3d' : 'classic',
            width: config.width || 800,
            height: config.height || 600,
            showToolBar: config.showToolBar !== false,
            showAlgebraInput: config.showAlgebraInput !== false,
            showMenuBar: config.showMenuBar !== false,
            showResetIcon: true,
            enableLabelDrags: false,
            enableShiftDragZoom: true,
            enableRightClick: false,
            showFullscreenButton: true,
            showZoomButtons: true,
            showAnimationButton: true,
            capturingThreshold: 3,
            material_id: config.materialId,
            borderColor: '#2196F3',
            customToolBar: config.customToolBar || null
        };

        try {
            const applet = new GGBApplet(defaultParams, true);
            applet.inject(containerId);
            
            this.applets.set(containerId, {
                applet: applet,
                config: config
            });

            console.log(`✅ GeoGebra applet embedded in ${containerId}`);
            return applet;
        } catch (error) {
            console.error('Failed to embed GeoGebra applet:', error);
            container.innerHTML = `
                <div class="geogebra-error">
                    <p>❌ 无法加载GeoGebra演示</p>
                    <p>请检查网络连接或<a href="${config.url}" target="_blank">在GeoGebra.org打开</a></p>
                </div>
            `;
            return null;
        }
    }

    /**
     * 打开全屏模式
     * @param {object} nodeData - 节点数据
     */
    openFullscreen(nodeData) {
        if (!nodeData.geogebra || !nodeData.geogebra.enabled) {
            console.warn('Node does not have GeoGebra demo');
            return;
        }

        // 创建全屏模态框
        const modal = document.createElement('div');
        modal.className = 'geogebra-fullscreen-modal';
        modal.innerHTML = `
            <div class="geogebra-fullscreen-content">
                <button class="geogebra-close-btn" onclick="this.closest('.geogebra-fullscreen-modal').remove()">
                    ✕ 关闭
                </button>
                <div class="geogebra-fullscreen-header">
                    <h2>${nodeData.name} - GeoGebra演示</h2>
                    <p>${nodeData.geogebra.description || ''}</p>
                </div>
                <div id="geogebra-fullscreen-container" class="geogebra-fullscreen-container"></div>
            </div>
        `;

        document.body.appendChild(modal);

        // 嵌入GeoGebra
        this.embedApplet('geogebra-fullscreen-container', {
            ...nodeData.geogebra,
            width: window.innerWidth * 0.85,
            height: window.innerHeight * 0.75,
            showToolBar: true,
            showAlgebraInput: true,
            showMenuBar: true
        });

        // ESC键关闭
        const closeHandler = (e) => {
            if (e.key === 'Escape') {
                modal.remove();
                document.removeEventListener('keydown', closeHandler);
            }
        };
        document.addEventListener('keydown', closeHandler);
    }

    /**
     * 在节点详情面板中嵌入GeoGebra
     * @param {object} nodeData - 节点数据
     * @param {string} containerId - 容器ID
     */
    embedInPanel(nodeData, containerId) {
        if (!nodeData.geogebra || !nodeData.geogebra.enabled) {
            return;
        }

        this.embedApplet(containerId, {
            ...nodeData.geogebra,
            width: '100%',
            height: 500,
            showToolBar: true,
            showAlgebraInput: false,
            showMenuBar: false
        });
    }

    /**
     * 移除GeoGebra应用
     * @param {string} containerId - 容器ID
     */
    removeApplet(containerId) {
        if (this.applets.has(containerId)) {
            const container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = '';
            }
            this.applets.delete(containerId);
            console.log(`✅ GeoGebra applet removed from ${containerId}`);
        }
    }

    /**
     * 获取节点的GeoGebra按钮HTML
     * @param {object} nodeData - 节点数据
     * @returns {string} HTML字符串
     */
    getButtonsHTML(nodeData) {
        if (!nodeData.geogebra || !nodeData.geogebra.enabled) {
            return '';
        }

        return `
            <div class="geogebra-section">
                <h3>📐 GeoGebra动态演示</h3>
                <p class="geogebra-description">${nodeData.geogebra.description || '动态数学可视化'}</p>
                <div class="geogebra-buttons">
                    <button class="btn-geogebra-embed" data-node-id="${nodeData.id}">
                        <span class="icon">▶</span> 嵌入式查看
                    </button>
                    <button class="btn-geogebra-fullscreen" data-node-id="${nodeData.id}">
                        <span class="icon">⛶</span> 全屏模式
                    </button>
                    <a href="${nodeData.geogebra.url}" target="_blank" class="btn-geogebra-external">
                        <span class="icon">↗</span> 在GeoGebra.org打开
                    </a>
                </div>
                <div id="geogebra-container-${nodeData.id}" class="geogebra-container" style="display:none;"></div>
            </div>
        `;
    }

    /**
     * 初始化事件监听
     */
    initEventListeners() {
        // 嵌入式查看按钮
        document.addEventListener('click', (e) => {
            if (e.target.closest('.btn-geogebra-embed')) {
                const btn = e.target.closest('.btn-geogebra-embed');
                const nodeId = btn.dataset.nodeId;
                const container = document.getElementById(`geogebra-container-${nodeId}`);
                
                if (container.style.display === 'none') {
                    container.style.display = 'block';
                    btn.innerHTML = '<span class="icon">⏸</span> 隐藏演示';
                    
                    // 获取节点数据并嵌入
                    const nodeData = this.getNodeData(nodeId);
                    if (nodeData) {
                        this.embedInPanel(nodeData, `geogebra-container-${nodeId}`);
                    }
                } else {
                    container.style.display = 'none';
                    btn.innerHTML = '<span class="icon">▶</span> 嵌入式查看';
                    this.removeApplet(`geogebra-container-${nodeId}`);
                }
            }
        });

        // 全屏模式按钮
        document.addEventListener('click', (e) => {
            if (e.target.closest('.btn-geogebra-fullscreen')) {
                const btn = e.target.closest('.btn-geogebra-fullscreen');
                const nodeId = btn.dataset.nodeId;
                const nodeData = this.getNodeData(nodeId);
                
                if (nodeData) {
                    this.openFullscreen(nodeData);
                }
            }
        });
    }

    /**
     * 获取节点数据（需要与主应用集成）
     * @param {string} nodeId - 节点ID
     * @returns {object} 节点数据
     */
    getNodeData(nodeId) {
        // 这里需要与主应用的数据管理器集成
        // 暂时返回null，实际使用时需要实现
        if (window.graphData && window.graphData.nodes) {
            return window.graphData.nodes.find(n => n.id === nodeId);
        }
        return null;
    }

    /**
     * 检查节点是否有GeoGebra演示
     * @param {object} nodeData - 节点数据
     * @returns {boolean}
     */
    hasDemo(nodeData) {
        return nodeData && nodeData.geogebra && nodeData.geogebra.enabled;
    }

    /**
     * 获取所有有GeoGebra演示的节点
     * @param {array} nodes - 节点数组
     * @returns {array} 有演示的节点数组
     */
    getNodesWithDemo(nodes) {
        return nodes.filter(node => this.hasDemo(node));
    }

    /**
     * 批量预加载GeoGebra材料
     * @param {array} materialIds - 材料ID数组
     */
    preloadMaterials(materialIds) {
        // 预加载常用的GeoGebra材料
        console.log(`Preloading ${materialIds.length} GeoGebra materials...`);
        // 实际实现可以使用link rel="prefetch"
    }
}

// 导出单例
const geogebraIntegration = new GeoGebraIntegration();

// 页面加载完成后初始化事件监听
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        geogebraIntegration.initEventListeners();
    });
} else {
    geogebraIntegration.initEventListeners();
}

export default geogebraIntegration;
