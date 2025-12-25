import { v4 as uuidv4 } from 'uuid';
import type { IAIService } from '../AIServiceInterface.js';
import type { Curriculum, Module, Topic, Lesson } from '../../../types/curriculum.types.js';
import logger from '../../../utils/logger.js';

/**
 * Mock AI Adapter
 * 
 * A mock implementation of IAIService for:
 * - Development and testing without API costs
 * - Demonstrating the full flow
 * - Unit testing
 * 
 * Parses PDF content using simple text analysis to identify structure.
 */
export class MockAIAdapter implements IAIService {
  getName(): string {
    return 'MockAI';
  }

  async generateCurriculum(extractedContent: string): Promise<Curriculum> {
    logger.info('MockAIAdapter: Generating curriculum from content');
    
    // Simulate API delay
    await this.simulateDelay(500);
    
    // Parse content and generate structure
    const curriculum = this.parseContentToCurriculum(extractedContent);
    
    logger.info({ 
      modules: curriculum.modules.length,
      topics: curriculum.modules.reduce((acc, m) => acc + m.topics.length, 0),
    }, 'MockAIAdapter: Curriculum generated');
    
    return curriculum;
  }

  private async simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private parseContentToCurriculum(content: string): Curriculum {
    const lines = content.split('\n').filter(line => line.trim());
    const modules: Module[] = [];
    
    let currentModule: Module | null = null;
    let currentTopic: Topic | null = null;
    
    // Simple parsing logic - looks for keywords
    for (const line of lines) {
      const trimmedLine = line.trim();
      const lowerLine = trimmedLine.toLowerCase();
      
      // Detect modules (Module, Chapter, Unit, Part)
      if (this.isModuleHeading(lowerLine)) {
        if (currentModule) {
          // Ensure module has at least one topic
          if (currentModule.topics.length === 0) {
            currentModule.topics.push(this.createDefaultTopic(currentModule.title));
          }
          modules.push(currentModule);
        }
        currentModule = this.createModule(trimmedLine, modules.length + 1);
        currentTopic = null;
      }
      // Detect topics (Topic, Section, Lesson header)
      else if (this.isTopicHeading(lowerLine) && currentModule) {
        if (currentTopic) {
          // Ensure topic has at least one lesson
          if (currentTopic.lessons.length === 0) {
            currentTopic.lessons.push(this.createDefaultLesson(currentTopic.title));
          }
          currentModule.topics.push(currentTopic);
        }
        currentTopic = this.createTopic(trimmedLine, currentModule.topics.length + 1);
      }
      // Detect lessons
      else if (this.isLessonHeading(lowerLine) && currentTopic) {
        currentTopic.lessons.push(this.createLesson(trimmedLine, currentTopic.lessons.length + 1));
      }
    }
    
    // Add last items
    if (currentTopic && currentModule) {
      if (currentTopic.lessons.length === 0) {
        currentTopic.lessons.push(this.createDefaultLesson(currentTopic.title));
      }
      currentModule.topics.push(currentTopic);
    }
    if (currentModule) {
      if (currentModule.topics.length === 0) {
        currentModule.topics.push(this.createDefaultTopic(currentModule.title));
      }
      modules.push(currentModule);
    }
    
    // If no modules found, create a default structure
    if (modules.length === 0) {
      modules.push(this.createDefaultModule());
    }
    
    return {
      id: uuidv4(),
      title: this.extractTitle(content) || 'Uploaded Curriculum',
      description: 'Curriculum generated from uploaded PDF document',
      modules,
    };
  }

  private isModuleHeading(line: string): boolean {
    return /^(module|chapter|unit|part)\s*\d*/i.test(line) ||
           /^\d+\.\s+[A-Z]/.test(line);
  }

  private isTopicHeading(line: string): boolean {
    return /^(topic|section|lesson)\s*\d*/i.test(line) ||
           /^\d+\.\d+\s+/.test(line);
  }

  private isLessonHeading(line: string): boolean {
    return /^\d+\.\d+\.\d+/.test(line) ||
           /^(activity|exercise|lesson)\s*\d*/i.test(line);
  }

  private createModule(title: string, index: number): Module {
    return {
      id: uuidv4(),
      title: this.cleanTitle(title) || `Module ${index}`,
      description: `Content for module ${index}`,
      topics: [],
    };
  }

  private createTopic(title: string, index: number): Topic {
    return {
      id: uuidv4(),
      title: this.cleanTitle(title) || `Topic ${index}`,
      description: `Content for topic ${index}`,
      lessons: [],
    };
  }

  private createLesson(title: string, index: number): Lesson {
    return {
      id: uuidv4(),
      title: this.cleanTitle(title) || `Lesson ${index}`,
      description: `Learning objectives for lesson ${index}`,
    };
  }

  private createDefaultModule(): Module {
    return {
      id: uuidv4(),
      title: 'Module 1 - Introduction',
      description: 'Introduction to the curriculum content',
      topics: [this.createDefaultTopic('Introduction')],
    };
  }

  private createDefaultTopic(moduleName: string): Topic {
    return {
      id: uuidv4(),
      title: `Topic 1 - Overview of ${moduleName}`,
      description: 'Overview and key concepts',
      lessons: [this.createDefaultLesson('Overview')],
    };
  }

  private createDefaultLesson(topicName: string): Lesson {
    return {
      id: uuidv4(),
      title: `Lesson 1 - Introduction to ${topicName}`,
      description: 'Foundational concepts and learning objectives',
    };
  }

  private cleanTitle(title: string): string {
    // Remove common prefixes and clean up
    return title
      .replace(/^(module|chapter|unit|part|topic|section|lesson)\s*\d*[\s\-:.]*/i, '')
      .replace(/^\d+\.?\d*\.?\d*\s*[-:.]?\s*/, '')
      .trim();
  }

  private extractTitle(content: string): string {
    const lines = content.split('\n').filter(line => line.trim());
    // First non-empty line is often the title
    return lines[0]?.trim().substring(0, 100) || '';
  }
}
