/**
 * SkillContentGenerator
 * 依据节点类型自动生成丰富的 Skill 内容，促进学习思维提升
 * 节点类型：concept(概念)、theorem(定理)、method(方法)、application(应用)
 */

export function inferNodeType(node) {
    const id = (node.id || '').toLowerCase();
    const name = (node.name || '') + (node.nameEn || '');
    const combined = id + name;
    if (/\b(theorem|定理)\b/.test(combined)) return 'theorem';
    if (/\b(method|法则|方法|技巧|rules)\b/.test(combined)) return 'method';
    if (/\b(application|应用)\b/.test(combined)) return 'application';
    return 'concept';
}

/**
 * @param {Object} node - 节点对象
 * @param {Object} domainManager - 学域管理器
 * @param {Object} [graphEngine] - 图谱引擎，用于前置/后续节点
 */
export function generateSkillContent(node, domainManager, graphEngine) {
    const type = inferNodeType(node);
    const escapeHtml = (s) => {
        if (!s) return '';
        const d = document.createElement('div');
        d.textContent = s;
        return d.innerHTML;
    };
    const domain = node.domains?.[0] ? domainManager?.getDomainById(node.domains[0]) : null;
    const domainName = domain ? `${domain.icon} ${domain.name}` : '';
    const name = escapeHtml(node.name);

    let html = `
        <div class="skill-content-header">
            <span class="skill-type-badge skill-type-${type}">${getTypeLabel(type)}</span>
            ${domainName ? `<span class="skill-domain-tag">${domainName}</span>` : ''}
        </div>
        <h2 class="skill-content-title">${name}</h2>
        ${node.description ? `<div class="skill-content-desc"><p>${escapeHtml(node.description)}</p></div>` : ''}
    `;

    if (node.formula) {
        html += `
            <div class="skill-content-section skill-formula-block">
                <h3>📐 核心公式</h3>
                <div class="formula-display">\\[${node.formula}\\]</div>
            </div>
        `;
    }

    html += getTypeSpecificContent(type, node, escapeHtml, name);
    if (node.keywords && node.keywords.length > 0) {
        html += `
            <div class="skill-content-section">
                <h3>🏷️ 关键词网络</h3>
                <div class="skill-keywords">${node.keywords.map(k => `<span class="skill-keyword-tag">${escapeHtml(k)}</span>`).join('')}</div>
            </div>
        `;
    }
    html += buildPrereqAndNext(node, graphEngine, escapeHtml);
    if (node.relatedSkills && node.relatedSkills.length > 0) {
        html += `
            <div class="skill-content-section skill-related-skills">
                <h3>🔗 可联动 Skill</h3>
                <p>与本节点配套的技能模块，可结合使用以加深理解。</p>
                <div class="skill-related-list">${node.relatedSkills.map(s => `<span class="skill-related-tag">${escapeHtml(s)}</span>`).join('')}</div>
            </div>
        `;
    }
    html += buildNextStepByType(type, node, escapeHtml);
    if (node.difficulty >= 3) {
        html += `
            <div class="skill-content-section skill-difficulty-tip">
                <h3>📌 难度提示</h3>
                <p>本节点难度较高，建议先巩固前置知识，再结合例题多练几遍。</p>
            </div>
        `;
    }
    html += `
        <div class="skill-content-section skill-think-prompt">
            <h3>🧠 学习后自问</h3>
            <p>我能用自己的话解释吗？能举一个例子或反例吗？和前置知识如何衔接？</p>
        </div>
    `;
    if (node.estimatedStudyTime) {
        html += `<p class="skill-estimated-time">⏱️ 建议学习时间：${node.estimatedStudyTime} 分钟</p>`;
    }
    return html;
}

function buildPrereqAndNext(node, graphEngine, escapeHtml) {
    if (!graphEngine) return '';
    const prereqIds = node.prerequisites || [];
    const prereqNodes = prereqIds.map(id => graphEngine.getNode(id)).filter(Boolean);
    const nextNodes = graphEngine.getAllNodes().filter(n =>
        n.prerequisites && n.prerequisites.includes(node.id)
    );
    if (prereqNodes.length === 0 && nextNodes.length === 0) return '';
    let html = '<div class="skill-content-section skill-prereq-next"><h3>📚 前置与延伸学习</h3>';
    if (prereqNodes.length > 0) {
        html += `<p><strong>前置：</strong>建议先掌握 ${prereqNodes.map(n => escapeHtml(n.name)).join('、')}。</p>`;
        html += `<div class="skill-node-links">${prereqNodes.map(n => `<a href="#" class="skill-node-link" data-node-id="${(n.id || '').replace(/"/g, '&quot;')}">${escapeHtml(n.name)}</a>`).join('')}</div>`;
    }
    if (nextNodes.length > 0) {
        html += `<p><strong>延伸：</strong>学完本节点可继续 ${nextNodes.slice(0, 5).map(n => escapeHtml(n.name)).join('、')}。</p>`;
        html += `<div class="skill-node-links">${nextNodes.slice(0, 5).map(n => `<a href="#" class="skill-node-link" data-node-id="${(n.id || '').replace(/"/g, '&quot;')}">${escapeHtml(n.name)}</a>`).join('')}</div>`;
    }
    html += '</div>';
    return html;
}

