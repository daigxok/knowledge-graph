/**
 * SkillUIController
 * Manages the UI for skill display, activation, and interaction
 * Provides UI components for skill integration in the knowledge graph
 */

export class SkillUIController {
    constructor(skillIntegrationManager, skillContentManager) {
        this.skillManager = skillIntegrationManager;
        this.contentManager = skillContentManager;
        this.activeSkillId = null;
        this.skillPanelOpen = false;
    }

    /**
     * Create skill button for a node
     * @param {Object} skill - Skill object
     * @param {Function} onActivate - Callback when skill is activated
     * @returns {HTMLElement} Skill button element
     */
    createSkillButton(skill, onActivate) {
        const button = document.createElement('button');
        button.className = 'skill-button';
        button.id = `skill-btn-${skill.id}`;
        button.title = skill.name;
        button.innerHTML = `
            <span class="skill-icon">${skill.icon}</span>
            <span class="skill-name">${skill.name}</span>
        `;

        button.addEventListener('click', async () => {
            await this.activateSkill(skill, onActivate);
        });

        return button;
    }

    /**
     * Create skill panel for displaying skill content
     * @param {Object} skill - Skill object
     * @returns {HTMLElement} Skill panel element
     */
    createSkillPanel(skill) {
        const panel = document.createElement('div');
        panel.className = 'skill-panel';
        panel.id = `skill-panel-${skill.id}`;

        const content = this.contentManager.getFullContent(skill.id);
        const stats = this.contentManager.getContentStats(skill.id);

        panel.innerHTML = `
            <div class="skill-panel-header">
                <h2>${skill.icon} ${skill.name}</h2>
                <button class="skill-panel-close" aria-label="Close skill panel">×</button>
            </div>

            <div class="skill-panel-content">
                <!-- Skill Description -->
                <div class="skill-section">
                    <h3>📝 描述</h3>
                    <p>${skill.description}</p>
                </div>

                <!-- Content Statistics -->
                <div class="skill-section">
                    <h3>📊 内容统计</h3>
                    <div class="skill-stats">
                        <div class="stat-item">
                            <span class="stat-label">理论讲解:</span>
                            <span class="stat-value">${stats.theoryDuration}分钟</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">可视化:</span>
                            <span class="stat-value">${stats.visualizationCount}个</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">练习题:</span>
                            <span class="stat-value">${stats.exerciseCount}题</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">应用案例:</span>
                            <span class="stat-value">${stats.applicationCount}个</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">总时长:</span>
                            <span class="stat-value">${stats.totalEstimatedTime}分钟</span>
                        </div>
                    </div>
                </div>

                <!-- Content Tabs -->
                <div class="skill-tabs">
                    <button class="skill-tab-btn active" data-tab="theory">理论</button>
                    <button class="skill-tab-btn" data-tab="visualizations">可视化</button>
                    <button class="skill-tab-btn" data-tab="exercises">练习</button>
                    <button class="skill-tab-btn" data-tab="applications">应用</button>
                </div>

                <!-- Tab Content -->
                <div class="skill-tab-content">
                    <!-- Theory Tab -->
                    <div class="skill-tab-pane active" id="theory-tab">
                        ${this._createTheoryContent(content)}
                    </div>

                    <!-- Visualizations Tab -->
                    <div class="skill-tab-pane" id="visualizations-tab">
                        ${this._createVisualizationsContent(content)}
                    </div>

                    <!-- Exercises Tab -->
                    <div class="skill-tab-pane" id="exercises-tab">
                        ${this._createExercisesContent(content)}
                    </div>

                    <!-- Applications Tab -->
                    <div class="skill-tab-pane" id="applications-tab">
                        ${this._createApplicationsContent(content)}
                    </div>
                </div>
            </div>
        `;

        // Add event listeners
        this._attachPanelEventListeners(panel, skill);

        return panel;
    }

