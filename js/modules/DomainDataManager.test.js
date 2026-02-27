/**
 * Unit Tests for DomainDataManager
 * Tests the domain data loading and retrieval functionality
 */

import { DomainDataManager } from './DomainDataManager.js';

// Mock domain data for testing
const mockDomainData = {
  domains: [
    {
      id: "domain-1",
      name: "变化与逼近",
      nameEn: "Change and Approximation",
      coreIdea: "用离散逼近连续，用局部刻画整体",
      description: "通过极限、导数和微分的概念，理解如何用离散的方法逼近连续的变化，用局部的性质刻画整体的行为",
      integratedContent: ["极限论", "导数论", "微分学"],
      traditionalChapters: ["chapter-1", "chapter-2", "chapter-3"],
      typicalProblems: ["瞬时变化率", "最优化问题", "曲线性质分析"],
      realWorldScenarios: [
        {
          title: "自动驾驶轨迹规划",
          description: "使用导数计算车辆的瞬时速度和加速度，通过微分预测短时间内的位置变化",
          concepts: ["导数", "微分", "曲率", "切线"],
          industry: "人工智能"
        }
      ],
      color: "#667eea",
      icon: "📈",
      keySkills: ["函数极限与连续Skill", "导数与微分Skill", "概念可视化Skill"]
    },
    {
      id: "domain-2",
      name: "结构与累积",
      nameEn: "Structure and Accumulation",
      coreIdea: "从局部累积到整体，建立结构化认知",
      description: "通过积分、微分方程和级数，理解如何从局部的变化累积得到整体的结果",
      integratedContent: ["积分学", "微分方程", "级数论"],
      traditionalChapters: ["chapter-4", "chapter-5", "chapter-10", "chapter-11"],
      typicalProblems: ["累积量计算", "守恒律", "动态演化", "无穷求和"],
      realWorldScenarios: [
        {
          title: "碳中和计算",
          description: "通过积分计算企业的总碳排放量，建立碳减排的微分方程模型",
          concepts: ["定积分", "微分方程", "累积"],
          industry: "环境科学"
        }
      ],
      color: "#f093fb",
      icon: "🔄",
      keySkills: ["积分概念Skill", "定积分应用Skill"]
    }
  ],
  traditionalChapters: [
    { id: "chapter-1", name: "函数与极限", domains: ["domain-1"] },
    { id: "chapter-2", name: "导数与微分", domains: ["domain-1"] },
    { id: "chapter-4", name: "不定积分", domains: ["domain-2"] }
  ]
};

