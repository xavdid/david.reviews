import slugify from "@sindresorhus/slugify";

export const bookPermalink = (slug: string) => `/books/${slug}`;
export const authorPermalink = (slug: string) => `/books/authors/${slug}`;
export const seriesPermalnk = (n: string) => `/books/series/${slugify(n)}`;

export const movieSlug = (title: string, yearReleased: number) =>
  slugify(`${title} ${yearReleased}`);
export const moviePermalink = (title: string, yearReleased: number) =>
  `/movies/${movieSlug(title, yearReleased)}`;
