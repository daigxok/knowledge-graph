/**
 * Cytoscape 错误诊断脚本
 * 在浏览器控制台执行此脚本来诊断 Cytoscape 相关问题
 */

(function() {
    console.log('\n' + '='.repeat(60));
    console.log('🔍 Cytoscape 错误诊断工具');
    console.log('='.repeat(60) + '\n');
    
    const results = {
        library: false,
        container: false,
        domReady: false,
        instance: false,
        issues: []
    };
    
    // 1. 检查 Cytoscape 库
    console.log('1️⃣ 检查 Cytoscape 库');
    console.log('-'.repeat(40));
    
    if (typeof cytoscape !== 'undefined') {
        console.log('✅ Cytoscape 库已加载');
        console.log('   版本:', cytoscape.version || '未知');
        results.library = true;
    } else {
        console.log('❌ Cytoscape 库未加载');
        results.issues.push('Cytoscape 库未加载，请检查 <script> 标签');
    }
    
    // 2. 检查容器元素
    console.log('\n2️⃣ 检查容器元素');
    console.log('-'.repeat(40));
    
    const container = document.getElementById('cy');
    if (container) {
        console.log('✅ 容器 #cy 存在');
        console.log('   类型:', container.constructor.name);
        console.log('   标签:', container.tagName);
        console.log('   是否为 HTMLElement:', container instanceof HTMLElement);
        console.log('   尺寸:', {
            width: container.offsetWidth + 'px',
            height: container.offsetHeight + 'px'
        });
        
        if (container.offsetWidth === 0 || container.offsetHeight === 0) {
            console.log('⚠️ 警告：容器尺寸为 0');
            results.issues.push('容器尺寸为 0，需要设置 CSS width 和 height');
        } else {
            results.container = true;
        }
        
        // 检查 nodeName 方法
        if (container.nodeName && typeof container.nodeName.toLowerCase === 'function') {
            console.log('✅ nodeName.toLowerCase 方法可用');
        } else {
            console.log('❌ nodeName.toLowerCase 方法不可用');
            results.issues.push('容器对象缺少 nodeName.toLowerCase 方法');
        }
    } else {
        console.log('❌ 容器 #cy 不存在');
        results.issues.push('HTML 中缺少 <div id="cy"></div>');
        
        // 列出可用的 ID 元素
        const idsInPage = Array.from(document.querySelectorAll('[id]'))
            .map(el => el.id)
            .slice(0, 10);
        
        if (idsInPage.length > 0) {
            console.log('   页面中的其他 ID 元素:', idsInPage.join(', '));
        }
    }
    
    // 3. 检查 DOM 状态
    console.log('\n3️⃣ 检查 DOM 状态');
    console.log('-'.repeat(40));
    
    console.log('   readyState:', document.readyState);
    console.log('   body 存在:', !!document.body);
    
    if (document.readyState === 'complete') {
        console.log('✅ DOM 已完全加载');
        results.domReady = true;
    } else {
        console.log('⚠️ DOM 尚未完全加载');
        results.issues.push('DOM 尚未完全加载，建议在 DOMContentLoaded 后初始化');
    }
    
    // 4. 检查现有 Cytoscape 实例
    console.log('\n4️⃣ 检查 Cytoscape 实例');
    console.log('-'.repeat(40));
    
    if (window.cy) {
        console.log('✅ 全局 cy 实例存在');
        try {
            console.log('   节点数:', window.cy.nodes().length);
            console.log('   边数:', window.cy.edges().length);
            console.log('   容器:', window.cy.container());
            results.instance = true;
        } catch (error) {
            console.log('❌ cy 实例存在但无法访问:', error.message);
            results.issues.push('cy 实例损坏或未正确初始化');
        }
    } else {
        console.log('ℹ️ 全局 cy 实例不存在（可能尚未初始化）');
    }
    
    // 5. 检查脚本加载
    console.log('\n5️⃣ 检查脚本加载');
    console.log('-'.repeat(40));
    
    const scripts = Array.from(document.scripts);
    const cytoscapeScripts = scripts.filter(s => 
        s.src && (s.src.includes('cytoscape') || s.src.includes('content-all'))
    );
    
    if (cytoscapeScripts.length > 0) {
        console.log('✅ 找到 Cytoscape 相关脚本:');
        cytoscapeScripts.forEach(s => {
            console.log('   -', s.src);
        });
    } else {
        console.log('⚠️ 未找到 Cytoscape 脚本标签');
    }
    
    // 6. 检查 CSS
    console.log('\n6️⃣ 检查 CSS 样式');
    console.log('-'.repeat(40));
    
    if (container) {
        const styles = window.getComputedStyle(container);
        console.log('   display:', styles.display);
        console.log('   position:', styles.position);
        console.log('   width:', styles.width);
        console.log('   height:', styles.height);
        
        if (styles.display === 'none') {
            console.log('⚠️ 警告：容器被隐藏 (display: none)');
            results.issues.push('容器被 CSS 隐藏');
        }
    }
    
    // 7. 总结和建议
    console.log('\n' + '='.repeat(60));
    console.log('📊 诊断总结');
    console.log('='.repeat(60) + '\n');
    
    console.log('状态检查:');
    console.log('  Cytoscape 库:', results.library ? '✅' : '❌');
    console.log('  容器元素:', results.container ? '✅' : '❌');
    console.log('  DOM 就绪:', results.domReady ? '✅' : '⚠️');
    console.log('  实例存在:', results.instance ? '✅' : 'ℹ️');
    
    if (results.issues.length > 0) {
        console.log('\n⚠️ 发现的问题:');
        results.issues.forEach((issue, index) => {
            console.log(`  ${index + 1}. ${issue}`);
        });
    } else {
        console.log('\n✅ 未发现明显问题');
    }
    
    // 8. 提供修复建议
    console.log('\n💡 修复建议:');
    console.log('-'.repeat(40));
    
    if (!results.library) {
        console.log('\n1. 添加 Cytoscape 库:');
        console.log('   <script src="https://cdnjs.cloudflare.com/ajax/libs/cytoscape/3.23.0/cytoscape.min.js"></script>');
    }
    
    if (!results.container) {
        console.log('\n2. 添加容器元素:');
        console.log('   <div id="cy" style="width: 100%; height: 600px;"></div>');
    }
    
    if (results.library && results.container && !results.instance) {
        console.log('\n3. 初始化 Cytoscape:');
        console.log('   const cy = cytoscape({');
        console.log('       container: document.getElementById("cy"),');
        console.log('       elements: [],');
        console.log('       style: []');
        console.log('   });');
    }
    
    // 9. 提供测试代码
    if (results.library && results.container) {
        console.log('\n🧪 测试初始化:');
        console.log('-'.repeat(40));
        console.log('执行以下代码测试 Cytoscape 初始化:');
        console.log('');
        console.log('try {');
        console.log('    const testCy = cytoscape({');
        console.log('        container: document.getElementById("cy"),');
        console.log('        elements: [');
        console.log('            { data: { id: "a" } },');
        console.log('            { data: { id: "b" } },');
        console.log('            { data: { id: "ab", source: "a", target: "b" } }');
        console.log('        ]');
        console.log('    });');
        console.log('    console.log("✅ 测试成功！节点数:", testCy.nodes().length);');
        console.log('} catch (error) {');
        console.log('    console.error("❌ 测试失败:", error);');
        console.log('}');
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('诊断完成！');
    console.log('='.repeat(60) + '\n');
    
    // 返回结果供进一步使用
    return results;
})();
