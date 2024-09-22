import { defineCollection, z } from "astro:content";

// zod defaults are ignored when astro parses?
const articles = defineCollection({
  type: "content",
  schema: z
    .object({
      title: z.string(),
      ogDesc: z.string(),
      publishedOn: z.optional(z.string().date()),
      gameSlugs: z.optional(z.array(z.string())),
      review: z
        .object({
          rating: z.number().min(1).max(4),
          blurb: z.string(),
          plusses: z.array(z.string()).default([]),
          minuses: z.array(z.string()).default([]),
        })
        .strict()
        .optional(),
    })
    .strict(),
});

export const collections = {
  articles,
};
