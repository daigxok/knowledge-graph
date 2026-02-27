/**
 * PDEVisualizer - 偏微分方程可视化组件
 * Task 19.3: 实现偏微分方程可视化
 * 需求 12.3: 为偏微分方程节点提供解的动画演示
 */

export class PDEVisualizer {
    constructor(container) {
        this.container = container;
        this.width = 800;
        this.height = 600;
        this.animationId = null;
        this.time = 0;
    }

    /**
     * 渲染热传导方程解的演化
     * @param {Object} config - 配置对象
     */
    renderHeatEquation(config) {
        const {
            initialCondition = (x) => Math.sin(Math.PI * x),
            xRange = [0, 1],
            tMax = 1,
            alpha = 0.01 // 热扩散系数
        } = config;
        
        this.container.innerHTML = '';
        
        // 使用Plotly绘制热传导方程
        const nx = 100;
        const dx = (xRange[1] - xRange[0]) / nx;
        const dt = 0.001;
        
        // 初始化温度分布
        let u = [];
        for (let i = 0; i <= nx; i++) {
            const x = xRange[0] + i * dx;
            u.push(initialCondition(x));
        }
        
        // 创建初始图表
        const x = Array.from({ length: nx + 1 }, (_, i) => xRange[0] + i * dx);
        
        const data = [{
            x: x,
            y: u,
            type: 'scatter',
            mode: 'lines',
            name: '温度分布',
            line: { color: '#F44336', width: 2 }
        }];
        
        const layout = {
            title: `热传导方程 (t = 0.00)`,
            xaxis: { title: 'x', range: xRange },
            yaxis: { title: 'u(x,t)', range: [-1.5, 1.5] },
            showlegend: true
        };
        
        if (typeof Plotly === 'undefined') {
            console.warn('Plotly not loaded');
            return;
        }
        
        Plotly.newPlot(this.container, data, layout);
        
        // 动画更新
        this.time = 0;
        const animate = () => {
            // 使用显式有限差分法更新
            const uNew = [...u];
            for (let i = 1; i < nx; i++) {
                uNew[i] = u[i] + alpha * dt / (dx * dx) * (u[i + 1] - 2 * u[i] + u[i - 1]);
            }
            u = uNew;
            
            this.time += dt;
            
            // 更新图表
            Plotly.update(this.container, {
                y: [u]
            }, {
                title: `热传导方程 (t = ${this.time.toFixed(3)})`
            });
            
            if (this.time < tMax) {
                this.animationId = requestAnimationFrame(animate);
            }
        };
        
        // 添加控制按钮
        this.addControls(animate);
    }

    /**
     * 渲染波动方程解的演化
     * @param {Object} config - 配置对象
     */
    renderWaveEquation(config) {
        const {
            initialPosition = (x) => Math.sin(Math.PI * x),
            initialVelocity = (x) => 0,
            xRange = [0, 1],
            tMax = 2,
            c = 1 // 波速
        } = config;
        
        this.container.innerHTML = '';
        
        const nx = 100;
        const dx = (xRange[1] - xRange[0]) / nx;
        const dt = 0.001;
        
        // 初始化位移和速度
        let u = [];
        let v = [];
        for (let i = 0; i <= nx; i++) {
            const x = xRange[0] + i * dx;
            u.push(initialPosition(x));
            v.push(initialVelocity(x));
        }
        
        const x = Array.from({ length: nx + 1 }, (_, i) => xRange[0] + i * dx);
        
        const data = [{
            x: x,
            y: u,
            type: 'scatter',
            mode: 'lines',
            name: '波形',
            line: { color: '#2196F3', width: 2 }
        }];
        
        const layout = {
            title: `波动方程 (t = 0.00)`,
            xaxis: { title: 'x', range: xRange },
            yaxis: { title: 'u(x,t)', range: [-2, 2] },
            showlegend: true
        };
        
        if (typeof Plotly === 'undefined') {
            console.warn('Plotly not loaded');
            return;
        }
        
        Plotly.newPlot(this.container, data, layout);
        
        // 动画更新
        this.time = 0;
        const animate = () => {
            // 使用显式有限差分法更新
            const uNew = [...u];
            const vNew = [...v];
            
            for (let i = 1; i < nx; i++) {
                const acceleration = c * c / (dx * dx) * (u[i + 1] - 2 * u[i] + u[i - 1]);
                vNew[i] = v[i] + acceleration * dt;
                uNew[i] = u[i] + vNew[i] * dt;
            }
            
            u = uNew;
            v = vNew;
            this.time += dt;
            
            // 更新图表
            Plotly.update(this.container, {
                y: [u]
            }, {
                title: `波动方程 (t = ${this.time.toFixed(3)})`
            });
            
            if (this.time < tMax) {
                this.animationId = requestAnimationFrame(animate);
            }
        };
        
        this.addControls(animate);
    }

