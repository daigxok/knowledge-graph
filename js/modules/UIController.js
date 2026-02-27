/**
 * UIController
 * Coordinates all UI components and handles user interactions
 */

import { generateSkillContent, inferNodeType } from './SkillContentGenerator.js';

export class UIController {
    constructor(components) {
        this.domainManager = components.domainManager;
        this.graphEngine = components.graphEngine;
        this.visualizationEngine = components.visualizationEngine;
        this.filterEngine = components.filterEngine;
        this.stateManager = components.stateManager;
        this.learningPathFinder = components.learningPathFinder;
        this.openSkillsExperience = components.openSkillsExperience;
        this.skillContentManager = components.skillContentManager || null;
        this.learningDataManager = components.learningDataManager || null;
        
        this.searchDebounceTimer = null;
        this.detailPanelOpen = false;
        this.currentLearningPath = null;
        this.currentSelectedNodeId = null;
        
        this.initializeComponents();
    }

    /**
     * Initialize all UI components
     */
    initializeComponents() {
        this.setupSidebar();
        this.setupDomainOverview();
        this.updateDomainLegend();
        this.setupHeaderDomainBadges();
        this.setupZoomControls();
        this.setupDetailPanel();
        this.setupSkillPanel();
        this.setupSearch();
        this.updateSearchResultsCount(0);
    }
    
    /**
     * 学域概览：按学域统计节点数并展示核心思想
     */
    setupDomainOverview() {
        this.updateDomainOverview();
        this.bindDomainOverviewClicks();
        this.updateSkillsHint();
    }
    
    /**
     * 更新侧栏「Skills 运用」节点数
     */
    updateSkillsHint() {
        const el = document.getElementById('skillsNodeCount');
        if (!el) return;
        const allNodes = this.graphEngine.getAllNodes();
        const count = allNodes.filter(n => n.relatedSkills && n.relatedSkills.length > 0).length;
        el.textContent = count;
    }
    
    /**
     * 学域概览项点击：筛选该学域（与头部徽章一致）
     */
    bindDomainOverviewClicks() {
        document.querySelectorAll('.domain-overview-item').forEach(el => {
            el.addEventListener('click', (e) => this._onDomainOverviewClick(e));
        });
    }
    
    /**
     * @param {Event} e
     */
    _onDomainOverviewClick(e) {
        const domainId = e.currentTarget.getAttribute('data-domain');
        if (!domainId) return;
        const cb = document.getElementById(`domain-${domainId}`);
        if (cb) {
            cb.checked = !cb.checked;
            this.handleDomainFilter();
        }
    }
    
    /**
     * 更新学域概览列表（节点数、核心思想）
     * @param {Array} [visibleNodes] - 当前可见节点；不传则使用全图节点，与筛选后图谱一致
     */
    updateDomainOverview(visibleNodes) {
        const container = document.getElementById('domainOverviewList');
        if (!container) return;
        const nodesToCount = visibleNodes != null ? visibleNodes : this.graphEngine.getAllNodes();
        const domains = this.domainManager.getAllDomains();
        const countByDomain = {};
        domains.forEach(d => { countByDomain[d.id] = 0; });
        nodesToCount.forEach(node => {
            if (node.domains) {
                node.domains.forEach(did => {
                    if (countByDomain[did] !== undefined) countByDomain[did]++;
                });
            }
        });
        const escapeAttr = (s) => (s || '').replace(/"/g, '&quot;').replace(/</g, '&lt;');
        container.innerHTML = domains.map(domain => {
            const count = countByDomain[domain.id] || 0;
            const idea = (domain.coreIdea || '').slice(0, 24);
            const title = `${domain.name}: ${domain.coreIdea || ''}`;
            return `
                <div class="domain-overview-item" data-domain="${domain.id}" title="${escapeAttr(title)}" role="button" tabindex="0" aria-label="筛选学域：${escapeAttr(domain.name)}">
                    <span class="domain-ov-icon">${domain.icon}</span>
                    <div class="domain-ov-body">
                        <div class="domain-ov-row"><span class="domain-ov-name">${domain.name}</span><span class="domain-ov-count">${count} 节点</span></div>
                        ${idea ? `<span class="domain-ov-idea">${escapeAttr(idea)}${(domain.coreIdea || '').length > 24 ? '…' : ''}</span>` : ''}
                    </div>
                </div>
            `;
        }).join('');
        this.bindDomainOverviewClicks();
    }
    
    /**
     * 更新学域图例：从 DomainDataManager 动态生成，与 domains.json 一致
     */
    updateDomainLegend() {
        const listEl = document.getElementById('domainLegendList');
        if (!listEl) return;
        const domains = this.domainManager.getAllDomains();
        const escapeAttr = (s) => (s || '').replace(/"/g, '&quot;').replace(/</g, '&lt;');
        listEl.innerHTML = domains.map(domain => {
            const color = domain.color || '#999999';
            return `<div class="domain-legend-item" data-domain="${domain.id}" title="${escapeAttr(domain.name)}"><span class="legend-dot" style="background:${escapeAttr(color)}"></span><span>${escapeAttr(domain.name)}</span></div>`;
        }).join('');
    }
    
    /**
     * 头部学域徽章点击：快速筛选该学域
     */
    setupHeaderDomainBadges() {
        const badges = document.querySelectorAll('.domain-badge');
        badges.forEach(badge => {
            badge.addEventListener('click', () => {
                const domainId = badge.getAttribute('data-domain');
                const cb = document.getElementById(`domain-${domainId}`);
                if (cb) {
                    cb.checked = !cb.checked;
                    this.handleDomainFilter();
                }
            });
        });
    }

    /**
     * Setup sidebar filters
     */
    setupSidebar() {
        // Populate domain filters
        const domainFiltersContainer = document.getElementById('domainFilters');
        if (domainFiltersContainer) {
            const domains = this.domainManager.getAllDomains();
            
            domains.forEach(domain => {
                const filterItem = document.createElement('div');
                filterItem.className = 'domain-filter-item';
                filterItem.innerHTML = `
                    <input type="checkbox" id="domain-${domain.id}" value="${domain.id}">
                    <label for="domain-${domain.id}">
                        <span class="domain-icon">${domain.icon}</span>
                        <span>${domain.name}</span>
                    </label>
                `;
                domainFiltersContainer.appendChild(filterItem);
                
                // Add event listener
                filterItem.querySelector('input').addEventListener('change', () => {
                    this.handleDomainFilter();
                });
            });
        }
        
        // 节点类型筛选
        document.querySelectorAll('#nodeTypeFilters input').forEach(input => {
            input.addEventListener('change', () => this.handleNodeTypeFilter());
        });
        
        // Populate chapter filter
        const chapterSelect = document.getElementById('chapterFilter');
        if (chapterSelect) {
            const chapters = this.domainManager.getAllChapters();
            
            chapters.forEach(chapter => {
                const option = document.createElement('option');
                option.value = chapter.id;
                option.textContent = chapter.name;
                chapterSelect.appendChild(option);
            });
            
            chapterSelect.addEventListener('change', () => {
                this.handleChapterFilter();
            });
        }
        
        // Setup difficulty sliders
        const difficultyMin = document.getElementById('difficultyMin');
        const difficultyMax = document.getElementById('difficultyMax');
        const difficultyMinLabel = document.getElementById('difficultyMinLabel');
        const difficultyMaxLabel = document.getElementById('difficultyMaxLabel');
        
        if (difficultyMin && difficultyMax && difficultyMinLabel && difficultyMaxLabel) {
            difficultyMin.addEventListener('input', (e) => {
                difficultyMinLabel.textContent = e.target.value;
                this.handleDifficultyFilter();
            });
            
            difficultyMax.addEventListener('input', (e) => {
                difficultyMaxLabel.textContent = e.target.value;
                this.handleDifficultyFilter();
            });
        }
        
        // Setup clear filters button
        const clearFiltersBtn = document.getElementById('clearFiltersBtn');
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => {
                this.clearAllFilters();
            });
        }

        // Learning data export/reset (local only)
        const btnExport = document.getElementById('btnExportLearningData');
        if (btnExport) {
            btnExport.addEventListener('click', () => {
                if (this.learningDataManager) {
                    const ts = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
                    this.learningDataManager.downloadJSON(`learning-data-${ts}.json`);
                    this.showNotification('学习数据已导出（JSON）', 'success');
                } else {
                    this.showNotification('学习数据模块未初始化', 'warning');
                }
            });
        }
        const btnReset = document.getElementById('btnResetLearningData');
        if (btnReset) {
            btnReset.addEventListener('click', () => {
                const ok = window.confirm('确认清空本机学习数据？该操作不可恢复。');
                if (!ok) return;
                if (this.learningDataManager) {
                    this.learningDataManager.resetAll();
                    this.showNotification('学习数据已清空', 'info');
                }
            });
        }
        
        // Setup sidebar toggle for mobile
        const sidebarToggle = document.getElementById('sidebarToggle');
        const sidebar = document.getElementById('sidebar');
        
        if (sidebarToggle && sidebar) {
            sidebarToggle.addEventListener('click', () => {
                sidebar.classList.toggle('open');
            });
        }
    }

