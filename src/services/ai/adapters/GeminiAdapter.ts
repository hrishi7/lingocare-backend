import { GoogleGenerativeAI } from '@google/generative-ai';
import { v4 as uuidv4 } from 'uuid';
import type { IAIService } from '../AIServiceInterface.js';
import type { Curriculum, Module, Topic, Lesson } from '../../../types/curriculum.types.js';
import { CURRICULUM_GENERATION_PROMPT } from '../prompts/curriculumPrompt.js';
import config from '../../../config/index.js';
import logger from '../../../utils/logger.js';
import { InternalError } from '../../../utils/AppError.js';

/**
 * Google Gemini AI Adapter
 * 
 * Production AI adapter using Google's Gemini API.
 * Requires GOOGLE_GEMINI_API_KEY environment variable.
 */
export class GeminiAdapter implements IAIService {
  private genAI: GoogleGenerativeAI;
  private model: ReturnType<GoogleGenerativeAI['getGenerativeModel']>;

  constructor() {
    if (!config.geminiApiKey) {
      logger.warn('Gemini API key not configured. AI generation may fail.');
    }
    
    this.genAI = new GoogleGenerativeAI(config.geminiApiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }

  getName(): string {
    return 'GoogleGemini';
  }

  async generateCurriculum(extractedContent: string): Promise<Curriculum> {
    logger.info('GeminiAdapter: Generating curriculum with Gemini API');
    
    try {
      const prompt = CURRICULUM_GENERATION_PROMPT + extractedContent;
      
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      
      logger.debug({ responseLength: text.length }, 'Received response from Gemini');
      
      // Parse JSON response
      const curriculum = this.parseResponse(text);
      
      logger.info({ 
        modules: curriculum.modules.length,
      }, 'GeminiAdapter: Curriculum generated successfully');
      
      return curriculum;
    } catch (error) {
      logger.error({ error }, 'GeminiAdapter: Failed to generate curriculum');
      throw InternalError('Failed to generate curriculum using AI. Please try again.');
    }
  }

  private parseResponse(text: string): Curriculum {
    try {
      // Try to extract JSON from the response
      let jsonStr = text;
      
      // Remove markdown code blocks if present
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1];
      }
      
      // Try to find JSON object
      const startIndex = jsonStr.indexOf('{');
      const endIndex = jsonStr.lastIndexOf('}');
      if (startIndex !== -1 && endIndex !== -1) {
        jsonStr = jsonStr.substring(startIndex, endIndex + 1);
      }
      
      const parsed = JSON.parse(jsonStr);
      
      // Add IDs to all items
      return this.addIdsToStructure(parsed);
    } catch (error) {
      logger.error({ error, text: text.substring(0, 200) }, 'Failed to parse Gemini response');
      throw new Error('Failed to parse AI response');
    }
  }

  private addIdsToStructure(parsed: Record<string, unknown>): Curriculum {
    const curriculum: Curriculum = {
      id: uuidv4(),
      title: String(parsed.title || 'Untitled Curriculum'),
      description: String(parsed.description || ''),
      modules: [],
    };

    const modules = parsed.modules as Array<Record<string, unknown>> || [];
    
    for (const mod of modules) {
      const module: Module = {
        id: uuidv4(),
        title: String(mod.title || 'Untitled Module'),
        description: String(mod.description || ''),
        topics: [],
      };

      const topics = mod.topics as Array<Record<string, unknown>> || [];
      
      for (const top of topics) {
        const topic: Topic = {
          id: uuidv4(),
          title: String(top.title || 'Untitled Topic'),
          description: String(top.description || ''),
          lessons: [],
        };

        const lessons = top.lessons as Array<Record<string, unknown>> || [];
        
        for (const les of lessons) {
          const lesson: Lesson = {
            id: uuidv4(),
            title: String(les.title || 'Untitled Lesson'),
            description: String(les.description || ''),
          };
          topic.lessons.push(lesson);
        }

        module.topics.push(topic);
      }

      curriculum.modules.push(module);
    }

    return curriculum;
  }
}
