import { defineCollection, z } from "astro:content";

const articles = defineCollection({
  type: "content",
  schema: ({ image }) =>
    z
      .object({
        title: z.string(),
        ogDesc: z
          .string()
          .refine(
            (v) => v.endsWith(".") || v.endsWith("?") || v.endsWith("!"),
            "ogDesc must end with punctuation.",
          ),
        ogImg: image().optional(),
        publishedOn: z.string().date().optional(),
        gameSlugs: z
          .array(
            z.string().refine(
              (val) => !val.endsWith("/"),
              (val) => ({
                message: `Slug "${val}" should not end with a slash`,
              }),
            ),
          )
          .optional(),
        // If available, shows a steam store widget at the bottom of the page.
        steamId: z.string().regex(/^\d+$/).optional(),
        review: z
          .object({
            rating: z.number().min(1).max(4),
            blurb: z.string(),
            plusses: z.array(z.string()).default([]),
            minuses: z.array(z.string()).default([]),
            gotPressKey: z.boolean().default(false),
          })
          .strict()
          .optional(),
      })
      .strict()
      .refine(
        ({ publishedOn, ogImg }) => (publishedOn ? ogImg : true),
        "published posts must have OG images",
      ),
});

export const collections = {
  articles,
};
