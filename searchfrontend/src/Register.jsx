
import { useState } from "react";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:8081").replace(/\/$/, "");

function Register({ onRegister }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const register = async () => {
    setError("");

    if (!name || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          email,
          password
        })
      });

      if (!response.ok) {
        throw new Error("Registration failed. Email may already exist.");
      }

      onRegister();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-glow"></div>

      <div className="auth-card">
        <div className="auth-brand">
          <span className="brand-dot"></span>
          Private Search
        </div>

        <div className="auth-heading">
          <p className="auth-label">GET STARTED</p>

          <h1>Take back your search.</h1>

          <p>
            Create your private account and search the web on your terms.
          </p>
        </div>

        <div className="auth-form">
          <label>Name</label>

          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />

          <label>Email</label>

          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          <label>Password</label>

          <input
            type="password"
            placeholder="Create a password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                register();
              }
            }}
          />

          {error && <div className="auth-error">{error}</div>}

          <button
            className="auth-submit"
            onClick={register}
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </div>

        <div className="auth-footer">
          <span>Private by design.</span>
          <span className="auth-accent">No tracking.</span>
        </div>
      </div>
    </div>
  );
}

export default Register;