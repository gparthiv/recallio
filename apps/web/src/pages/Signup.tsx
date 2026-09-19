import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signup } from "../api/auth.api";

function Signup() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      await signup(username, password);

      navigate("/login");
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.errors ||
          "Unable to create account."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 text-text">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <Link
            to="/"
            className="font-logo text-3xl text-primary"
          >
            synapse
          </Link>

          <h1 className="mt-8 text-2xl font-semibold tracking-tight">
            Create your second brain
          </h1>

          <p className="mt-2 text-sm leading-6 text-muted">
            Start saving the things worth remembering.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="username"
              className="mb-2 block text-sm font-medium"
            >
              Username
            </label>

            <input
              id="username"
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
              minLength={3}
              maxLength={20}
              autoComplete="username"
              className="w-full rounded-xl bg-surface px-4 py-3 text-sm text-text outline-none transition-shadow placeholder:text-muted/60 focus:shadow-md"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={8}
              maxLength={20}
              autoComplete="new-password"
              className="w-full rounded-xl bg-surface px-4 py-3 text-sm text-text outline-none transition-shadow placeholder:text-muted/60 focus:shadow-md"
            />

            <p className="mt-2 text-xs leading-5 text-muted">
              8–20 characters with uppercase, lowercase, number and
              special character.
            </p>
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-medium text-white transition hover:bg-accent hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-text underline decoration-text/30 underline-offset-4 transition hover:text-primary"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}

export default Signup;
