import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./UserRegistration.css";

function UserRegistration() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    if (!username || !email || !password) {
      setError("Bitte alle Felder ausfüllen");
      setLoading(false);
    return;
    }

    try {
      const response = await fetch("http://localhost:8080/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      const data = await response.json();

      setMessage(`User ${data.username} erfolgreich registriert!`);
      setTimeout(() => {
        navigate("/userlogin");
      }, 800);

      setUsername("");
      setEmail("");
      setPassword("");
    } catch (err) {
      setError(err.message || "Registrierung fehlgeschlagen");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="UserRegistration">
      <section className="UserRegistration_card">
        <h1>Sign Up</h1>
        <p>Welcome to SmartMovieFinder!</p>

        <form className="UserRegistration_form" onSubmit={handleSubmit}>
          <input
            required
            className="UserRegistration_input"
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            required
            className="UserRegistration_input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            required
            className="UserRegistration_input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        {message && <p className="success-text">{message}</p>}
        {error && <p className="error-text">{error}</p>}
      </section>
    </main>
  );
}

export default UserRegistration;