function buildNextStepByType(type, node, escapeHtml) {
    const steps = {
        concept: '尝试画一张「概念—性质—例子」小卡片，或口述给同学听。',
        theorem: '选一道用该定理的例题，先自己写证明再对照解析。',
        method: '找 2～3 道同类型题，限时完成并总结共性。',
        application: '选一个生活中的类似问题，试着自己建立简化模型。'
    };
    const text = steps[type] || steps.concept;
    return `
        <div class="skill-content-section skill-next-action">
            <h3>🎯 推荐下一步</h3>
            <p>${text}</p>
        </div>
    `;
}

function getTypeLabel(type) {
    const labels = { concept: '概念', theorem: '定理', method: '方法', application: '应用' };
    return labels[type] || '概念';
}

function getTypeSpecificContent(type, node, escapeHtml, name) {
    switch (type) {
        case 'concept':
            return getConceptContent(node, escapeHtml, name);
        case 'theorem':
            return getTheoremContent(node, escapeHtml, name);
        case 'method':
            return getMethodContent(node, escapeHtml, name);
        case 'application':
            return getApplicationContent(node, escapeHtml, name);
        default:
            return getConceptContent(node, escapeHtml, name);
    }
}

function getConceptContent(node, escapeHtml, name) {
    const keywords = (node.keywords || []).slice(0, 4).map(k => escapeHtml(k));
    return `
        <div class="skill-content-section">
            <h3>💡 概念本质</h3>
            <p>${escapeHtml(node.description)}</p>
            <details class="skill-interactive-details">
                <summary>展开思考</summary>
                <div class="skill-think-block">
                    <strong>思考：</strong>「${name}」解决的是什么问题？在学域中扮演什么角色？
                </div>
            </details>
        </div>
        <div class="skill-content-section skill-interactive-concept">
            <h3>🎯 理解层次自测</h3>
            <p class="skill-interactive-desc">学完后勾选，自检掌握程度</p>
            <div class="skill-check-group">
                <label class="skill-check-item"><input type="checkbox" class="skill-check-input"> 能复述定义与符号含义</label>
                <label class="skill-check-item"><input type="checkbox" class="skill-check-input"> 能举出正例与反例，区分易混概念</label>
                <label class="skill-check-item"><input type="checkbox" class="skill-check-input"> 能联系几何直观或实际背景解释</label>
                <label class="skill-check-item"><input type="checkbox" class="skill-check-input"> 能在简单问题中正确选用该概念</label>
            </div>
        </div>
        <div class="skill-content-section skill-compare-box">
            <h3>🔄 概念辨析</h3>
            <p>与相近概念（如${keywords.length ? keywords.join('、') : '相关概念'}）的异同：条件强弱、适用范围、典型反例。尝试自己画一张对比表。</p>
        </div>
        <div class="skill-content-section skill-pitfall">
            <h3>⚠️ 易错提醒</h3>
            <p>常混淆的条件、忽略的前提、符号与记法的陷阱。做题时多问一句：「条件都满足了吗？」</p>
        </div>
    `;
}

function getTheoremContent(node, escapeHtml, name) {
    return `
        <div class="skill-content-section">
            <h3>📜 定理陈述</h3>
            <p>${escapeHtml(node.description)}</p>
        </div>
        <div class="skill-content-section skill-interactive-theorem">
            <h3>📋 条件与结论拆解</h3>
            <p class="skill-interactive-desc">点击展开，逐条理解</p>
            <details class="skill-interactive-details">
                <summary>前提条件</summary>
                <p>定理在什么条件下成立？缺一不可的是哪几条？</p>
            </details>
            <details class="skill-interactive-details">
                <summary>结论</summary>
                <p>能得到什么？结论是「存在性」还是「构造性」？</p>
            </details>
            <details class="skill-interactive-details">
                <summary>反例思考</summary>
                <p>去掉某条件时，能否举出结论不成立的例子？</p>
            </details>
        </div>
        <div class="skill-content-section skill-interactive-theorem">
            <h3>🔍 证明步骤自检</h3>
            <p class="skill-interactive-desc">写证明时可逐项勾选</p>
            <div class="skill-check-group">
                <label class="skill-check-item"><input type="checkbox" class="skill-check-input"> 看清条件与结论，改写为「若…则…」</label>
                <label class="skill-check-item"><input type="checkbox" class="skill-check-input"> 联想已学定理与定义，找到桥梁</label>
                <label class="skill-check-item"><input type="checkbox" class="skill-check-input"> 按逻辑链写清每一步，注明用到的条件</label>
                <label class="skill-check-item"><input type="checkbox" class="skill-check-input"> 检查是否用全条件、结论是否写完整</label>
            </div>
        </div>
        <div class="skill-content-section skill-compare-box">
            <h3>📌 何时用 / 何时不用</h3>
            <p>该定理适合解决的问题类型；与其它定理（如中值定理族、收敛定理）的分工。遇到「存在性」「不等式」「估计」等关键词时可优先考虑。</p>
        </div>
        <div class="skill-content-section skill-think-block">
            <h3>🧠 思维提升</h3>
            <p>证明中哪一步是「关键一步」？若条件加强或减弱，结论会怎样变化？尝试用图形或数值例子验证直觉。</p>
        </div>
    `;
}

