/* eslint-disable @typescript-eslint/explicit-function-return-type */
import type { Author } from "../airtable/data/authors";
import type { Permalink } from "../airtable/types";
import { averageRating, last, seoTitle } from "./data";

export const buildStructuredReview = (
  type: "VideoGame" | "Movie" | "Book",
  items: Array<{ rating: number; dateFinished: string }>,
  {
    title,
    permalink,
    poster,
    authors,
    articleTitle,
    articleSubject,
    blurb,
  }: {
    // any missing values will be removed from output

    // used for most pages
    title?: string;
    // used for articles
    articleTitle?: string;
    // subtitle in articles
    blurb?: string;
    permalink: Permalink;
    poster?: string;
    authors?: Author[];
    // if article, the permalink for the game being reviewed
    articleSubject?: string;
  },
) => {
  if (!title && !articleTitle) {
    throw new Error("need one title or the other!");
  }
  if (type === "Book" && !authors) {
    throw new Error(`provide author for book (${title})`);
  }

  return {
    "@context": "http://schema.org/",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": permalink,
    },
    "@type": "Review",
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    headline: articleTitle ?? seoTitle(title!),
    description: blurb,
    url: permalink,
    image: poster,
    itemReviewed: {
      "@type": type,
      name: title,
      author: authors?.[0].name,
      url: articleSubject,
    },
    reviewRating: {
      "@type": "Rating",
      ratingValue: averageRating(items),
      worstRating: 1,
      bestRating: 4,
    },
    // items are sorted newest -> oldest
    datePublished: last(items).dateFinished,
    dateModified: items.length > 1 ? items[0].dateFinished : undefined,
    publisher: {
      "@type": "Organization",
      name: "david.reviews",
      logo: {
        "@type": "ImageObject",
        url: "https://david.reviews/android-chrome-192x192.png",
      },
    },
    author: {
      "@type": "Person",
      name: "David Brownman",
      url: "https://david.reviews/about",
      sameAs: "https://xavd.id",
    },
  };
};
