import "./StartPosterCard.css";

function StartPosterCard({ title, imageUrl }) {
  return (
    <div className="start-poster-card">
      <div className="start-poster-card__content">
        {imageUrl ? (
          <img
            className="start-poster-card__image"
            src={imageUrl}
            alt=""
          />
        ) : (
          <span className="start-poster-card__label">
            {title}
          </span>
        )}
      </div>
    </div>
  );
}

export default StartPosterCard;