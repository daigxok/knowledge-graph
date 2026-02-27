/**
 * OptimizationVisualizer - 优化算法可视化组件
 * Task 19.4: 实现优化算法可视化
 * 需求 12.4: 为优化算法节点提供迭代过程的可视化
 */

export class OptimizationVisualizer {
    constructor(container) {
        this.container = container;
        this.width = 800;
        this.height = 600;
        this.margin = { top: 40, right: 40, bottom: 60, left: 60 };
        this.animationId = null;
        this.currentIteration = 0;
    }

    /**
     * 渲染梯度下降算法
     * @param {Object} config - 配置对象
     */
    renderGradientDescent(config) {
        const {
            objectiveFunction = (x, y) => x * x + y * y,
            gradient = (x, y) => [2 * x, 2 * y],
            startPoint = [2, 2],
            learningRate = 0.1,
            maxIterations = 50,
            xRange = [-3, 3],
            yRange = [-3, 3]
        } = config;
        
        this.container.innerHTML = '';
        
        // 创建SVG
        const svg = d3.select(this.container)
            .append('svg')
            .attr('width', this.width)
            .attr('height', this.height);
        
        // 创建比例尺
        const xScale = d3.scaleLinear()
            .domain(xRange)
            .range([this.margin.left, this.width - this.margin.right]);
        
        const yScale = d3.scaleLinear()
            .domain(yRange)
            .range([this.height - this.margin.bottom, this.margin.top]);
        
        // 绘制等高线
        this.drawContours(svg, objectiveFunction, xRange, yRange, xScale, yScale);
        
        // 绘制坐标轴
        this.drawAxes(svg, xScale, yScale);
        
        // 执行梯度下降
        const path = this.gradientDescentPath(
            startPoint,
            gradient,
            learningRate,
            maxIterations
        );
        
        // 绘制路径
        this.drawOptimizationPath(svg, path, xScale, yScale, objectiveFunction);
        
        // 添加信息面板
        this.addInfoPanel(path, objectiveFunction);
        
        // 添加控制按钮
        this.addControls();
    }

    /**
     * 绘制等高线
     */
    drawContours(svg, func, xRange, yRange, xScale, yScale) {
        const [xMin, xMax] = xRange;
        const [yMin, yMax] = yRange;
        const resolution = 50;
        const dx = (xMax - xMin) / resolution;
        const dy = (yMax - yMin) / resolution;
        
        // 生成网格数据
        const contourData = [];
        for (let i = 0; i <= resolution; i++) {
            for (let j = 0; j <= resolution; j++) {
                const x = xMin + i * dx;
                const y = yMin + j * dy;
                contourData.push({
                    x: x,
                    y: y,
                    z: func(x, y)
                });
            }
        }
        
        // 找到z值范围
        const zValues = contourData.map(d => d.z);
        const zMin = Math.min(...zValues);
        const zMax = Math.max(...zValues);
        
        // 颜色比例尺
        const colorScale = d3.scaleSequential(d3.interpolateYlOrRd)
            .domain([zMin, zMax]);
        
        // 绘制热图
        const cellWidth = (this.width - this.margin.left - this.margin.right) / resolution;
        const cellHeight = (this.height - this.margin.top - this.margin.bottom) / resolution;
        
        svg.append('g')
            .attr('class', 'contours')
            .selectAll('rect')
            .data(contourData)
            .enter()
            .append('rect')
            .attr('x', d => xScale(d.x) - cellWidth / 2)
            .attr('y', d => yScale(d.y) - cellHeight / 2)
            .attr('width', cellWidth)
            .attr('height', cellHeight)
            .attr('fill', d => colorScale(d.z))
            .attr('opacity', 0.6);
    }

    /**
     * 绘制坐标轴
     */
    drawAxes(svg, xScale, yScale) {
        svg.append('g')
            .attr('transform', `translate(0,${this.height - this.margin.bottom})`)
            .call(d3.axisBottom(xScale));
        
        svg.append('g')
            .attr('transform', `translate(${this.margin.left},0)`)
            .call(d3.axisLeft(yScale));
    }

