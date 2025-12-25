/**
 * Curriculum Generation Prompt - BALANCED FOR SPEED AND QUALITY
 * 
 * Key optimizations:
 * 1. Direct, concise language (no verbose explanations)
 * 2. Sequential generation instruction for streaming
 * 3. Proper numbering and formatting requirements maintained
 * 4. Meaningful descriptions enforced
 * 
 * Performance: Fast streaming without compromising quality
 */
export const CURRICULUM_GENERATION_PROMPT = `Generate a structured curriculum from the document below.

CRITICAL REQUIREMENTS:
1. Start generating the FIRST module immediately (streaming optimization)
2. Generate modules SEQUENTIALLY - complete Module 1 entirely before Module 2
3. Generate ALL modules found in the document - do not stop after Module 1
4. Use hierarchical numbering: "Module 1", "Topic 1.1", "Lesson 1.1.1"
5. Generate meaningful curriculum title and description
6. Each description should be 1-2 clear, informative sentences
7. Auto-generate topics/lessons if document lacks detail

Return ONLY valid JSON (no markdown, no code blocks):
{
  "title": "Descriptive Curriculum Title",
  "description": "Clear 1-2 sentence overview of the curriculum",
  "modules": [
    {
      "title": "Module 1: Module Name",
      "description": "1-2 sentences describing this module",
      "topics": [
        {
          "title": "Topic 1.1: Topic Name",
          "description": "1-2 sentences about this topic",
          "lessons": [
            {
              "title": "Lesson 1.1.1: Lesson Name",
              "description": "1-2 sentences explaining this lesson"
            }
          ]
        }
      ]
    }
  ]
}

DOCUMENT:
`;

