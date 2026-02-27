/**
 * Translation Dictionary
 * Provides Chinese and English translations for all UI elements
 */

export const translations = {
  zh: {
    // Header
    'app.title': '高等数学学域知识图谱',
    'app.subtitle': '从章节记忆到学域理解 · 5大学域整合范式',
    
    // Domain names
    'domain.1': '变化与逼近',
    'domain.2': '结构与累积',
    'domain.3': '优化与决策',
    'domain.4': '不确定性处理',
    'domain.5': '真实问题建模',
    
    // Domain descriptions
    'domain.1.desc': '用离散逼近连续',
    'domain.2.desc': '从局部累积到整体',
    'domain.3.desc': '多元系统最优决策',
    'domain.4.desc': '无穷与随机工具',
    'domain.5.desc': '综合运用解决复杂问题',
    
    // Sidebar
    'sidebar.explore': '探索与筛选',
    'sidebar.domainMode': '学域模式',
    'sidebar.domainMode.intro': '从章节记忆到学域理解：按五大数学学域整合知识，点击学域可筛选节点。',
    'sidebar.domainMode.title': '五大学域一览',
    'sidebar.domainOverview': '学域概览',
    'sidebar.skills': 'Skills 运用',
    'sidebar.skills.count': '个节点可运用 Skills',
    'sidebar.skills.link': '查看学生侧 Skills 看板 →',
    'sidebar.skills.experience': '进入 Skills 真实体验（测试平台） →',
    'sidebar.skills.currentNode': '当前节点',
    'sidebar.skills.apply': '去运用',
    'sidebar.limitConflict': '极限认知冲突教学',
    'sidebar.limitConflict.intro': '围绕"极限"构建认知冲突，从学域视角设计一节完整课例。',
    'sidebar.limitConflict.link': '进入极限认知冲突教学 →',
    'sidebar.teacherAgents': '教师侧 AI Agents',
    'sidebar.teacherAgents.intro': '七大 Agents：从学域诊断、路径规划，到课堂教练、评价生成与教学反思。',
    'sidebar.teacherAgents.link': '查看教师侧七大 Agents →',
    'sidebar.realModeling': '真实问题建模学习内容',
    'sidebar.realModeling.hint': '学域五：从数学到工程场景的建模与求解',
    'sidebar.realModeling.link': '进入真实问题建模 →',
    
    // Search and filters
    'search.placeholder': '搜索知识节点、学域、关键词...',
    'filter.domain': '学域筛选',
    'filter.nodeType': '节点类型',
    'filter.nodeType.concept': '概念',
    'filter.nodeType.theorem': '定理',
    'filter.nodeType.method': '方法',
    'filter.nodeType.application': '应用',
    'filter.chapter': '传统章节',
    'filter.chapter.all': '全部章节',
    'filter.difficulty': '难度范围',
    'filter.clear': '清除所有筛选',
    
    // Stats
    'stats.title': '学习统计',
    'stats.completed': '已完成节点:',
    'stats.total': '总节点数:',
    'stats.progress': '学习进度:',
    
    // Zoom controls
    'zoom.in': '放大',
    'zoom.out': '缩小',
    'zoom.reset': '重置视图',
    'zoom.fit': '适应画布',
    'zoom.crossDomain': '跨学域视图',
    
    // Detail panel
    'detail.title': '节点详情',
    'detail.close': '关闭',
    'detail.description': '描述',
    'detail.formula': '数学公式',
    'detail.prerequisites': '前置知识',
    'detail.relatedSkills': '相关技能',
    'detail.applications': '实际应用',
    'detail.difficulty': '难度',
    'detail.studyTime': '预计学习时间',
    'detail.keywords': '关键词',
    'detail.chapter': '章节',
    
    // Loading
    'loading.graph': '加载知识图谱中...',
    'loading.data': '加载数据中...',
    
    // Notifications
    'notification.dataLoaded': '数据加载成功',
    'notification.dataError': '数据加载失败',
    'notification.filterApplied': '筛选已应用',
    'notification.filterCleared': '筛选已清除',
    'notification.languageChanged': '语言已切换',
    
    // Language switcher
    'language.switch': '切换语言',
    'language.zh': '中文',
    'language.en': 'English',
    
    // Export
    'export.pdf': '导出为 PDF',
    'export.markdown': '导出为 Markdown',
    'export.png': '导出为图片',
    'export.json': '导出数据',
    'export.success': '导出成功',
    'export.error': '导出失败',
    
    // Share
    'share.title': '分享',
    'share.link': '分享链接',
    'share.copy': '复制链接',
    'share.copied': '链接已复制',
    'share.error': '分享失败',
    
    // Onboarding
    'onboarding.welcome.title': '欢迎使用 Phase 2 知识图谱系统！',
    'onboarding.welcome.content': '我们为您准备了150个数学知识节点、5种专业可视化和完整的移动端支持。让我们快速了解主要功能。',
    'onboarding.language.title': '多语言支持',
    'onboarding.language.content': '点击这里可以在中文和English之间切换。系统会记住您的选择。',
    'onboarding.search.title': '搜索功能',
    'onboarding.search.content': '在这里输入关键词搜索节点。支持中英文名称、描述和关键词搜索。',
    'onboarding.domain.title': '学域筛选',
    'onboarding.domain.content': '按五大学域筛选节点：变化与逼近、结构与累积、优化与决策、不确定性处理、真实问题建模。',
    'onboarding.graph.title': '知识图谱',
    'onboarding.graph.content': '这是知识图谱主视图。点击节点查看详情，拖动平移，滚轮缩放。',
    'onboarding.controls.title': '视图控制',
    'onboarding.controls.content': '使用这些按钮控制视图：放大、缩小、重置、适应画布、跨学域视图。',
    'onboarding.skip': '跳过',
    'onboarding.prev': '上一步',
    'onboarding.next': '下一步',
    'onboarding.finish': '完成'
  },
  
  en: {
    // Header
    'app.title': 'Advanced Mathematics Domain Knowledge Graph',
    'app.subtitle': 'From Chapter Memorization to Domain Understanding · 5 Domain Integration Paradigm',
    
    // Domain names
    'domain.1': 'Change & Approximation',
    'domain.2': 'Structure & Accumulation',
    'domain.3': 'Optimization & Decision',
    'domain.4': 'Uncertainty Handling',
    'domain.5': 'Real-World Modeling',
    
    // Domain descriptions
    'domain.1.desc': 'Approximating continuous with discrete',
    'domain.2.desc': 'From local to global accumulation',
    'domain.3.desc': 'Optimal decisions in multivariate systems',
    'domain.4.desc': 'Tools for infinity and randomness',
    'domain.5.desc': 'Comprehensive problem solving',
    
    // Sidebar
    'sidebar.explore': 'Explore & Filter',
    'sidebar.domainMode': 'Domain Mode',
    'sidebar.domainMode.intro': 'From chapter memorization to domain understanding: organize knowledge by five mathematical domains, click to filter nodes.',
    'sidebar.domainMode.title': 'Five Domains Overview',
    'sidebar.domainOverview': 'Domain Overview',
    'sidebar.skills': 'Skills Application',
    'sidebar.skills.count': 'nodes with Skills',
    'sidebar.skills.link': 'View Student Skills Dashboard →',
    'sidebar.skills.experience': 'Enter Skills Experience Platform →',
    'sidebar.skills.currentNode': 'Current Node',
    'sidebar.skills.apply': 'Apply',
    'sidebar.limitConflict': 'Limit Cognitive Conflict Teaching',
    'sidebar.limitConflict.intro': 'Build cognitive conflict around "limit" concept, design a complete lesson from domain perspective.',
    'sidebar.limitConflict.link': 'Enter Limit Conflict Teaching →',
    'sidebar.teacherAgents': 'Teacher AI Agents',
    'sidebar.teacherAgents.intro': 'Seven Agents: from domain diagnosis, path planning, to classroom coaching, evaluation and teaching reflection.',
    'sidebar.teacherAgents.link': 'View Teacher Agents →',
    'sidebar.realModeling': 'Real-World Modeling Content',
    'sidebar.realModeling.hint': 'Domain 5: From mathematics to engineering scenarios',
    'sidebar.realModeling.link': 'Enter Real-World Modeling →',
    
    // Search and filters
    'search.placeholder': 'Search nodes, domains, keywords...',
    'filter.domain': 'Domain Filter',
    'filter.nodeType': 'Node Type',
    'filter.nodeType.concept': 'Concept',
    'filter.nodeType.theorem': 'Theorem',
    'filter.nodeType.method': 'Method',
    'filter.nodeType.application': 'Application',
    'filter.chapter': 'Traditional Chapter',
    'filter.chapter.all': 'All Chapters',
    'filter.difficulty': 'Difficulty Range',
    'filter.clear': 'Clear All Filters',
    
    // Stats
    'stats.title': 'Learning Statistics',
    'stats.completed': 'Completed Nodes:',
    'stats.total': 'Total Nodes:',
    'stats.progress': 'Progress:',
    
    // Zoom controls
    'zoom.in': 'Zoom In',
    'zoom.out': 'Zoom Out',
    'zoom.reset': 'Reset View',
    'zoom.fit': 'Fit to View',
    'zoom.crossDomain': 'Cross-Domain View',
    
    // Detail panel
    'detail.title': 'Node Details',
    'detail.close': 'Close',
    'detail.description': 'Description',
    'detail.formula': 'Mathematical Formula',
    'detail.prerequisites': 'Prerequisites',
    'detail.relatedSkills': 'Related Skills',
    'detail.applications': 'Applications',
    'detail.difficulty': 'Difficulty',
    'detail.studyTime': 'Estimated Study Time',
    'detail.keywords': 'Keywords',
    'detail.chapter': 'Chapter',
    
    // Loading
    'loading.graph': 'Loading knowledge graph...',
    'loading.data': 'Loading data...',
    
    // Notifications
    'notification.dataLoaded': 'Data loaded successfully',
    'notification.dataError': 'Failed to load data',
    'notification.filterApplied': 'Filter applied',
    'notification.filterCleared': 'Filters cleared',
    'notification.languageChanged': 'Language changed',
    
    // Language switcher
    'language.switch': 'Switch Language',
    'language.zh': '中文',
    'language.en': 'English',
    
    // Export
    'export.pdf': 'Export as PDF',
    'export.markdown': 'Export as Markdown',
    'export.png': 'Export as Image',
    'export.json': 'Export Data',
    'export.success': 'Export successful',
    'export.error': 'Export failed',
    
    // Share
    'share.title': 'Share',
    'share.link': 'Share Link',
    'share.copy': 'Copy Link',
    'share.copied': 'Link copied',
    'share.error': 'Share failed',
    
    // Onboarding
    'onboarding.welcome.title': 'Welcome to Phase 2 Knowledge Graph System!',
    'onboarding.welcome.content': 'We have prepared 150 math nodes, 5 professional visualizations, and complete mobile support. Let\'s explore the main features.',
    'onboarding.language.title': 'Multi-language Support',
    'onboarding.language.content': 'Click here to switch between Chinese and English. The system will remember your choice.',
    'onboarding.search.title': 'Search Function',
    'onboarding.search.content': 'Enter keywords here to search nodes. Supports Chinese/English names, descriptions, and keywords.',
    'onboarding.domain.title': 'Domain Filter',
    'onboarding.domain.content': 'Filter nodes by five domains: Change & Approximation, Structure & Accumulation, Optimization & Decision, Uncertainty Handling, Real-World Modeling.',
    'onboarding.graph.title': 'Knowledge Graph',
    'onboarding.graph.content': 'This is the main knowledge graph view. Click nodes for details, drag to pan, scroll to zoom.',
    'onboarding.controls.title': 'View Controls',
    'onboarding.controls.content': 'Use these buttons to control the view: zoom in, zoom out, reset, fit to view, cross-domain view.',
    'onboarding.skip': 'Skip',
    'onboarding.prev': 'Previous',
    'onboarding.next': 'Next',
    'onboarding.finish': 'Finish'
  }
};