    /**
     * 计算梯度下降路径
     */
    gradientDescentPath(startPoint, gradient, learningRate, maxIterations) {
        const path = [startPoint];
        let [x, y] = startPoint;
        
        for (let i = 0; i < maxIterations; i++) {
            const [gx, gy] = gradient(x, y);
            x = x - learningRate * gx;
            y = y - learningRate * gy;
            path.push([x, y]);
            
            // 收敛判断
            if (Math.sqrt(gx * gx + gy * gy) < 1e-6) {
                break;
            }
        }
        
        return path;
    }

    /**
     * 绘制优化路径
     */
    drawOptimizationPath(svg, path, xScale, yScale, objectiveFunction) {
        const pathGroup = svg.append('g').attr('class', 'optimization-path');
        
        // 绘制路径线
        const line = d3.line()
            .x(d => xScale(d[0]))
            .y(d => yScale(d[1]));
        
        pathGroup.append('path')
            .datum(path)
            .attr('d', line)
            .attr('fill', 'none')
            .attr('stroke', '#2196F3')
            .attr('stroke-width', 2)
            .attr('stroke-dasharray', '5,5');
        
        // 绘制迭代点
        pathGroup.selectAll('circle')
            .data(path)
            .enter()
            .append('circle')
            .attr('cx', d => xScale(d[0]))
            .attr('cy', d => yScale(d[1]))
            .attr('r', 4)
            .attr('fill', (d, i) => i === 0 ? '#4CAF50' : i === path.length - 1 ? '#F44336' : '#2196F3')
            .attr('stroke', 'white')
            .attr('stroke-width', 2)
            .append('title')
            .text((d, i) => `迭代 ${i}: (${d[0].toFixed(3)}, ${d[1].toFixed(3)}), f = ${objectiveFunction(d[0], d[1]).toFixed(3)}`);
        
        // 添加箭头
        for (let i = 0; i < path.length - 1; i++) {
            const [x1, y1] = path[i];
            const [x2, y2] = path[i + 1];
            const angle = Math.atan2(y2 - y1, x2 - x1);
            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2;
            
            this.drawArrow(
                pathGroup,
                xScale(midX),
                yScale(midY),
                angle,
                '#2196F3'
            );
        }
    }

    /**
     * 绘制箭头
     */
    drawArrow(group, x, y, angle, color) {
        const arrowSize = 8;
        const arrowPoints = [
            [x, y],
            [
                x - arrowSize * Math.cos(angle - Math.PI / 6),
                y - arrowSize * Math.sin(angle - Math.PI / 6)
            ],
            [
                x - arrowSize * Math.cos(angle + Math.PI / 6),
                y - arrowSize * Math.sin(angle + Math.PI / 6)
            ]
        ];
        
        group.append('polygon')
            .attr('points', arrowPoints.map(p => p.join(',')).join(' '))
            .attr('fill', color);
    }

    /**
     * 添加信息面板
     */
    addInfoPanel(path, objectiveFunction) {
        const info = document.createElement('div');
        info.style.marginTop = '10px';
        info.style.padding = '10px';
        info.style.backgroundColor = '#f5f5f5';
        info.style.borderRadius = '5px';
        
        const startPoint = path[0];
        const endPoint = path[path.length - 1];
        const startValue = objectiveFunction(startPoint[0], startPoint[1]);
        const endValue = objectiveFunction(endPoint[0], endPoint[1]);
        
        info.innerHTML = `
            <h4>优化结果</h4>
            <p><strong>起点:</strong> (${startPoint[0].toFixed(3)}, ${startPoint[1].toFixed(3)}), f = ${startValue.toFixed(3)}</p>
            <p><strong>终点:</strong> (${endPoint[0].toFixed(3)}, ${endPoint[1].toFixed(3)}), f = ${endValue.toFixed(3)}</p>
            <p><strong>迭代次数:</strong> ${path.length - 1}</p>
            <p><strong>函数值减少:</strong> ${(startValue - endValue).toFixed(3)} (${((1 - endValue / startValue) * 100).toFixed(1)}%)</p>
        `;
        
        this.container.appendChild(info);
    }

