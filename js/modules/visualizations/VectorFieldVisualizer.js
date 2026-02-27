/**
 * VectorFieldVisualizer - 向量场可视化组件
 * Task 19.2: 实现场论节点可视化
 * 需求 12.2: 为场论节点提供向量场的可视化
 */

export class VectorFieldVisualizer {
    constructor(container) {
        this.container = container;
        this.width = 800;
        this.height = 600;
        this.margin = { top: 40, right: 40, bottom: 60, left: 60 };
        this.gridSize = 20; // 网格大小
    }

    /**
     * 渲染2D向量场
     * @param {Object} config - 配置对象
     * @param {Function} config.field - 向量场函数 (x, y) => [vx, vy]
     * @param {Array} config.xRange - x范围 [xMin, xMax]
     * @param {Array} config.yRange - y范围 [yMin, yMax]
     * @param {string} config.colorScheme - 颜色方案
     */
    render2D(config) {
        const {
            field,
            xRange = [-5, 5],
            yRange = [-5, 5],
            colorScheme = 'viridis'
        } = config;
        
        // 清空容器
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
        
        // 绘制坐标轴
        this.drawAxes(svg, xScale, yScale);
        
        // 绘制向量场
        this.drawVectorField(svg, field, xRange, yRange, xScale, yScale, colorScheme);
        
        // 添加图例
        this.addLegend(svg, colorScheme);
    }

    /**
     * 绘制坐标轴
     */
    drawAxes(svg, xScale, yScale) {
        // X轴
        svg.append('g')
            .attr('transform', `translate(0,${this.height - this.margin.bottom})`)
            .call(d3.axisBottom(xScale))
            .append('text')
            .attr('x', this.width - this.margin.right)
            .attr('y', -10)
            .attr('fill', 'black')
            .text('x');
        
        // Y轴
        svg.append('g')
            .attr('transform', `translate(${this.margin.left},0)`)
            .call(d3.axisLeft(yScale))
            .append('text')
            .attr('x', 10)
            .attr('y', this.margin.top)
            .attr('fill', 'black')
            .text('y');
    }

    /**
     * 绘制向量场
     */
    drawVectorField(svg, field, xRange, yRange, xScale, yScale, colorScheme) {
        const [xMin, xMax] = xRange;
        const [yMin, yMax] = yRange;
        const dx = (xMax - xMin) / this.gridSize;
        const dy = (yMax - yMin) / this.gridSize;
        
        // 计算所有向量的模，用于归一化和着色
        const magnitudes = [];
        for (let x = xMin; x <= xMax; x += dx) {
            for (let y = yMin; y <= yMax; y += dy) {
                const [vx, vy] = field(x, y);
                magnitudes.push(Math.sqrt(vx * vx + vy * vy));
            }
        }
        
        const maxMagnitude = Math.max(...magnitudes);
        const minMagnitude = Math.min(...magnitudes);
        
        // 颜色比例尺
        const colorScale = d3.scaleSequential(d3.interpolateViridis)
            .domain([minMagnitude, maxMagnitude]);
        
        // 绘制向量
        const arrowGroup = svg.append('g').attr('class', 'vector-field');
        
        for (let x = xMin; x <= xMax; x += dx) {
            for (let y = yMin; y <= yMax; y += dy) {
                const [vx, vy] = field(x, y);
                const magnitude = Math.sqrt(vx * vx + vy * vy);
                
                if (magnitude < 0.01) continue; // 跳过零向量
                
                // 归一化向量
                const scale = 0.4 * dx; // 箭头长度
                const nvx = (vx / magnitude) * scale;
                const nvy = (vy / magnitude) * scale;
                
                const x1 = xScale(x);
                const y1 = yScale(y);
                const x2 = xScale(x + nvx);
                const y2 = yScale(y + nvy);
                
                // 绘制箭头
                this.drawArrow(arrowGroup, x1, y1, x2, y2, colorScale(magnitude));
            }
        }
    }

