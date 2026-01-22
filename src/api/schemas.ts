/**
 * Zod schemas for API response validation.
 */
import { z } from 'zod';

/**
 * Health check response schema.
 */
export const HealthResponseSchema = z.object({
  status: z.string(),
  message: z.string(),
});

export type HealthResponse = z.infer<typeof HealthResponseSchema>;

/**
 * Generation statistics schema.
 */
export const GenerationStatsSchema = z.object({
  tablesProcessed: z.number(),
  entitiesGenerated: z.number(),
  filesGenerated: z.number(),
  generationTimeMs: z.number(),
});

export type GenerationStats = z.infer<typeof GenerationStatsSchema>;

/**
 * Generate/validate response schema.
 */
export const GenerateResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  generatedFiles: z.array(z.string()),
  warnings: z.array(z.string()),
  errors: z.array(z.string()),
  stats: GenerationStatsSchema.optional(),
});

export type GenerateResponse = z.infer<typeof GenerateResponseSchema>;
