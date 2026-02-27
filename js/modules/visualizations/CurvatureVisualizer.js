/**
 * CurvatureVisualizer - 曲率可视化组件
 * Task 19.1: 实现曲率节点可视化
 * 需求 12.1: 为曲率节点提供曲线曲率的动态可视化
 */

export class CurvatureVisualizer {
    constructor(container) {
        this.container = container;
        this.width = 800;
        this.height = 600;
        this.margin = { top: 40, right: 40, bottom: 60, left: 60 };
        this.t = 0; // 动画参数
        this.animationId = null;
    }

    /**
     * 渲染曲率可视化
     * @param {Object} config - 配置对象
     * @param {Function} config.curve - 曲线函数 (t) => [x, y]
     * @param {Function} config.curvature - 曲率函数 (t) => k
     * @param {Array} config.tRange - t的范围 [tMin, tMax]
     */
    render(config) {
        const { curve, curvature, tRange = [0, 2 * Math.PI] } = config;
        
        // 清空容器
        this.container.innerHTML = '';
        
        // 创建SVG
        const svg = d3.select(this.container)
            .append('svg')
            .attr('width', this.width)
            .attr('height', this.height);
        
        // 创建比例尺
        const xScale = d3.scaleLinear()
            .domain([-3, 3])
            .range([this.margin.left, this.width - this.margin.right]);
        
        const yScale = d3.scaleLinear()
            .domain([-3, 3])
            .range([this.height - this.margin.bottom, this.margin.top]);
        
        // 绘制坐标轴
        this.drawAxes(svg, xScale, yScale);
        
        // 绘制曲线
        this.drawCurve(svg, curve, tRange, xScale, yScale);
        
        // 绘制曲率圆、切线和法线
        this.drawCurvatureElements(svg, curve, curvature, xScale, yScale);
        
        // 添加控制按钮
        this.addControls();
        
        // 启动动画
        this.startAnimation(curve, curvature, tRange, svg, xScale, yScale);
    }

    /**
     * 绘制坐标轴
     */
    drawAxes(svg, xScale, yScale) {
        // X轴
        svg.append('g')
            .attr('transform', `translate(0,${this.height / 2})`)
            .call(d3.axisBottom(xScale))
            .append('text')
            .attr('x', this.width - this.margin.right)
            .attr('y', -10)
            .attr('fill', 'black')
            .text('x');
        
        // Y轴
        svg.append('g')
            .attr('transform', `translate(${this.width / 2},0)`)
            .call(d3.axisLeft(yScale))
            .append('text')
            .attr('x', 10)
            .attr('y', this.margin.top)
            .attr('fill', 'black')
            .text('y');
    }

    /**
     * 绘制曲线
     */
    drawCurve(svg, curve, tRange, xScale, yScale) {
        const [tMin, tMax] = tRange;
        const points = [];
        
        for (let t = tMin; t <= tMax; t += 0.01) {
            const [x, y] = curve(t);
            points.push([xScale(x), yScale(y)]);
        }
        
        const line = d3.line();
        
        svg.append('path')
            .datum(points)
            .attr('class', 'curve')
            .attr('d', line)
            .attr('fill', 'none')
            .attr('stroke', '#2196F3')
            .attr('stroke-width', 2);
    }

    /**
     * 绘制曲率元素（曲率圆、切线、法线）
     */
    drawCurvatureElements(svg, curve, curvature, xScale, yScale) {
        // 创建组
        const group = svg.append('g').attr('class', 'curvature-elements');
        
        // 当前点
        group.append('circle')
            .attr('class', 'current-point')
            .attr('r', 5)
            .attr('fill', '#F44336');
        
        // 切线
        group.append('line')
            .attr('class', 'tangent')
            .attr('stroke', '#4CAF50')
            .attr('stroke-width', 2)
            .attr('stroke-dasharray', '5,5');
        
        // 法线
        group.append('line')
            .attr('class', 'normal')
            .attr('stroke', '#FF9800')
            .attr('stroke-width', 2)
            .attr('stroke-dasharray', '5,5');
        
        // 曲率圆
        group.append('circle')
            .attr('class', 'curvature-circle')
            .attr('fill', 'none')
            .attr('stroke', '#9C27B0')
            .attr('stroke-width', 2)
            .attr('opacity', 0.6);
        
        // 曲率圆圆心
        group.append('circle')
            .attr('class', 'curvature-center')
            .attr('r', 3)
            .attr('fill', '#9C27B0');
        
        // 信息文本
        group.append('text')
            .attr('class', 'info-text')
            .attr('x', this.margin.left)
            .attr('y', this.margin.top - 10)
            .attr('font-size', '14px')
            .attr('fill', 'black');
    }

