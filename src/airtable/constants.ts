// mapping of a useful name to a field ID, which will make this more resistant to field renames

type Base = {
  id: string;
  tables: {
    [tableName: string]: {
      id: string;
      fields: { [fieldName: string]: string };
      views: { [viewName: string]: string };
    };
  };
};

export const BASES = {
  movies: {
    id: "appctKQDyHbyqNJOY",
    tables: {
      // https://airtable.com/appctKQDyHbyqNJOY/api/docs#javascript/table:watches
      watches: {
        id: "tblvUWLFrN47hrzmb",
        fields: {
          // https://airtable.com/appctKQDyHbyqNJOY/api/docs#javascript/table:watches:fields
          title: "fldv3t6rmcVNEW9xN",
          dateWatched: "fldhJwKvRV18ox99t",
          isFirstWatch: "fldpSxAP9mpw0D7V6",
          rating: "fld120ruFVH8sml4B",
          notes: "fldHCPMRJrOOiZxca",
          // movie: "fldhAqjnIaBR90xr1",
          // poster: "flda3rt0LrVVid62H",
          tmdbID: "fldquYvRJYLZhvfvA", // string[]
          posterPath: "fldgUqyuGvEV9ESj8",
          collections: "fldy9V32NQfusaaVP",
          award: "fldmW9FgOxwCcgmGE",
          awardYear: "fldr8qhnvoNTpykWe",
          totalMovieWatches: "fldIcHiMwU6eMo3GG",
        },
        views: {
          watchedMovies: "viwovZ8M1YpRtgpFS",
        },
      },
      movies: {
        id: "tblSk0UGL0gDE9Qic",
        fields: {
          title: "fldTnYNwU1nDCbVr4",
          numTimesWatched: "fldjw4L2x9amvkPoC",
          collections: "fldQHNpHO95v5XR2d",
          poster: "fld4w9PILcqJIcTr8",
          watches: "fldpujZmy7solWxpf",
        },
        views: {},
      },
    },
  },
  games: {
    id: "",
    tables: {
      watches: {
        id: "",
        fields: {},
        views: {},
      },
    },
  },
  books: {
    id: "",
    tables: {
      watches: {
        id: "",
        fields: {},
        views: {},
      },
    },
  },
} as const satisfies Record<string, Base>;
