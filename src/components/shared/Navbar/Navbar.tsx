"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import styles from "./Navbar.module.scss";
import { MoonIcon, SunIcon } from "@/components/ui/Icon";

export default function Navbar() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light";
    return (
      (localStorage.getItem("paletto-theme") as "light" | "dark") || "light"
    );
  });
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      },
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("paletto-theme", next);
  };

  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.inner}>
        <span className={styles.wordmark}>Paletto</span>

        <div className={styles.actions}>
          <button
            className={styles.themeToggle}
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === "light" ? <MoonIcon /> : <SunIcon />}
          </button>

          {!loading && (
            <>
              {user ? (
                <div className={styles.userArea}>
                  {user.user_metadata?.avatar_url && (
                    <img
                      src={user.user_metadata.avatar_url}
                      alt="Avatar"
                      className={styles.avatar}
                    />
                  )}
                  <a href="/palettes" className={styles.palettesLink}>
                    Your palettes
                  </a>
                  <button className={styles.signOut} onClick={handleSignOut}>
                    Sign out
                  </button>
                </div>
              ) : (
                <button className={styles.signIn} onClick={handleSignIn}>
                  Sign in
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
