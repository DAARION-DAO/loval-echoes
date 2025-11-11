// Shared validation schemas using Zod
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// XSS protection regex
const XSS_PATTERN = /<script|javascript:|onerror=|onload=|onclick=|onmouseover=/i;

// UUID validation
export const UUIDSchema = z.string().uuid('Невірний формат UUID');

// Text validation with XSS protection
export const SafeTextSchema = (maxLength = 1000, minLength = 1) => 
  z.string()
    .min(minLength, `Текст не може бути порожнім`)
    .max(maxLength, `Текст не може перевищувати ${maxLength} символів`)
    .refine(
      (text) => !XSS_PATTERN.test(text),
      'Текст містить небезпечний контент'
    );

// News reply validation
export const NewsReplySchema = z.object({
  text: SafeTextSchema(1000, 1),
  author_id: UUIDSchema,
});

// Chat message validation
export const ChatMessageSchema = z.object({
  message: SafeTextSchema(5000, 1),
  conversationId: UUIDSchema.optional(),
  chatId: UUIDSchema.optional(),
});

// File validation
export const FileIdSchema = z.object({
  fileId: UUIDSchema,
});

// Generic validation helper
export const validateInput = <T>(schema: z.ZodSchema<T>, data: unknown) => {
  return schema.safeParse(data);
};

