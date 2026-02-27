/**
 * Higher Mathematics Domain Knowledge Graph System
 * Main Entry Point
 * 
 * This module initializes the application and coordinates all components.
 */

import { DomainDataManager } from './modules/DomainDataManager.js';
import { KnowledgeGraphEngine } from './modules/KnowledgeGraphEngine.js';
import { D3VisualizationEngine } from './modules/D3VisualizationEngine.js';
import { FilterEngine } from './modules/FilterEngine.js';
import { UIController } from './modules/UIController.js';
import { StateManager } from './modules/StateManager.js';
import { LearningPathFinder } from './modules/LearningPathFinder.js';
import { inferNodeType } from './modules/SkillContentGenerator.js';
import { SkillContentManager } from './modules/SkillContentManager.js';
import { LearningDataManager } from './modules/LearningDataManager.js';
import { onboardingGuide } from './modules/OnboardingGuide.js';

/**
 * Global error handler
 */
window.addEventListener('error', (event) => {
    console.error('Global error caught:', event.error);
    // Check if error object exists and has a message
    const errorMessage = event.error && event.error.message 
        ? event.error.message 
        : (event.message || 'Unknown error');
    showErrorNotification(`系统错误: ${errorMessage}`);
});

/**
 * Unhandled promise rejection handler
 */
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    // Handle both Error objects and plain values
    const errorMessage = event.reason && event.reason.message 
        ? event.reason.message 
        : (event.reason || 'Unknown error');
    showErrorNotification(`异步操作失败: ${errorMessage}`);
});

/**
 * Show error notification
 */
function showErrorNotification(message) {
    const toast = document.getElementById('notificationToast');
    if (toast) {
        const messageElement = document.getElementById('notificationMessage');
        messageElement.textContent = message;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 5000);
    }
}

/**
 * Application class - main orchestrator
 */
