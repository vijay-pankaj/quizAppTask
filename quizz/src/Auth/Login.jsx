import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../Hooks/useTheame"

const Login = () => {
  const { t } = useTheme();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  };

  return (
    <div className={`min-h-screen ${t.bg} flex items-center justify-center px-4 transition-colors duration-300`}>
      <div className="w-full max-w-md">
        <div className={`${t.bgCard} border ${t.border} rounded-3xl p-8 shadow-xl ${t.shadow}`}>
          <div className="text-center mb-8">
           
            <h2 className={`text-2xl font-black ${t.text}`}>Welcome back</h2>
            <p className={`${t.textMuted} text-sm mt-1`}>Sign in to continue your quiz journey</p>
          </div>

          <div className="flex flex-col gap-5">
            {[
              { name: "email", label: "Email address", type: "email", placeholder: "you@example.com" },
              { name: "password", label: "Password", type: "password", placeholder: "••••••••" },
            ].map(({ name, label, type, placeholder }) => (
              <div key={name}>
                <label className={`text-xs font-bold uppercase tracking-widest ${t.textMuted} mb-2 block`}>
                  {label}
                </label>
                <input
                  name={name}
                  type={type}
                  value={form[name]}
                  onChange={handleChange}
                  placeholder={placeholder}
                  className={`w-full ${t.inputBg} border ${t.inputBorder} rounded-xl px-4 py-3 text-sm ${t.text} placeholder:${t.textMuted} focus:outline-none focus:ring-2 ${t.inputFocus} transition`}
                />
              </div>
            ))}

            <div className="flex justify-end -mt-2">
              <a href="#" className={`text-xs font-semibold ${t.accent} hover:underline`}>
                Forgot password?
              </a>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`w-full ${t.accentBg} ${t.accentBgHover} disabled:opacity-50 text-white py-3 rounded-xl font-bold text-sm shadow-md transition-all`}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </div>

          <p className={`text-center text-xs ${t.textMuted} mt-6`}>
            Don't have an account?{" "}
            <Link to="/signup" className={`${t.accentText} font-bold hover:underline`}>
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;