    /**
     * 更新曲率元素
     */
    updateCurvatureElements(svg, curve, curvature, t, xScale, yScale) {
        const dt = 0.001;
        
        // 计算当前点
        const [x, y] = curve(t);
        const px = xScale(x);
        const py = yScale(y);
        
        // 计算导数（切向量）
        const [x1, y1] = curve(t + dt);
        const dx = (x1 - x) / dt;
        const dy = (y1 - y) / dt;
        const tangentLength = Math.sqrt(dx * dx + dy * dy);
        const tx = dx / tangentLength;
        const ty = dy / tangentLength;
        
        // 计算法向量
        const nx = -ty;
        const ny = tx;
        
        // 计算曲率
        const k = curvature(t);
        const radius = Math.abs(1 / k);
        
        // 更新当前点
        svg.select('.current-point')
            .attr('cx', px)
            .attr('cy', py);
        
        // 更新切线
        const tangentLen = 100;
        svg.select('.tangent')
            .attr('x1', px - tx * tangentLen)
            .attr('y1', py - ty * tangentLen)
            .attr('x2', px + tx * tangentLen)
            .attr('y2', py + ty * tangentLen);
        
        // 更新法线
        const normalLen = 100;
        svg.select('.normal')
            .attr('x1', px - nx * normalLen)
            .attr('y1', py - ny * normalLen)
            .attr('x2', px + nx * normalLen)
            .attr('y2', py + ny * normalLen);
        
        // 更新曲率圆
        const centerX = x + nx * radius;
        const centerY = y + ny * radius;
        const radiusPixels = Math.abs(xScale(radius) - xScale(0));
        
        svg.select('.curvature-circle')
            .attr('cx', xScale(centerX))
            .attr('cy', yScale(centerY))
            .attr('r', radiusPixels);
        
        // 更新曲率圆圆心
        svg.select('.curvature-center')
            .attr('cx', xScale(centerX))
            .attr('cy', yScale(centerY));
        
        // 更新信息文本
        svg.select('.info-text')
            .text(`t = ${t.toFixed(2)}, 曲率 κ = ${k.toFixed(4)}, 曲率半径 ρ = ${radius.toFixed(4)}`);
    }

    /**
     * 启动动画
     */
    startAnimation(curve, curvature, tRange, svg, xScale, yScale) {
        const [tMin, tMax] = tRange;
        const speed = 0.02;
        
        const animate = () => {
            this.t += speed;
            if (this.t > tMax) this.t = tMin;
            
            this.updateCurvatureElements(svg, curve, curvature, this.t, xScale, yScale);
            
            this.animationId = requestAnimationFrame(animate);
        };
        
        animate();
    }

    /**
     * 添加控制按钮
     */
    addControls() {
        const controls = document.createElement('div');
        controls.style.marginTop = '10px';
        
        const playButton = document.createElement('button');
        playButton.textContent = '暂停';
        playButton.onclick = () => {
            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
                this.animationId = null;
                playButton.textContent = '播放';
            } else {
                this.startAnimation();
                playButton.textContent = '暂停';
            }
        };
        
        controls.appendChild(playButton);
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

// 示例：圆的曲率可视化
export function createCircleCurvatureExample(container) {
    const visualizer = new CurvatureVisualizer(container);
    
    const radius = 2;
    const curve = (t) => [radius * Math.cos(t), radius * Math.sin(t)];
    const curvature = (t) => 1 / radius; // 圆的曲率是常数
    
    visualizer.render({
        curve,
        curvature,
        tRange: [0, 2 * Math.PI]
    });
    
    return visualizer;
}

// 示例：抛物线的曲率可视化
export function createParabolaCurvatureExample(container) {
    const visualizer = new CurvatureVisualizer(container);
    
    const curve = (t) => [t, t * t];
    const curvature = (t) => 2 / Math.pow(1 + 4 * t * t, 1.5);
    
    visualizer.render({
        curve,
        curvature,
        tRange: [-2, 2]
    });
    
    return visualizer;
}
