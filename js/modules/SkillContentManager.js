/**
 * SkillContentManager
 * Manages skill content, exercises, and learning materials
 * Provides structured access to skill-related educational content
 */

export class SkillContentManager {
    constructor() {
        this.contentCache = new Map();
        this.exerciseCache = new Map();
        // Phase2 深度内容（来自 data/skills-content-phase2.json）
        this.phase2DeepCache = new Map(); // key: 中文 skillId（如“函数极限与连续Skill”）
        this.phase2Metadata = null;
        this.isInitialized = false;
    }

    /**
     * Initialize content manager and load content metadata
     * @returns {Promise<void>}
     */
    async initialize() {
        if (this.isInitialized) {
            return;
        }

        try {
            // Load skill content metadata
            await this._loadContentMetadata();
            this.isInitialized = true;
            console.log('✅ Skill content manager initialized');
        } catch (error) {
            console.error('❌ Failed to initialize skill content manager:', error);
            throw error;
        }
    }

    /**
     * Load Phase2 deep skills content (advanced topics/exercises/projects)
     * from data/skills-content-phase2.json
     * @param {string} [url] - JSON URL path
     * @returns {Promise<{totalItems:number, skillIds:string[]}>}
     */
    async loadPhase2DeepContent(url = 'data/skills-content-phase2.json') {
        try {
            const res = await fetch(url, { cache: 'no-store' });
            if (!res.ok) {
                throw new Error(`HTTP ${res.status} ${res.statusText}`);
            }
            const json = await res.json();
            const items = Array.isArray(json?.data) ? json.data : [];
            this.phase2Metadata = json?.metadata || null;
            this.phase2DeepCache.clear();
            items.forEach(item => {
                if (!item || !item.skillId) return;
                this.phase2DeepCache.set(item.skillId, item);
            });
            const skillIds = Array.from(this.phase2DeepCache.keys()).sort();
            console.log('✅ Phase2 deep skills loaded:', skillIds.length, 'skills');
            return { totalItems: skillIds.length, skillIds };
        } catch (error) {
            console.error('❌ Failed to load phase2 deep skills:', error);
            throw error;
        }
    }

    /**
     * Get Phase2 metadata object
     * @returns {Object|null}
     */
    getPhase2Metadata() {
        return this.phase2Metadata;
    }

    /**
     * List available Phase2 skillIds
     * @returns {string[]}
     */
    getPhase2SkillIds() {
        return Array.from(this.phase2DeepCache.keys()).sort();
    }

    /**
     * Get Phase2 deep content by skillId (中文)
     * @param {string} skillId
     * @returns {Object|null}
     */
    getPhase2Skill(skillId) {
        return this.phase2DeepCache.get(skillId) || null;
    }

