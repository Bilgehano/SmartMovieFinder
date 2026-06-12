import { graphCategoryConfig } from "../features/movieGraph/graphCategoryConfig";

function buildGraphCategories(categoryItems) {
  return graphCategoryConfig.map((category) => ({
    ...category,
    items: categoryItems[category.id] ?? [],
  }));
}

export const allMovieGraphMockData = [
  {
    center: {
      id: "forrest-gump",
      movieId: "1",
      type: "movie",
      label: "Forrest Gump",
      year: 1994,
      genre: "Drama",
      averageRating: 8.8,
    },

    categories: buildGraphCategories({
      "same-genre": [
        "The Shawshank Redemption",
        "A Beautiful Mind",
        "Good Will Hunting",
        "Life Is Beautiful",
        "The Green Mile",
      ],

      "similar-movies": [
        "Rain Man",
        "Big Fish",
        "The Terminal",
        "Cast Away",
        "The Curious Case of Benjamin Button",
      ],

      recommendations: [
        "The Green Mile",
        "Cast Away",
        "Big Fish",
        "The Terminal",
        "The Shawshank Redemption",
      ],

      "your-genre-picks": [
        "Dead Poets Society",
        "The Pursuit of Happyness",
        "Silver Linings Playbook",
        "Little Miss Sunshine",
        "About Time",
      ],

      "top-rated": [
        "The Godfather",
        "The Dark Knight",
        "Pulp Fiction",
        "Fight Club",
        "Interstellar",
      ],
    }),
  },

  {
    center: {
      id: "inception",
      movieId: "2",
      type: "movie",
      label: "Inception",
      year: 2010,
      genre: "Sci-Fi",
      averageRating: 8.8,
    },

    categories: buildGraphCategories({
      "same-genre": [
        "Interstellar",
        "The Matrix",
        "Blade Runner 2049",
        "Arrival",
        "Tenet",
      ],

      "similar-movies": [
        "The Prestige",
        "Shutter Island",
        "Source Code",
        "Looper",
        "Memento",
      ],

      recommendations: [
        "Interstellar",
        "Shutter Island",
        "Tenet",
        "The Matrix",
        "Memento",
      ],

      "your-genre-picks": [
        "Dune",
        "Minority Report",
        "Edge of Tomorrow",
        "Ex Machina",
        "Oblivion",
      ],

      "top-rated": [
        "The Dark Knight",
        "The Shawshank Redemption",
        "The Godfather",
        "Pulp Fiction",
        "Fight Club",
      ],
    }),
  },

  {
    center: {
      id: "the-matrix",
      movieId: "19",
      type: "movie",
      label: "The Matrix",
      year: 1999,
      genre: "Sci-Fi",
      averageRating: 8.7,
    },

    categories: buildGraphCategories({
      "same-genre": [
        "Inception",
        "Blade Runner",
        "Minority Report",
        "Ghost in the Shell",
        "Equilibrium",
      ],

      "similar-movies": [
        "Dark City",
        "Total Recall",
        "Tron: Legacy",
        "Ready Player One",
        "Tenet",
      ],

      recommendations: [
        "Inception",
        "Blade Runner",
        "Equilibrium",
        "Ghost in the Shell",
        "Dark City",
      ],

      "your-genre-picks": [
        "Dune",
        "Interstellar",
        "Arrival",
        "Edge of Tomorrow",
        "Blade Runner 2049",
      ],

      "top-rated": [
        "The Shawshank Redemption",
        "The Godfather",
        "The Dark Knight",
        "Pulp Fiction",
        "Fight Club",
      ],
    }),
  },
];

export const movieGraphMockData = allMovieGraphMockData[0];