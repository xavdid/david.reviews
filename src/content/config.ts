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
        mentionedGameSlugs: z
          .array(
            z.string().refine(
              (val) => !val.endsWith("/"),
              (val) => ({
                message: `Slug "${val}" should not end with a slash`,
              }),
            ),
          )
          .optional(),
        review: z
          .object({
            // used in structured data
            gameInfo: z
              .object({
                title: z.string().optional(),
                // If available, shows a steam store widget at the bottom of the page.
                steamId: z.string().regex(/^\d+$/).optional(),
                availability: z
                  .array(
                    z
                      .object({
                        text: z.string(),
                        href: z
                          .string()
                          .refine((s) => s.startsWith("https://"))
                          .optional(),
                      })
                      .strict(),
                  )
                  .default([]),
              })
              .strict()
              .refine(
                ({ title, steamId }) => steamId ?? title,
                "If steamId is missing in a review, must provide title.",
              ),
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
      .refine(({ publishedOn, ogImg }) => {
        return publishedOn ? ogImg : true;
      }, "published posts must have OG images"),
});

export const collections = {
  articles,
};