    /**
     * 绘制箭头
     */
    drawArrow(group, x1, y1, x2, y2, color) {
        // 箭头线
        group.append('line')
            .attr('x1', x1)
            .attr('y1', y1)
            .attr('x2', x2)
            .attr('y2', y2)
            .attr('stroke', color)
            .attr('stroke-width', 1.5);
        
        // 箭头头部
        const angle = Math.atan2(y2 - y1, x2 - x1);
        const arrowSize = 5;
        
        const arrowPoints = [
            [x2, y2],
            [
                x2 - arrowSize * Math.cos(angle - Math.PI / 6),
                y2 - arrowSize * Math.sin(angle - Math.PI / 6)
            ],
            [
                x2 - arrowSize * Math.cos(angle + Math.PI / 6),
                y2 - arrowSize * Math.sin(angle + Math.PI / 6)
            ]
        ];
        
        group.append('polygon')
            .attr('points', arrowPoints.map(p => p.join(',')).join(' '))
            .attr('fill', color);
    }

    /**
     * 添加图例
     */
    addLegend(svg, colorScheme) {
        const legendWidth = 20;
        const legendHeight = 200;
        const legendX = this.width - this.margin.right + 10;
        const legendY = this.margin.top;
        
        // 创建渐变
        const defs = svg.append('defs');
        const gradient = defs.append('linearGradient')
            .attr('id', 'legend-gradient')
            .attr('x1', '0%')
            .attr('y1', '100%')
            .attr('x2', '0%')
            .attr('y2', '0%');
        
        for (let i = 0; i <= 10; i++) {
            gradient.append('stop')
                .attr('offset', `${i * 10}%`)
                .attr('stop-color', d3.interpolateViridis(i / 10));
        }
        
        // 绘制图例矩形
        svg.append('rect')
            .attr('x', legendX)
            .attr('y', legendY)
            .attr('width', legendWidth)
            .attr('height', legendHeight)
            .style('fill', 'url(#legend-gradient)');
        
        // 添加标签
        svg.append('text')
            .attr('x', legendX + legendWidth / 2)
            .attr('y', legendY - 5)
            .attr('text-anchor', 'middle')
            .attr('font-size', '12px')
            .text('向量模');
    }

    /**
     * 渲染3D向量场（使用Plotly）
     * @param {Object} config - 配置对象
     */
    async render3D(config) {
        const {
            field,
            xRange = [-2, 2],
            yRange = [-2, 2],
            zRange = [-2, 2]
        } = config;
        
        // 生成网格点
        const gridSize = 10;
        const dx = (xRange[1] - xRange[0]) / gridSize;
        const dy = (yRange[1] - yRange[0]) / gridSize;
        const dz = (zRange[1] - zRange[0]) / gridSize;
        
        const x = [], y = [], z = [];
        const u = [], v = [], w = [];
        
        for (let xi = xRange[0]; xi <= xRange[1]; xi += dx) {
            for (let yi = yRange[0]; yi <= yRange[1]; yi += dy) {
                for (let zi = zRange[0]; zi <= zRange[1]; zi += dz) {
                    const [vx, vy, vz] = field(xi, yi, zi);
                    x.push(xi);
                    y.push(yi);
                    z.push(zi);
                    u.push(vx);
                    v.push(vy);
                    w.push(vz);
                }
            }
        }
        
        // 使用Plotly绘制3D向量场
        const data = [{
            type: 'cone',
            x, y, z, u, v, w,
            colorscale: 'Viridis',
            sizemode: 'absolute',
            sizeref: 0.5
        }];
        
        const layout = {
            scene: {
                xaxis: { title: 'X' },
                yaxis: { title: 'Y' },
                zaxis: { title: 'Z' }
            },
            title: '3D向量场'
        };
        
        if (typeof Plotly !== 'undefined') {
            Plotly.newPlot(this.container, data, layout);
        } else {
            console.warn('Plotly not loaded. Cannot render 3D vector field.');
        }
    }

    /**
     * 销毁可视化
     */
    destroy() {
        this.container.innerHTML = '';
    }
}

// 示例：梯度场
export function createGradientFieldExample(container) {
    const visualizer = new VectorFieldVisualizer(container);
    
    // 梯度场: ∇f = (2x, 2y) for f(x,y) = x² + y²
    const field = (x, y) => [2 * x, 2 * y];
    
    visualizer.render2D({
        field,
        xRange: [-3, 3],
        yRange: [-3, 3]
    });
    
    return visualizer;
}

// 示例：旋度场
export function createRotationalFieldExample(container) {
    const visualizer = new VectorFieldVisualizer(container);
    
    // 旋转场: F = (-y, x)
    const field = (x, y) => [-y, x];
    
    visualizer.render2D({
        field,
        xRange: [-3, 3],
        yRange: [-3, 3]
    });
    
    return visualizer;
}
