"use client";

import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabase";
import { LogIn, UserPlus, Loader2 } from "lucide-react";

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim() || email.split("@")[0],
          },
        },
      });

      if (error) {
        setError(error.message);
      } else if (data?.user) {
        setSuccess("Account created successfully! You can now sign in.");
        setIsSignUp(false);
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setError(error.message);
      }
    }

    setLoading(false);
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <div className="logo-circle">
          {isSignUp ? <UserPlus size={30} /> : <LogIn size={30} />}
        </div>

        <h1>Attendance Portal</h1>

        <p className="subtitle">
          {isSignUp
            ? "Create Teacher Account"
            : "Smart Attendance & Academic Management"}
        </p>

        <div className="auth-tabs">
          <button
            type="button"
            className={!isSignUp ? "active" : ""}
            onClick={() => {
              setIsSignUp(false);
              setError("");
              setSuccess("");
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={isSignUp ? "active" : ""}
            onClick={() => {
              setIsSignUp(true);
              setError("");
              setSuccess("");
            }}
          >
            Register Teacher
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {isSignUp && (
            <>
              <label>Full Name</label>
              <input
                type="text"
                placeholder="Prof. John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required={isSignUp}
              />
            </>
          )}

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

          {error && <div className="error-box">{error}</div>}
          {success && <div className="success-box">{success}</div>}

          <button
            type="submit"
            className="primary-btn login-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="spin" size={18} />
                {isSignUp ? "Creating Account..." : "Signing in..."}
              </>
            ) : isSignUp ? (
              <>
                <UserPlus size={18} />
                Register Account
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