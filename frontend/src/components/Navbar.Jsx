import { NavLink, useNavigate } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();

  function handleLogout() {
    // Later: remove token/user data here
    navigate("/userlogin");
  }

  return (
    <header className="app-navbar">
      <NavLink to="/homepage" className="navbar-logo" aria-label="Go to homepage">
        <div className="logo-placeholder"></div>
      </NavLink>

      <nav className="navbar-links" aria-label="Main navigation">
        <NavLink
          to="/homepage"
          className={({ isActive }) =>
            isActive ? "navbar-link active" : "navbar-link"
          }
        >
          Home
        </NavLink>

        <NavLink
          to="/search"
          className={({ isActive }) =>
            isActive ? "navbar-link active" : "navbar-link"
          }
        >
          Search
        </NavLink>

        <NavLink
          to="/library"
          className={({ isActive }) =>
            isActive ? "navbar-link active" : "navbar-link"
          }
        >
          Library
        </NavLink>

        <NavLink
          to="/profile"
          className={({ isActive }) =>
            isActive ? "navbar-link active" : "navbar-link"
          }
        >
          Profile
        </NavLink>

        <button type="button" className="navbar-link logout-button" onClick={handleLogout}>
          Logout
        </button>
      </nav>
    </header>
  );
}

export default Navbar;