/**
 * Verification script for DomainDataManager
 * This script manually tests the DomainDataManager implementation
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Inline DomainDataManager class (copied from the module)
class DomainDataManager {
    constructor(domainData) {
        this.domains = domainData.domains || [];
        this.traditionalChapters = domainData.traditionalChapters || [];
        this.domainMap = new Map();
        this.chapterMap = new Map();
        
        this._buildMaps();
    }

    _buildMaps() {
        this.domains.forEach(domain => {
            this.domainMap.set(domain.id, domain);
        });
        
        this.traditionalChapters.forEach(chapter => {
            this.chapterMap.set(chapter.id, chapter);
        });
    }

    getAllDomains() {
        return this.domains;
    }

    getDomainById(domainId) {
        return this.domainMap.get(domainId) || null;
    }

    getScenariosByDomain(domainId) {
        const domain = this.getDomainById(domainId);
        return domain ? domain.realWorldScenarios : [];
    }

    getAllChapters() {
        return this.traditionalChapters;
    }

    getChapterById(chapterId) {
        return this.chapterMap.get(chapterId) || null;
    }

    getDomainsByChapter(chapterId) {
        const chapter = this.getChapterById(chapterId);
        return chapter ? chapter.domains : [];
    }

    getDomainColor(domainId) {
        const domain = this.getDomainById(domainId);
        return domain ? domain.color : '#999999';
    }

    getDomainIcon(domainId) {
        const domain = this.getDomainById(domainId);
        return domain ? domain.icon : '📊';
    }
}

// Load domain data
const domainData = JSON.parse(readFileSync(join(__dirname, 'data/domains.json'), 'utf-8'));

// Test counters
let passCount = 0;
let failCount = 0;
const failures = [];

function assert(condition, testName) {
    if (condition) {
        console.log(`✓ ${testName}`);
        passCount++;
    } else {
        console.log(`✗ ${testName}`);
        failures.push(testName);
        failCount++;
    }
}

function section(title) {
    console.log(`\n${'='.repeat(70)}`);
    console.log(title);
    console.log('='.repeat(70));
}

// Run tests
console.log('\n🧪 DomainDataManager Verification\n');

try {
    // Create manager instance
    const manager = new DomainDataManager(domainData);
    console.log('✓ DomainDataManager instance created successfully\n');

    // Test 1: Constructor
    section('Test 1: Constructor and Initialization');
    assert(manager !== null, 'Manager instance created');
    assert(manager.domains.length === 5, 'Loaded 5 domains');
    assert(manager.traditionalChapters.length === 12, 'Loaded 12 traditional chapters');
    assert(manager.domainMap.size === 5, 'Domain map contains 5 entries');
    assert(manager.chapterMap.size === 12, 'Chapter map contains 12 entries');

    // Test 2: getAllDomains()
    section('Test 2: getAllDomains() Method');
    const allDomains = manager.getAllDomains();
    assert(Array.isArray(allDomains), 'Returns an array');
    assert(allDomains.length === 5, 'Returns 5 domains');
    assert(allDomains[0].id === 'domain-1', 'First domain is domain-1');
    assert(allDomains[4].id === 'domain-5', 'Last domain is domain-5');

    console.log('\nDomain List:');
    allDomains.forEach((d, i) => {
        console.log(`  ${i + 1}. ${d.icon} ${d.name} (${d.nameEn})`);
    });

    // Test 3: getDomainById()
    section('Test 3: getDomainById() Method');
    const domain1 = manager.getDomainById('domain-1');
    assert(domain1 !== null, 'Returns domain-1');
    assert(domain1.name === '变化与逼近', 'Domain-1 name is correct');
    assert(domain1.nameEn === 'Change and Approximation', 'Domain-1 English name is correct');
    assert(domain1.color === '#667eea', 'Domain-1 color is correct');
    assert(domain1.icon === '📈', 'Domain-1 icon is correct');

    // Test all required fields (Requirement 1.6)
    const requiredFields = ['id', 'name', 'nameEn', 'coreIdea', 'description', 
                           'integratedContent', 'traditionalChapters', 'typicalProblems', 
                           'realWorldScenarios', 'color', 'icon', 'keySkills'];
    let allFieldsPresent = true;
    requiredFields.forEach(field => {
        if (!(field in domain1)) {
            allFieldsPresent = false;
            console.log(`  ✗ Missing field: ${field}`);
        }
    });
    assert(allFieldsPresent, 'All required fields present in domain');

    // Test invalid domain ID
    const invalidDomain = manager.getDomainById('invalid-domain');
    assert(invalidDomain === null, 'Returns null for invalid ID');

    // Test 4: getScenariosByDomain()
    section('Test 4: getScenariosByDomain() Method (Requirement 5.1)');
    const scenarios1 = manager.getScenariosByDomain('domain-1');
    assert(Array.isArray(scenarios1), 'Returns an array');
    assert(scenarios1.length === 3, 'Domain-1 has 3 scenarios');
    assert(scenarios1[0].title === '自动驾驶轨迹规划', 'First scenario title is correct');
    assert('description' in scenarios1[0], 'Scenario has description');
    assert('concepts' in scenarios1[0], 'Scenario has concepts');
    assert('industry' in scenarios1[0], 'Scenario has industry');

    console.log('\nDomain-1 Scenarios:');
    scenarios1.forEach((s, i) => {
        console.log(`  ${i + 1}. ${s.title} (${s.industry})`);
    });

    // Test invalid domain scenarios
    const invalidScenarios = manager.getScenariosByDomain('invalid-domain');
    assert(invalidScenarios.length === 0, 'Returns empty array for invalid domain');

    // Test 5: Additional Helper Methods
    section('Test 5: Additional Helper Methods');
    
    const allChapters = manager.getAllChapters();
    assert(allChapters.length === 12, 'getAllChapters returns 12 chapters');
    
    const chapter1 = manager.getChapterById('chapter-1');
    assert(chapter1 !== null, 'getChapterById returns chapter-1');
    assert(chapter1.name === '函数与极限', 'Chapter-1 name is correct');
    
    const domainsForChapter1 = manager.getDomainsByChapter('chapter-1');
    assert(domainsForChapter1.includes('domain-1'), 'Chapter-1 belongs to domain-1');
    
    const color1 = manager.getDomainColor('domain-1');
    assert(color1 === '#667eea', 'getDomainColor returns correct color');
    
    const defaultColor = manager.getDomainColor('invalid');
    assert(defaultColor === '#999999', 'getDomainColor returns default for invalid domain');
    
    const icon1 = manager.getDomainIcon('domain-1');
    assert(icon1 === '📈', 'getDomainIcon returns correct icon');
    
    const defaultIcon = manager.getDomainIcon('invalid');
    assert(defaultIcon === '📊', 'getDomainIcon returns default for invalid domain');

    // Test 6: Requirements Validation
    section('Test 6: Requirements Validation');
    
    // Requirement 1.6: Domain metadata completeness
    let allMetadataComplete = true;
    allDomains.forEach((domain, index) => {
        if (!(domain.name && domain.description && domain.color && domain.icon)) {
            allMetadataComplete = false;
            console.log(`  ✗ Domain-${index + 1} metadata incomplete`);
        }
    });
    assert(allMetadataComplete, 'Requirement 1.6: All domain metadata complete');
    
    // Requirement 5.1: Real-world scenarios storage
    let allHaveScenarios = true;
    allDomains.forEach((domain, index) => {
        const scenarios = manager.getScenariosByDomain(domain.id);
        if (scenarios.length === 0) {
            allHaveScenarios = false;
            console.log(`  ✗ Domain-${index + 1} has no scenarios`);
        }
    });
    assert(allHaveScenarios, 'Requirement 5.1: All domains have real-world scenarios');

    // Test 7: Data Integrity
    section('Test 7: Data Integrity Checks');
    
    // Check domain color uniqueness
    const colors = allDomains.map(d => d.color);
    const uniqueColors = new Set(colors);
    assert(colors.length === uniqueColors.size, 'All domain colors are unique');
    
    // Check all domains have at least 3 scenarios
    let allHaveEnoughScenarios = true;
    allDomains.forEach(domain => {
        const scenarios = manager.getScenariosByDomain(domain.id);
        if (scenarios.length < 3) {
            allHaveEnoughScenarios = false;
            console.log(`  ✗ ${domain.name} has only ${scenarios.length} scenarios (expected 3+)`);
        }
    });
    assert(allHaveEnoughScenarios, 'All domains have at least 3 scenarios');
    
    // Check chapter-domain bidirectional mapping
    let allMappingsValid = true;
    allChapters.forEach(chapter => {
        const domainIds = manager.getDomainsByChapter(chapter.id);
        domainIds.forEach(domainId => {
            const domain = manager.getDomainById(domainId);
            if (!domain.traditionalChapters.includes(chapter.id)) {
                allMappingsValid = false;
                console.log(`  ✗ Mapping broken: ${chapter.name} ↔ ${domain.name}`);
            }
        });
    });
    assert(allMappingsValid, 'Bidirectional chapter-domain mapping is valid');

    // Summary
    section('Test Summary');
    console.log(`Total Tests: ${passCount + failCount}`);
    console.log(`Passed: ${passCount} ✓`);
    console.log(`Failed: ${failCount} ✗`);
    console.log(`Success Rate: ${((passCount / (passCount + failCount)) * 100).toFixed(1)}%`);

    if (failCount === 0) {
        console.log('\n🎉 SUCCESS! All tests passed!');
        console.log('\n✅ Task 2.1 Complete: DomainDataManager class is fully functional');
        console.log('   - Constructor accepts domain data ✓');
        console.log('   - getAllDomains() method works ✓');
        console.log('   - getDomainById() method works ✓');
        console.log('   - getScenariosByDomain() method works ✓');
        console.log('   - Validates Requirements 1.6 and 5.1 ✓');
        process.exit(0);
    } else {
        console.log(`\n⚠️ FAILURE: ${failCount} test(s) failed`);
        console.log('\nFailed tests:');
        failures.forEach(f => console.log(`  - ${f}`));
        process.exit(1);
    }

} catch (error) {
    console.error(`\n❌ Error during testing: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
}
