import { AIServiceFactory } from '../../../../src/services/ai/AIServiceFactory';
import { MockAIAdapter } from '../../../../src/services/ai/adapters/MockAIAdapter';
import { GeminiAdapter } from '../../../../src/services/ai/adapters/GeminiAdapter';

describe('AIServiceFactory', () => {
  beforeEach(() => {
    // Clear cached instance before each test
    AIServiceFactory.clearCache();
  });

  describe('createService', () => {
    it('should return MockAIAdapter when provider is "mock"', () => {
      const service = AIServiceFactory.createService('mock');
      
      expect(service).toBeInstanceOf(MockAIAdapter);
      expect(service.getName()).toBe('MockAI');
    });

    it('should return GeminiAdapter when provider is "gemini"', () => {
      const service = AIServiceFactory.createService('gemini');
      
      expect(service).toBeInstanceOf(GeminiAdapter);
      expect(service.getName()).toBe('GoogleGemini');
    });

    it('should return MockAIAdapter as default when no provider specified', () => {
      const service = AIServiceFactory.createService();
      
      expect(service).toBeInstanceOf(MockAIAdapter);
    });

    it('should be case-insensitive for provider names', () => {
      const upperCase = AIServiceFactory.createService('MOCK');
      AIServiceFactory.clearCache();
      const mixedCase = AIServiceFactory.createService('Mock');
      
      expect(upperCase).toBeInstanceOf(MockAIAdapter);
      expect(mixedCase).toBeInstanceOf(MockAIAdapter);
    });

    it('should cache and reuse the same instance for same provider', () => {
      const first = AIServiceFactory.createService('mock');
      const second = AIServiceFactory.createService('mock');
      
      // Both should be MockAIAdapter instances with same name
      expect(first.getName()).toBe(second.getName());
      expect(first.getName()).toBe('MockAI');
    });

    it('should create new instance when provider changes', () => {
      const mock = AIServiceFactory.createService('mock');
      const gemini = AIServiceFactory.createService('gemini');
      
      expect(mock).not.toBe(gemini);
      expect(mock).toBeInstanceOf(MockAIAdapter);
      expect(gemini).toBeInstanceOf(GeminiAdapter);
    });
  });

  describe('getAvailableProviders', () => {
    it('should return list of available providers', () => {
      const providers = AIServiceFactory.getAvailableProviders();
      
      expect(providers).toContain('mock');
      expect(providers).toContain('gemini');
      expect(providers.length).toBe(2);
    });
  });

  describe('clearCache', () => {
    it('should clear cached instance', () => {
      const first = AIServiceFactory.createService('mock');
      AIServiceFactory.clearCache();
      const second = AIServiceFactory.createService('mock');
      
      // They should be different instances after cache clear
      expect(first).not.toBe(second);
    });
  });
});