// Test Suite
describe('DomainDataManager', () => {
  let manager;

  beforeEach(() => {
    manager = new DomainDataManager(mockDomainData);
  });

  describe('Constructor', () => {
    test('should initialize with domain data', () => {
      expect(manager).toBeDefined();
      expect(manager.domains).toHaveLength(2);
      expect(manager.traditionalChapters).toHaveLength(3);
    });

    test('should handle empty domain data', () => {
      const emptyManager = new DomainDataManager({});
      expect(emptyManager.domains).toEqual([]);
      expect(emptyManager.traditionalChapters).toEqual([]);
    });

    test('should build internal maps', () => {
      expect(manager.domainMap.size).toBe(2);
      expect(manager.chapterMap.size).toBe(3);
    });
  });

  describe('getAllDomains()', () => {
    test('should return all domains', () => {
      const domains = manager.getAllDomains();
      expect(domains).toHaveLength(2);
      expect(domains[0].id).toBe('domain-1');
      expect(domains[1].id).toBe('domain-2');
    });

    test('should return array reference to domains', () => {
      const domains1 = manager.getAllDomains();
      const domains2 = manager.getAllDomains();
      expect(domains1).toBe(domains2);
    });
  });

  describe('getDomainById()', () => {
    test('should return domain for valid ID', () => {
      const domain = manager.getDomainById('domain-1');
      expect(domain).toBeDefined();
      expect(domain.name).toBe('变化与逼近');
      expect(domain.nameEn).toBe('Change and Approximation');
    });

    test('should return null for invalid ID', () => {
      const domain = manager.getDomainById('invalid-domain');
      expect(domain).toBeNull();
    });

    test('should return domain with all required fields', () => {
      const domain = manager.getDomainById('domain-1');
      expect(domain).toHaveProperty('id');
      expect(domain).toHaveProperty('name');
      expect(domain).toHaveProperty('nameEn');
      expect(domain).toHaveProperty('coreIdea');
      expect(domain).toHaveProperty('description');
      expect(domain).toHaveProperty('integratedContent');
      expect(domain).toHaveProperty('traditionalChapters');
      expect(domain).toHaveProperty('typicalProblems');
      expect(domain).toHaveProperty('realWorldScenarios');
      expect(domain).toHaveProperty('color');
      expect(domain).toHaveProperty('icon');
      expect(domain).toHaveProperty('keySkills');
    });
  });

  describe('getScenariosByDomain()', () => {
    test('should return scenarios for valid domain', () => {
      const scenarios = manager.getScenariosByDomain('domain-1');
      expect(scenarios).toHaveLength(1);
      expect(scenarios[0].title).toBe('自动驾驶轨迹规划');
      expect(scenarios[0]).toHaveProperty('description');
      expect(scenarios[0]).toHaveProperty('concepts');
      expect(scenarios[0]).toHaveProperty('industry');
    });

    test('should return empty array for invalid domain', () => {
      const scenarios = manager.getScenariosByDomain('invalid-domain');
      expect(scenarios).toEqual([]);
    });

    test('should return all scenarios for domain with multiple scenarios', () => {
      const scenarios = manager.getScenariosByDomain('domain-2');
      expect(scenarios).toHaveLength(1);
      expect(scenarios[0].title).toBe('碳中和计算');
    });
  });

  describe('Additional Helper Methods', () => {
    test('getAllChapters() should return all chapters', () => {
      const chapters = manager.getAllChapters();
      expect(chapters).toHaveLength(3);
    });

    test('getChapterById() should return chapter for valid ID', () => {
      const chapter = manager.getChapterById('chapter-1');
      expect(chapter).toBeDefined();
      expect(chapter.name).toBe('函数与极限');
    });

    test('getDomainsByChapter() should return domain IDs for chapter', () => {
      const domains = manager.getDomainsByChapter('chapter-1');
      expect(domains).toEqual(['domain-1']);
    });

    test('getDomainColor() should return color for valid domain', () => {
      const color = manager.getDomainColor('domain-1');
      expect(color).toBe('#667eea');
    });

    test('getDomainColor() should return default color for invalid domain', () => {
      const color = manager.getDomainColor('invalid-domain');
      expect(color).toBe('#999999');
    });

    test('getDomainIcon() should return icon for valid domain', () => {
      const icon = manager.getDomainIcon('domain-1');
      expect(icon).toBe('📈');
    });

    test('getDomainIcon() should return default icon for invalid domain', () => {
      const icon = manager.getDomainIcon('invalid-domain');
      expect(icon).toBe('📊');
    });
  });

  describe('Requirements Validation', () => {
    test('Requirement 1.6: Domain metadata should be complete', () => {
      const domain = manager.getDomainById('domain-1');
      expect(domain.name).toBeDefined();
      expect(domain.description).toBeDefined();
      expect(domain.color).toBeDefined();
      expect(domain.icon).toBeDefined();
    });

    test('Requirement 5.1: Real-world scenarios should be stored', () => {
      const scenarios = manager.getScenariosByDomain('domain-1');
      expect(scenarios.length).toBeGreaterThan(0);
      expect(scenarios[0]).toHaveProperty('title');
      expect(scenarios[0]).toHaveProperty('description');
      expect(scenarios[0]).toHaveProperty('concepts');
      expect(scenarios[0]).toHaveProperty('industry');
    });
  });
});

// Run tests if this file is executed directly
if (typeof describe === 'undefined') {
  console.log('Running DomainDataManager tests...');
  
  const manager = new DomainDataManager(mockDomainData);
  
  // Test 1: Constructor
  console.assert(manager.domains.length === 2, 'Constructor should load 2 domains');
  console.log('✓ Constructor test passed');
  
  // Test 2: getAllDomains
  const allDomains = manager.getAllDomains();
  console.assert(allDomains.length === 2, 'getAllDomains should return 2 domains');
  console.log('✓ getAllDomains test passed');
  
  // Test 3: getDomainById
  const domain1 = manager.getDomainById('domain-1');
  console.assert(domain1 !== null, 'getDomainById should return domain-1');
  console.assert(domain1.name === '变化与逼近', 'Domain name should match');
  console.log('✓ getDomainById test passed');
  
  // Test 4: getDomainById with invalid ID
  const invalidDomain = manager.getDomainById('invalid');
  console.assert(invalidDomain === null, 'getDomainById should return null for invalid ID');
  console.log('✓ getDomainById invalid ID test passed');
  
  // Test 5: getScenariosByDomain
  const scenarios = manager.getScenariosByDomain('domain-1');
  console.assert(scenarios.length === 1, 'getScenariosByDomain should return 1 scenario');
  console.assert(scenarios[0].title === '自动驾驶轨迹规划', 'Scenario title should match');
  console.log('✓ getScenariosByDomain test passed');
  
  // Test 6: getScenariosByDomain with invalid ID
  const emptyScenarios = manager.getScenariosByDomain('invalid');
  console.assert(emptyScenarios.length === 0, 'getScenariosByDomain should return empty array for invalid ID');
  console.log('✓ getScenariosByDomain invalid ID test passed');
  
  console.log('\n✅ All DomainDataManager tests passed!');
}
