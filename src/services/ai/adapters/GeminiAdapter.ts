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

  /**
   * Generate curriculum using streaming API
   * @param extractedContent - Text extracted from PDF
   * @param onChunk - Callback for each streamed chunk
   * @returns Promise of complete curriculum
   */
  async generateCurriculumStream(
    extractedContent: string,
    onChunk?: (chunk: string, index: number) => void
  ): Promise<Curriculum> {
    logger.info('GeminiAdapter: Generating curriculum with Gemini streaming API');
    
    try {
      const prompt = CURRICULUM_GENERATION_PROMPT + extractedContent;
      
      // Use streaming API with optimized configuration
      const result = await this.model.generateContentStream({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,        // Lower = faster, more focused
          topP: 0.9,              // Narrower probability distribution
          topK: 40,               // Limit candidate tokens for speed
          // Note: No maxOutputTokens - let it generate complete curriculum
        },
      });
      
      let fullText = '';
      let chunkIndex = 0;
      
      // Process each chunk as it arrives
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullText += chunkText;
        
        // Notify caller of new chunk
        if (onChunk) {
          onChunk(chunkText, chunkIndex);
        }
        
        chunkIndex++;
        logger.debug({ chunkIndex, chunkLength: chunkText.length }, 'Received chunk from Gemini');
      }
      
      logger.debug({ 
        totalChunks: chunkIndex,
        responseLength: fullText.length 
      }, 'Streaming complete from Gemini');
      
      // Parse the complete response
      const curriculum = this.parseResponse(fullText);
      
      logger.info({ 
        modules: curriculum.modules.length,
      }, 'GeminiAdapter: Streaming curriculum generated successfully');
      
      return curriculum;
    } catch (error) {
      logger.error({ error }, 'GeminiAdapter: Failed to generate curriculum via streaming');
      throw InternalError('Failed to generate curriculum using AI streaming. Please try again.');
    }
  }

  private parseResponse(text: string): Curriculum {
    try {
      // Try to extract JSON from the response
      let jsonStr = text;
      
      logger.debug('Parsing response', {
        textLength: text.length,
        preview: text.substring(0, 300)
      });
      
      // Remove markdown code blocks if present
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1];
        logger.debug('Removed markdown code blocks');
      }
      
      // Try to find JSON object
      const startIndex = jsonStr.indexOf('{');
      const endIndex = jsonStr.lastIndexOf('}');
      if (startIndex !== -1 && endIndex !== -1) {
        jsonStr = jsonStr.substring(startIndex, endIndex + 1);
        logger.debug('Extracted JSON boundaries', {
          startIndex,
          endIndex,
          extractedLength: jsonStr.length
        });
      }
      
      logger.debug('Attempting JSON.parse', {
        jsonLength: jsonStr.length,
        jsonPreview: jsonStr.substring(0, 200)
      });
      
      const parsed = JSON.parse(jsonStr);
      
      logger.debug('JSON parsed successfully', {
        hasTitle: !!parsed.title,
        hasDescription: !!parsed.description,
        modulesCount: parsed.modules?.length || 0
      });
      
      // Add IDs to all items
      return this.addIdsToStructure(parsed);
    } catch (error) {
      logger.error({ 
        error,
        errorMessage: error instanceof Error ? error.message : 'Unknown', 
        text: text.substring(0, 500),
        textLength: text.length
      }, 'Failed to parse Gemini response');
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
