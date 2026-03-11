import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../Hooks/useTheame";

function Header() {
  const { t, theme, toggleTheme } = useTheme();
  const navigate                  = useNavigate();
  const [scrolled, setScrolled]   = useState(false);
  const [token, setToken]         = useState(localStorage.getItem("token"));

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // keep token state in sync if it changes elsewhere
  useEffect(() => {
    const sync = () => setToken(localStorage.getItem("token"));
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    setToken(null);
    navigate("/login");
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 px-6 py-3 flex items-center justify-between
        ${t.bgCard} ${scrolled
          ? `shadow-md ${t.shadow} border-b ${t.border}`
          : "border-b border-transparent"}`}
    >
      <Link to="/" className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-xl ${t.accentBg} flex items-center justify-center text-white text-lg font-black shadow-md`}>
          Q
        </div>
        <span className={`text-xl font-black tracking-tight ${t.text}`}>
          Quiz<span className={t.accent}>App</span>
        </span>
      </Link>

      <div className="flex items-center gap-3">

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className={`w-10 h-10 rounded-xl border ${t.border} ${t.bgCard} ${t.bgCardHover} ${t.textSecondary} flex items-center justify-center text-lg transition-all`}
          title="Toggle theme"
        >
          {theme === "light" ? "🌙" : "☀️"}
        </button>

        {token ? (
          // Logged in
          <button
            onClick={handleLogout}
            className="px-4 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-sm font-semibold shadow-sm transition-all"
          >
            Logout
          </button>
        ) : (
          // Not logged in
          <>
            <Link
              to="/login"
              className={`px-4 py-1.5 rounded-lg border ${t.border} text-sm font-semibold ${t.textSecondary} transition-all`}
            >
              Login
            </Link>
            <Link
              to="/signup"
              className={`px-4 py-1.5 rounded-xl ${t.accentBg} ${t.accentBgHover} text-white text-sm font-semibold shadow-sm transition-all`}
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </header>
  );
}

export default Header;