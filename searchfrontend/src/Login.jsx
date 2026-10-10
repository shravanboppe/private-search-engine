
import { useState } from "react";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:8081").replace(/\/$/, "");

function Login({ onLogin, onRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async () => {
    setError("");

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          password
        })
      });

      if (!response.ok) {
        throw new Error("Invalid email or password");
      }

      const data = await response.json();

      localStorage.setItem("token", data.token);

      onLogin();
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
          <p className="auth-label">WELCOME BACK</p>

          <h1>Search without limits.</h1>

          <p>Your searches. Your privacy. Your control.</p>
        </div>

        <div className="auth-form">
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
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                login();
              }
            }}
          />

          {error && <div className="auth-error">{error}</div>}

          <button className="auth-submit" onClick={login} disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </div>

        <div className="auth-footer">
          <span>New to Private Search?</span>

          <button className="auth-link" onClick={onRegister}>
            Create an account
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;