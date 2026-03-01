/**
 * Lesson Plan Generator
 * Generates structured lesson plans from knowledge nodes
 */

import { nodeDataManager } from './NodeDataManager.js';

export class LessonPlanGenerator {
    constructor() {
        this.defaultTemplate = this.getDefaultTemplate();
    }
    
    /**
     * Generate lesson plan for a single node
     */
    generate(nodeId) {
        const node = nodeDataManager.getNodeById(nodeId);
        
        if (!node) {
            return {
                success: false,
                message: '节点不存在'
            };
        }
        
        const lessonPlan = this.generateFromNode(node);
        
        return {
            success: true,
            lessonPlan: lessonPlan
        };
    }
    
    /**
     * Generate lesson plans for multiple nodes
     */
    generateBatch(nodeIds) {
        const lessonPlans = [];
        
        for (const nodeId of nodeIds) {
            const result = this.generate(nodeId);
            if (result.success) {
                lessonPlans.push(result.lessonPlan);
            }
        }
        
        return {
            success: true,
            lessonPlans: lessonPlans,
            count: lessonPlans.length
        };
    }
    
    /**
     * Generate lesson plan from node data
     */
    generateFromNode(node) {
        const allNodes = nodeDataManager.getAllNodes();
        
        // Get prerequisite names
        const prerequisites = (node.prerequisites || [])
            .map(id => {
                const prereqNode = allNodes.find(n => n.id === id);
                return prereqNode ? prereqNode.name : id;
            });
        
        // Get domain names
        const domainNames = this.getDomainNames(node.domains || []);
        
        const lessonPlan = {
            nodeId: node.id,
            nodeName: node.name,
            nodeNameEn: node.nameEn,
            generatedAt: new Date().toISOString(),
            
            sections: [
                {
                    title: '一、教学目标',
                    content: this.generateTeachingObjectives(node)
                },
                {
                    title: '二、知识点概述',
                    content: this.generateKnowledgeOverview(node, domainNames)
                },
                {
                    title: '三、前置知识',
                    content: this.generatePrerequisites(prerequisites)
                },
                {
                    title: '四、核心内容',
                    content: this.generateCoreContent(node)
                },
                {
                    title: '五、核心公式',
                    content: this.generateFormulas(node)
                },
                {
                    title: '六、教学重点',
                    content: this.generateTeachingFocus(node)
                },
                {
                    title: '七、预计课时',
                    content: this.generateEstimatedHours(node)
                },
                {
                    title: '八、实际应用',
                    content: this.generateRealApplications(node)
                },
                {
                    title: '九、扩展主题',
                    content: this.generateAdvancedTopics(node)
                }
            ]
        };
        
        return lessonPlan;
    }
    
    /**
     * Generate teaching objectives
     */
    generateTeachingObjectives(node) {
        return `
通过本节课的学习，学生应能够：

1. 理解并掌握"${node.name}"的基本概念和定义
2. 能够运用相关知识解决实际问题
3. 建立与其他知识点的联系，形成系统化理解
4. 培养数学思维和问题解决能力

难度等级：${node.difficulty}/5
重要性：${node.importance}/5
        `.trim();
    }
    
    /**
     * Generate knowledge overview
     */
    generateKnowledgeOverview(node, domainNames) {
        return `
${node.description}

所属学域：${domainNames.join('、')}

关键词：${(node.keywords || []).join('、') || '无'}
        `.trim();
    }
    
    /**
     * Generate prerequisites section
     */
    generatePrerequisites(prerequisites) {
        if (prerequisites.length === 0) {
            return '本知识点无特定前置要求，适合初学者学习。';
        }
        
        return `
学习本知识点前，学生应该已经掌握以下内容：

${prerequisites.map((name, index) => `${index + 1}. ${name}`).join('\n')}

建议在学习本节内容前，先复习上述前置知识。
        `.trim();
    }
    
    /**
     * Generate core content
     */
    generateCoreContent(node) {
        return `
${node.description}

【教学建议】
1. 从实际问题引入，激发学生兴趣
2. 通过例题讲解，帮助学生理解核心概念
3. 组织课堂讨论，促进深度思考
4. 布置练习题，巩固所学知识
        `.trim();
    }
    
    /**
     * Generate formulas section
     */
    generateFormulas(node) {
        if (!node.formula) {
            return '本知识点暂无核心公式。';
        }
        
        return `
核心公式：

$${node.formula}$

【公式说明】
请结合具体例题讲解公式的含义和应用场景。
        `.trim();
    }
    
    /**
     * Generate teaching focus
     */
    generateTeachingFocus(node) {
        return `
1. 核心概念的准确理解
2. 公式的推导和应用
3. 与其他知识点的联系
4. 实际问题的建模和求解

【教学难点】
- 抽象概念的具体化
- 理论与实践的结合
- 思维方法的培养
        `.trim();
    }
    
    /**
     * Generate estimated hours
     */
    generateEstimatedHours(node) {
        return `
预计学习时间：${node.estimatedStudyTime || '2小时'}

【时间分配建议】
- 概念讲解：30%
- 例题演示：30%
- 练习巩固：30%
- 总结提升：10%
        `.trim();
    }
    
    /**
     * Generate real applications
     */
    generateRealApplications(node) {
        return `
本知识点在以下领域有重要应用：

1. 工程技术：在实际工程问题中的应用
2. 科学研究：在科学研究中的作用
3. 日常生活：与日常生活的联系

【教学建议】
通过具体案例展示知识点的实际价值，提高学生学习动机。
        `.trim();
    }
    
    /**
     * Generate advanced topics
     */
    generateAdvancedTopics(node) {
        return `
对于学有余力的学生，可以探索以下扩展内容：

1. 更深入的理论研究
2. 相关的高级主题
3. 跨学科的应用
4. 前沿研究方向

【拓展资源】
建议学生查阅相关文献和在线资源，进行自主学习。
        `.trim();
    }
    
    /**
     * Get domain names
     */
    getDomainNames(domainIds) {
        const domainMap = {
            'domain-1': '变化与逼近',
            'domain-2': '结构与累积',
            'domain-3': '优化与决策',
            'domain-4': '不确定性处理',
            'domain-5': '真实问题建模'
        };
        
        return domainIds.map(id => domainMap[id] || id);
    }
    
    /**
     * Get default template
     */
    getDefaultTemplate() {
        return {
            sections: [
                { id: 'objectives', title: '教学目标', required: true },
                { id: 'overview', title: '知识点概述', required: true },
                { id: 'prerequisites', title: '前置知识', required: false },
                { id: 'core', title: '核心内容', required: true },
                { id: 'formulas', title: '核心公式', required: false },
                { id: 'focus', title: '教学重点', required: true },
                { id: 'hours', title: '预计课时', required: false },
                { id: 'applications', title: '实际应用', required: false },
                { id: 'advanced', title: '扩展主题', required: false }
            ]
        };
    }
    
    /**
     * Save custom template
     */
    saveTemplate(template) {
        try {
            localStorage.setItem('kg_lesson_plan_template', JSON.stringify(template));
            return { success: true, message: '模板保存成功' };
        } catch (error) {
            return { success: false, message: '模板保存失败：' + error.message };
        }
    }
    
    /**
     * Load custom template
     */
    loadTemplate() {
        try {
            const templateJson = localStorage.getItem('kg_lesson_plan_template');
            if (templateJson) {
                return JSON.parse(templateJson);
            }
            return this.defaultTemplate;
        } catch (error) {
            console.error('Error loading template:', error);
            return this.defaultTemplate;
        }
    }
}

// Export singleton instance
export const lessonPlanGenerator = new LessonPlanGenerator();
