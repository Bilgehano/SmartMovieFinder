import { Link } from "react-router-dom";

import StartHexGrid from "../components/start/StartHexGrid";
import "./StartPage.css";

function StartPage() {
return ( <main className="start-page"> <section
     className="start-hero"
     aria-label="SmartMovieFinder introduction"
   > <h1 className="start-brand-title">
      <span>Smart</span>
      <span>Movie</span>
      <span>Finder</span>
    </h1>

    <div
      className="start-hero-right"
      aria-hidden="true"
    > 
      <StartHexGrid />
    </div>

    <div
      className="start-hero-left"
      aria-hidden="true"
    />

    <div
      className="start-lightbeam"
      aria-hidden="true"
    />
  </section>

  <section className="start-action-area">
    <div className="start-actions">
      <Link
        to="/userregistration"
        className="start-button start-signup-button"
      >
        Sign Up
      </Link>

      <Link
        to="/userlogin"
        className="start-button start-login-button"
      >
        Login
      </Link>
    </div>
  </section>
</main>

);
}

export default StartPage;