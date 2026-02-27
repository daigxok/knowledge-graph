/**
 * Visualization Components Index
 * Task 19: 可视化增强功能
 * 
 * 导出所有可视化组件和示例函数
 */

export { 
    CurvatureVisualizer,
    createCircleCurvatureExample,
    createParabolaCurvatureExample
} from './CurvatureVisualizer.js';

export {
    VectorFieldVisualizer,
    createGradientFieldExample,
    createRotationalFieldExample
} from './VectorFieldVisualizer.js';

export {
    PDEVisualizer,
    createHeatEquationExample,
    createWaveEquationExample,
    createLaplaceEquationExample
} from './PDEVisualizer.js';

export {
    OptimizationVisualizer,
    createGradientDescentExample,
    createNewtonMethodExample
} from './OptimizationVisualizer.js';

export {
    ProbabilityVisualizer,
    createNormalDistributionExample,
    createPoissonDistributionExample,
    createExponentialDistributionExample
} from './ProbabilityVisualizer.js';

/**
 * 可视化组件注册表
 * 用于根据节点类型自动选择合适的可视化组件
 */
export const VisualizationRegistry = {
    // 曲率相关节点
    'curvature': CurvatureVisualizer,
    'curve-analysis': CurvatureVisualizer,
    
    // 场论相关节点
    'vector-field': VectorFieldVisualizer,
    'gradient': VectorFieldVisualizer,
    'divergence': VectorFieldVisualizer,
    'curl': VectorFieldVisualizer,
    
    // 偏微分方程相关节点
    'heat-equation': PDEVisualizer,
    'wave-equation': PDEVisualizer,
    'laplace-equation': PDEVisualizer,
    'pde': PDEVisualizer,
    
    // 优化算法相关节点
    'gradient-descent': OptimizationVisualizer,
    'newton-method': OptimizationVisualizer,
    'optimization': OptimizationVisualizer,
    
    // 概率分布相关节点
    'normal-distribution': ProbabilityVisualizer,
    'poisson-distribution': ProbabilityVisualizer,
    'exponential-distribution': ProbabilityVisualizer,
    'probability': ProbabilityVisualizer
};

/**
 * 根据节点获取合适的可视化组件
 * @param {Object} node - 节点对象
 * @returns {Class|null} 可视化组件类
 */
export function getVisualizerForNode(node) {
    // 检查节点的可视化配置
    if (node.visualization && node.visualization.type) {
        return VisualizationRegistry[node.visualization.type];
    }
    
    // 根据节点关键词匹配
    if (node.keywords) {
        for (const keyword of node.keywords) {
            const lowerKeyword = keyword.toLowerCase();
            if (VisualizationRegistry[lowerKeyword]) {
                return VisualizationRegistry[lowerKeyword];
            }
        }
    }
    
    // 根据节点ID匹配
    const nodeIdLower = node.id.toLowerCase();
    for (const key in VisualizationRegistry) {
        if (nodeIdLower.includes(key)) {
            return VisualizationRegistry[key];
        }
    }
    
    return null;
}

/**
 * 创建可视化实例
 * @param {Object} node - 节点对象
 * @param {HTMLElement} container - 容器元素
 * @returns {Object|null} 可视化实例
 */
export function createVisualization(node, container) {
    const VisualizerClass = getVisualizerForNode(node);
    
    if (!VisualizerClass) {
        console.warn(`No visualizer found for node: ${node.id}`);
        return null;
    }
    
    const visualizer = new VisualizerClass(container);
    
    // 如果节点有可视化配置，使用配置渲染
    if (node.visualization && node.visualization.config) {
        const config = node.visualization.config;
        
        // 根据可视化类型调用相应的渲染方法
        if (visualizer instanceof CurvatureVisualizer) {
            visualizer.render(config);
        } else if (visualizer instanceof VectorFieldVisualizer) {
            if (config.dimension === '3D') {
                visualizer.render3D(config);
            } else {
                visualizer.render2D(config);
            }
        } else if (visualizer instanceof PDEVisualizer) {
            if (config.equationType === 'heat') {
                visualizer.renderHeatEquation(config);
            } else if (config.equationType === 'wave') {
                visualizer.renderWaveEquation(config);
            } else if (config.equationType === 'laplace') {
                visualizer.renderLaplaceEquation(config);
            }
        } else if (visualizer instanceof OptimizationVisualizer) {
            if (config.method === 'newton') {
                visualizer.renderNewtonMethod(config);
            } else {
                visualizer.renderGradientDescent(config);
            }
        } else if (visualizer instanceof ProbabilityVisualizer) {
            if (config.distribution === 'normal') {
                visualizer.renderNormalDistribution(config);
            } else if (config.distribution === 'poisson') {
                visualizer.renderPoissonDistribution(config);
            } else if (config.distribution === 'exponential') {
                visualizer.renderExponentialDistribution(config);
            }
        }
    }
    
    return visualizer;
}
