import { z } from 'zod';

export const seoTitleMax = 60;
export const seoDescriptionMax = 160;
export const shortContentMax = 500;

export const postBaseSchema = z.object({
  title: z.string().min(3, 'Tytuł jest za krótki').max(255, 'Tytuł jest za długi'),
  slug: z.string().min(3, 'Slug jest za krótki').max(255, 'Slug jest za długi'),
  content: z.string().min(1, 'Treść jest wymagana'),
  short_content: z.string().max(shortContentMax).optional().nullable(),
  tags: z.string().max(255).optional().nullable(),
  image_display: z.string().url().optional().nullable().or(z.literal('')),
  seo_title: z.string().max(seoTitleMax).optional().nullable(),
  seo_content: z.string().max(seoDescriptionMax).optional().nullable(),
});

export const createPostSchema = postBaseSchema.extend({
  status: z.enum(['draft', 'published']).default('draft'),
});

export const updatePostSchema = postBaseSchema.partial().extend({
  status: z.enum(['draft', 'published', 'archived']).optional(),
  published_at: z.string().datetime().optional(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;


