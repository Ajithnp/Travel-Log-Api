import { z } from 'zod';

export const chatbotQuerySchema = z.object({

  message: z
    .string({ required_error: 'Message is required' })
    .trim()
    .min(2, 'Message must be at least 2 characters')
    .max(500, 'Message must not exceed 500 characters'),
  chatHistory: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
      }),
    )
    .optional(),
});

export const chatbotQueryRequestSchema = z.object({
  body: chatbotQuerySchema,
});


export type ChatbotQueryRequestDTO = z.infer<typeof chatbotQueryRequestSchema>;