    /**
     * 渲染牛顿法
     * @param {Object} config - 配置对象
     */
    renderNewtonMethod(config) {
        const {
            objectiveFunction = (x, y) => x * x + y * y,
            gradient = (x, y) => [2 * x, 2 * y],
            hessian = (x, y) => [[2, 0], [0, 2]],
            startPoint = [2, 2],
            maxIterations = 20,
            xRange = [-3, 3],
            yRange = [-3, 3]
        } = config;
        
        // 计算牛顿法路径
        const path = this.newtonMethodPath(
            startPoint,
            gradient,
            hessian,
            maxIterations
        );
        
        // 使用相同的渲染逻辑
        this.renderGradientDescent({
            objectiveFunction,
            gradient,
            startPoint,
            learningRate: 0, // 不使用
            maxIterations: 0, // 不使用
            xRange,
            yRange
        });
        
        // 重新绘制路径（牛顿法的路径）
        const svg = d3.select(this.container).select('svg');
        const xScale = d3.scaleLinear()
            .domain(xRange)
            .range([this.margin.left, this.width - this.margin.right]);
        const yScale = d3.scaleLinear()
            .domain(yRange)
            .range([this.height - this.margin.bottom, this.margin.top]);
        
        svg.select('.optimization-path').remove();
        this.drawOptimizationPath(svg, path, xScale, yScale, objectiveFunction);
    }

    /**
     * 计算牛顿法路径
     */
    newtonMethodPath(startPoint, gradient, hessian, maxIterations) {
        const path = [startPoint];
        let [x, y] = startPoint;
        
        for (let i = 0; i < maxIterations; i++) {
            const [gx, gy] = gradient(x, y);
            const H = hessian(x, y);
            
            // 求解 H * d = -g
            const det = H[0][0] * H[1][1] - H[0][1] * H[1][0];
            if (Math.abs(det) < 1e-10) break;
            
            const dx = (-H[1][1] * gx + H[0][1] * gy) / det;
            const dy = (H[1][0] * gx - H[0][0] * gy) / det;
            
            x = x + dx;
            y = y + dy;
            path.push([x, y]);
            
            // 收敛判断
            if (Math.sqrt(gx * gx + gy * gy) < 1e-6) {
                break;
            }
        }
        
        return path;
    }

    /**
     * 添加控制按钮
     */
    addControls() {
        const controls = document.createElement('div');
        controls.style.marginTop = '10px';
        controls.style.textAlign = 'center';
        
        const resetButton = document.createElement('button');
        resetButton.textContent = '重置';
        resetButton.style.margin = '5px';
        resetButton.onclick = () => {
            this.currentIteration = 0;
        };
        
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

// 示例：梯度下降
export function createGradientDescentExample(container) {
    const visualizer = new OptimizationVisualizer(container);
    
    visualizer.renderGradientDescent({
        objectiveFunction: (x, y) => x * x + y * y,
        gradient: (x, y) => [2 * x, 2 * y],
        startPoint: [2, 2],
        learningRate: 0.1,
        maxIterations: 50
    });
    
    return visualizer;
}

// 示例：牛顿法
export function createNewtonMethodExample(container) {
    const visualizer = new OptimizationVisualizer(container);
    
    visualizer.renderNewtonMethod({
        objectiveFunction: (x, y) => x * x + y * y,
        gradient: (x, y) => [2 * x, 2 * y],
        hessian: (x, y) => [[2, 0], [0, 2]],
        startPoint: [2, 2],
        maxIterations: 20
    });
    
    return visualizer;
}