    /**
     * Load content metadata from JSON files
     * @private
     */
    async _loadContentMetadata() {
        // Define content structure for each skill
        const skillsContent = {
            'gradient-visualization-skill': {
                theory: {
                    title: '梯度可视化',
                    duration: 10,
                    sections: [
                        {
                            title: '梯度的定义',
                            content: '梯度是多元函数在某点处最陡上升方向的指示...',
                            formula: '∇f = (∂f/∂x, ∂f/∂y, ∂f/∂z)'
                        },
                        {
                            title: '梯度的几何意义',
                            content: '梯度向量垂直于等高线...',
                            formula: '|∇f| = 最大变化率'
                        },
                        {
                            title: '方向导数',
                            content: '沿着特定方向的变化率...',
                            formula: 'D_u f = ∇f · u'
                        }
                    ]
                },
                visualizations: [
                    {
                        id: 'gradient-3d-surface',
                        title: '3D曲面与梯度向量',
                        description: '显示函数曲面和梯度向量',
                        type: '3d-plot'
                    },
                    {
                        id: 'gradient-contour',
                        title: '等高线与梯度',
                        description: '显示等高线和梯度方向',
                        type: 'contour-plot'
                    },
                    {
                        id: 'directional-derivative',
                        title: '方向导数动画',
                        description: '演示沿不同方向的导数变化',
                        type: 'animation'
                    },
                    {
                        id: 'gradient-descent',
                        title: '梯度下降过程',
                        description: '显示梯度下降优化过程',
                        type: 'animation'
                    },
                    {
                        id: 'gradient-field',
                        title: '梯度场可视化',
                        description: '显示整个区域的梯度向量场',
                        type: 'vector-field'
                    }
                ],
                exercises: [
                    {
                        id: 'gradient-calc-1',
                        type: 'calculation',
                        difficulty: 'basic',
                        question: '计算函数 f(x,y) = x² + y² 在点 (1,2) 处的梯度',
                        answer: '∇f(1,2) = (2, 4)',
                        explanation: '对x求偏导得2x，对y求偏导得2y...'
                    },
                    {
                        id: 'gradient-calc-2',
                        type: 'calculation',
                        difficulty: 'intermediate',
                        question: '计算函数 f(x,y) = e^(x²+y²) 在点 (0,1) 处的梯度',
                        answer: '∇f(0,1) = (0, 2e)',
                        explanation: '使用链式法则...'
                    },
                    {
                        id: 'gradient-direction',
                        type: 'multiple-choice',
                        difficulty: 'basic',
                        question: '梯度向量指向哪个方向？',
                        options: [
                            '最陡上升方向',
                            '最陡下降方向',
                            '等高线方向',
                            '任意方向'
                        ],
                        answer: 0
                    }
                ],
                applications: [
                    {
                        title: '机器学习中的梯度下降',
                        description: '使用梯度下降优化神经网络参数',
                        difficulty: 'advanced'
                    },
                    {
                        title: '图像处理中的梯度',
                        description: '使用梯度检测图像边缘',
                        difficulty: 'intermediate'
                    },
                    {
                        title: '物理中的势能梯度',
                        description: '梯度在物理学中的应用',
                        difficulty: 'advanced'
                    }
                ]
            },
            'concept-visualization-skill': {
                theory: {
                    title: '概念可视化',
                    duration: 15,
                    sections: [
                        {
                            title: '极限的ε-δ定义',
                            content: '对于任意ε > 0，存在δ > 0...',
                            formula: '∀ε > 0, ∃δ > 0: |x - a| < δ ⟹ |f(x) - L| < ε'
                        },
                        {
                            title: '导数的定义',
                            content: '函数在某点的导数是...',
                            formula: "f'(a) = lim(h→0) [f(a+h) - f(a)] / h"
                        },
                        {
                            title: '积分的定义',
                            content: '积分是黎曼和的极限...',
                            formula: '∫[a,b] f(x)dx = lim(n→∞) Σ f(ξᵢ)Δxᵢ'
                        }
                    ]
                },
                visualizations: [
                    {
                        id: 'limit-epsilon-delta',
                        title: 'ε-δ极限定义',
                        description: '交互式演示极限的ε-δ定义',
                        type: 'interactive'
                    },
                    {
                        id: 'derivative-secant-tangent',
                        title: '割线到切线',
                        description: '演示割线逐渐变为切线的过程',
                        type: 'animation'
                    },
                    {
                        id: 'integral-riemann-sum',
                        title: '黎曼和到积分',
                        description: '演示黎曼和逼近积分的过程',
                        type: 'animation'
                    }
                ],
                exercises: [
                    {
                        id: 'concept-limit-1',
                        type: 'multiple-choice',
                        difficulty: 'basic',
                        question: '函数在某点的极限存在意味着什么？',
                        options: [
                            '函数在该点有定义',
                            '函数在该点连续',
                            '当x接近该点时，f(x)接近某个值',
                            '函数在该点可导'
                        ],
                        answer: 2
                    }
                ]
            },
            'derivation-animation-skill': {
                theory: {
                    title: '推导动画',
                    duration: 12,
                    sections: [
                        {
                            title: '导数定义推导',
                            content: '从割线斜率到切线斜率的推导过程...',
                            steps: 8
                        },
                        {
                            title: '泰勒级数推导',
                            content: '多项式逼近函数的推导...',
                            steps: 12
                        }
                    ]
                },
                visualizations: [
                    {
                        id: 'derivative-derivation',
                        title: '导数定义推导动画',
                        description: '逐步演示导数定义的推导',
                        type: 'step-animation',
                        steps: 8
                    },
                    {
                        id: 'taylor-series-derivation',
                        title: '泰勒级数推导动画',
                        description: '逐步演示泰勒级数的推导',
                        type: 'step-animation',
                        steps: 12
                    }
                ]
            },
            'h5p-interaction-skill': {
                theory: {
                    title: 'H5P交互',
                    duration: 5,
                    sections: []
                },
                exercises: [
                    {
                        id: 'h5p-multiple-choice-1',
                        type: 'multiple-choice',
                        difficulty: 'basic',
                        count: 20
                    },
                    {
                        id: 'h5p-fill-blanks-1',
                        type: 'fill-blanks',
                        difficulty: 'intermediate',
                        count: 15
                    },
                    {
                        id: 'h5p-drag-drop-1',
                        type: 'drag-drop',
                        difficulty: 'advanced',
                        count: 10
                    }
                ]
            },
            'limit-continuity-skill': {
                theory: {
                    title: '函数极限与连续',
                    duration: 20,
                    sections: [
                        {
                            title: '数列极限',
                            content: '数列极限的定义和性质...',
                            formula: 'lim(n→∞) aₙ = L'
                        },
                        {
                            title: '函数极限',
                            content: '函数极限的定义和性质...',
                            formula: 'lim(x→a) f(x) = L'
                        },
                        {
                            title: '连续性',
                            content: '函数连续的定义...',
                            formula: 'lim(x→a) f(x) = f(a)'
                        },
                        {
                            title: '间断点分类',
                            content: '可去间断点、跳跃间断点、无穷间断点...',
                            types: 3
                        }
                    ]
                },
                visualizations: [
                    {
                        id: 'limit-convergence',
                        title: '极限收敛过程',
                        description: '演示数列和函数的极限收敛',
                        type: 'animation'
                    },
                    {
                        id: 'continuity-check',
                        title: '连续性检验',
                        description: '交互式检验函数连续性',
                        type: 'interactive'
                    },
                    {
                        id: 'discontinuity-types',
                        title: '间断点分类',
                        description: '显示不同类型的间断点',
                        type: 'visualization'
                    }
                ]
            },
            'derivative-differential-skill': {
                theory: {
                    title: '导数与微分',
                    duration: 25,
                    sections: [
                        {
                            title: '导数定义',
                            content: '导数的定义和几何意义...',
                            formula: "f'(x) = lim(h→0) [f(x+h) - f(x)] / h"
                        },
                        {
                            title: '求导法则',
                            content: '基本求导法则...',
                            rules: ['幂法则', '乘积法则', '商法则', '链式法则']
                        },
                        {
                            title: '高阶导数',
                            content: '二阶导数、三阶导数等...',
                            formula: "f''(x), f'''(x), ..."
                        },
                        {
                            title: '微分',
                            content: '微分的定义和应用...',
                            formula: 'dy = f\'(x)dx'
                        }
                    ]
                },
                visualizations: [
                    {
                        id: 'derivative-geometric',
                        title: '导数的几何意义',
                        description: '显示导数作为切线斜率',
                        type: 'interactive'
                    },
                    {
                        id: 'derivative-rules',
                        title: '求导法则演示',
                        description: '演示各种求导法则',
                        type: 'animation'
                    },
                    {
                        id: 'higher-order-derivatives',
                        title: '高阶导数',
                        description: '显示高阶导数的含义',
                        type: 'visualization'
                    }
                ]
            },
            'integral-concept-skill': {
                theory: {
                    title: '积分概念',
                    duration: 25,
                    sections: [
                        {
                            title: '不定积分',
                            content: '原函数和不定积分...',
                            formula: '∫ f(x)dx = F(x) + C'
                        },
                        {
                            title: '定积分',
                            content: '定积分的定义...',
                            formula: '∫[a,b] f(x)dx = F(b) - F(a)'
                        },
                        {
                            title: '积分法则',
                            content: '基本积分法则...',
                            rules: ['幂法则', '换元法', '分部积分']
                        },
                        {
                            title: '应用',
                            content: '积分的应用...',
                            applications: ['面积', '体积', '物理应用']
                        }
                    ]
                },
                visualizations: [
                    {
                        id: 'riemann-sum',
                        title: '黎曼和',
                        description: '演示黎曼和逼近积分',
                        type: 'animation'
                    },
                    {
                        id: 'integral-area',
                        title: '积分与面积',
                        description: '显示积分与曲线下面积的关系',
                        type: 'interactive'
                    },
                    {
                        id: 'integral-applications',
                        title: '积分应用',
                        description: '演示积分的各种应用',
                        type: 'visualization'
                    }
                ]
            }
        };

        // Cache the content
        for (const [skillId, content] of Object.entries(skillsContent)) {
            this.contentCache.set(skillId, content);
        }
    }