    /**
     * Setup zoom controls
     */
    setupZoomControls() {
        const zoomInBtn = document.getElementById('zoomInBtn');
        const zoomOutBtn = document.getElementById('zoomOutBtn');
        const resetViewBtn = document.getElementById('resetViewBtn');
        const crossDomainViewBtn = document.getElementById('crossDomainViewBtn');
        
        if (zoomInBtn) {
            zoomInBtn.addEventListener('click', () => {
                this.visualizationEngine.zoomIn();
            });
        }
        
        if (zoomOutBtn) {
            zoomOutBtn.addEventListener('click', () => {
                this.visualizationEngine.zoomOut();
            });
        }
        
        if (resetViewBtn) {
            resetViewBtn.addEventListener('click', () => {
                this.visualizationEngine.resetView();
            });
        }
        
        const fitViewBtn = document.getElementById('fitViewBtn');
        if (fitViewBtn) {
            fitViewBtn.addEventListener('click', () => {
                this.visualizationEngine.fitToView();
                this.showNotification('已适应画布', 'info');
            });
        }
        
        if (crossDomainViewBtn) {
            crossDomainViewBtn.addEventListener('click', () => {
                this.toggleCrossDomainView();
            });
        }
    }

    /**
     * Setup detail panel
     */
    setupDetailPanel() {
        const closeDetailBtn = document.getElementById('closeDetailBtn');
        if (closeDetailBtn) {
            closeDetailBtn.addEventListener('click', () => {
                this.hideDetailPanel();
            });
        }
    }

    setupSkillPanel() {
        const closeBtn = document.getElementById('closeSkillPanelBtn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hideSkillPanel());
        }
        const applyNowBtn = document.getElementById('skillApplyNowBtn');
        if (applyNowBtn) {
            applyNowBtn.addEventListener('click', () => {
                if (this.currentSelectedNodeId) {
                    const node = this.graphEngine.getNode(this.currentSelectedNodeId);
                    if (node) this.showSkillContent(node);
                }
            });
        }
    }

