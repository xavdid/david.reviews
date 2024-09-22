import { defineCollection, z } from "astro:content";

const articles = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    publishedOn: z.optional(z.date()),
    gameSlugs: z.optional(z.array(z.string())),
  }),
});

export const collections = {
  articles,
};