    /**
     * Create theory content HTML
     * @private
     */
    _createTheoryContent(content) {
        if (!content.theory) {
            return '<p>暂无理论内容</p>';
        }

        const theory = content.theory;
        let html = `
            <div class="theory-content">
                <h3>${theory.title}</h3>
                <p class="duration">⏱️ 预计时长: ${theory.duration}分钟</p>
        `;

        theory.sections?.forEach((section, index) => {
            html += `
                <div class="theory-section">
                    <h4>${index + 1}. ${section.title}</h4>
                    <p>${section.content}</p>
                    ${section.formula ? `<div class="formula">$$${section.formula}$$</div>` : ''}
                </div>
            `;
        });

        html += '</div>';
        return html;
    }

    /**
     * Create visualizations content HTML
     * @private
     */
    _createVisualizationsContent(content) {
        if (!content.visualizations || content.visualizations.length === 0) {
            return '<p>暂无可视化内容</p>';
        }

        let html = '<div class="visualizations-content">';

        content.visualizations.forEach(viz => {
            html += `
                <div class="visualization-item">
                    <h4>${viz.title}</h4>
                    <p>${viz.description}</p>
                    <button class="viz-launch-btn" data-viz-id="${viz.id}">
                        启动可视化 →
                    </button>
                </div>
            `;
        });

        html += '</div>';
        return html;
    }

    /**
     * Create exercises content HTML
     * @private
     */
    _createExercisesContent(content) {
        if (!content.exercises || content.exercises.length === 0) {
            return '<p>暂无练习题</p>';
        }

        let html = '<div class="exercises-content">';

        // Group exercises by difficulty
        const byDifficulty = {};
        content.exercises.forEach(ex => {
            if (!byDifficulty[ex.difficulty]) {
                byDifficulty[ex.difficulty] = [];
            }
            byDifficulty[ex.difficulty].push(ex);
        });

        const difficultyOrder = ['basic', 'intermediate', 'advanced'];
        const difficultyLabels = {
            'basic': '基础',
            'intermediate': '中级',
            'advanced': '高级'
        };

        difficultyOrder.forEach(difficulty => {
            if (byDifficulty[difficulty]) {
                html += `
                    <div class="exercise-group">
                        <h4>${difficultyLabels[difficulty]}练习 (${byDifficulty[difficulty].length}题)</h4>
                        <div class="exercise-list">
                `;

                byDifficulty[difficulty].forEach((ex, index) => {
                    html += `
                        <div class="exercise-item">
                            <span class="exercise-number">${index + 1}.</span>
                            <span class="exercise-question">${ex.question}</span>
                            <button class="exercise-btn" data-exercise-id="${ex.id}">
                                查看 →
                            </button>
                        </div>
                    `;
                });

                html += '</div></div>';
            }
        });

        html += '</div>';
        return html;
    }

    /**
     * Create applications content HTML
     * @private
     */
    _createApplicationsContent(content) {
        if (!content.applications || content.applications.length === 0) {
            return '<p>暂无应用案例</p>';
        }

        let html = '<div class="applications-content">';

        content.applications.forEach(app => {
            html += `
                <div class="application-item">
                    <h4>${app.title}</h4>
                    <p>${app.description}</p>
                    <span class="difficulty-badge difficulty-${app.difficulty}">
                        ${app.difficulty === 'basic' ? '基础' : app.difficulty === 'intermediate' ? '中级' : '高级'}
                    </span>
                </div>
            `;
        });

        html += '</div>';
        return html;
    }