function getMethodContent(node, escapeHtml, name) {
    return `
        <div class="skill-content-section">
            <h3>📋 方法概述</h3>
            <p>${escapeHtml(node.description)}</p>
        </div>
        <div class="skill-content-section">
            <h3>🎯 适用情境</h3>
            <p>当问题中出现哪些特征时，应优先考虑本方法？与其它方法（如直接法、换元法、分部法）的选用依据是什么？</p>
        </div>
        <div class="skill-content-section skill-interactive-method">
            <h3>📐 操作步骤（做题时可勾选）</h3>
            <p class="skill-interactive-desc">按顺序完成并勾选，避免漏步</p>
            <div class="skill-check-group">
                <label class="skill-check-item"><input type="checkbox" class="skill-check-input"> <strong>识别：</strong>判断题型，确认满足使用条件</label>
                <label class="skill-check-item"><input type="checkbox" class="skill-check-input"> <strong>变形：</strong>将问题化归为标准形式</label>
                <label class="skill-check-item"><input type="checkbox" class="skill-check-input"> <strong>执行：</strong>按方法步骤逐步计算或推导</label>
                <label class="skill-check-item"><input type="checkbox" class="skill-check-input"> <strong>检验：</strong>结果是否合理（量纲、极限、特例）</label>
            </div>
        </div>
        <div class="skill-content-section skill-example-stub">
            <h3>✏️ 典型例题结构</h3>
            <p>题干常给什么？设问常问什么？关键一步通常是哪一步？建议做完题后归纳「套路」与「变式」。</p>
        </div>
        <div class="skill-content-section skill-interactive-method">
            <h3>✅ 自检清单</h3>
            <div class="skill-check-group">
                <label class="skill-check-item"><input type="checkbox" class="skill-check-input"> 条件是否用全？</label>
                <label class="skill-check-item"><input type="checkbox" class="skill-check-input"> 步骤是否可逆、是否丢解？</label>
                <label class="skill-check-item"><input type="checkbox" class="skill-check-input"> 边界情况、特殊值是否单独讨论？</label>
            </div>
        </div>
    `;
}

function getApplicationContent(node, escapeHtml, name) {
    return `
        <div class="skill-content-section">
            <h3>🌐 应用背景</h3>
            <p>${escapeHtml(node.description)}</p>
        </div>
        <div class="skill-content-section skill-interactive-application">
            <h3>📐 建模思维链</h3>
            <p class="skill-interactive-desc">点击每步展开，按顺序思考</p>
            <details class="skill-interactive-details">
                <summary>1. 问题识别</summary>
                <p>实际情境中的量（时间、距离、成本等）与目标是什么？</p>
            </details>
            <details class="skill-interactive-details">
                <summary>2. 假设简化</summary>
                <p>哪些因素先忽略？哪些关系用方程近似？</p>
            </details>
            <details class="skill-interactive-details">
                <summary>3. 数学化</summary>
                <p>变量、函数、方程或不等式如何建立？</p>
            </details>
            <details class="skill-interactive-details">
                <summary>4. 求解与解释</summary>
                <p>用定理/方法得到数学结果，再翻译回实际意义。</p>
            </details>
        </div>
        <div class="skill-content-section skill-compare-box">
            <h3>🔗 跨学域联系</h3>
            <p>本应用涉及哪些学域（变化与逼近、结构与累积、优化与决策等）？哪一块是核心数学工具？培养「从问题到数学」与「从数学到结论」的双向思维。</p>
        </div>
        <div class="skill-content-section skill-think-block">
            <h3>🧠 反思问题</h3>
            <p>若假设放宽，模型如何改？结果对参数敏感吗？在实际中如何检验模型好坏？</p>
        </div>
    `;
}
