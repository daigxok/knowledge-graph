/**
 * Simple Node.js test runner for DomainDataManager
 * Run with: node test-runner.js
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load DomainDataManager
const domainManagerCode = readFileSync(join(__dirname, 'js/modules/DomainDataManager.js'), 'utf-8');
eval(domainManagerCode.replace('export class', 'class'));

// Load domain data
const domainData = JSON.parse(readFileSync(join(__dirname, 'data/domains.json'), 'utf-8'));

// Test counters
let passCount = 0;
let failCount = 0;

function assert(condition, testName) {
    if (condition) {
        console.log(`✓ PASS: ${testName}`);
        passCount++;
    } else {
        console.log(`✗ FAIL: ${testName}`);
        failCount++;
    }
}

function section(title) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(title);
    console.log('='.repeat(60));
}

// Run tests
console.log('🧪 DomainDataManager Test Suite\n');

try {
    // Create manager instance
    const manager = new DomainDataManager(domainData);
    console.log('✓ DomainDataManager instance created\n');

    // Test 1: Constructor
    section('Test 1: Constructor and Initialization');
    assert(manager !== null, 'Manager instance should be created');
    assert(manager.domains.length === 5, 'Should load 5 domains');
    assert(manager.traditionalChapters.length === 12, 'Should load 12 traditional chapters');
    assert(manager.domainMap.size === 5, 'Domain map should contain 5 entries');
    assert(manager.chapterMap.size === 12, 'Chapter map should contain 12 entries');

    // Test 2: getAllDomains()
    section('Test 2: getAllDomains() Method');
    const allDomains = manager.getAllDomains();
    assert(Array.isArray(allDomains), 'getAllDomains should return an array');
    assert(allDomains.length === 5, 'getAllDomains should return 5 domains');
    assert(allDomains[0].id === 'domain-1', 'First domain should be domain-1');
    assert(allDomains[4].id === 'domain-5', 'Last domain should be domain-5');

    // Test 3: getDomainById()
    section('Test 3: getDomainById() Method');
    const domain1 = manager.getDomainById('domain-1');
    assert(domain1 !== null, 'getDomainById should return domain-1');
    assert(domain1.name === '变化与逼近', 'Domain-1 name should be "变化与逼近"');
    assert(domain1.nameEn === 'Change and Approximation', 'Domain-1 English name should match');
    assert(domain1.color === '#667eea', 'Domain-1 color should be #667eea');
    assert(domain1.icon === '📈', 'Domain-1 icon should be 📈');

    // Test all required fields
    const requiredFields = ['id', 'name', 'nameEn', 'coreIdea', 'description', 
                           'integratedContent', 'traditionalChapters', 'typicalProblems', 
                           'realWorldScenarios', 'color', 'icon', 'keySkills'];
    requiredFields.forEach(field => {
        assert(field in domain1, `Domain should have field: ${field}`);
    });

    // Test invalid domain ID
    const invalidDomain = manager.getDomainById('invalid-domain');
    assert(invalidDomain === null, 'getDomainById should return null for invalid ID');

    // Test 4: getScenariosByDomain()
    section('Test 4: getScenariosByDomain() Method');
    const scenarios1 = manager.getScenariosByDomain('domain-1');
    assert(Array.isArray(scenarios1), 'getScenariosByDomain should return an array');
    assert(scenarios1.length === 3, 'Domain-1 should have 3 scenarios');
    assert(scenarios1[0].title === '自动驾驶轨迹规划', 'First scenario title should match');
    assert('description' in scenarios1[0], 'Scenario should have description');
    assert('concepts' in scenarios1[0], 'Scenario should have concepts');
    assert('industry' in scenarios1[0], 'Scenario should have industry');

    // Test invalid domain scenarios
    const invalidScenarios = manager.getScenariosByDomain('invalid-domain');
    assert(Array.isArray(invalidScenarios), 'getScenariosByDomain should return array for invalid domain');
    assert(invalidScenarios.length === 0, 'Invalid domain should return empty array');

    // Test 5: Additional Helper Methods
    section('Test 5: Additional Helper Methods');
    
    const allChapters = manager.getAllChapters();
    assert(allChapters.length === 12, 'getAllChapters should return 12 chapters');
    
    const chapter1 = manager.getChapterById('chapter-1');
    assert(chapter1 !== null, 'getChapterById should return chapter-1');
    assert(chapter1.name === '函数与极限', 'Chapter-1 name should match');
    
    const domainsForChapter1 = manager.getDomainsByChapter('chapter-1');
    assert(Array.isArray(domainsForChapter1), 'getDomainsByChapter should return array');
    assert(domainsForChapter1.includes('domain-1'), 'Chapter-1 should belong to domain-1');
    
    const color1 = manager.getDomainColor('domain-1');
    assert(color1 === '#667eea', 'getDomainColor should return correct color');
    const defaultColor = manager.getDomainColor('invalid');
    assert(defaultColor === '#999999', 'getDomainColor should return default color for invalid domain');
    
    const icon1 = manager.getDomainIcon('domain-1');
    assert(icon1 === '📈', 'getDomainIcon should return correct icon');
    const defaultIcon = manager.getDomainIcon('invalid');
    assert(defaultIcon === '📊', 'getDomainIcon should return default icon for invalid domain');

    // Test 6: Requirements Validation
    section('Test 6: Requirements Validation');
    
    // Requirement 1.6: Domain metadata completeness
    allDomains.forEach((domain, index) => {
        assert(domain.name && domain.description && domain.color && domain.icon,
               `Requirement 1.6: Domain-${index + 1} metadata should be complete`);
    });
    
    // Requirement 5.1: Real-world scenarios storage
    allDomains.forEach((domain, index) => {
        const scenarios = manager.getScenariosByDomain(domain.id);
        assert(scenarios.length > 0, 
               `Requirement 5.1: Domain-${index + 1} should have real-world scenarios`);
    });

    // Test 7: Data Integrity
    section('Test 7: Data Integrity Checks');
    
    // Check domain color uniqueness
    const colors = allDomains.map(d => d.color);
    const uniqueColors = new Set(colors);
    assert(colors.length === uniqueColors.size, 'All domain colors should be unique');
    
    // Check all domains have scenarios
    allDomains.forEach(domain => {
        const scenarios = manager.getScenariosByDomain(domain.id);
        assert(scenarios.length >= 3, `${domain.name} should have at least 3 scenarios`);
    });
    
    // Check chapter-domain bidirectional mapping
    allChapters.forEach(chapter => {
        const domainIds = manager.getDomainsByChapter(chapter.id);
        domainIds.forEach(domainId => {
            const domain = manager.getDomainById(domainId);
            assert(domain.traditionalChapters.includes(chapter.id),
                   `Bidirectional mapping: ${chapter.name} ↔ ${domain.name}`);
        });
    });

    // Summary
    section('Test Summary');
    console.log(`Total Tests: ${passCount + failCount}`);
    console.log(`Passed: ${passCount} ✓`);
    console.log(`Failed: ${failCount} ✗`);
    console.log(`Success Rate: ${((passCount / (passCount + failCount)) * 100).toFixed(1)}%`);

    if (failCount === 0) {
        console.log('\n🎉 All tests passed! DomainDataManager is working correctly.');
        process.exit(0);
    } else {
        console.log(`\n⚠️ ${failCount} test(s) failed. Please review the failures above.`);
        process.exit(1);
    }

} catch (error) {
    console.error(`\n❌ Error during testing: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
}
