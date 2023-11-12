import slugify from "@sindresorhus/slugify";

export const bookPermalink = (n: string) => `/books/${slugify(n)}`;
export const authorPermalink = (n: string) => `/books/authors/${slugify(n)}`;
export const seriesPermalnk = (n: string) => `/books/series/${slugify(n)}`;

export const movieSlug = (title: string, yearReleased: number) =>
  slugify(`${title} ${yearReleased}`);
export const moviePermalink = (title: string, yearReleased: number) =>
  `/movies/${movieSlug(title, yearReleased)}`;
