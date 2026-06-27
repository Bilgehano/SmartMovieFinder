import "./CommunityRatingSection.css";

function renderStars(rating) {
  return Array.from({ length: 10 }, (_, index) => {
    return index < rating ? "★" : "☆";
  }).join("");
}

function getAverageRating(ratings) {
  if (!ratings.length) return "0.0";

  const totalRating = ratings.reduce((sum, item) => sum + item.rating, 0);

  return (totalRating / ratings.length).toFixed(1);
}

function CommunityRatingSection({ ratings }) {
  const averageCommunityRating = getAverageRating(ratings);

  return (
    <section
      id="community-ratings"
      className="movie-detail-community-section"
    >
      <div className="movie-detail-section-header">
        <div>
          <p className="movie-detail-section-kicker">Community</p>
          <h2>Community Ratings</h2>
          <p>
            See how other users rated this movie. Comments can be added later if
            needed.
          </p>
        </div>

        <div className="movie-detail-average-rating">
          <span>{averageCommunityRating}/10</span>
          <small>Average rating</small>
        </div>
      </div>

      <div className="movie-detail-community-grid">
        {ratings.map((item) => (
          <article className="movie-detail-community-card" key={item.id}>
            <div className="movie-detail-community-card-header">
              <strong>{item.username}</strong>
              <span>{item.rating}/10  </span>
            </div>

            <div className="movie-detail-community-stars">
              {renderStars(item.rating)}
            </div>

            <p>User rating</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default CommunityRatingSection;