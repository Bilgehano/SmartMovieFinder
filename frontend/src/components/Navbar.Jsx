import { NavLink } from "react-router-dom";
import NavbarButtons from "./navbar/NavbarButtons";
import "./Navbar.css";

function Navbar() {
  return (
    <header className="app-navbar">
      <NavLink
        to="/homepage"
        className="navbar-logo"
        aria-label="Go to homepage"
      >
        <div className="navbar-brand">
          <span className="navbar-brand-smart">SMART</span>
          <span className="navbar-brand-line">Movie</span>
          <span className="navbar-brand-line">Finder</span>
          <span className="navbar-brand-tagline">
            Discover your next movie
          </span>
        </div>
      </NavLink>

      <NavbarButtons />
    </header>
  );
}

export default Navbar;