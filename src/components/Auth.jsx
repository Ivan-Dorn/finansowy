import { useState } from "react";
import { supabase } from "../lib/supabase";

function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    setLoading(true);
    setError("");

    const { error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (error) {
      setError(
        "Nieprawidłowy email lub hasło."
      );
    }

    setLoading(false);
  }

  return (
    <div className="auth-screen">
      <form
        className="auth-card"
        onSubmit={handleSubmit}
      >
        <div className="auth-logo">F</div>

        <span className="auth-label">
          FINANSOWY
        </span>

        <h1>Logowanie</h1>

        <p>
          Zaloguj się, aby wejść do swojego panelu.
        </p>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(event) =>
            setEmail(event.target.value)
          }
          required
        />

        <input
          type="password"
          placeholder="Hasło"
          value={password}
          onChange={(event) =>
            setPassword(event.target.value)
          }
          required
        />

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        <button
          className="auth-button"
          type="submit"
          disabled={loading}
        >
          {loading
            ? "Logowanie..."
            : "Zaloguj się"}
        </button>
      </form>
    </div>
  );
}

export default Auth;