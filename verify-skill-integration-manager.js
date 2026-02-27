/**
 * Verification script for SkillIntegrationManager
 * Run this with: node verify-skill-integration-manager.js
 */

import { SkillIntegrationManager } from './js/modules/SkillIntegrationManager.js';

console.log('🧪 SkillIntegrationManager Verification Script\n');
console.log('='.repeat(60));

async function runVerification() {
    let passedTests = 0;
    let totalTests = 0;

    function test(name, condition, message) {
        totalTests++;
        if (condition) {
            passedTests++;
            console.log(`✓ ${name}: ${message}`);
        } else {
            console.log(`✗ ${name}: ${message}`);
        }
    }

    try {
        // Test 1: Constructor
        console.log('\n📋 Test 1: Constructor');
        const manager = new SkillIntegrationManager();
        test('Constructor', manager !== null, 'Manager instance created');
        test('Initial state', !manager.isInitialized, 'isInitialized is false');
        test('Skill registry', manager.skillRegistry === null, 'skillRegistry is null initially');

        // Test 2: Load Skill Registry
        console.log('\n📋 Test 2: Load Skill Registry');
        await manager.loadSkillRegistry();
        test('Registry loaded', manager.isInitialized, 'isInitialized is true after loading');
        test('Skills data', manager.skillsData.size > 0, `Loaded ${manager.skillsData.size} skills`);

        // Test 3: Get Skills by Node
        console.log('\n📋 Test 3: Get Skills by Node');
        const gradientSkills = manager.getSkillsByNode('node-gradient');
        test('Gradient node', gradientSkills.length > 0, `Found ${gradientSkills.length} skills for node-gradient`);
        
        const limitSkills = manager.getSkillsByNode('node-limit-def');
        test('Limit node', limitSkills.length >= 2, `Found ${limitSkills.length} skills for node-limit-def`);
        
        const invalidNodeSkills = manager.getSkillsByNode('invalid-node');
        test('Invalid node', invalidNodeSkills.length === 0, 'Returns empty array for invalid node');

        // Test 4: Get Skills by Domain
        console.log('\n📋 Test 4: Get Skills by Domain');
        const domain1Skills = manager.getSkillsByDomain('domain-1');
        test('Domain 1', domain1Skills.length > 0, `Found ${domain1Skills.length} skills for domain-1`);
        
        const domain3Skills = manager.getSkillsByDomain('domain-3');
        test('Domain 3', domain3Skills.length > 0, `Found ${domain3Skills.length} skills for domain-3`);
        
        const invalidDomainSkills = manager.getSkillsByDomain('invalid-domain');
        test('Invalid domain', invalidDomainSkills.length === 0, 'Returns empty array for invalid domain');

        // Test 5: Get Skill Info
        console.log('\n📋 Test 5: Get Skill Info');
        const gradientSkillInfo = manager.getSkillInfo('gradient-visualization-skill');
        test('Valid skill ID', gradientSkillInfo !== null, 'Returns skill info object');
        test('Skill name', gradientSkillInfo.name === '梯度可视化Skill', `Name: ${gradientSkillInfo.name}`);
        test('Skill type', gradientSkillInfo.type === 'visualization', `Type: ${gradientSkillInfo.type}`);
        
        const invalidSkillInfo = manager.getSkillInfo('invalid-skill');
        test('Invalid skill ID', invalidSkillInfo === null, 'Returns null for invalid skill ID');

        // Test 6: Is Skill Available
        console.log('\n📋 Test 6: Is Skill Available');
        test('Available skill', manager.isSkillAvailable('gradient-visualization-skill'), 'Gradient skill is available');
        test('Unavailable skill', !manager.isSkillAvailable('invalid-skill'), 'Invalid skill is not available');

        // Test 7: Get All Skills
        console.log('\n📋 Test 7: Get All Skills');
        const allSkills = manager.getAllSkills();
        test('All skills', allSkills.length > 0, `Total skills: ${allSkills.length}`);
        test('Skills are objects', allSkills.every(s => typeof s === 'object'), 'All skills are objects');
        test('Skills have IDs', allSkills.every(s => s.id), 'All skills have IDs');

        // Test 8: Get Skills by Type
        console.log('\n📋 Test 8: Get Skills by Type');
        const vizSkills = manager.getSkillsByType('visualization');
        test('Visualization skills', vizSkills.length > 0, `Found ${vizSkills.length} visualization skills`);
        test('Type filter', vizSkills.every(s => s.type === 'visualization'), 'All returned skills are visualization type');
        
        const animSkills = manager.getSkillsByType('animation');
        test('Animation skills', animSkills.length > 0, `Found ${animSkills.length} animation skills`);

        // Test 9: Skill-Node Mapping
        console.log('\n📋 Test 9: Skill-Node Mapping');
        const gradientNodeSkills = manager.getSkillsByNode('node-gradient');
        const hasGradientSkill = gradientNodeSkills.some(s => s.id === 'gradient-visualization-skill');
        test('Gradient mapping', hasGradientSkill, 'node-gradient maps to gradient-visualization-skill');
        
        const hasMultivariateSkill = gradientNodeSkills.some(s => s.id === 'multivariate-function-skill');
        test('Multiple mappings', hasMultivariateSkill, 'node-gradient maps to multiple skills');

        // Test 10: Skill-Domain Mapping
        console.log('\n📋 Test 10: Skill-Domain Mapping');
        const domain3SkillsList = manager.getSkillsByDomain('domain-3');
        const domain3HasGradient = domain3SkillsList.some(s => s.id === 'gradient-visualization-skill');
        test('Domain 3 mapping', domain3HasGradient, 'domain-3 includes gradient-visualization-skill');
        
        const domain5Skills = manager.getSkillsByDomain('domain-5');
        const domain5HasH5P = domain5Skills.some(s => s.id === 'h5p-interaction-skill');
        test('Domain 5 mapping', domain5HasH5P, 'domain-5 includes h5p-interaction-skill');

        // Test 11: Skill Metadata Completeness
        console.log('\n📋 Test 11: Skill Metadata Completeness');
        const sampleSkill = manager.getSkillInfo('concept-visualization-skill');
        const requiredFields = ['id', 'name', 'nameEn', 'type', 'path', 'entryPoint', 
                                'applicableNodes', 'applicableDomains', 'description', 'icon'];
        const hasAllFields = requiredFields.every(field => field in sampleSkill);
        test('Required fields', hasAllFields, 'Skill has all required metadata fields');
        test('Applicable nodes', Array.isArray(sampleSkill.applicableNodes), 'applicableNodes is an array');
        test('Applicable domains', Array.isArray(sampleSkill.applicableDomains), 'applicableDomains is an array');

        // Test 12: Deactivate Skill
        console.log('\n📋 Test 12: Deactivate Skill');
        manager.loadedSkills.add('test-skill');
        manager.deactivateSkill('test-skill');
        test('Deactivate', !manager.loadedSkills.has('test-skill'), 'Skill removed from loaded skills');

        // Test 13: Requirements Validation
        console.log('\n📋 Test 13: Requirements Validation');
        test('Requirement 3.1', manager.isInitialized, 'Integrates with skill registry system');
        test('Requirement 3.2', gradientNodeSkills.length > 0, 'Nodes are associated with skills');
        test('Requirement 3.4', typeof manager.activateSkill === 'function', 'Provides skill activation method');

        // Summary
        console.log('\n' + '='.repeat(60));
        console.log(`\n📊 Test Summary: ${passedTests}/${totalTests} tests passed`);
        
        if (passedTests === totalTests) {
            console.log('✅ All tests passed! SkillIntegrationManager is working correctly.\n');
            return 0;
        } else {
            console.log(`⚠️  ${totalTests - passedTests} test(s) failed.\n`);
            return 1;
        }

    } catch (error) {
        console.error('\n❌ Verification failed with error:', error);
        console.error(error.stack);
        return 1;
    }
}

// Run verification
runVerification().then(exitCode => {
    if (typeof process !== 'undefined') {
        process.exit(exitCode);
    }
});
