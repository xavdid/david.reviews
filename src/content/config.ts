import { defineCollection, z } from "astro:content";

// zod defaults are ignored when astro parses?
const articles = defineCollection({
  type: "content",
  schema: z
    .object({
      title: z.string(),
      ogDesc: z
        .string()
        .refine(
          (v) => v.endsWith(".") || v.endsWith("?"),
          "ogDesc must end with punctuation.",
        ),
      ogImg: z
        .object({
          url: z
            .string()
            .startsWith("https://")
            .refine(
              // this probably true, but can adjust as needed
              (v) => v.endsWith(".png") || v.endsWith(".jpeg"),
              "ogImg.url must end with .png or .jpeg",
            ),
          height: z.number(),
          width: z.number(),
        })
        .strict()
        .optional(),
      publishedOn: z.optional(z.string().date()),
      gameSlugs: z.optional(
        z.array(
          z.string().refine(
            (val) => !val.endsWith("/"),
            (val) => ({
              message: `Slug "${val}" should not end with a slash`,
            }),
          ),
        ),
      ),
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
