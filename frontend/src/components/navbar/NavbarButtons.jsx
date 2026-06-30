import {
Bookmark,
BookOpen,
ChartNetwork,
CircleUserRound,
Eye,
House,
LogOut,
Search,
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import "./NavbarButtons.css";

function NavbarButtons() {
const navigate = useNavigate();
const location = useLocation();

const activeLibraryTab = new URLSearchParams(location.search).get("tab");

const isGraphPage =
location.pathname === "/graph" || location.pathname.endsWith("/graph");

const isWatchlistPage =
location.pathname === "/library" &&
activeLibraryTab === "watch-later";

const isLibrarySearchPage =
location.pathname === "/library" && !isWatchlistPage;

function handleLogout() {
const shouldLogout = window.confirm("Are you sure you want to log out?");

if (!shouldLogout) {
return;
}

localStorage.removeItem("userId");
localStorage.removeItem("username");
localStorage.removeItem("email");
localStorage.removeItem("isNewUser");


navigate("/userlogin");

}

return ( <nav className="navbar-links" aria-label="Main navigation">
<NavLink
to="/homepage"
aria-label="Home"
title="Home"
className={({ isActive }) =>
isActive
? "navbar-link navbar-icon-only active"
: "navbar-link navbar-icon-only"
}
> <House className="navbar-icon" size={28} strokeWidth={2.3} /> </NavLink>

  <NavLink
    to="/search"
    aria-label="Search"
    title="Search"
    className={({ isActive }) =>
      isActive
        ? "navbar-link navbar-icon-only active"
        : "navbar-link navbar-icon-only"
    }
  >
    <Search className="navbar-icon" size={28} strokeWidth={2.3} />
  </NavLink>

  <NavLink
    to="/graph"
    aria-label="Graph"
    title="Graph"
    className={
      isGraphPage
        ? "navbar-link navbar-icon-only active"
        : "navbar-link navbar-icon-only"
    }
  >
    <ChartNetwork className="navbar-icon" size={28} strokeWidth={2.2} />
  </NavLink>

  <NavLink
    to="/library"
    aria-label="Library Search"
    title="Library Search"
    className={() =>
      isLibrarySearchPage
        ? "navbar-link navbar-icon-only active"
        : "navbar-link navbar-icon-only"
    }
  >
    <span className="navbar-icon-stack" aria-hidden="true">
      <BookOpen className="navbar-icon" size={28} strokeWidth={2.3} />
      <Search
        className="navbar-icon-badge"
        size={14}
        strokeWidth={3}
      />
    </span>
  </NavLink>

  <NavLink
    to="/library?tab=watch-later"
    aria-label="Watchlist"
    title="Watchlist"
    className={() =>
      isWatchlistPage
        ? "navbar-link navbar-icon-only active"
        : "navbar-link navbar-icon-only"
    }
  >
    <span className="navbar-icon-stack" aria-hidden="true">
      <Eye className="navbar-icon" size={29} strokeWidth={2.3} />
      <Bookmark
        className="navbar-icon-badge"
        size={14}
        strokeWidth={3}
      />
    </span>
  </NavLink>

  <NavLink
    to="/profile"
    aria-label="Profile"
    title="Profile"
    className={({ isActive }) =>
      isActive
        ? "navbar-link navbar-icon-only active"
        : "navbar-link navbar-icon-only"
    }
  >
    <CircleUserRound
      className="navbar-icon"
      size={29}
      strokeWidth={2.2}
    />
  </NavLink>

  <button
    type="button"
    className="navbar-link navbar-icon-only logout-button"
    aria-label="Logout"
    title="Logout"
    onClick={handleLogout}
  >
    <LogOut className="navbar-icon" size={28} strokeWidth={2.3} />
  </button>
</nav>

);
}

export default NavbarButtons;