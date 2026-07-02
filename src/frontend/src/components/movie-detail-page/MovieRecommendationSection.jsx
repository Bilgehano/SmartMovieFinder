import MovieCard from "../shared/MovieCard";
import "./MovieRecommendationSection.css";

function MovieRecommendationSection({ recommendedMovies }) {
  return (
    <section
      id="movie-recommendations"
      className="movie-detail-recommendations-section"
    >
      <div className="movie-detail-section-header">
        <div>
          <p className="movie-detail-section-kicker">
            Discover More
          </p>

          <h2>Recommendations</h2>

          <p>Similar movies based on the selected movie.</p>
        </div>
      </div>

      <div className="movie-detail-recommendation-grid">
        {recommendedMovies.map((recommendedMovie) => (
          <MovieCard
            key={recommendedMovie.id}
            movie={recommendedMovie}
          />
        ))}
      </div>
    </section>
  );
}

export default MovieRecommendationSection;