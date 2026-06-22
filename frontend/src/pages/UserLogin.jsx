import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
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
    const response = await fetch("http://193.197.230.150:8080/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, password })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log("Login failed", errorText);

      setLoginError("Username oder Passwort ist falsch");
      return;
    }

    const data = await response.json();
    console.log("LOGIN RESPONSE:", data);
    console.log("USER ID:", data.id);
    console.log("Login data:", data);

    const userId = data.id;

    localStorage.setItem("username", data.username);
    localStorage.setItem("email", data.email);
    localStorage.setItem("userId", userId);

    const genreResponse = await fetch(
      `http://193.197.230.150:8080/users/${userId}/favorite-genres`
    );

    if (!genreResponse.ok) {
      navigate("/genreselection");
      return;
    }

    const genres = await genreResponse.json();

    console.log("Genres:", genres);

    if (!genres || genres.length === 0) {
      navigate("/genreselection");
    } else {
      navigate("/homepage");
    }

  } catch (error) {
    console.error("Login error:", error);
    setLoginError("Serverfehler. Bitte später erneut versuchen.");

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