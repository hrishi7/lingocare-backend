import { MockAIAdapter } from '../../../../src/services/ai/adapters/MockAIAdapter';

describe('MockAIAdapter', () => {
  let adapter: MockAIAdapter;

  beforeEach(() => {
    adapter = new MockAIAdapter();
  });

  describe('getName', () => {
    it('should return "MockAI"', () => {
      expect(adapter.getName()).toBe('MockAI');
    });
  });

  describe('generateCurriculum', () => {
    it('should generate curriculum with modules', async () => {
      const content = `
        Module 1 - Introduction to Programming
        Topic 1.1 - Variables and Data Types
        Lesson 1.1.1 - What are Variables
        
        Module 2 - Control Flow
        Topic 2.1 - Conditionals
      `;

      const curriculum = await adapter.generateCurriculum(content);

      expect(curriculum).toBeDefined();
      expect(curriculum.id).toBeDefined();
      expect(curriculum.modules.length).toBeGreaterThan(0);
    });

    it('should create default structure when content has no clear structure', async () => {
      const content = 'Random text without any module or topic markers';

      const curriculum = await adapter.generateCurriculum(content);

      expect(curriculum).toBeDefined();
      expect(curriculum.modules.length).toBe(1);
      expect(curriculum.modules[0].topics.length).toBeGreaterThan(0);
      expect(curriculum.modules[0].topics[0].lessons.length).toBeGreaterThan(0);
    });

    it('should ensure each module has at least one topic', async () => {
      const content = `
        Module 1 - First Module
        Module 2 - Second Module
      `;

      const curriculum = await adapter.generateCurriculum(content);

      for (const module of curriculum.modules) {
        expect(module.topics.length).toBeGreaterThan(0);
      }
    });

    it('should ensure each topic has at least one lesson', async () => {
      const content = `
        Module 1 - First Module
        Topic 1.1 - First Topic
        Topic 1.2 - Second Topic
      `;

      const curriculum = await adapter.generateCurriculum(content);

      for (const module of curriculum.modules) {
        for (const topic of module.topics) {
          expect(topic.lessons.length).toBeGreaterThan(0);
        }
      }
    });

    it('should generate unique IDs for all items', async () => {
      const content = `
        Module 1 - Introduction
        Topic 1.1 - Overview
        Lesson 1.1.1 - Getting Started
      `;

      const curriculum = await adapter.generateCurriculum(content);
      const ids = new Set<string>();

      ids.add(curriculum.id);
      for (const module of curriculum.modules) {
        expect(ids.has(module.id)).toBe(false);
        ids.add(module.id);
        
        for (const topic of module.topics) {
          expect(ids.has(topic.id)).toBe(false);
          ids.add(topic.id);
          
          for (const lesson of topic.lessons) {
            expect(ids.has(lesson.id)).toBe(false);
            ids.add(lesson.id);
          }
        }
      }
    });

    it('should handle numbered headings', async () => {
      const content = `
        1. First Module
        1.1 First Topic
        1.1.1 First Lesson
        2. Second Module
      `;

      const curriculum = await adapter.generateCurriculum(content);

      expect(curriculum.modules.length).toBeGreaterThanOrEqual(1);
    });

    it('should set title from first line of content', async () => {
      const content = `My Curriculum Title
        Module 1 - Introduction
      `;

      const curriculum = await adapter.generateCurriculum(content);

      expect(curriculum.title).toBe('My Curriculum Title');
    });
  });
});
