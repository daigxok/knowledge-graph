/**
 * Gradient Visualization Skill
 * 梯度可视化Skill - 3D曲面和梯度向量可视化
 */

export class GradientVisualizationSkill {
    constructor(container) {
        this.container = container;
        this.canvas = null;
        this.ctx = null;
        this.isActive = false;
        this.animationId = null;
        
        // 参数
        this.params = {
            functionType: 'paraboloid', // paraboloid, saddle, peaks
            showGradient: true,
            showContour: true,
            pointX: 0,
            pointY: 0,
            gridSize: 20
        };
    }

    /**
     * 初始化Skill
     */
    async init() {
        this.createUI();
        this.isActive = true;
        this.render();
        console.log('✅ Gradient Visualization Skill initialized');
    }

    /**
     * 创建UI
     */
    createUI() {
        this.container.innerHTML = `
            <div class="gradient-viz-container">
                <div class="viz-controls">
                    <div class="control-group">
                        <label>函数类型:</label>
                        <select id="functionType">
                            <option value="paraboloid">抛物面 (x² + y²)</option>
                            <option value="saddle">鞍面 (x² - y²)</option>
                            <option value="peaks">峰面 (sin(x)cos(y))</option>
                        </select>
                    </div>
                    
                    <div class="control-group">
                        <label>
                            <input type="checkbox" id="showGradient" checked>
                            显示梯度向量
                        </label>
                    </div>
                    
                    <div class="control-group">
                        <label>
                            <input type="checkbox" id="showContour" checked>
                            显示等高线
                        </label>
                    </div>
                    
                    <div class="control-group">
                        <label>点位置 X: <span id="pointXValue">0.0</span></label>
                        <input type="range" id="pointX" min="-2" max="2" step="0.1" value="0">
                    </div>
                    
                    <div class="control-group">
                        <label>点位置 Y: <span id="pointYValue">0.0</span></label>
                        <input type="range" id="pointY" min="-2" max="2" step="0.1" value="0">
                    </div>
                    
                    <button id="resetView" class="viz-button">重置视图</button>
                </div>
                
                <div class="viz-canvas-container">
                    <canvas id="gradientCanvas" width="600" height="500"></canvas>
                    <div class="viz-info">
                        <div id="gradientInfo"></div>
                    </div>
                </div>
            </div>
        `;

        this.canvas = this.container.querySelector('#gradientCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.attachEventListeners();
    }

    /**
     * 附加事件监听器
     */
    attachEventListeners() {
        const functionType = this.container.querySelector('#functionType');
        const showGradient = this.container.querySelector('#showGradient');
        const showContour = this.container.querySelector('#showContour');
        const pointX = this.container.querySelector('#pointX');
        const pointY = this.container.querySelector('#pointY');
        const resetView = this.container.querySelector('#resetView');

        functionType.addEventListener('change', (e) => {
            this.params.functionType = e.target.value;
            this.render();
        });

        showGradient.addEventListener('change', (e) => {
            this.params.showGradient = e.target.checked;
            this.render();
        });

        showContour.addEventListener('change', (e) => {
            this.params.showContour = e.target.checked;
            this.render();
        });

        pointX.addEventListener('input', (e) => {
            this.params.pointX = parseFloat(e.target.value);
            this.container.querySelector('#pointXValue').textContent = e.target.value;
            this.render();
        });

        pointY.addEventListener('input', (e) => {
            this.params.pointY = parseFloat(e.target.value);
            this.container.querySelector('#pointYValue').textContent = e.target.value;
            this.render();
        });

        resetView.addEventListener('click', () => {
            this.params.pointX = 0;
            this.params.pointY = 0;
            pointX.value = 0;
            pointY.value = 0;
            this.container.querySelector('#pointXValue').textContent = '0.0';
            this.container.querySelector('#pointYValue').textContent = '0.0';
            this.render();
        });
    }

    /**
     * 计算函数值
     */
    computeFunction(x, y) {
        switch (this.params.functionType) {
            case 'paraboloid':
                return x * x + y * y;
            case 'saddle':
                return x * x - y * y;
            case 'peaks':
                return Math.sin(x) * Math.cos(y);
            default:
                return 0;
        }
    }

    /**
     * 计算梯度
     */
    computeGradient(x, y) {
        const h = 0.001;
        const fx = (this.computeFunction(x + h, y) - this.computeFunction(x - h, y)) / (2 * h);
        const fy = (this.computeFunction(x, y + h) - this.computeFunction(x, y - h)) / (2 * h);
        return { x: fx, y: fy };
    }

    /**
     * 渲染可视化
     */
    render() {
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        // 清空画布
        this.ctx.clearRect(0, 0, width, height);
        
        // 绘制等高线
        if (this.params.showContour) {
            this.drawContours();
        }
        
        // 绘制梯度向量
        if (this.params.showGradient) {
            this.drawGradientField();
        }
        
        // 绘制当前点
        this.drawCurrentPoint();
        
        // 更新信息
        this.updateInfo();
    }

    /**
     * 绘制等高线
     */
    drawContours() {
        const width = this.canvas.width;
        const height = this.canvas.height;
        const scale = 80;
        const centerX = width / 2;
        const centerY = height / 2;

        // 绘制多个等高线
        const levels = [-2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2];
        
        levels.forEach(level => {
            this.ctx.beginPath();
            this.ctx.strokeStyle = `rgba(100, 100, 200, 0.3)`;
            this.ctx.lineWidth = 1;

            for (let angle = 0; angle <= Math.PI * 2; angle += 0.1) {
                // 简化的等高线绘制
                const r = Math.sqrt(Math.abs(level));
                const x = centerX + r * Math.cos(angle) * scale;
                const y = centerY + r * Math.sin(angle) * scale;
                
                if (angle === 0) {
                    this.ctx.moveTo(x, y);
                } else {
                    this.ctx.lineTo(x, y);
                }
            }
            
            this.ctx.closePath();
            this.ctx.stroke();
        });
    }

    /**
     * 绘制梯度场
     */
    drawGradientField() {
        const width = this.canvas.width;
        const height = this.canvas.height;
        const scale = 80;
        const centerX = width / 2;
        const centerY = height / 2;
        const step = 1;

        for (let x = -2; x <= 2; x += step) {
            for (let y = -2; y <= 2; y += step) {
                const grad = this.computeGradient(x, y);
                const magnitude = Math.sqrt(grad.x * grad.x + grad.y * grad.y);
                
                if (magnitude > 0.01) {
                    const px = centerX + x * scale;
                    const py = centerY - y * scale;
                    
                    const arrowLength = Math.min(magnitude * 20, 40);
                    const dx = (grad.x / magnitude) * arrowLength;
                    const dy = -(grad.y / magnitude) * arrowLength;
                    
                    this.drawArrow(px, py, px + dx, py + dy, 'rgba(255, 100, 100, 0.6)');
                }
            }
        }
    }

    /**
     * 绘制箭头
     */
    drawArrow(x1, y1, x2, y2, color) {
        const headLength = 8;
        const angle = Math.atan2(y2 - y1, x2 - x1);

        this.ctx.beginPath();
        this.ctx.strokeStyle = color;
        this.ctx.fillStyle = color;
        this.ctx.lineWidth = 2;
        
        // 线
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();
        
        // 箭头
        this.ctx.beginPath();
        this.ctx.moveTo(x2, y2);
        this.ctx.lineTo(
            x2 - headLength * Math.cos(angle - Math.PI / 6),
            y2 - headLength * Math.sin(angle - Math.PI / 6)
        );
        this.ctx.lineTo(
            x2 - headLength * Math.cos(angle + Math.PI / 6),
            y2 - headLength * Math.sin(angle + Math.PI / 6)
        );
        this.ctx.closePath();
        this.ctx.fill();
    }

    /**
     * 绘制当前点
     */
    drawCurrentPoint() {
        const width = this.canvas.width;
        const height = this.canvas.height;
        const scale = 80;
        const centerX = width / 2;
        const centerY = height / 2;

        const px = centerX + this.params.pointX * scale;
        const py = centerY - this.params.pointY * scale;

        // 绘制点
        this.ctx.beginPath();
        this.ctx.arc(px, py, 6, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(255, 200, 0, 0.9)';
        this.ctx.fill();
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        // 绘制该点的梯度向量
        const grad = this.computeGradient(this.params.pointX, this.params.pointY);
        const magnitude = Math.sqrt(grad.x * grad.x + grad.y * grad.y);
        
        if (magnitude > 0.01) {
            const arrowLength = Math.min(magnitude * 30, 60);
            const dx = (grad.x / magnitude) * arrowLength;
            const dy = -(grad.y / magnitude) * arrowLength;
            
            this.drawArrow(px, py, px + dx, py + dy, 'rgba(255, 0, 0, 0.9)');
        }
    }

    /**
     * 更新信息显示
     */
    updateInfo() {
        const x = this.params.pointX;
        const y = this.params.pointY;
        const z = this.computeFunction(x, y);
        const grad = this.computeGradient(x, y);
        const magnitude = Math.sqrt(grad.x * grad.x + grad.y * grad.y);

        const infoDiv = this.container.querySelector('#gradientInfo');
        infoDiv.innerHTML = `
            <div class="info-item"><strong>点坐标:</strong> (${x.toFixed(2)}, ${y.toFixed(2)})</div>
            <div class="info-item"><strong>函数值:</strong> f(x,y) = ${z.toFixed(3)}</div>
            <div class="info-item"><strong>梯度:</strong> ∇f = (${grad.x.toFixed(3)}, ${grad.y.toFixed(3)})</div>
            <div class="info-item"><strong>梯度模:</strong> |∇f| = ${magnitude.toFixed(3)}</div>
        `;
    }

    /**
     * 销毁Skill
     */
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.isActive = false;
        this.container.innerHTML = '';
    }
}
