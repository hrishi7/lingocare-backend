import type { Curriculum } from '../../types/curriculum.types.js';

/**
 * AI Service Interface
 * 
 * This interface defines the contract for all AI adapters.
 * Any new AI provider must implement this interface.
 * 
 * Design Pattern: Strategy Pattern
 * - Allows swapping AI providers without changing client code
 * - Enables easy testing with mock adapters
 * - Follows Open/Closed Principle
 */
export interface IAIService {
  /**
   * Generate a structured curriculum from extracted PDF content
   * @param extractedContent - Text extracted from uploaded PDF
   * @returns Structured curriculum object
   */
  generateCurriculum(extractedContent: string): Promise<Curriculum>;
  
  /**
   * Get the name of the AI provider
   * @returns Provider name for logging/debugging
   */
  getName(): string;
}