class KnowledgeGraphApp {
    constructor() {
        this.domainManager = null;
        this.graphEngine = null;
        this.visualizationEngine = null;
        this.filterEngine = null;
        this.uiController = null;
        this.stateManager = null;
        this.learningPathFinder = null;
        this.skillContentManager = null;
        this.learningDataManager = null;
        
        this.isInitialized = false;
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            this.showLoading(true);
            
            // Load data files
            const [domainsData, nodesData, edgesData] = await Promise.all([
                this.loadJSON('./data/domains.json'),
                this.loadJSON('./data/nodes.json'),
                this.loadJSON('./data/edges.json')
            ]);

            // Validate data
            this.validateData(domainsData, nodesData, edgesData);

            // 依据节点名称/描述为每个节点注入类型（concept/theorem/method/application），供图谱与详情按类型增强交互
            nodesData.nodes.forEach(node => {
                node.type = node.type || inferNodeType(node);
            });

            // Initialize components
            this.domainManager = new DomainDataManager(domainsData);
            this.graphEngine = new KnowledgeGraphEngine(nodesData.nodes, edgesData.edges);
            this.stateManager = new StateManager();
            
            // Initialize visualization（传入 domainManager 以与学域颜色一致）
            const container = document.getElementById('graphCanvas');
            const width = container.clientWidth;
            const height = container.clientHeight;
            this.visualizationEngine = new D3VisualizationEngine('#graphCanvas', width, height, {
                domainManager: this.domainManager
            });
            
            // Initialize filter engine
            this.filterEngine = new FilterEngine(this.graphEngine);
            
            // Initialize learning path finder
            this.learningPathFinder = new LearningPathFinder(this.graphEngine);
            
            // Initialize skill content manager（含 Phase2 深度内容）
            this.skillContentManager = new SkillContentManager();
            try {
                await this.skillContentManager.initialize();
                await this.skillContentManager.loadPhase2DeepContent('data/skills-content-phase2.json');
                console.log('✅ Phase2 deep skills ready for main graph');
            } catch (e) {
                console.warn('⚠️ Phase2 deep skills not available, fallback to auto-generated skill content:', e);
            }

            // Initialize real learning data manager (local-only by default)
            this.learningDataManager = new LearningDataManager();
            window.learningDataManager = this.learningDataManager;
            
            // Initialize UI controller
            this.uiController = new UIController({
                domainManager: this.domainManager,
                graphEngine: this.graphEngine,
                visualizationEngine: this.visualizationEngine,
                filterEngine: this.filterEngine,
                stateManager: this.stateManager,
                learningPathFinder: this.learningPathFinder,
                openSkillsExperience: () => this.openSkillsExperience(),
                skillContentManager: this.skillContentManager,
                learningDataManager: this.learningDataManager
            });

            // Setup event handlers
            this.setupEventHandlers();

            // Render initial graph
            this.renderGraph();
            
            // Setup interactions AFTER rendering (when nodeElements exist)
            this.uiController.setupInteractions();
            
            // 学域概览、学域图例、学域主动状态与 Skills 运用提示
            this.uiController.updateDomainOverview();
            this.uiController.updateDomainLegend();
            this.uiController.updateDomainActiveStates();
            this.uiController.updateSkillsHint();

            // Load saved state
            this.loadSavedState();

            this.isInitialized = true;
            this.showLoading(false);
            
            console.log('✅ Knowledge Graph System initialized successfully');
            this.uiController.showNotification('知识图谱加载成功！', 'success');
            
            // Show onboarding guide for first-time visitors
            if (onboardingGuide.shouldShow()) {
                setTimeout(() => {
                    onboardingGuide.start();
                }, 1000); // Delay to ensure UI is fully rendered
            }
            
        } catch (error) {
            console.error('❌ Failed to initialize application:', error);
            this.showLoading(false);
            this.showError('系统初始化失败: ' + error.message);
        }
    }

    /**
     * Load JSON data file
     */
    async loadJSON(url) {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to load ${url}: ${response.statusText}`);
        }
        return await response.json();
    }

    /**
     * Validate loaded data
     */
    validateData(domainsData, nodesData, edgesData) {
        // Check domains
        if (!domainsData.domains || !Array.isArray(domainsData.domains)) {
            throw new Error('Invalid domains data structure');
        }
        
        if (domainsData.domains.length !== 5) {
            throw new Error(`Expected 5 domains, got ${domainsData.domains.length}`);
        }

        // Check nodes
        if (!nodesData.nodes || !Array.isArray(nodesData.nodes)) {
            throw new Error('Invalid nodes data structure');
        }

        if (nodesData.nodes.length < 20) {
            throw new Error(`Expected at least 20 nodes, got ${nodesData.nodes.length}`);
        }

        // Check edges
        if (!edgesData.edges || !Array.isArray(edgesData.edges)) {
            throw new Error('Invalid edges data structure');
        }

        console.log(`✓ Data validation passed: ${domainsData.domains.length} domains, ${nodesData.nodes.length} nodes, ${edgesData.edges.length} edges`);
    }

    /**
     * Setup event handlers
     */
    setupEventHandlers() {
        window.addEventListener('resize', () => this.handleResize());
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        window.addEventListener('beforeunload', () => this.stateManager.saveToLocalStorage());
    }

    /**
     * 进入 Skills 真实体验（同页跳转，避免 iframe 在 file:// 下被阻止）
     */
    openSkillsExperience() {
        window.location.href = 'test-skills-system.html';
    }

    /**
     * Render the knowledge graph
     */
    renderGraph() {
        const nodes = this.graphEngine.getAllNodes();
        const edges = this.graphEngine.getAllEdges();
        
        this.visualizationEngine.render(nodes, edges);
        
        // Update stats
        this.uiController.updateStats({
            totalNodes: nodes.length,
            completedNodes: this.stateManager.getCompletedNodes().length
        });
    }

    /**
     * Handle window resize
     */
    handleResize() {
        if (!this.isInitialized) return;
        
        const container = document.getElementById('graphCanvas');
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        this.visualizationEngine.resize(width, height);
    }

    /**
     * Handle keyboard shortcuts
     */
    handleKeyboard(event) {
        if (event.key === 'Escape') {
            const skillPanel = document.getElementById('skillPanel');
            if (skillPanel?.classList.contains('open')) {
                this.uiController.hideSkillPanel();
            } else {
                this.uiController.hideDetailPanel();
            }
        }
        
        // Ctrl/Cmd + F - focus search
        if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
            event.preventDefault();
            document.getElementById('searchInput').focus();
        }
        
        // Ctrl/Cmd + R - reset view
        if ((event.ctrlKey || event.metaKey) && event.key === 'r') {
            event.preventDefault();
            this.visualizationEngine.resetView();
        }
    }

    /**
     * Load saved state from localStorage and restore UI + graph
     */
    loadSavedState() {
        const savedState = this.stateManager.loadFromLocalStorage();
        if (savedState) {
            console.log('Loaded saved state:', savedState);
            if (savedState.filters) {
                this.filterEngine.setActiveFilters(savedState.filters);
                this.uiController.restoreSidebarFromFilters(savedState.filters);
                this.uiController.applyFiltersAndRender();
            }
        }
    }

    /**
     * Show/hide loading indicator
     */
    showLoading(show) {
        const indicator = document.getElementById('loadingIndicator');
        if (indicator) {
            if (show) {
                indicator.style.display = 'block';
                indicator.classList.remove('hidden');
            } else {
                // Use both methods to ensure it's hidden
                indicator.classList.add('hidden');
                indicator.style.display = 'none';
                
                // Force reflow to ensure the change is applied
                void indicator.offsetHeight;
            }
        }
    }

    /**
     * Show error message
     */
    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #fff;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            max-width: 500px;
        `;
        errorDiv.innerHTML = `
            <h2 style="color: #e74c3c; margin-bottom: 1rem;">❌ 错误</h2>
            <p style="margin-bottom: 1rem;">${message}</p>
            <button onclick="location.reload()" style="
                padding: 0.5rem 1rem;
                background: #667eea;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
            ">重新加载</button>
        `;
        document.body.appendChild(errorDiv);
    }
}

// Initialize application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        const app = new KnowledgeGraphApp();
        app.init();
        
        // Make app globally accessible for debugging
        window.knowledgeGraphApp = app;
    });
} else {
    const app = new KnowledgeGraphApp();
    app.init();
    window.knowledgeGraphApp = app;
}
