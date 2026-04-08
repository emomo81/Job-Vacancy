"use client";
import Link from "next/link";
import { useState } from "react";
import { Check, ArrowRight } from "lucide-react";

type Mode = "signin" | "signup";
type Role = "company" | "candidate";

export default function AuthPage() {
  const [role, setRole] = useState<Role>("company");
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="min-h-screen flex">
      {/* ── Left: dark panel ─────────────────────────────── */}
      <div className="hidden lg:flex flex-1 bg-[#0A0A0F] flex-col justify-between p-12 relative overflow-hidden">
        {/* Subtle radial glow */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />

        <Link href="/" className="flex items-center gap-2 relative z-10">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">R</span>
          </div>
          <span className="text-white font-bold text-lg tracking-tight">Rankr</span>
        </Link>

        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-white leading-tight mb-6">
            The smarter way<br />to hire.
          </h1>
          <p className="text-gray-400 text-sm mb-8 leading-relaxed max-w-xs">
            AI screening that ranks every candidate and explains every decision.
          </p>
          <ul className="space-y-4">
            {[
              "Screen hundreds of CVs in seconds",
              "AI-generated match scores and reasoning",
              "Works with Unicorn profiles and external uploads",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-gray-400">
                <div className="w-5 h-5 rounded-full bg-blue-600/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check size={11} className="text-blue-400" />
                </div>
                {item}
              </li>
            ))}
          </ul>

          {/* Office photo placeholder */}
          <div className="mt-10 rounded-2xl overflow-hidden bg-white/5 border border-white/10 h-40 flex items-center justify-center">
            <span className="text-gray-600 text-sm">Team workspace</span>
          </div>
        </div>

        <p className="text-gray-600 text-xs relative z-10">© 2026 Rankr. All rights reserved.</p>
      </div>

      {/* ── Right: form panel ────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center bg-[#F0F4F8] p-6">
        <div className="w-full max-w-sm">
          {/* Role toggle */}
          <div className="flex bg-white rounded-xl p-1 gap-1 mb-8 shadow-sm border border-gray-100">
            <button
              onClick={() => setRole("company")}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                role === "company" ? "bg-blue-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              I&apos;m a Company
            </button>
            <button
              onClick={() => setRole("candidate")}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                role === "candidate" ? "bg-blue-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              I&apos;m a Candidate
            </button>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            {/* Mode toggle */}
            <div className="flex border-b border-gray-100 mb-6 -mt-1">
              <button
                onClick={() => setMode("signin")}
                className={`pb-3 mr-6 text-sm font-semibold border-b-2 transition-colors ${
                  mode === "signin" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-400 hover:text-gray-600"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setMode("signup")}
                className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
                  mode === "signup" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-400 hover:text-gray-600"
                }`}
              >
                Create Account
              </button>
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-1">
              {mode === "signin" ? "Welcome back" : "Create your account"}
            </h2>
            <p className="text-gray-400 text-sm mb-6">
              {mode === "signin"
                ? `Sign in to your ${role === "company" ? "company" : "candidate"} account`
                : `Get started as a ${role === "company" ? "company" : "candidate"} today`}
            </p>

            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              {mode === "signup" && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    {role === "company" ? "Company Name" : "Full Name"}
                  </label>
                  <input
                    type="text"
                    placeholder={role === "company" ? "Acme Inc." : "Jordan Reeves"}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">EMAIL</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-gray-600">PASSWORD</label>
                  {mode === "signin" && (
                    <a href="#" className="text-xs text-blue-600 hover:text-blue-700">Forgot password?</a>
                  )}
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>

              <Link
                href={role === "company" ? "/dashboard" : "/profile"}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-3 rounded-xl transition-colors text-sm"
              >
                {mode === "signin" ? "Sign In" : "Create Account"}
                <ArrowRight size={15} />
              </Link>
            </form>

            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-xs text-gray-400">or</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            <button className="w-full flex items-center justify-center gap-2 border border-gray-200 hover:border-gray-300 text-gray-700 font-medium px-5 py-3 rounded-xl transition-colors text-sm">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>

            <p className="text-center text-xs text-gray-400 mt-5">
              {mode === "signin" ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                {mode === "signin" ? "Create one" : "Sign in"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