    /**
     * Get theory content for a skill
     * @param {string} skillId - Skill identifier
     * @returns {Object|null} Theory content object
     */
    getTheoryContent(skillId) {
        const content = this.contentCache.get(skillId);
        return content ? content.theory : null;
    }

    /**
     * Get visualizations for a skill
     * @param {string} skillId - Skill identifier
     * @returns {Array} Array of visualization objects
     */
    getVisualizations(skillId) {
        const content = this.contentCache.get(skillId);
        return content ? content.visualizations || [] : [];
    }

    /**
     * Get exercises for a skill
     * @param {string} skillId - Skill identifier
     * @param {string} difficulty - Filter by difficulty (optional)
     * @returns {Array} Array of exercise objects
     */
    getExercises(skillId, difficulty = null) {
        const content = this.contentCache.get(skillId);
        if (!content || !content.exercises) {
            return [];
        }

        if (difficulty) {
            return content.exercises.filter(ex => ex.difficulty === difficulty);
        }
        return content.exercises;
    }

    /**
     * Get applications for a skill
     * @param {string} skillId - Skill identifier
     * @returns {Array} Array of application objects
     */
    getApplications(skillId) {
        const content = this.contentCache.get(skillId);
        return content ? content.applications || [] : [];
    }

    /**
     * Get all content for a skill
     * @param {string} skillId - Skill identifier
     * @returns {Object|null} Complete content object
     */
    getFullContent(skillId) {
        return this.contentCache.get(skillId) || null;
    }

