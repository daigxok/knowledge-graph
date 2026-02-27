/**
 * ProbabilityVisualizer - 概率分布可视化组件
 * Task 19.5: 实现概率分布可视化
 * 需求 12.5: 为概率分布节点提供交互式分布图
 */

export class ProbabilityVisualizer {
    constructor(container) {
        this.container = container;
        this.width = 800;
        this.height = 600;
        this.margin = { top: 40, right: 40, bottom: 60, left: 60 };
    }

    /**
     * 渲染正态分布
     * @param {Object} config - 配置对象
     */
    renderNormalDistribution(config) {
        const {
            mean = 0,
            stdDev = 1,
            xRange = [-5, 5]
        } = config;
        
        this.container.innerHTML = '';
        
        // 生成数据点
        const data = [];
        const step = (xRange[1] - xRange[0]) / 200;
        for (let x = xRange[0]; x <= xRange[1]; x += step) {
            const y = this.normalPDF(x, mean, stdDev);
            data.push({ x, y });
        }
        
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
            .domain([0, d3.max(data, d => d.y) * 1.1])
            .range([this.height - this.margin.bottom, this.margin.top]);
        
        // 绘制坐标轴
        this.drawAxes(svg, xScale, yScale, 'x', 'f(x)');
        
        // 绘制曲线
        const line = d3.line()
            .x(d => xScale(d.x))
            .y(d => yScale(d.y));
        
        svg.append('path')
            .datum(data)
            .attr('d', line)
            .attr('fill', 'none')
            .attr('stroke', '#2196F3')
            .attr('stroke-width', 2);
        
        // 填充区域
        const area = d3.area()
            .x(d => xScale(d.x))
            .y0(yScale(0))
            .y1(d => yScale(d.y));
        
        svg.append('path')
            .datum(data)
            .attr('d', area)
            .attr('fill', '#2196F3')
            .attr('opacity', 0.3);
        
        // 添加交互式控制
        this.addNormalDistributionControls(mean, stdDev, xRange);
    }

    /**
     * 正态分布PDF
     */
    normalPDF(x, mean, stdDev) {
        const coefficient = 1 / (stdDev * Math.sqrt(2 * Math.PI));
        const exponent = -Math.pow(x - mean, 2) / (2 * Math.pow(stdDev, 2));
        return coefficient * Math.exp(exponent);
    }