    /**
     * 依据节点类型生成 Skill 内容并展示（含前置/后续、可联动 Skill、推荐下一步）
     * 优先使用 Phase2 深度内容（advancedTopics/advancedExercises/projects），否则退回自动生成内容
     * @param {Object} node - 节点对象
     * @param {string} [selectedSkillName] - 当前点击的 Skill 名称（如“函数极限与连续Skill”）
     */
    showSkillContent(node, selectedSkillName) {
        const panel = document.getElementById('skillPanel');
        const contentEl = document.getElementById('skillPanelContent');
        const subtitleEl = document.getElementById('skillPanelSubtitle');
        if (!panel || !contentEl || !node) return;

        let contentHtml = '';
        const primarySkillName = selectedSkillName || (
            Array.isArray(node.relatedSkills) && node.relatedSkills.length > 0
                ? node.relatedSkills[0]
                : null
        );

        // 若存在 Phase2 深度内容，则优先展示
        if (this.skillContentManager && primarySkillName) {
            const deepSkill = this.skillContentManager.getPhase2Skill(primarySkillName);
            if (deepSkill) {
                contentHtml = this._renderPhase2SkillContent(node, deepSkill, primarySkillName);
            }
        }

        // 若无 Phase2 数据，则回退到自动生成的 Skill 内容
        if (!contentHtml) {
            contentHtml = generateSkillContent(node, this.domainManager, this.graphEngine);
        }

        // 更新面板副标题：当前节点 · 当前 Skill
        if (subtitleEl) {
            const nodeName = node.name || '';
            const skillLabel = primarySkillName || '综合';
            subtitleEl.textContent = [nodeName, skillLabel].filter(Boolean).join(' · ');
            subtitleEl.classList.toggle('hidden', !nodeName && !primarySkillName);
        }

        // 记录 Skill 打开事件（用于真实学习数据）
        if (this.learningDataManager && primarySkillName) {
            const hasPhase2 = !!(this.skillContentManager && this.skillContentManager.getPhase2Skill(primarySkillName));
            this.learningDataManager.openSkill(primarySkillName, {
                nodeId: node.id,
                nodeName: node.name || '',
                phase2: hasPhase2
            });
        }

        const footer = `
            <div class="skill-panel-footer">
                <button type="button" class="skill-footer-btn" id="skillBackToDetailBtn">返回节点详情</button>
                <button type="button" class="skill-footer-btn skill-footer-primary" id="skillOpenExperienceLink">进入 Skills 完整体验</button>
            </div>
        `;
        contentEl.innerHTML = contentHtml + footer;
        panel.classList.add('open');
        this._bindSkillPanelActions(contentEl, node);
        requestAnimationFrame(() => {
            if (window.MathJax && window.MathJax.typesetPromise) {
                MathJax.typesetPromise([contentEl]).catch(err => console.error('MathJax error:', err));
            }
        });
    }

    /**
     * 使用 Phase2 深度内容渲染 Skill 面板
     * @param {Object} node - 当前知识节点
     * @param {Object} skill - Phase2 JSON 中的 Skill 对象
     * @param {string} skillName - Skill 名称（中文）
     * @returns {string} HTML 字符串
     */
    /**
     * 难度数字转星级（1–5）
     * @param {number} d - 难度值
     * @returns {string} 如 "★★★☆☆"
     */
    _difficultyStars(d) {
        if (d == null || typeof d !== 'number') return '';
        const n = Math.min(5, Math.max(1, Math.round(d)));
        return '★'.repeat(n) + '☆'.repeat(5 - n);
    }