    /**
     * Get content statistics for a skill
     * @param {string} skillId - Skill identifier
     * @returns {Object} Statistics object
     */
    getContentStats(skillId) {
        const content = this.contentCache.get(skillId);
        if (!content) {
            return null;
        }

        return {
            skillId,
            theoryDuration: content.theory?.duration || 0,
            visualizationCount: content.visualizations?.length || 0,
            exerciseCount: content.exercises?.length || 0,
            applicationCount: content.applications?.length || 0,
            totalEstimatedTime: (content.theory?.duration || 0) + 
                               ((content.exercises?.length || 0) * 2) +
                               ((content.applications?.length || 0) * 5)
        };
    }

    /**
     * Get all skills content statistics
     * @returns {Array} Array of statistics objects
     */
    getAllContentStats() {
        const stats = [];
        for (const skillId of this.contentCache.keys()) {
            stats.push(this.getContentStats(skillId));
        }
        return stats;
    }

    /**
     * Search content by keyword
     * @param {string} keyword - Search keyword
     * @returns {Array} Array of matching content items
     */
    searchContent(keyword) {
        const results = [];
        const lowerKeyword = keyword.toLowerCase();

        for (const [skillId, content] of this.contentCache.entries()) {
            // Search in theory
            if (content.theory?.title.toLowerCase().includes(lowerKeyword)) {
                results.push({
                    type: 'theory',
                    skillId,
                    title: content.theory.title
                });
            }

            // Search in visualizations
            content.visualizations?.forEach(viz => {
                if (viz.title.toLowerCase().includes(lowerKeyword)) {
                    results.push({
                        type: 'visualization',
                        skillId,
                        title: viz.title
                    });
                }
            });

            // Search in exercises
            content.exercises?.forEach(ex => {
                if (ex.question?.toLowerCase().includes(lowerKeyword)) {
                    results.push({
                        type: 'exercise',
                        skillId,
                        title: ex.question
                    });
                }
            });

            // Search in applications
            content.applications?.forEach(app => {
                if (app.title.toLowerCase().includes(lowerKeyword)) {
                    results.push({
                        type: 'application',
                        skillId,
                        title: app.title
                    });
                }
            });
        }

        return results;
    }
}

