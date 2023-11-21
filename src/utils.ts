export const bookPermalink = (slug: string): string => `/books/${slug}`;
export const authorPermalink = (slug: string): string =>
  `/books/authors/${slug}`;
export const seriesPermalnk = (slug: string): string => `/books/series/${slug}`;
export const moviePermalink = (slug: string): string => `/movies/${slug}`;
export const collectionPermalink = (slug: string): string =>
  `/movies/collections/${slug}`;
export const gamePermalink = (slug: string): string => `/games/${slug}`;
export const genrePermalink = (slug: string): string => `/games/genres/${slug}`;
export const minutesToDuration = (totalMinutes: number): string => {
  if (!totalMinutes) {
    return "Unknown Playtime";
  }
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes - hours * 60;
  return `${hours}h ${minutes}m`;
};
