"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Auth from "@/components/Auth";
import App from "@/components/App";
import type { User } from "@supabase/supabase-js";

export type UserRole = "super_admin" | "teacher";

export type UserProfile = {
  id: string;
  email: string;
  role: UserRole;
  full_name?: string | null;
};

export default function Page() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchProfile(currentUser: User) {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .single();

      if (data) {
        setProfile(data as UserProfile);
      } else if (error) {
        // Fallback profile if record doesn't exist yet
        const defaultProfile: UserProfile = {
          id: currentUser.id,
          email: currentUser.email || "",
          role: "teacher",
          full_name: currentUser.email?.split("@")[0] || "Teacher",
        };
        // Try creating fallback profile
        await supabase.from("profiles").upsert(defaultProfile);
        setProfile(defaultProfile);
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      setProfile({
        id: currentUser.id,
        email: currentUser.email || "",
        role: "teacher",
      });
    }
  }

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (mounted) {
        setUser(user);
        if (user) {
          await fetchProfile(user);
        }
        setLoading(false);
      }
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        await fetchProfile(currentUser);
      } else {
        setProfile(null);
      }
    });

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

  if (!user || !profile) {
    return <Auth />;
  }

  return <App user={user} userProfile={profile} onProfileUpdate={() => fetchProfile(user)} />;
}