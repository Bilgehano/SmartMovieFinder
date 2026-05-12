import { Link } from "react-router-dom";

function StartPage() {
  return (
    <main className="start-page">
      <section className="start-card">
        <div className="start-visual"></div>

        <h1>SmartMovieFinder</h1>

        <p>
          Find movies smarter based on genres, recommendations and your personal library.
        </p>

        <div className="start-actions">
          <Link to="/userregistration" className="primary-button">
            Sign Up
          </Link>

          <Link to="/userlogin" className="secondary-button">
            Login
          </Link>
        </div>
      </section>
    </main>
  );
}

export default StartPage;