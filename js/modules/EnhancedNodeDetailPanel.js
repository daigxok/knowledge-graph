/**
 * EnhancedNodeDetailPanel - 增强的节点详情面板
 * 支持Phase 2的新字段：高级主题、应用案例、可视化配置
 * Task 18.3: 实现节点详情面板
 */

export class EnhancedNodeDetailPanel {
    constructor(container) {
        this.container = container;
        this.currentNode = null;
        this.lazyLoadEnabled = true;
    }

    /**
     * 显示节点详情
     * @param {Object} node - 节点对象
     * @param {Object} options - 显示选项
     */
    show(node, options = {}) {
        this.currentNode = node;
        
        // 基础信息立即显示
        this.renderBasicInfo(node);
        
        // 懒加载详细内容
        if (this.lazyLoadEnabled && !options.immediate) {
            setTimeout(() => this.renderDetailedContent(node), 100);
        } else {
            this.renderDetailedContent(node);
        }
        
        // 显示面板
        this.container.classList.add('open');
    }

    /**
     * 渲染基础信息
     * @param {Object} node - 节点对象
     */
    renderBasicInfo(node) {
        const title = this.container.querySelector('#detailTitle');
        const content = this.container.querySelector('#detailContent');
        
        if (title) {
            title.textContent = node.name || '未命名节点';
        }
        
        if (content) {
            content.innerHTML = `
                <div class="detail-loading">
                    <div class="spinner-small"></div>
                    <p>加载详情中...</p>
                </div>
            `;
        }
    }

    /**
     * 渲染详细内容
     * @param {Object} node - 节点对象
     */
    renderDetailedContent(node) {
        const content = this.container.querySelector('#detailContent');
        if (!content) return;
        
        const isPhase2 = node.phase === 'phase2';
        
        content.innerHTML = `
            ${this.renderHeader(node, isPhase2)}
            ${this.renderDescription(node)}
            ${this.renderFormula(node)}
            ${this.renderMetadata(node)}
            ${isPhase2 ? this.renderAdvancedTopics(node) : ''}
            ${this.renderApplications(node, isPhase2)}
            ${isPhase2 ? this.renderVisualization(node) : ''}
            ${this.renderPrerequisites(node)}
            ${this.renderRelatedSkills(node)}
            ${this.renderKeywords(node)}
        `;
        
        // 触发MathJax渲染
        if (window.MathJax) {
            window.MathJax.typesetPromise([content]).catch(err => 
                console.warn('MathJax rendering failed:', err)
            );
        }
    }

    /**
     * 渲染头部信息
     */
    renderHeader(node, isPhase2) {
        const phaseBadge = isPhase2 
            ? '<span class="phase-badge phase2">Phase 2</span>' 
            : '<span class="phase-badge phase1">Phase 1</span>';
        
        return `
            <div class="detail-header">
                <h3>${node.name}</h3>
                ${node.nameEn ? `<p class="name-en">${node.nameEn}</p>` : ''}
                <div class="detail-badges">
                    ${phaseBadge}
                    <span class="difficulty-badge difficulty-${node.difficulty}">
                        难度 ${node.difficulty}/5
                    </span>
                    ${node.importance ? `<span class="importance-badge">重要度 ${node.importance}/5</span>` : ''}
                </div>
            </div>
        `;
    }

    /**
     * 渲染描述
     */
    renderDescription(node) {
        if (!node.description) return '';
        
        return `
            <div class="detail-section">
                <h4>📝 描述</h4>
                <p class="description-text">${node.description}</p>
            </div>
        `;
    }

    /**
     * 渲染公式
     */
    renderFormula(node) {
        if (!node.formula) return '';
        
        return `
            <div class="detail-section">
                <h4>📐 数学公式</h4>
                <div class="formula-box">
                    $${node.formula}$
                </div>
            </div>
        `;
    }

    /**
     * 渲染元数据
     */
    renderMetadata(node) {
        const metadata = [];
        
        if (node.estimatedStudyTime) {
            metadata.push(`⏱️ 学习时长: ${node.estimatedStudyTime}分钟`);
        }
        
        if (node.domains && node.domains.length > 0) {
            metadata.push(`🎯 学域: ${node.domains.join(', ')}`);
        }
        
        if (node.traditionalChapter) {
            metadata.push(`📚 章节: ${node.traditionalChapter}`);
        }
        
        if (metadata.length === 0) return '';
        
        return `
            <div class="detail-section">
                <h4>ℹ️ 基本信息</h4>
                <ul class="metadata-list">
                    ${metadata.map(item => `<li>${item}</li>`).join('')}
                </ul>
            </div>
        `;
    }

