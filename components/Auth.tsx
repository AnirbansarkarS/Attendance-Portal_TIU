"use client";

import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabase";
import { LogIn, Loader2 } from "lucide-react";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: FormEvent) {
    e.preventDefault();

    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password
    });

    if (error) {
      setError(error.message);
    }

    setLoading(false);
  }

  return (
    <main className="auth-page">
      <div className="auth-card">

        <div className="logo-circle">
          <LogIn size={30} />
        </div>

        <h1>Attendance Portal</h1>

        <p className="subtitle">
          Smart Attendance & Academic Management
        </p>

        <form onSubmit={handleLogin}>

          <label>Email</label>

          <input
            type="email"
            placeholder="teacher@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>

          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <div className="error-box">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="primary-btn login-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="spin" size={18} />
                Signing in...
              </>
            ) : (
              <>
                <LogIn size={18} />
                Sign In
              </>
            )}
          </button>

        </form>

      </div>
    </main>
  );
}