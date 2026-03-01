#!/usr/bin/env node
/**
 * 教师备课功能验证脚本
 * 检查所有必需的文件和功能是否完整
 */

const fs = require('fs');
const path = require('path');

console.log('\n' + '='.repeat(70));
console.log('🔍 教师备课功能完整性验证');
console.log('='.repeat(70) + '\n');

const results = {
    passed: 0,
    failed: 0,
    warnings: 0,
    total: 0
};

// 检查文件是否存在
function checkFile(filePath, description) {
    results.total++;
    const exists = fs.existsSync(filePath);
    
    if (exists) {
        const stats = fs.statSync(filePath);
        const size = (stats.size / 1024).toFixed(2);
        console.log(`✅ ${description}`);
        console.log(`   路径: ${filePath}`);
        console.log(`   大小: ${size} KB`);
        results.passed++;
    } else {
        console.log(`❌ ${description}`);
        console.log(`   路径: ${filePath} (不存在)`);
        results.failed++;
    }
    console.log('');
}

// 检查目录
function checkDirectory(dirPath, description) {
    results.total++;
    const exists = fs.existsSync(dirPath);
    
    if (exists && fs.statSync(dirPath).isDirectory()) {
        const files = fs.readdirSync(dirPath);
        console.log(`✅ ${description}`);
        console.log(`   路径: ${dirPath}`);
        console.log(`   文件数: ${files.length}`);
        results.passed++;
    } else {
        console.log(`❌ ${description}`);
        console.log(`   路径: ${dirPath} (不存在)`);
        results.failed++;
    }
    console.log('');
}

// 1. 核心模块文件
console.log('📦 1. 核心模块文件');
console.log('-'.repeat(70));
checkFile('js/modules/TeacherFeatures.js', '教师功能主模块');
checkFile('js/modules/NodeEditor.js', '节点编辑器');
checkFile('js/modules/NodeDataManager.js', '节点数据管理器');
checkFile('js/modules/LessonPlanGenerator.js', '教案生成器');
checkFile('js/modules/LessonPlanViewer.js', '教案查看器');
checkFile('js/modules/LessonPlanExporter.js', '教案导出器');
checkFile('js/modules/BatchOperationManager.js', '批量操作管理器');
checkFile('js/modules/TeacherUIController.js', '教师UI控制器');

// 2. 样式文件
console.log('🎨 2. 样式文件');
console.log('-'.repeat(70));
checkFile('styles/teacher.css', '教师功能样式');
checkFile('styles/node-editor.css', '节点编辑器样式');
checkFile('styles/lesson-plan-viewer.css', '教案查看器样式');
checkFile('styles/batch-operations.css', '批量操作样式');

// 3. 测试文件
console.log('🧪 3. 测试文件');
console.log('-'.repeat(70));
checkFile('test-teacher-features.html', '功能测试页面');
checkFile('test-teacher-unit-tests.html', '单元测试页面');
checkFile('tests/teacher-features-tests.js', '测试脚本');
checkFile('test-batch-operations.html', '批量操作测试');

// 4. 文档文件
console.log('📖 4. 文档文件');
console.log('-'.repeat(70));
checkFile('docs/TEACHER-USER-GUIDE.md', '完整用户指南');
checkFile('教师备课快速指南.md', '快速指南');
checkFile('教师备课实例教程.md', '实例教程');
checkFile('批量操作面板故障排查.md', '故障排查指南');
checkFile('教师备课功能检查清单.md', '功能检查清单');

// 5. 数据文件
console.log('💾 5. 数据文件');
console.log('-'.repeat(70));
checkFile('data/nodes.json', 'Phase 1 节点数据');
checkFile('data/nodes-extended-phase2.json', 'Phase 2 节点数据');
checkFile('data/edges.json', 'Phase 1 边数据');
checkFile('data/domains.json', '学域数据');

// 6. 认证相关
console.log('🔐 6. 认证相关');
console.log('-'.repeat(70));
checkFile('auth.html', '认证页面');
checkFile('js/modules/Auth.js', '认证模块');
checkFile('styles/auth.css', '认证样式');

// 7. 规格文档
console.log('📋 7. 规格文档');
console.log('-'.repeat(70));
checkDirectory('.kiro/specs/teacher-lesson-planning', '教师备课规格');
checkFile('.kiro/specs/teacher-lesson-planning/requirements.md', '需求文档');
checkFile('.kiro/specs/teacher-lesson-planning/design.md', '设计文档');
checkFile('.kiro/specs/teacher-lesson-planning/tasks.md', '任务文档');

// 8. Bug 修复相关
console.log('🐛 8. Bug 修复相关');
console.log('-'.repeat(70));
checkDirectory('.kiro/specs/node-editor-allnodes-filter-fix', 'Bug 修复规格');
checkFile('NODE-EDITOR-BUGFIX-SUMMARY.md', 'Bug 修复总结');
checkFile('run-bugfix-tests.js', 'Bug 修复测试脚本');
checkFile('run-preservation-tests.js', '保留测试脚本');

// 统计结果
console.log('='.repeat(70));
console.log('📊 验证结果统计');
console.log('='.repeat(70));
console.log(`总检查项: ${results.total}`);
console.log(`✅ 通过: ${results.passed}`);
console.log(`❌ 失败: ${results.failed}`);
console.log(`⚠️ 警告: ${results.warnings}`);

const passRate = ((results.passed / results.total) * 100).toFixed(1);
console.log(`\n通过率: ${passRate}%`);

// 评估
console.log('\n' + '='.repeat(70));
console.log('🎯 总体评估');
console.log('='.repeat(70));

if (passRate >= 95) {
    console.log('✅ 优秀！所有核心文件完整，系统可以正常使用。');
} else if (passRate >= 80) {
    console.log('⚠️ 良好。大部分文件完整，但有些文件缺失。');
} else if (passRate >= 60) {
    console.log('⚠️ 一般。缺失较多文件，建议检查。');
} else {
    console.log('❌ 不合格。缺失大量文件，需要重新安装或配置。');
}

// 建议
if (results.failed > 0) {
    console.log('\n💡 建议:');
    console.log('1. 检查缺失的文件是否在正确的位置');
    console.log('2. 确认文件路径是否正确');
    console.log('3. 如果是新安装，可能需要运行初始化脚本');
    console.log('4. 查看文档了解如何获取缺失的文件');
}

console.log('\n' + '='.repeat(70));
console.log('验证完成！');
console.log('='.repeat(70) + '\n');

// 退出码
process.exit(results.failed > 0 ? 1 : 0);
