import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { loginUser, fetchFavoriteGenres } from "../api/userApi";
import { getCurrentUserId } from "../api/userSession";
import "./UserLogin.css";

function UserLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setLoginError("");

      try {
          const data = await loginUser(username, password);

          const userId = data.id;

          localStorage.setItem("username", data.username);
          localStorage.setItem("email", data.email);
          localStorage.setItem("userId", userId);

          const genres = await fetchFavoriteGenres(userId);

         if (!genres || genres.length === 0) {
            navigate("/genreselection");
          } else {
            navigate("/homepage");
          }

        } catch (error) {
          console.error("Login error:", error);
          setLoginError("Username oder Passwort ist falsch oder Serverfehler.");
        } finally {
          setLoading(false);
        }
      };


  return (
    <main className="UserLogin">
      <section className="UserLogin_card">
        <div className="UserLogin_visual">

          <h1>User Login</h1>

          <p>Welcome back to SmartMovieFinder!</p>

          {loginError && (
            <p className="error-text">{loginError}</p>
          )}

          <div className="UserLogin_form">
            <input
              type="text"
              placeholder="Username"
              className="UserLogin_input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <input
              type="password"
              placeholder="Password"
              className="UserLogin_input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="UserLogin-actions">
            <button
              onClick={handleLogin}
              className="login-button"
              disabled={loading}
              type="button"
          >
              <span>{loading ? "Logging in..." : "Login"}</span>
            </button>

            <Link to="/userregistration" className="signup-button">
              <span>Sign Up</span>
            </Link>
          </div>

        </div>
      </section>
    </main>
  );
}

export default UserLogin;