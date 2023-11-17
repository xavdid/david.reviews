import slugify from "@sindresorhus/slugify";

export const bookPermalink = (slug: string) => `/books/${slug}`;
export const authorPermalink = (slug: string) => `/books/authors/${slug}`;
export const seriesPermalnk = (slug: string) => `/books/series/${slug}`;

export const movieSlug = (title: string, yearReleased: number) =>
  slugify(`${title} ${yearReleased}`);
export const moviePermalink = (title: string, yearReleased: number) =>
  `/movies/${movieSlug(title, yearReleased)}`;
