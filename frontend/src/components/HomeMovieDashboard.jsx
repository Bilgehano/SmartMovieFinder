import HomeMovieRow from "./HomeMovieRow";
import {
  popularMovies,
  recentlyViewedMovies,
  recommendedMovies,
  topRatedMovies,
  watchlistMovies,
} from "../data/mockMovies";
import "./HomeMovieDashboard.css";

function HomeMovieDashboard() {
  return (
    <div className="home-movie-dashboard">
      <div className="home-movie-dashboard-header">
        <h2>Discover Movies</h2>
        <p>
          Explore recommendations, popular movies, top rated movies and your personal movie areas.
        </p>
      </div>

      <HomeMovieRow
        title="Recommended Movies"
        linkTo="/search"
        movies={recommendedMovies}
      />

      <HomeMovieRow
        title="Popular Movies"
        linkTo="/search"
        movies={popularMovies}
      />

      <HomeMovieRow
        title="Top Rated"
        linkTo="/search"
        movies={topRatedMovies}
      />

      <HomeMovieRow
        title="Recently Viewed"
        linkTo="/library"
        movies={recentlyViewedMovies}
      />

      <HomeMovieRow
        title="Watchlist"
        linkTo="/library"
        movies={watchlistMovies}
      />
    </div>
  );
}

export default HomeMovieDashboard;