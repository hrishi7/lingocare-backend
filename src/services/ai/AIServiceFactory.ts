import type { IAIService } from './AIServiceInterface.js';
import { MockAIAdapter } from './adapters/MockAIAdapter.js';
import { GeminiAdapter } from './adapters/GeminiAdapter.js';
import config from '../../config/index.js';
import logger from '../../utils/logger.js';

/**
 * AI Service Factory
 * 
 * Creates the appropriate AI service adapter based on configuration.
 * 
 * Design Pattern: Factory Pattern
 * - Centralizes adapter creation logic
 * - Allows runtime switching via environment variables
 * - Easy to add new providers without modifying client code
 * 
 * Usage:
 *   const aiService = AIServiceFactory.createService();
 *   const curriculum = await aiService.generateCurriculum(content);
 */
export class AIServiceFactory {
  private static instance: IAIService | null = null;
  
  /**
   * Create or return cached AI service instance
   * @param provider - Optional override for AI provider
   */
  static createService(provider?: string): IAIService {
    const selectedProvider = provider || config.aiProvider;
    
    // Return cached instance if same provider
    if (this.instance && this.instance.getName().toLowerCase() === selectedProvider.toLowerCase()) {
      return this.instance;
    }
    
    logger.info({ provider: selectedProvider }, 'Creating AI service adapter');
    
    switch (selectedProvider.toLowerCase()) {
      case 'gemini':
        this.instance = new GeminiAdapter();
        break;
      case 'mock':
      default:
        this.instance = new MockAIAdapter();
        break;
    }
    
    return this.instance;
  }
  
  /**
   * Get list of available AI providers
   */
  static getAvailableProviders(): string[] {
    return ['mock', 'gemini'];
  }
  
  /**
   * Clear cached instance (useful for testing)
   */
  static clearCache(): void {
    this.instance = null;
  }
}
