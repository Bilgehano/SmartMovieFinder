import { Link } from "react-router-dom";
import "./MovieRecommendationSection.css";

function MovieRecommendationSection({ recommendedMovies }) {
  return (
    <section
      id="movie-recommendations"
      className="movie-detail-recommendations-section"
    >
      <div className="movie-detail-section-header">
        <div>
          <p className="movie-detail-section-kicker">Discover more</p>
          <h2>Recommendations</h2>
          <p>Similar or popular movies based on the current mock data.</p>
        </div>
      </div>

      <div className="movie-detail-recommendation-grid">
        {recommendedMovies.map((recommendedMovie) => (
          <article
            className="movie-detail-recommendation-card"
            key={recommendedMovie.id}
          >
            <div className="movie-detail-recommendation-poster">
              <span>{recommendedMovie.title.charAt(0)}</span>
            </div>

            <div className="movie-detail-recommendation-content">
              <h3>{recommendedMovie.title}</h3>
              <p>
                {recommendedMovie.year} · {recommendedMovie.genre}
              </p>

              <div className="movie-detail-recommendation-footer">
                <span>★ {recommendedMovie.rating}</span>

                <Link
                  className="movie-detail-recommendation-button"
                  to={`/movies/${recommendedMovie.id}`}
                >
                  Details
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default MovieRecommendationSection;