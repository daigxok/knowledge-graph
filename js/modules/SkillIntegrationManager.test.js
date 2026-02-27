/**
 * Unit tests for SkillIntegrationManager
 */

import { SkillIntegrationManager } from './SkillIntegrationManager.js';

describe('SkillIntegrationManager', () => {
    let manager;

    beforeEach(() => {
        manager = new SkillIntegrationManager();
    });

    describe('Constructor', () => {
        test('should initialize with default skill registry path', () => {
            expect(manager.skillRegistryPath).toBe('../../higher_math_skills/skill_registry.js');
            expect(manager.isInitialized).toBe(false);
            expect(manager.skillRegistry).toBeNull();
        });

        test('should accept custom skill registry path', () => {
            const customManager = new SkillIntegrationManager('/custom/path/skill_registry.js');
            expect(customManager.skillRegistryPath).toBe('/custom/path/skill_registry.js');
        });
    });

    describe('loadSkillRegistry', () => {
        test('should initialize skill metadata on first load', async () => {
            // Mock the import to avoid actual file loading in tests
            const originalImport = global.import;
            global.import = jest.fn().mockResolvedValue({
                SkillRegistry: class MockSkillRegistry {}
            });

            await manager.loadSkillRegistry();

            expect(manager.isInitialized).toBe(true);
            expect(manager.skillsData.size).toBeGreaterThan(0);
            
            global.import = originalImport;
        });

        test('should return cached registry on subsequent calls', async () => {
            global.import = jest.fn().mockResolvedValue({
                SkillRegistry: class MockSkillRegistry {}
            });

            const firstCall = await manager.loadSkillRegistry();
            const secondCall = await manager.loadSkillRegistry();

            expect(firstCall).toBe(secondCall);
            expect(global.import).toHaveBeenCalledTimes(1);
        });

        test('should handle loading errors gracefully', async () => {
            global.import = jest.fn().mockRejectedValue(new Error('File not found'));
            
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            
            const result = await manager.loadSkillRegistry();

            expect(result).toBeNull();
            expect(manager.isInitialized).toBe(true);
            expect(consoleSpy).toHaveBeenCalled();
            
            consoleSpy.mockRestore();
        });
    });

    describe('getSkillsByNode', () => {
        beforeEach(async () => {
            // Initialize the manager
            global.import = jest.fn().mockResolvedValue({
                SkillRegistry: class MockSkillRegistry {}
            });
            await manager.loadSkillRegistry();
        });

        test('should return skills for a valid node ID', () => {
            const skills = manager.getSkillsByNode('node-gradient');
            
            expect(Array.isArray(skills)).toBe(true);
            expect(skills.length).toBeGreaterThan(0);
            expect(skills[0]).toHaveProperty('id');
            expect(skills[0]).toHaveProperty('name');
        });

        test('should return empty array for node with no skills', () => {
            const skills = manager.getSkillsByNode('node-nonexistent');
            
            expect(Array.isArray(skills)).toBe(true);
            expect(skills.length).toBe(0);
        });

        test('should warn if registry not initialized', () => {
            const uninitializedManager = new SkillIntegrationManager();
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
            
            const skills = uninitializedManager.getSkillsByNode('node-gradient');
            
            expect(skills).toEqual([]);
            expect(consoleSpy).toHaveBeenCalled();
            
            consoleSpy.mockRestore();
        });

        test('should return gradient visualization skill for gradient node', () => {
            const skills = manager.getSkillsByNode('node-gradient');
            
            const gradientSkill = skills.find(s => s.id === 'gradient-visualization-skill');
            expect(gradientSkill).toBeDefined();
            expect(gradientSkill.name).toBe('梯度可视化Skill');
        });
    });

    describe('getSkillsByDomain', () => {
        beforeEach(async () => {
            global.import = jest.fn().mockResolvedValue({
                SkillRegistry: class MockSkillRegistry {}
            });
            await manager.loadSkillRegistry();
        });

        test('should return skills for a valid domain ID', () => {
            const skills = manager.getSkillsByDomain('domain-3');
            
            expect(Array.isArray(skills)).toBe(true);
            expect(skills.length).toBeGreaterThan(0);
        });

        test('should return empty array for domain with no skills', () => {
            const skills = manager.getSkillsByDomain('domain-nonexistent');
            
            expect(Array.isArray(skills)).toBe(true);
            expect(skills.length).toBe(0);
        });

        test('should return multiple skills for domain-1', () => {
            const skills = manager.getSkillsByDomain('domain-1');
            
            expect(skills.length).toBeGreaterThan(1);
            const skillNames = skills.map(s => s.name);
            expect(skillNames).toContain('概念可视化Skill');
        });

        test('should warn if registry not initialized', () => {
            const uninitializedManager = new SkillIntegrationManager();
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
            
            const skills = uninitializedManager.getSkillsByDomain('domain-1');
            
            expect(skills).toEqual([]);
            expect(consoleSpy).toHaveBeenCalled();
            
            consoleSpy.mockRestore();
        });
    });

    describe('activateSkill', () => {
        let container;

        beforeEach(async () => {
            global.import = jest.fn().mockResolvedValue({
                SkillRegistry: class MockSkillRegistry {}
            });
            await manager.loadSkillRegistry();
            
            container = document.createElement('div');
        });

        test('should throw error if registry not initialized', async () => {
            const uninitializedManager = new SkillIntegrationManager();
            
            await expect(
                uninitializedManager.activateSkill('gradient-visualization-skill', container)
            ).rejects.toThrow('Skill registry not initialized');
        });

        test('should throw error for invalid skill ID', async () => {
            await expect(
                manager.activateSkill('invalid-skill-id', container)
            ).rejects.toThrow('Skill not found');
        });

        test('should load skill module and call init function', async () => {
            const mockInit = jest.fn().mockResolvedValue(undefined);
            global.import = jest.fn()
                .mockResolvedValueOnce({ SkillRegistry: class MockSkillRegistry {} })
                .mockResolvedValueOnce({ init: mockInit });

            await manager.loadSkillRegistry();
            await manager.activateSkill('gradient-visualization-skill', container);

            expect(manager.loadedSkills.has('gradient-visualization-skill')).toBe(true);
        });

        test('should not reload already loaded skill', async () => {
            const mockInit = jest.fn().mockResolvedValue(undefined);
            global.import = jest.fn()
                .mockResolvedValueOnce({ SkillRegistry: class MockSkillRegistry {} })
                .mockResolvedValue({ init: mockInit });

            await manager.loadSkillRegistry();
            await manager.activateSkill('gradient-visualization-skill', container);
            
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            await manager.activateSkill('gradient-visualization-skill', container);

            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('already loaded')
            );
            
            consoleSpy.mockRestore();
        });

        test('should display error message in container on load failure', async () => {
            global.import = jest.fn()
                .mockResolvedValueOnce({ SkillRegistry: class MockSkillRegistry {} })
                .mockRejectedValueOnce(new Error('Module not found'));

            await manager.loadSkillRegistry();
            
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            
            await expect(
                manager.activateSkill('gradient-visualization-skill', container)
            ).rejects.toThrow();

            expect(container.innerHTML).toContain('Skill Loading Error');
            expect(container.innerHTML).toContain('Module not found');
            
            consoleSpy.mockRestore();
        });
    });

    describe('deactivateSkill', () => {
        beforeEach(async () => {
            global.import = jest.fn().mockResolvedValue({
                SkillRegistry: class MockSkillRegistry {}
            });
            await manager.loadSkillRegistry();
        });

        test('should remove skill from loaded skills', () => {
            manager.loadedSkills.add('gradient-visualization-skill');
            
            manager.deactivateSkill('gradient-visualization-skill');
            
            expect(manager.loadedSkills.has('gradient-visualization-skill')).toBe(false);
        });

        test('should handle deactivating non-loaded skill gracefully', () => {
            expect(() => {
                manager.deactivateSkill('non-loaded-skill');
            }).not.toThrow();
        });
    });

    describe('getSkillInfo', () => {
        beforeEach(async () => {
            global.import = jest.fn().mockResolvedValue({
                SkillRegistry: class MockSkillRegistry {}
            });
            await manager.loadSkillRegistry();
        });

        test('should return skill info for valid skill ID', () => {
            const info = manager.getSkillInfo('gradient-visualization-skill');
            
            expect(info).toBeDefined();
            expect(info.id).toBe('gradient-visualization-skill');
            expect(info.name).toBe('梯度可视化Skill');
            expect(info.type).toBe('visualization');
        });

        test('should return null for invalid skill ID', () => {
            const info = manager.getSkillInfo('invalid-skill-id');
            
            expect(info).toBeNull();
        });

        test('should include all required fields', () => {
            const info = manager.getSkillInfo('gradient-visualization-skill');
            
            expect(info).toHaveProperty('id');
            expect(info).toHaveProperty('name');
            expect(info).toHaveProperty('nameEn');
            expect(info).toHaveProperty('type');
            expect(info).toHaveProperty('path');
            expect(info).toHaveProperty('entryPoint');
            expect(info).toHaveProperty('applicableNodes');
            expect(info).toHaveProperty('applicableDomains');
            expect(info).toHaveProperty('description');
            expect(info).toHaveProperty('icon');
        });
    });

    describe('isSkillAvailable', () => {
        beforeEach(async () => {
            global.import = jest.fn().mockResolvedValue({
                SkillRegistry: class MockSkillRegistry {}
            });
            await manager.loadSkillRegistry();
        });

        test('should return true for available skill', () => {
            expect(manager.isSkillAvailable('gradient-visualization-skill')).toBe(true);
        });

        test('should return false for unavailable skill', () => {
            expect(manager.isSkillAvailable('invalid-skill-id')).toBe(false);
        });
    });

    describe('getAllSkills', () => {
        beforeEach(async () => {
            global.import = jest.fn().mockResolvedValue({
                SkillRegistry: class MockSkillRegistry {}
            });
            await manager.loadSkillRegistry();
        });

        test('should return array of all skills', () => {
            const skills = manager.getAllSkills();
            
            expect(Array.isArray(skills)).toBe(true);
            expect(skills.length).toBeGreaterThan(0);
        });

        test('should include all skill types', () => {
            const skills = manager.getAllSkills();
            const types = [...new Set(skills.map(s => s.type))];
            
            expect(types).toContain('visualization');
            expect(types).toContain('animation');
            expect(types).toContain('interaction');
        });
    });

    describe('getSkillsByType', () => {
        beforeEach(async () => {
            global.import = jest.fn().mockResolvedValue({
                SkillRegistry: class MockSkillRegistry {}
            });
            await manager.loadSkillRegistry();
        });

        test('should return only visualization skills', () => {
            const skills = manager.getSkillsByType('visualization');
            
            expect(skills.every(s => s.type === 'visualization')).toBe(true);
            expect(skills.length).toBeGreaterThan(0);
        });

        test('should return only animation skills', () => {
            const skills = manager.getSkillsByType('animation');
            
            expect(skills.every(s => s.type === 'animation')).toBe(true);
        });

        test('should return empty array for non-existent type', () => {
            const skills = manager.getSkillsByType('non-existent-type');
            
            expect(skills).toEqual([]);
        });
    });

    describe('Skill-Node Mapping', () => {
        beforeEach(async () => {
            global.import = jest.fn().mockResolvedValue({
                SkillRegistry: class MockSkillRegistry {}
            });
            await manager.loadSkillRegistry();
        });

        test('should map gradient node to gradient visualization skill', () => {
            const skills = manager.getSkillsByNode('node-gradient');
            const skillIds = skills.map(s => s.id);
            
            expect(skillIds).toContain('gradient-visualization-skill');
            expect(skillIds).toContain('multivariate-function-skill');
        });

        test('should map limit node to appropriate skills', () => {
            const skills = manager.getSkillsByNode('node-limit-def');
            const skillIds = skills.map(s => s.id);
            
            expect(skillIds).toContain('concept-visualization-skill');
            expect(skillIds).toContain('limit-continuity-skill');
        });
    });

    describe('Skill-Domain Mapping', () => {
        beforeEach(async () => {
            global.import = jest.fn().mockResolvedValue({
                SkillRegistry: class MockSkillRegistry {}
            });
            await manager.loadSkillRegistry();
        });

        test('should map domain-3 to optimization skills', () => {
            const skills = manager.getSkillsByDomain('domain-3');
            const skillIds = skills.map(s => s.id);
            
            expect(skillIds).toContain('gradient-visualization-skill');
            expect(skillIds).toContain('multivariate-function-skill');
        });

        test('should map domain-1 to change and approximation skills', () => {
            const skills = manager.getSkillsByDomain('domain-1');
            
            expect(skills.length).toBeGreaterThan(0);
            expect(skills.some(s => s.name.includes('极限') || s.name.includes('导数'))).toBe(true);
        });

        test('should map domain-5 to H5P interaction skill', () => {
            const skills = manager.getSkillsByDomain('domain-5');
            const skillIds = skills.map(s => s.id);
            
            expect(skillIds).toContain('h5p-interaction-skill');
        });
    });
});