    /**
     * 渲染拉普拉斯方程解（2D热图）
     * @param {Object} config - 配置对象
     */
    renderLaplaceEquation(config) {
        const {
            boundaryCondition = (x, y) => {
                if (y === 1) return Math.sin(Math.PI * x);
                return 0;
            },
            xRange = [0, 1],
            yRange = [0, 1],
            iterations = 1000
        } = config;
        
        this.container.innerHTML = '';
        
        const nx = 50;
        const ny = 50;
        const dx = (xRange[1] - xRange[0]) / nx;
        const dy = (yRange[1] - yRange[0]) / ny;
        
        // 初始化网格
        let u = Array(ny + 1).fill(0).map(() => Array(nx + 1).fill(0));
        
        // 设置边界条件
        for (let i = 0; i <= nx; i++) {
            for (let j = 0; j <= ny; j++) {
                const x = xRange[0] + i * dx;
                const y = yRange[0] + j * dy;
                
                if (i === 0 || i === nx || j === 0 || j === ny) {
                    u[j][i] = boundaryCondition(x, y);
                }
            }
        }
        
        // 使用Gauss-Seidel迭代求解
        for (let iter = 0; iter < iterations; iter++) {
            for (let i = 1; i < nx; i++) {
                for (let j = 1; j < ny; j++) {
                    u[j][i] = 0.25 * (u[j][i + 1] + u[j][i - 1] + u[j + 1][i] + u[j - 1][i]);
                }
            }
        }
        
        // 绘制热图
        const data = [{
            z: u,
            type: 'heatmap',
            colorscale: 'Jet'
        }];
        
        const layout = {
            title: '拉普拉斯方程解',
            xaxis: { title: 'x' },
            yaxis: { title: 'y' }
        };
        
        if (typeof Plotly !== 'undefined') {
            Plotly.newPlot(this.container, data, layout);
        }
    }

    /**
     * 添加控制按钮
     */
    addControls(animateFunction) {
        const controls = document.createElement('div');
        controls.style.marginTop = '10px';
        controls.style.textAlign = 'center';
        
        const playButton = document.createElement('button');
        playButton.textContent = '播放';
        playButton.style.margin = '5px';
        playButton.onclick = () => {
            if (!this.animationId) {
                animateFunction();
                playButton.textContent = '暂停';
            } else {
                cancelAnimationFrame(this.animationId);
                this.animationId = null;
                playButton.textContent = '播放';
            }
        };
        
        const resetButton = document.createElement('button');
        resetButton.textContent = '重置';
        resetButton.style.margin = '5px';
        resetButton.onclick = () => {
            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
                this.animationId = null;
            }
            this.time = 0;
            playButton.textContent = '播放';
        };
        
        controls.appendChild(playButton);
        controls.appendChild(resetButton);
        this.container.appendChild(controls);
    }

    /**
     * 销毁可视化
     */
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.container.innerHTML = '';
    }
}

// 示例：热传导方程
export function createHeatEquationExample(container) {
    const visualizer = new PDEVisualizer(container);
    
    visualizer.renderHeatEquation({
        initialCondition: (x) => Math.sin(Math.PI * x),
        xRange: [0, 1],
        tMax: 0.5,
        alpha: 0.01
    });
    
    return visualizer;
}

// 示例：波动方程
export function createWaveEquationExample(container) {
    const visualizer = new PDEVisualizer(container);
    
    visualizer.renderWaveEquation({
        initialPosition: (x) => Math.sin(Math.PI * x),
        initialVelocity: (x) => 0,
        xRange: [0, 1],
        tMax: 2,
        c: 1
    });
    
    return visualizer;
}

// 示例：拉普拉斯方程
export function createLaplaceEquationExample(container) {
    const visualizer = new PDEVisualizer(container);
    
    visualizer.renderLaplaceEquation({
        boundaryCondition: (x, y) => {
            if (y === 1) return Math.sin(Math.PI * x);
            return 0;
        },
        xRange: [0, 1],
        yRange: [0, 1],
        iterations: 1000
    });
    
    return visualizer;
}