    /**
     * Attach event listeners to skill panel
     * @private
     */
    _attachPanelEventListeners(panel, skill) {
        // Close button
        const closeBtn = panel.querySelector('.skill-panel-close');
        closeBtn?.addEventListener('click', () => {
            this.closeSkillPanel();
        });

        // Tab buttons
        const tabBtns = panel.querySelectorAll('.skill-tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this._switchTab(panel, e.target.dataset.tab);
            });
        });

        // Visualization launch buttons
        const vizBtns = panel.querySelectorAll('.viz-launch-btn');
        vizBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const vizId = e.target.dataset.vizId;
                this._launchVisualization(skill.id, vizId);
            });
        });

        // Exercise buttons
        const exBtns = panel.querySelectorAll('.exercise-btn');
        exBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const exerciseId = e.target.dataset.exerciseId;
                this._showExercise(skill.id, exerciseId);
            });
        });
    }

    /**
     * Switch tab in skill panel
     * @private
     */
    _switchTab(panel, tabName) {
        // Hide all panes
        panel.querySelectorAll('.skill-tab-pane').forEach(pane => {
            pane.classList.remove('active');
        });

        // Remove active class from all buttons
        panel.querySelectorAll('.skill-tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Show selected pane
        const pane = panel.querySelector(`#${tabName}-tab`);
        if (pane) {
            pane.classList.add('active');
        }

        // Add active class to clicked button
        const btn = panel.querySelector(`[data-tab="${tabName}"]`);
        if (btn) {
            btn.classList.add('active');
        }
    }

    /**
     * Activate a skill
     * @private
     */
    async activateSkill(skill, onActivate) {
        try {
            this.activeSkillId = skill.id;
            const panel = this.createSkillPanel(skill);
            
            // Insert panel into DOM
            const container = document.getElementById('skill-panel-container') || 
                            document.body.appendChild(document.createElement('div'));
            container.id = 'skill-panel-container';
            container.innerHTML = '';
            container.appendChild(panel);

            this.skillPanelOpen = true;

            if (onActivate) {
                onActivate(skill);
            }

            console.log(`✅ Skill ${skill.id} activated`);
        } catch (error) {
            console.error(`❌ Failed to activate skill:`, error);
        }
    }

    /**
     * Close skill panel
     */
    closeSkillPanel() {
        const container = document.getElementById('skill-panel-container');
        if (container) {
            container.innerHTML = '';
        }
        this.skillPanelOpen = false;
        this.activeSkillId = null;
    }

    /**
     * Launch visualization
     * @private
     */
    _launchVisualization(skillId, vizId) {
        console.log(`🎨 Launching visualization: ${vizId} for skill: ${skillId}`);
        // Implementation would depend on specific visualization framework
        // This is a placeholder for the actual visualization launch logic
    }

    /**
     * Show exercise
     * @private
     */
    _showExercise(skillId, exerciseId) {
        console.log(`📝 Showing exercise: ${exerciseId} for skill: ${skillId}`);
        // Implementation would depend on specific exercise framework
        // This is a placeholder for the actual exercise display logic
    }

    /**
     * Create skill browser for exploring all skills
     * @returns {HTMLElement} Skill browser element
     */
    createSkillBrowser(skills) {
        const browser = document.createElement('div');
        browser.className = 'skill-browser';

        let html = '<div class="skill-browser-header"><h2>🎯 Skills浏览器</h2></div>';
        html += '<div class="skill-browser-grid">';

        skills.forEach(skill => {
            html += `
                <div class="skill-card">
                    <div class="skill-card-icon">${skill.icon}</div>
                    <h3>${skill.name}</h3>
                    <p>${skill.description}</p>
                    <div class="skill-card-meta">
                        <span class="skill-type">${skill.type}</span>
                        <span class="skill-domains">${skill.applicableDomains.length}个学域</span>
                    </div>
                    <button class="skill-card-btn" data-skill-id="${skill.id}">
                        了解更多 →
                    </button>
                </div>
            `;
        });

        html += '</div>';
        browser.innerHTML = html;

        // Add event listeners
        browser.querySelectorAll('.skill-card-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const skillId = e.target.dataset.skillId;
                const skill = skills.find(s => s.id === skillId);
                if (skill) {
                    this.activateSkill(skill);
                }
            });
        });

        return browser;
    }
}

