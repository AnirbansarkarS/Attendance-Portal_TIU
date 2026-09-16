"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Auth from "@/components/Auth";
import App from "@/components/App";
import type { User } from "@supabase/supabase-js";

export default function Page() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (mounted) {
        setUser(user);
        setLoading(false);
      }
    }

    loadUser();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="loading-page">
        <div className="loader"></div>
        <p>Loading Attendance Portal...</p>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return <App user={user} />;
}