    /**
     * 渲染高级主题（Phase 2专属）
     */
    renderAdvancedTopics(node) {
        if (!node.advancedTopics || node.advancedTopics.length === 0) return '';
        
        return `
            <div class="detail-section advanced-topics">
                <h4>🎓 高级主题</h4>
                <ul class="topics-list">
                    ${node.advancedTopics.map(topic => `
                        <li class="topic-item">${topic}</li>
                    `).join('')}
                </ul>
            </div>
        `;
    }

    /**
     * 渲染应用案例
     */
    renderApplications(node, isPhase2) {
        const apps = node.realWorldApplications || [];
        if (apps.length === 0) return '';
        
        return `
            <div class="detail-section applications">
                <h4>🌐 实际应用</h4>
                <div class="applications-list">
                    ${apps.map((app, index) => `
                        <div class="application-card">
                            <h5>${app.title || `应用 ${index + 1}`}</h5>
                            <p class="app-industry">
                                <span class="industry-badge">${app.industry || '通用'}</span>
                            </p>
                            <p class="app-description">${app.description || ''}</p>
                            ${isPhase2 && app.code ? `
                                <details class="app-code-details">
                                    <summary>查看代码实现</summary>
                                    <pre><code>${this.escapeHtml(app.code)}</code></pre>
                                </details>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    /**
     * 渲染可视化配置（Phase 2专属）
     */
    renderVisualization(node) {
        if (!node.visualizationConfig) return '';
        
        const config = node.visualizationConfig;
        
        return `
            <div class="detail-section visualization">
                <h4>📊 可视化</h4>
                <div class="viz-config">
                    <p><strong>类型:</strong> ${config.type || 'static-plot'}</p>
                    ${config.showCurvatureCircle ? '<p>✓ 显示曲率圆</p>' : ''}
                    ${config.showTangent ? '<p>✓ 显示切线</p>' : ''}
                    ${config.showNormal ? '<p>✓ 显示法线</p>' : ''}
                    ${config.show3D ? '<p>✓ 3D显示</p>' : ''}
                    ${config.showStreamlines ? '<p>✓ 显示流线</p>' : ''}
                </div>
            </div>
        `;
    }

    /**
     * 渲染前置节点
     */
    renderPrerequisites(node) {
        if (!node.prerequisites || node.prerequisites.length === 0) return '';
        
        return `
            <div class="detail-section prerequisites">
                <h4>📋 前置知识</h4>
                <ul class="prerequisites-list">
                    ${node.prerequisites.map(preId => `
                        <li class="prerequisite-item" data-node-id="${preId}">
                            <a href="#" class="node-link">${preId}</a>
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;
    }

    /**
     * 渲染相关Skills
     */
    renderRelatedSkills(node) {
        if (!node.relatedSkills || node.relatedSkills.length === 0) return '';
        
        return `
            <div class="detail-section related-skills">
                <h4>🎯 相关Skills</h4>
                <div class="skills-tags">
                    ${node.relatedSkills.map(skill => `
                        <span class="skill-tag">${skill}</span>
                    `).join('')}
                </div>
            </div>
        `;
    }

    /**
     * 渲染关键词
     */
    renderKeywords(node) {
        if (!node.keywords || node.keywords.length === 0) return '';
        
        return `
            <div class="detail-section keywords">
                <h4>🏷️ 关键词</h4>
                <div class="keywords-tags">
                    ${node.keywords.map(keyword => `
                        <span class="keyword-tag">${keyword}</span>
                    `).join('')}
                </div>
            </div>
        `;
    }

    /**
     * 转义HTML
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * 隐藏面板
     */
    hide() {
        this.container.classList.remove('open');
        this.currentNode = null;
    }

    /**
     * 设置懒加载
     */
    setLazyLoad(enabled) {
        this.lazyLoadEnabled = enabled;
    }

    /**
     * 获取当前节点
     */
    getCurrentNode() {
        return this.currentNode;
    }
}