    /**
     * 渲染泊松分布
     * @param {Object} config - 配置对象
     */
    renderPoissonDistribution(config) {
        const {
            lambda = 3,
            maxK = 15
        } = config;
        
        this.container.innerHTML = '';
        
        // 生成数据点
        const data = [];
        for (let k = 0; k <= maxK; k++) {
            const prob = this.poissonPMF(k, lambda);
            data.push({ k, prob });
        }
        
        // 创建SVG
        const svg = d3.select(this.container)
            .append('svg')
            .attr('width', this.width)
            .attr('height', this.height);
        
        // 创建比例尺
        const xScale = d3.scaleBand()
            .domain(data.map(d => d.k))
            .range([this.margin.left, this.width - this.margin.right])
            .padding(0.1);
        
        const yScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.prob) * 1.1])
            .range([this.height - this.margin.bottom, this.margin.top]);
        
        // 绘制坐标轴
        svg.append('g')
            .attr('transform', `translate(0,${this.height - this.margin.bottom})`)
            .call(d3.axisBottom(xScale));
        
        svg.append('g')
            .attr('transform', `translate(${this.margin.left},0)`)
            .call(d3.axisLeft(yScale));
        
        // 绘制柱状图
        svg.selectAll('rect')
            .data(data)
            .enter()
            .append('rect')
            .attr('x', d => xScale(d.k))
            .attr('y', d => yScale(d.prob))
            .attr('width', xScale.bandwidth())
            .attr('height', d => yScale(0) - yScale(d.prob))
            .attr('fill', '#4CAF50')
            .attr('opacity', 0.8)
            .append('title')
            .text(d => `P(X = ${d.k}) = ${d.prob.toFixed(4)}`);
        
        // 添加交互式控制
        this.addPoissonDistributionControls(lambda, maxK);
    }

    /**
     * 泊松分布PMF
     */
    poissonPMF(k, lambda) {
        return Math.exp(-lambda) * Math.pow(lambda, k) / this.factorial(k);
    }

    /**
     * 阶乘
     */
    factorial(n) {
        if (n <= 1) return 1;
        let result = 1;
        for (let i = 2; i <= n; i++) {
            result *= i;
        }
        return result;
    }

    /**
     * 渲染指数分布
     * @param {Object} config - 配置对象
     */
    renderExponentialDistribution(config) {
        const {
            lambda = 1,
            xRange = [0, 5]
        } = config;
        
        this.container.innerHTML = '';
        
        // 生成数据点
        const data = [];
        const step = (xRange[1] - xRange[0]) / 200;
        for (let x = xRange[0]; x <= xRange[1]; x += step) {
            const y = lambda * Math.exp(-lambda * x);
            data.push({ x, y });
        }
        
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
            .domain([0, d3.max(data, d => d.y) * 1.1])
            .range([this.height - this.margin.bottom, this.margin.top]);
        
        // 绘制坐标轴
        this.drawAxes(svg, xScale, yScale, 'x', 'f(x)');
        
        // 绘制曲线
        const line = d3.line()
            .x(d => xScale(d.x))
            .y(d => yScale(d.y));
        
        svg.append('path')
            .datum(data)
            .attr('d', line)
            .attr('fill', 'none')
            .attr('stroke', '#FF9800')
            .attr('stroke-width', 2);
        
        // 填充区域
        const area = d3.area()
            .x(d => xScale(d.x))
            .y0(yScale(0))
            .y1(d => yScale(d.y));
        
        svg.append('path')
            .datum(data)
            .attr('d', area)
            .attr('fill', '#FF9800')
            .attr('opacity', 0.3);
        
        // 添加交互式控制
        this.addExponentialDistributionControls(lambda, xRange);
    }

    /**
     * 绘制坐标轴
     */
    drawAxes(svg, xScale, yScale, xLabel, yLabel) {
        // X轴
        svg.append('g')
            .attr('transform', `translate(0,${this.height - this.margin.bottom})`)
            .call(d3.axisBottom(xScale))
            .append('text')
            .attr('x', this.width - this.margin.right)
            .attr('y', -10)
            .attr('fill', 'black')
            .text(xLabel);
        
        // Y轴
        svg.append('g')
            .attr('transform', `translate(${this.margin.left},0)`)
            .call(d3.axisLeft(yScale))
            .append('text')
            .attr('x', 10)
            .attr('y', this.margin.top)
            .attr('fill', 'black')
            .text(yLabel);
    }

    /**
     * 添加正态分布控制
     */
    addNormalDistributionControls(initialMean, initialStdDev, xRange) {
        const controls = document.createElement('div');
        controls.style.marginTop = '10px';
        controls.style.padding = '10px';
        controls.style.backgroundColor = '#f5f5f5';
        controls.style.borderRadius = '5px';
        
        controls.innerHTML = `
            <div style="margin-bottom: 10px;">
                <label>均值 μ: <span id="mean-value">${initialMean}</span></label>
                <input type="range" id="mean-slider" min="-5" max="5" step="0.1" value="${initialMean}" style="width: 200px;">
            </div>
            <div>
                <label>标准差 σ: <span id="stddev-value">${initialStdDev}</span></label>
                <input type="range" id="stddev-slider" min="0.1" max="3" step="0.1" value="${initialStdDev}" style="width: 200px;">
            </div>
        `;
        
        this.container.appendChild(controls);
        
        // 添加事件监听
        const meanSlider = controls.querySelector('#mean-slider');
        const stdDevSlider = controls.querySelector('#stddev-slider');
        const meanValue = controls.querySelector('#mean-value');
        const stdDevValue = controls.querySelector('#stddev-value');
        
        const update = () => {
            const mean = parseFloat(meanSlider.value);
            const stdDev = parseFloat(stdDevSlider.value);
            meanValue.textContent = mean;
            stdDevValue.textContent = stdDev;
            
            // 重新渲染
            this.renderNormalDistribution({ mean, stdDev, xRange });
        };
        
        meanSlider.addEventListener('input', update);
        stdDevSlider.addEventListener('input', update);
    }

    /**
     * 添加泊松分布控制
     */
    addPoissonDistributionControls(initialLambda, maxK) {
        const controls = document.createElement('div');
        controls.style.marginTop = '10px';
        controls.style.padding = '10px';
        controls.style.backgroundColor = '#f5f5f5';
        controls.style.borderRadius = '5px';
        
        controls.innerHTML = `
            <div>
                <label>参数 λ: <span id="lambda-value">${initialLambda}</span></label>
                <input type="range" id="lambda-slider" min="0.5" max="10" step="0.5" value="${initialLambda}" style="width: 200px;">
            </div>
        `;
        
        this.container.appendChild(controls);
        
        // 添加事件监听
        const lambdaSlider = controls.querySelector('#lambda-slider');
        const lambdaValue = controls.querySelector('#lambda-value');
        
        lambdaSlider.addEventListener('input', () => {
            const lambda = parseFloat(lambdaSlider.value);
            lambdaValue.textContent = lambda;
            this.renderPoissonDistribution({ lambda, maxK });
        });
    }

    /**
     * 添加指数分布控制
     */
    addExponentialDistributionControls(initialLambda, xRange) {
        const controls = document.createElement('div');
        controls.style.marginTop = '10px';
        controls.style.padding = '10px';
        controls.style.backgroundColor = '#f5f5f5';
        controls.style.borderRadius = '5px';
        
        controls.innerHTML = `
            <div>
                <label>参数 λ: <span id="lambda-value">${initialLambda}</span></label>
                <input type="range" id="lambda-slider" min="0.1" max="3" step="0.1" value="${initialLambda}" style="width: 200px;">
            </div>
        `;
        
        this.container.appendChild(controls);
        
        // 添加事件监听
        const lambdaSlider = controls.querySelector('#lambda-slider');
        const lambdaValue = controls.querySelector('#lambda-value');
        
        lambdaSlider.addEventListener('input', () => {
            const lambda = parseFloat(lambdaSlider.value);
            lambdaValue.textContent = lambda;
            this.renderExponentialDistribution({ lambda, xRange });
        });
    }

    /**
     * 销毁可视化
     */
    destroy() {
        this.container.innerHTML = '';
    }
}

// 示例：正态分布
export function createNormalDistributionExample(container) {
    const visualizer = new ProbabilityVisualizer(container);
    
    visualizer.renderNormalDistribution({
        mean: 0,
        stdDev: 1,
        xRange: [-5, 5]
    });
    
    return visualizer;
}

// 示例：泊松分布
export function createPoissonDistributionExample(container) {
    const visualizer = new ProbabilityVisualizer(container);
    
    visualizer.renderPoissonDistribution({
        lambda: 3,
        maxK: 15
    });
    
    return visualizer;
}

// 示例：指数分布
export function createExponentialDistributionExample(container) {
    const visualizer = new ProbabilityVisualizer(container);
    
    visualizer.renderExponentialDistribution({
        lambda: 1,
        xRange: [0, 5]
    });
    
    return visualizer;
}
