/**
 * SkillIntegrationManager
 * Manages skill registration, loading, and node-skill mapping
 */

export class SkillIntegrationManager {
    constructor() {
        this.skillRegistry = new Map();
        this.loadedSkills = new Map();
        this.nodeSkillMap = new Map();
        this.domainSkillMap = new Map();
        this.isInitialized = false;
    }

    /**
     * Load skill registry
     */
    async loadSkillRegistry() {
        if (this.isInitialized) {
            return;
        }

        try {
            this._buildSkillMetadata();
            this._buildNodeSkillMapping();
            this._buildDomainSkillMapping();
            
            this.isInitialized = true;
            console.log('✅ Skill registry loaded:', this.skillRegistry.size, 'skills');
        } catch (error) {
            console.error('❌ Failed to load skill registry:', error);
            throw error;
        }
    }

    /**
     * Build skill metadata
     */
    _buildSkillMetadata() {
        const skills = [
            {
                id: 'gradient-visualization-skill',
                name: '梯度可视化Skill',
                type: 'visualization',
                applicableNodes: ['node-gradient', 'node-directional-derivative'],
                applicableDomains: ['domain-3'],
                description: '3D曲面和梯度向量的交互式可视化',
                icon: '🎨',
                modulePath: './js/skills/gradient-visualization/index.js'
            }
,
            {
                id: 'concept-visualization-skill',
                name: '概念可视化Skill',
                type: 'visualization',
                applicableNodes: ['node-limit', 'node-derivative', 'node-integral'],
                applicableDomains: ['domain-1', 'domain-2'],
                description: '数学概念的动态可视化演示',
                icon: '📊',
                modulePath: './js/skills/concept-visualization/index.js'
            },
            {
                id: 'derivation-animation-skill',
                name: '推导动画Skill',
                type: 'animation',
                applicableNodes: ['node-derivative', 'node-taylor-series'],
                applicableDomains: ['domain-1', 'domain-4'],
                description: '数学推导过程的逐步动画',
                icon: '🎬',
                modulePath: './js/skills/derivation-animation/index.js'
            },
            {
                id: 'h5p-interaction-skill',
                name: 'H5P交互Skill',
                type: 'interaction',
                applicableNodes: ['*'],
                applicableDomains: ['domain-5'],
                description: '交互式练习和即时反馈',
                icon: '🎮',
                modulePath: './js/skills/h5p-interaction/index.js'
            },
            {
                id: 'limit-continuity-skill',
                name: '函数极限与连续Skill',
                type: 'visualization',
                applicableNodes: ['node-limit', 'node-continuity'],
                applicableDomains: ['domain-1'],
                description: '极限和连续性的可视化',
                icon: '📈',
                modulePath: './js/skills/limit-continuity/index.js'
            },
            {
                id: 'derivative-differential-skill',
                name: '导数与微分Skill',
                type: 'visualization',
                applicableNodes: ['node-derivative', 'node-differential'],
                applicableDomains: ['domain-1'],
                description: '导数和微分的几何意义',
                icon: '📐',
                modulePath: './js/skills/derivative-differential/index.js'
            },
            {
                id: 'integral-concept-skill',
                name: '积分概念Skill',
                type: 'visualization',
                applicableNodes: ['node-integral', 'node-definite-integral'],
                applicableDomains: ['domain-2'],
                description: '积分的黎曼和可视化',
                icon: '∫',
                modulePath: './js/skills/integral-concept/index.js'
            }
        ];

        skills.forEach(skill => {
            this.skillRegistry.set(skill.id, skill);
        });
    }

    /**
     * Build node-skill mapping
     */
    _buildNodeSkillMapping() {
        for (const [skillId, skill] of this.skillRegistry.entries()) {
            skill.applicableNodes.forEach(nodeId => {
                if (!this.nodeSkillMap.has(nodeId)) {
                    this.nodeSkillMap.set(nodeId, []);
                }
                this.nodeSkillMap.get(nodeId).push(skill);
            });
        }
    }

    /**
     * Build domain-skill mapping
     */
    _buildDomainSkillMapping() {
        for (const [skillId, skill] of this.skillRegistry.entries()) {
            skill.applicableDomains.forEach(domainId => {
                if (!this.domainSkillMap.has(domainId)) {
                    this.domainSkillMap.set(domainId, []);
                }
                this.domainSkillMap.get(domainId).push(skill);
            });
        }
    }

    /**
     * Get skills by node
     */
    getSkillsByNode(nodeId) {
        return this.nodeSkillMap.get(nodeId) || [];
    }

    /**
     * Get skills by domain
     */
    getSkillsByDomain(domainId) {
        return this.domainSkillMap.get(domainId) || [];
    }

    /**
     * Get all skills
     */
    getAllSkills() {
        return Array.from(this.skillRegistry.values());
    }

    /**
     * Get skill by ID
     */
    getSkillInfo(skillId) {
        return this.skillRegistry.get(skillId);
    }

    /**
     * Get skills by type
     */
    getSkillsByType(type) {
        return this.getAllSkills().filter(skill => skill.type === type);
    }

    /**
     * Check if skill is available
     */
    isSkillAvailable(skillId) {
        return this.skillRegistry.has(skillId);
    }

    /**
     * Activate skill
     */
    async activateSkill(skillId, container) {
        const skill = this.skillRegistry.get(skillId);
        if (!skill) {
            throw new Error(`Skill not found: ${skillId}`);
        }

        try {
            if (!this.loadedSkills.has(skillId)) {
                const module = await import(skill.modulePath);
                const SkillClass = Object.values(module)[0];
                const skillInstance = new SkillClass(container);
                await skillInstance.init();
                this.loadedSkills.set(skillId, skillInstance);
            }
            
            return this.loadedSkills.get(skillId);
        } catch (error) {
            console.error(`Failed to activate skill ${skillId}:`, error);
            throw error;
        }
    }

    /**
     * Deactivate skill
     */
    deactivateSkill(skillId) {
        const skillInstance = this.loadedSkills.get(skillId);
        if (skillInstance && skillInstance.destroy) {
            skillInstance.destroy();
        }
        this.loadedSkills.delete(skillId);
    }
}
