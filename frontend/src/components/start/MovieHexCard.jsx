import "./MovieHexCard.css";

function MovieHexCard({ title, imageUrl }) {
  return (
    <div className="movie-hex-card">
      <div className="movie-hex-card__content">
        {imageUrl ? (
          <img
            className="movie-hex-card__image"
            src={imageUrl}
            alt=""
          />
        ) : (
          <span className="movie-hex-card__label">
            {title}
          </span>
        )}
      </div>
    </div>
  );
}

export default MovieHexCard;