    _renderPhase2SkillContent(node, skill, skillName) {
        const esc = (s) => {
            if (s == null) return '';
            const d = document.createElement('div');
            d.textContent = String(s);
            return d.innerHTML;
        };
        const escAttr = (s) => (s == null ? '' : String(s)).replace(/"/g, '&quot;').replace(/</g, '&lt;');
        const truncate = (s, maxLen) => {
            if (s == null) return '';
            const str = String(s);
            return str.length <= maxLen ? str : str.slice(0, maxLen) + '…';
        };

        const topics = Array.isArray(skill.advancedTopics) ? skill.advancedTopics : [];
        const exercises = Array.isArray(skill.advancedExercises) ? skill.advancedExercises : [];
        const projects = Array.isArray(skill.projects) ? skill.projects : [];
        const md = skill.metadata || (this.skillContentManager && this.skillContentManager.getPhase2Metadata()) || {};

        let html = `
            <div class="detail-section phase2-intro">
                <h3>🎯 Skill 深度运用：${esc(skill.skillId || skillName || '')}</h3>
                <p class="phase2-kv">服务节点：<strong>${esc(node.name || '')}</strong></p>
                <p class="phase2-kv phase2-intro-line">本 Skill 提供 <strong>${topics.length}</strong> 个进阶主题、<strong>${exercises.length}</strong> 道进阶练习、<strong>${projects.length}</strong> 个项目任务，点击题目或项目可展开查看详情。</p>
                <p class="phase2-kv"><span class="phase2-pill">📚 ${topics.length} 主题</span> <span class="phase2-pill">📝 ${exercises.length} 练习</span> <span class="phase2-pill">🧩 ${projects.length} 项目</span></p>
            </div>
        `;

        // Topics
        html += `<div class="detail-section"><h3>📚 进阶主题</h3>`;
        if (!topics.length) {
            html += `<p>暂无进阶主题。</p>`;
        } else {
            topics.forEach(t => {
                const examples = Array.isArray(t.examples) ? t.examples : [];
                const apps = Array.isArray(t.applications) ? t.applications : [];
                html += `
                    <div class="phase2-item">
                        <div><strong>${esc(t.title || '')}</strong></div>
                        ${t.description ? `<div class="phase2-kv">${esc(t.description)}</div>` : ''}
                        ${t.formula ? `<div class="formula-display">\\[${t.formula}\\]</div>` : ''}
                        ${examples.length ? `<div class="phase2-kv"><strong>例：</strong><ul>${examples.map(e => `<li>${esc(e)}</li>`).join('')}</ul></div>` : ''}
                        ${apps.length ? `<div class="phase2-kv"><strong>应用：</strong>${apps.map(a => `<span class="phase2-tag">${esc(a)}</span>`).join(' ')}</div>` : ''}
                    </div>
                `;
            });
        }
        html += `</div>`;

        // Exercises
        html += `<div class="detail-section"><h3>📝 进阶练习</h3>`;
        if (!exercises.length) {
            html += `<p>暂无进阶练习。</p>`;
        } else {
            exercises.forEach(ex => {
                const hints = Array.isArray(ex.hints) ? ex.hints : [];
                const steps = Array.isArray(ex.solution && ex.solution.steps) ? ex.solution.steps : [];
                const keyPoints = Array.isArray(ex.solution && ex.solution.keyPoints) ? ex.solution.keyPoints : [];
                const stars = this._difficultyStars(ex.difficulty);
                const timeBadge = ex.estimatedTime ? `<span class="phase2-time-badge">⏱ ${ex.estimatedTime}min</span>` : '';
                const qShort = truncate(ex.question, 72);
                html += `
                    <details class="phase2-item phase2-exercise-item" data-item-type="exercise" data-item-id="${escAttr(ex.id || '')}">
                        <summary><span class="phase2-summary-id">${esc(ex.id || '')}</span><span class="phase2-difficulty-stars" aria-label="难度">${esc(stars)}</span>${timeBadge}<span class="phase2-summary-text">${esc(qShort)}</span></summary>
                        <div class="phase2-item-body">
                        ${hints.length ? `<div class="phase2-kv"><strong>提示：</strong><ul>${hints.map(h => `<li>${esc(h)}</li>`).join('')}</ul></div>` : ''}
                        ${steps.length ? `<div class="phase2-kv"><strong>解答关键步骤：</strong><ol>${steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol></div>` : ''}
                        ${keyPoints.length ? `<div class="phase2-kv"><strong>要点：</strong><div class="phase2-tags">${keyPoints.map(k => `<span class="phase2-tag">${esc(k)}</span>`).join('')}</div></div>` : ''}
                        ${ex.estimatedTime ? `<div class="phase2-kv">⏱️ 预计用时：${esc(ex.estimatedTime)} 分钟</div>` : ''}
                        </div>
                    </details>
                `;
            });
        }
        html += `</div>`;

        // Projects
        html += `<div class="detail-section"><h3>🧩 项目任务</h3>`;
        if (!projects.length) {
            html += `<p>暂无项目任务。</p>`;
        } else {
            projects.forEach(p => {
                const obj = Array.isArray(p.objectives) ? p.objectives : [];
                const tasks = Array.isArray(p.tasks) ? p.tasks : [];
                const deliverables = Array.isArray(p.deliverables) ? p.deliverables : [];
                const stars = this._difficultyStars(p.difficulty);
                const timeBadge = p.estimatedTime ? `<span class="phase2-time-badge">⏱ ${p.estimatedTime}min</span>` : '';
                const titleShort = truncate(p.title, 56);
                html += `
                    <details class="phase2-item phase2-project-item" data-item-type="project" data-item-id="${escAttr(p.id || '')}">
                        <summary><span class="phase2-summary-id">${esc(p.id || '')}</span><span class="phase2-difficulty-stars">${esc(stars)}</span>${timeBadge}<span class="phase2-summary-text">${esc(titleShort)}</span></summary>
                        <div class="phase2-item-body">
                        ${p.description ? `<div class="phase2-kv">${esc(p.description)}</div>` : ''}
                        ${obj.length ? `<div class="phase2-kv"><strong>目标：</strong><ul>${obj.map(o => `<li>${esc(o)}</li>`).join('')}</ul></div>` : ''}
                        ${tasks.length ? `<div class="phase2-kv"><strong>任务：</strong><ol>${tasks.map(t => `<li><strong>Step ${esc(t.step != null ? t.step : '')}</strong>：${esc(t.description || '')}${t.code ? `<pre class="formula-display"><code>${esc(t.code)}</code></pre>` : ''}${t.visualization ? `<div class="phase2-kv"><strong>可视化：</strong>${esc(t.visualization)}</div>` : ''}</li>`).join('')}</ol></div>` : ''}
                        ${deliverables.length ? `<div class="phase2-kv"><strong>交付物：</strong>${deliverables.map(d => `<span class="phase2-tag">${esc(d)}</span>`).join(' ')}</div>` : ''}
                        ${p.estimatedTime ? `<div class="phase2-kv">⏱️ 预计用时：${esc(p.estimatedTime)} 分钟</div>` : ''}
                        </div>
                    </details>
                `;
            });
        }
        html += `</div>`;

        return html;
    }

    /**
     * 绑定 Skill 面板内链接与按钮
     */
    _bindSkillPanelActions(container, currentNode) {
        container.querySelectorAll('.skill-node-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const nodeId = link.getAttribute('data-node-id');
                if (nodeId) {
                    this.handleNodeSelection(nodeId);
                    this.showDetailPanel();
                    this.showSkillContent(this.graphEngine.getNode(nodeId));
                }
            });
        });
        const backBtn = container.querySelector('#skillBackToDetailBtn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                this.hideSkillPanel();
            });
        }
        const expBtn = container.querySelector('#skillOpenExperienceLink');
        if (expBtn && typeof this.openSkillsExperience === 'function') {
            expBtn.addEventListener('click', () => this.openSkillsExperience());
        }
        // 展开 details 后重新渲染公式，确保 MathJax 生效
        const contentEl = document.getElementById('skillPanelContent');
        if (contentEl) {
            contentEl.addEventListener('toggle', (e) => {
                if (e.target.matches('details') && e.target.open && window.MathJax && window.MathJax.typesetPromise) {
                    requestAnimationFrame(() => {
                        MathJax.typesetPromise([e.target]).catch(err => console.warn('MathJax on toggle:', err));
                    });
                }
                if (e.target.matches('details') && e.target.open && this.learningDataManager) {
                    const itemType = e.target.getAttribute('data-item-type');
                    const itemId = e.target.getAttribute('data-item-id');
                    if (itemType && itemId) {
                        this.learningDataManager.openPhase2Item(itemType, itemId, {
                            nodeId: currentNode?.id || null,
                            nodeName: currentNode?.name || null
                        });
                    }
                }
            }, true);
        }
    }

    hideSkillPanel() {
        const panel = document.getElementById('skillPanel');
        if (panel) panel.classList.remove('open');
        if (this.learningDataManager) {
            this.learningDataManager.closeSkillPanel();
        }
    }

    /**
     * Setup graph interactions
     */
    setupInteractions() {
        this.visualizationEngine.onNodeClick((node) => {
            this.handleNodeSelection(node.id);
        });
        this.visualizationEngine.onNodeDblClick((node) => {
            this.handleNodeSelection(node.id);
            this.showSkillContent(node);
        });
        this.visualizationEngine.onNodeHover((node, event) => {
            if (node) {
                this.showTooltip(node, event);
            } else {
                this.hideTooltip();
            }
        });
    }

    /**
     * Setup search functionality
     */
    setupSearch() {
        const searchInput = document.getElementById('searchInput');
        
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                // Debounce search (300ms)
                clearTimeout(this.searchDebounceTimer);
                this.searchDebounceTimer = setTimeout(() => {
                    this.handleSearch(e.target.value);
                }, 300);
            });
        }
    }

    /**
     * Handle domain filter change
     */
    handleDomainFilter() {
        const selectedDomains = Array.from(
            document.querySelectorAll('#domainFilters input:checked')
        ).map(input => input.value);
        
        this.filterEngine.setActiveFilters({ domains: selectedDomains });
        this.applyFiltersAndRender();
    }

    /**
     * Handle chapter filter change
     */
    handleChapterFilter() {
        const chapterSelect = document.getElementById('chapterFilter');
        const selectedChapter = chapterSelect.value;
        
        const chapters = selectedChapter ? [selectedChapter] : [];
        this.filterEngine.setActiveFilters({ chapters });
        this.applyFiltersAndRender();
    }

    /**
     * Handle node type filter change（概念/定理/方法/应用）
     */
    handleNodeTypeFilter() {
        const selectedTypes = Array.from(
            document.querySelectorAll('#nodeTypeFilters input:checked')
        ).map(input => input.value);
        this.filterEngine.setActiveFilters({ nodeTypes: selectedTypes });
        this.applyFiltersAndRender();
    }

    /**
     * Handle difficulty filter change
     */
    handleDifficultyFilter() {
        const minDiff = parseInt(document.getElementById('difficultyMin').value);
        const maxDiff = parseInt(document.getElementById('difficultyMax').value);
        
        this.filterEngine.setActiveFilters({ difficultyRange: [minDiff, maxDiff] });
        this.applyFiltersAndRender();
    }

    /**
     * Handle search
     * @param {string} query - Search query
     */
    handleSearch(query) {
        this.filterEngine.setActiveFilters({ searchKeyword: query });
        this.applyFiltersAndRender();
        
        // Update search results count
        const filteredNodes = this.filterEngine.applyFilters(this.filterEngine.getActiveFilters());
        this.updateSearchResultsCount(filteredNodes.length);
    }

    /**
     * Apply filters and re-render graph
     */
    applyFiltersAndRender() {
        const filters = this.filterEngine.getActiveFilters();
        const filteredNodes = this.filterEngine.applyFilters(filters);
        const filteredEdges = this.filterEngine.getFilteredEdges(filteredNodes);
        
        this.visualizationEngine.render(filteredNodes, filteredEdges);
        this.updateStats({ totalNodes: filteredNodes.length });
        this.updateDomainOverview(filteredNodes);
        this.updateDomainActiveStates();
        this.stateManager.updateFilters(filters);
        this.stateManager.saveToLocalStorage();
        
        // Re-setup interactions after render
        this.setupInteractions();
    }

    /**
     * 学域模式：同步头部徽章与侧栏学域概览的「当前筛选」高亮状态
     */
    updateDomainActiveStates() {
        const filters = this.filterEngine.getActiveFilters();
        const activeDomains = filters.domains || [];
        document.querySelectorAll('.domain-badge').forEach(badge => {
            const id = badge.getAttribute('data-domain');
            badge.classList.toggle('domain-badge--active', activeDomains.includes(id));
        });
        document.querySelectorAll('.domain-overview-item').forEach(item => {
            const id = item.getAttribute('data-domain');
            item.classList.toggle('domain-overview-item--active', activeDomains.includes(id));
        });
    }

    /**
     * Clear all filters
     */
    clearAllFilters() {
        // Clear domain checkboxes
        document.querySelectorAll('#domainFilters input').forEach(input => {
            input.checked = false;
        });
        
        // Clear node type checkboxes
        document.querySelectorAll('#nodeTypeFilters input').forEach(input => {
            input.checked = false;
        });
        
        // Clear chapter select
        document.getElementById('chapterFilter').value = '';
        
        // Reset difficulty sliders
        document.getElementById('difficultyMin').value = 1;
        document.getElementById('difficultyMax').value = 5;
        document.getElementById('difficultyMinLabel').textContent = '1';
        document.getElementById('difficultyMaxLabel').textContent = '5';
        
        // Clear search
        document.getElementById('searchInput').value = '';
        this.updateSearchResultsCount(0);
        
        // Clear filter engine
        this.filterEngine.clearFilters();
        
        // Re-render
        this.applyFiltersAndRender();
        
        this.showNotification('已清除所有筛选条件', 'info');
    }
    
    /**
     * Restore sidebar UI from saved filter state
     * @param {Object} filters - Saved filter criteria
     */
    restoreSidebarFromFilters(filters) {
        if (!filters) return;
        if (filters.domains && filters.domains.length > 0) {
            filters.domains.forEach(domainId => {
                const cb = document.getElementById(`domain-${domainId}`);
                if (cb) cb.checked = true;
            });
        }
        if (filters.nodeTypes && filters.nodeTypes.length > 0) {
            filters.nodeTypes.forEach(type => {
                const cb = document.getElementById(`nodeType-${type}`);
                if (cb) cb.checked = true;
            });
        }
        if (filters.chapters && filters.chapters.length > 0) {
            const chapterSelect = document.getElementById('chapterFilter');
            if (chapterSelect) chapterSelect.value = filters.chapters[0];
        }
        if (filters.difficultyRange) {
            const [minD, maxD] = filters.difficultyRange;
            const minEl = document.getElementById('difficultyMin');
            const maxEl = document.getElementById('difficultyMax');
            const minL = document.getElementById('difficultyMinLabel');
            const maxL = document.getElementById('difficultyMaxLabel');
            if (minEl) { minEl.value = minD; }
            if (maxEl) { maxEl.value = maxD; }
            if (minL) minL.textContent = minD;
            if (maxL) maxL.textContent = maxD;
        }
        if (filters.searchKeyword) {
            const searchInput = document.getElementById('searchInput');
            if (searchInput) searchInput.value = filters.searchKeyword;
        }
    }

    /**
     * Handle node selection
     * @param {string} nodeId - Node identifier
     */
    handleNodeSelection(nodeId) {
        const node = this.graphEngine.getNode(nodeId);
        if (!node) return;
        
        this.currentSelectedNodeId = nodeId;
        this.updateDetailPanel(node);
        this.showDetailPanel();

        if (this.learningDataManager) {
            this.learningDataManager.enterNode(nodeId, {
                nodeName: node.name || '',
                domainIds: Array.isArray(node.domains) ? node.domains : [],
                nodeType: node.type || inferNodeType(node)
            });
        }
        
        const block = document.getElementById('skillCurrentNodeBlock');
        const nameEl = document.getElementById('skillCurrentNodeName');
        if (block && nameEl) {
            nameEl.textContent = node.name;
            block.classList.remove('hidden');
        }
        
        this.visualizationEngine.clearHighlights();
        this.visualizationEngine.highlightNodes([nodeId]);
        this.stateManager.updateView({ selectedNodeId: nodeId });
    }

    /**
     * Update detail panel with node information
     * @param {Object} node - Node object
     */
    updateDetailPanel(node) {
        const detailTitle = document.getElementById('detailTitle');
        const detailContent = document.getElementById('detailContent');
        
        detailTitle.textContent = node.name;
        
        const escapeHtml = (str) => {
            if (!str) return '';
            const div = document.createElement('div');
            div.textContent = str;
            return div.innerHTML;
        };
        const escapeAttr = (s) => (s || '').replace(/"/g, '&quot;').replace(/</g, '&lt;');
        
        // 节点类型（用于详情区按类型展示）
        const nodeType = node.type || inferNodeType(node);
        const typeLabels = { concept: '概念', theorem: '定理', method: '方法', application: '应用' };
        const typeHints = {
            concept: '建议画一张「概念—性质—例子」小卡片，或口述给同学听。',
            theorem: '选一道用该定理的例题，先自己写证明再对照解析。',
            method: '找 2～3 道同类型题，限时完成并总结共性。',
            application: '选一个生活中的类似问题，试着自己建立简化模型。'
        };
        
        // Build detail content：顶部类型徽章 + 按类型分区标题与推荐学习方式
        let html = `
            <div class="detail-section detail-node-type-row">
                <span class="detail-node-type-badge skill-type-${nodeType}" aria-label="节点类型">${typeLabels[nodeType] || '概念'}</span>
            </div>
            <div class="detail-section">
                <h3>📝 描述</h3>
                <p>${escapeHtml(node.description)}</p>
            </div>
            <div class="detail-section detail-type-hint">
                <h3>🎯 推荐学习方式</h3>
                <p>${typeHints[nodeType] || typeHints.concept}</p>
            </div>
        `;
        
        if (node.formula) {
            html += `
                <div class="detail-section">
                    <h3>📐 公式</h3>
                    <div class="formula-display">\\[${node.formula}\\]</div>
                </div>
            `;
        }
        
        if (node.relatedSkills && node.relatedSkills.length > 0) {
            const phase2Ids = this.skillContentManager ? this.skillContentManager.getPhase2SkillIds() : [];
            html += `
                <div class="detail-section skills-apply-section">
                    <h3>🎯 Skills 运用</h3>
                    <p class="skills-apply-desc">点击「去运用」可查看进阶主题、练习与项目；标注<span class="skill-phase2-badge-inline">含深度内容</span>的 Skill 提供完整题目与解答。</p>
                    <ul class="skill-list skill-apply-list">
                        ${node.relatedSkills.map(skill => {
                            const hasPhase2 = phase2Ids.includes(skill);
                            return `
                            <li class="skill-item skill-apply-item ${hasPhase2 ? 'skill-apply-item--phase2' : ''}">
                                <span class="skill-apply-name">${escapeHtml(skill)}</span>
                                ${hasPhase2 ? '<span class="skill-phase2-badge" aria-label="含深度内容">含深度内容</span>' : ''}
                                <a href="#" class="skill-apply-btn" data-node-id="${escapeAttr(node.id)}" data-skill-name="${escapeAttr(skill)}" aria-label="运用 ${escapeAttr(skill)}">去运用</a>
                            </li>`;
                        }).join('')}
                    </ul>
                </div>
            `;
        }
        
        if (node.domains && node.domains.length > 0) {
            const domainBlocks = node.domains.map(domainId => {
                const domain = this.domainManager.getDomainById(domainId);
                if (!domain) return `<span>${escapeHtml(domainId)}</span>`;
                const color = domain.color || '#999';
                const coreIdea = domain.coreIdea ? escapeHtml(domain.coreIdea) : '';
                return `
                    <div class="detail-domain-block" data-domain="${escapeAttr(domainId)}" style="--domain-accent: ${escapeAttr(color)}">
                        <div class="detail-domain-header">${domain.icon} ${escapeHtml(domain.name)}</div>
                        ${coreIdea ? `<p class="detail-domain-idea">${coreIdea}</p>` : ''}
                    </div>
                `;
            }).join('');
            html += `
                <div class="detail-section detail-section--domain">
                    <h3>🎯 所属学域</h3>
                    <div class="detail-domain-list">${domainBlocks}</div>
                </div>
            `;
        }
        
        if (node.difficulty) {
            html += `
                <div class="detail-section">
                    <h3>⭐ 难度等级</h3>
                    <p>${'★'.repeat(node.difficulty)}${'☆'.repeat(5 - node.difficulty)} (${node.difficulty}/5)</p>
                </div>
            `;
        }
        
        if (node.prerequisites && node.prerequisites.length > 0) {
            const prereqNodes = node.prerequisites.map(prereqId => 
                this.graphEngine.getNode(prereqId)
            ).filter(Boolean);
            
            html += `
                <div class="detail-section">
                    <h3>📚 前置知识</h3>
                    <ul class="prerequisite-list">
                        ${prereqNodes.map(prereq => `
                            <li class="prerequisite-item">
                                <a href="#" data-node-id="${prereq.id}">${prereq.name}</a>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            `;
        }
        
        if (node.keywords && node.keywords.length > 0) {
            html += `
                <div class="detail-section">
                    <h3>🏷️ 关键词</h3>
                    <p>${node.keywords.join(', ')}</p>
                </div>
            `;
        }
        
        if (node.estimatedStudyTime) {
            html += `
                <div class="detail-section">
                    <h3>⏱️ 预计学习时间</h3>
                    <p>${node.estimatedStudyTime} 分钟</p>
                </div>
            `;
        }
        
        // Add learning path section
        if (this.learningPathFinder) {
            html += this._generateLearningPathSection(node);
        }
        
        detailContent.innerHTML = html;
        
        // Use requestAnimationFrame to ensure DOM is fully updated before MathJax rendering
        requestAnimationFrame(() => {
            if (window.MathJax) {
                MathJax.typesetPromise([detailContent])
                    .catch(err => console.error('MathJax error:', err));
            }
        });
        
        // Add click handlers for prerequisite links
        detailContent.querySelectorAll('[data-node-id]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const nodeId = e.target.getAttribute('data-node-id');
                this.handleNodeSelection(nodeId);
            });
        });
        
        // Add click handler for generate path button
        const generatePathBtn = detailContent.querySelector('.generate-path-btn');
        if (generatePathBtn) {
            generatePathBtn.addEventListener('click', (e) => {
                const nodeId = e.target.getAttribute('data-node-id');
                this.generateAndDisplayLearningPath(nodeId);
            });
        }
        
        // Skills 运用按钮：依据节点类型生成 Skill 内容并展示（若有 Phase2 深度内容则优先使用）
        detailContent.querySelectorAll('.skill-apply-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const nodeId = btn.getAttribute('data-node-id');
                const skillName = btn.getAttribute('data-skill-name') || null;
                const node = nodeId ? this.graphEngine.getNode(nodeId) : null;
                if (node) {
                    this.showSkillContent(node, skillName);
                } else if (typeof this.openSkillsExperience === 'function') {
                    this.openSkillsExperience();
                }
            });
        });
    }

    /**
     * Show detail panel
     */
    showDetailPanel() {
        document.getElementById('detailPanel').classList.add('open');
        this.detailPanelOpen = true;
    }

    /**
     * Hide detail panel
     */
    hideDetailPanel() {
        document.getElementById('detailPanel').classList.remove('open');
        this.detailPanelOpen = false;
        this.visualizationEngine.clearHighlights();
    }

    /**
     * Show tooltip
     * @param {Object} node - Node object
     * @param {Event} event - Mouse event
     */
    showTooltip(node, event) {
        let tooltip = document.getElementById('nodeTooltip');
        
        // Create tooltip if it doesn't exist
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'nodeTooltip';
            tooltip.className = 'tooltip';
            document.body.appendChild(tooltip);
        }
        
        // Build tooltip content（含节点类型，便于悬停时快速识别）
        const domain = this.domainManager.getDomainById(node.domains && node.domains[0] ? node.domains[0] : null);
        const domainName = domain ? `${domain.icon} ${domain.name}` : '未知学域';
        const difficulty = '★'.repeat(node.difficulty || 1) + '☆'.repeat(5 - (node.difficulty || 1));
        const nodeType = node.type || inferNodeType(node);
        const typeLabels = { concept: '概念', theorem: '定理', method: '方法', application: '应用' };
        
        let content = `
            <div class="tooltip-header">
                <strong>${node.name}</strong>
            </div>
            <div class="tooltip-body">
                <div class="tooltip-item">
                    <span class="tooltip-label">类型:</span>
                    <span class="tooltip-value tooltip-type-${nodeType}">${typeLabels[nodeType] || '概念'}</span>
                </div>
                <div class="tooltip-item">
                    <span class="tooltip-label">学域:</span>
                    <span class="tooltip-value">${domainName}</span>
                </div>
                <div class="tooltip-item">
                    <span class="tooltip-label">难度:</span>
                    <span class="tooltip-value">${difficulty}</span>
                </div>
        `;
        
        if (node.description) {
            const shortDesc = node.description.length > 80 
                ? node.description.substring(0, 80) + '...' 
                : node.description;
            content += `
                <div class="tooltip-item">
                    <span class="tooltip-label">描述:</span>
                    <span class="tooltip-value">${shortDesc}</span>
                </div>
            `;
        }
        
        content += `
            </div>
            <div class="tooltip-footer">
                <small>点击查看详情</small>
            </div>
        `;
        
        tooltip.innerHTML = content;
        tooltip.style.display = 'block';
        
        // Position tooltip near the mouse cursor
        const tooltipWidth = 300;
        const tooltipHeight = tooltip.offsetHeight;
        const padding = 10;
        
        let left = event.pageX + padding;
        let top = event.pageY + padding;
        
        // Adjust if tooltip would go off screen
        if (left + tooltipWidth > window.innerWidth) {
            left = event.pageX - tooltipWidth - padding;
        }
        
        if (top + tooltipHeight > window.innerHeight) {
            top = event.pageY - tooltipHeight - padding;
        }
        
        tooltip.style.left = left + 'px';
        tooltip.style.top = top + 'px';
    }

    /**
     * Hide tooltip
     */
    hideTooltip() {
        const tooltip = document.getElementById('nodeTooltip');
        if (tooltip) {
            tooltip.style.display = 'none';
        }
    }

    /**
     * Toggle cross-domain view
     */
    toggleCrossDomainView() {
        const currentFilter = this.filterEngine.getActiveFilters();
        const newValue = !currentFilter.showCrossDomainOnly;
        
        this.filterEngine.setActiveFilters({ showCrossDomainOnly: newValue });
        this.applyFiltersAndRender();
        
        const message = newValue ? '已切换到跨学域视图' : '已切换到普通视图';
        this.showNotification(message, 'info');
    }

    /**
     * Update statistics display
     * @param {Object} stats - Statistics object
     */
    updateStats(stats) {
        if (stats.totalNodes !== undefined) {
            document.getElementById('totalCount').textContent = stats.totalNodes;
        }
        
        if (stats.completedNodes !== undefined) {
            document.getElementById('completedCount').textContent = stats.completedNodes;
        }
        
        const completed = parseInt(document.getElementById('completedCount').textContent);
        const total = parseInt(document.getElementById('totalCount').textContent);
        const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
        document.getElementById('progressPercent').textContent = `${percent}%`;
        const bar = document.getElementById('overallProgressBar');
        if (bar) {
            bar.style.width = `${Math.min(100, Math.max(0, percent))}%`;
        }
    }

    /**
     * Update search results count
     * @param {number} count - Number of results
     */
    updateSearchResultsCount(count) {
        const countElement = document.getElementById('searchResultsCount');
        if (count > 0) {
            countElement.textContent = `找到 ${count} 个结果`;
        } else {
            countElement.textContent = '';
        }
    }

    /**
     * Show notification toast
     * @param {string} message - Notification message
     * @param {string} type - Notification type (success, error, info)
     */
    showNotification(message, type = 'info') {
        const toast = document.getElementById('notificationToast');
        const messageElement = document.getElementById('notificationMessage');
        
        messageElement.textContent = message;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
    
    /**
     * Generate learning path section HTML
     * @param {Object} node - Node object
     * @returns {string} HTML string
     */
    _generateLearningPathSection(node) {
        let html = `
            <div class="detail-section learning-path-section">
                <h3>🎯 学习路径</h3>
                <p class="learning-path-description">查看到达此节点的推荐学习路径</p>
                <button class="generate-path-btn" data-node-id="${node.id}">
                    生成学习路径
                </button>
                <div class="learning-path-container" id="learningPathContainer"></div>
            </div>
        `;
        
        return html;
    }
    
    /**
     * Generate and display learning path for a node
     * @param {string} nodeId - Target node ID
     */
    generateAndDisplayLearningPath(nodeId) {
        try {
            // Get completed nodes from state manager
            const completedNodes = this.stateManager.getCompletedNodes();
            
            // Generate learning path
            const path = this.learningPathFinder.generatePath(nodeId, completedNodes);
            this.currentLearningPath = path;
            
            // Display the path
            this._displayLearningPath(path);
            
            // Highlight path in visualization
            const pathNodeIds = path.steps.map(step => step.node.id);
            this.visualizationEngine.highlightPath(pathNodeIds);
            
            this.showNotification('学习路径已生成', 'success');
            
        } catch (error) {
            console.error('Failed to generate learning path:', error);
            this.showNotification('生成学习路径失败: ' + error.message, 'error');
        }
    }
    
    /**
     * Display learning path in the detail panel
     * @param {Object} path - Learning path object
     */
    _displayLearningPath(path) {
        const container = document.getElementById('learningPathContainer');
        if (!container) return;
        
        // Build path HTML
        let html = `
            <div class="learning-path-summary">
                <div class="path-stat">
                    <span class="path-stat-label">总步骤:</span>
                    <span class="path-stat-value">${path.steps.length}</span>
                </div>
                <div class="path-stat">
                    <span class="path-stat-label">预计时间:</span>
                    <span class="path-stat-value">${this._formatTime(path.totalTime)}</span>
                </div>
                <div class="path-stat">
                    <span class="path-stat-label">平均难度:</span>
                    <span class="path-stat-value">${'★'.repeat(Math.round(path.difficulty))}${'☆'.repeat(5 - Math.round(path.difficulty))}</span>
                </div>
            </div>
            
            <div class="learning-path-steps">
        `;
        
        path.steps.forEach((step, index) => {
            const isLast = index === path.steps.length - 1;
            const isFirst = index === 0;
            
            html += `
                <div class="path-step ${isLast ? 'path-step-target' : ''} ${isFirst ? 'path-step-start' : ''}">
                    <div class="path-step-header">
                        <span class="path-step-number">${step.order}</span>
                        <span class="path-step-title">${step.node.name}</span>
                    </div>
                    <div class="path-step-body">
                        <div class="path-step-reason">
                            <span class="path-step-icon">💡</span>
                            <span>${step.reason}</span>
                        </div>
                        <div class="path-step-meta">
                            <span class="path-step-time">
                                <span class="path-step-icon">⏱️</span>
                                ${step.estimatedTime} 分钟
                            </span>
                            <span class="path-step-difficulty">
                                <span class="path-step-icon">⭐</span>
                                难度 ${step.node.difficulty}/5
                            </span>
                        </div>
                    </div>
                    ${!isLast ? '<div class="path-step-connector">↓</div>' : ''}
                </div>
            `;
        });
        
        html += `
            </div>
            <div class="learning-path-actions">
                <button class="clear-path-btn" id="clearPathBtn">清除路径高亮</button>
            </div>
        `;
        
        container.innerHTML = html;
        
        // Add event listener for clear button
        const clearBtn = document.getElementById('clearPathBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clearLearningPath();
            });
        }
        
        // Add click handlers for path steps
        container.querySelectorAll('.path-step').forEach((stepElement, index) => {
            stepElement.addEventListener('click', () => {
                const nodeId = path.steps[index].node.id;
                this.handleNodeSelection(nodeId);
            });
        });
    }
    
    /**
     * Clear learning path highlighting
     */
    clearLearningPath() {
        this.currentLearningPath = null;
        this.visualizationEngine.clearHighlights();
        
        const container = document.getElementById('learningPathContainer');
        if (container) {
            container.innerHTML = '';
        }
        
        this.showNotification('已清除学习路径', 'info');
    }
    
    /**
     * Format time in minutes to readable string
     * @param {number} minutes - Time in minutes
     * @returns {string} Formatted time string
     */
    _formatTime(minutes) {
        if (minutes < 60) {
            return `${minutes} 分钟`;
        }
        
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        
        if (mins === 0) {
            return `${hours} 小时`;
        }
        
        return `${hours} 小时 ${mins} 分钟`;
    }
}
