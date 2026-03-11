import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../Hooks/useTheame";

const guestLinks = [
  { to: "/",       label: "Home",    icon: "⊞" },
  { to: "/login",  label: "Login",   icon: "◉" },
  { to: "/signup", label: "Sign Up", icon: "◌" },
];

const authLinks = [
  { to: "/",           label: "Home",       icon: "⊞" },
  { to: "/categories", label: "Categories", icon: "◈" },
];

const Sidebar = () => {
  const location              = useLocation();
  const navigate              = useNavigate();
  const { t, theme, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [token, setToken]         = useState(localStorage.getItem("token"));
  const role                      = localStorage.getItem("role");

  // sync token if changed in another tab
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

  const navLinks = token ? authLinks : guestLinks;

  return (
    <aside
      className={`min-h-screen flex flex-col border-r ${t.border} ${t.bgCard} transition-all duration-300 ${collapsed ? "w-16" : "w-60"}`}
    >
     
      <div className={`flex items-center justify-between px-4 py-4 border-b ${t.borderSubtle}`}>
        {!collapsed && (
          <span className={`font-black text-lg ${t.text}`}>
            Quiz<span className={t.accent}>App</span>
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`w-8 h-8 rounded-lg flex items-center justify-center ${t.textMuted} ${t.bgCardHover} transition-all border ${t.border}`}
        >
          {collapsed ? "»" : "«"}
        </button>
      </div>

     
      {token && !collapsed && (
        <div className={`mx-3 mt-3 px-3 py-2 rounded-xl ${t.accentLight} border ${t.accentBorder}`}>
          <p className={`text-xs font-bold uppercase tracking-widest ${t.accentText}`}>
            {role ?? "user"}
          </p>
        </div>
      )}

      {/* Nav links */}
      <nav className="flex flex-col gap-1 p-2 flex-1 pt-3">
        {navLinks.map(({ to, label, icon }) => {
          const active = location.pathname === to ||
                         (to !== "/" && location.pathname.startsWith(to));
          return (
            <Link
              key={to}
              to={to}
              title={collapsed ? label : ""}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium border transition-all duration-200
                ${active
                  ? `${t.navActive} border`
                  : `border-transparent ${t.navInactive}`}`}
            >
              <span className="text-base w-5 text-center shrink-0">{icon}</span>
              {!collapsed && <span>{label}</span>}
              {active && !collapsed && (
                <span className={`ml-auto w-2 h-2 rounded-full ${t.accentBg}`} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className={`p-3 border-t ${t.borderSubtle} flex flex-col gap-2`}>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium border ${t.border} ${t.bgCardHover} ${t.textSecondary} transition-all`}
        >
          <span className="text-base w-5 text-center shrink-0">
            {theme === "light" ? "🌙" : "☀️"}
          </span>
          {!collapsed && (
            <span>{theme === "light" ? "Dark Mode" : "Light Mode"}</span>
          )}
        </button>

        {/* Logout button*/}
        {token && (
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600 transition-all`}
          >
            <span className="text-base w-5 text-center shrink-0">🚪</span>
            {!collapsed && <span>Logout</span>}
          </button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;