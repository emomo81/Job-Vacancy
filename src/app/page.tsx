"use client";
import Link from "next/link";
import { ArrowRight, Check, Upload, Zap, Users } from "lucide-react";
import { motion } from "framer-motion";
import LandingNav from "@/components/LandingNav";
import UnicornHero from "@/components/UnicornHero";
import SplineBottom from "@/components/SplineBottom";
import Loader from "@/components/Loader";

/* Word-by-word text reveal — hero only */
function TextReveal({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
  const words = text.split(" ");
  return (
    <span className={className} aria-label={text}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          className="inline-block mr-[0.25em]"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: delay + i * 0.08, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}

const candidateCards = [
  { name: "Amanda Bell", role: "Senior UX Designer", score: 94, tags: ["Design", "Research"], color: "bg-purple-500" },
  { name: "Leon Miller", role: "Backend Engineer", score: 88, tags: ["Node.js", "AWS"], color: "bg-blue-500" },
  { name: "Jessica Park", role: "Product Manager", score: 81, tags: ["Strategy", "Analytics"], color: "bg-green-500" },
];

export default function LandingPage() {
  return (
    <>
      <Loader />

      <div className="min-h-screen bg-[#0A0A0F]">
        <LandingNav />

        {/* ── Hero ──────────────────────────────────────── */}
        <section className="relative min-h-screen flex items-center overflow-hidden">
          <UnicornHero />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0F] via-[#0A0A0F]/75 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F]/60 via-transparent to-transparent z-10" />

          <div className="relative z-20 w-full max-w-7xl mx-auto px-6 pt-28 pb-24 flex flex-col lg:flex-row items-center gap-16">
            {/* Left content */}
            <div className="flex-1 max-w-xl">
              <h1 className="text-5xl lg:text-[3.75rem] font-bold text-white leading-[1.05] mb-2 tracking-tight">
                <TextReveal text="Hire Smarter." delay={0.2} />
              </h1>
              <h1 className="text-5xl lg:text-[3.75rem] font-bold leading-[1.1] mb-6 tracking-tight">
                <TextReveal text="Screen Faster." delay={0.5} className="text-blue-500" />
              </h1>

              <motion.p
                className="text-gray-400 text-lg leading-relaxed mb-8 max-w-md"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.6 }}
              >
                Rankr uses AI to screen hundreds of candidates in seconds — scoring, ranking, and explaining every decision so recruiters can focus on people, not paperwork.
              </motion.p>

              <motion.div
                className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.05, duration: 0.6 }}
              >
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-full transition-colors text-sm"
                >
                  Post a Job <ArrowRight size={15} />
                </Link>
                <Link
                  href="/auth"
                  className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors"
                >
                  <Upload size={14} /> Upload Your CV
                </Link>
              </motion.div>

              <motion.div
                className="flex items-center gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.6 }}
              >
                <div className="flex -space-x-2">
                  {["bg-purple-500", "bg-blue-500", "bg-green-500", "bg-yellow-500"].map((c, i) => (
                    <div key={i} className={`w-8 h-8 rounded-full border-2 border-[#0A0A0F] ${c}`} />
                  ))}
                </div>
                <span className="text-gray-500 text-xs">
                  Trusted by <span className="text-gray-300 font-medium">500+</span> companies worldwide
                </span>
              </motion.div>
            </div>

            {/* Right — candidate cards */}
            <div className="flex-1 hidden lg:flex flex-col gap-3 max-w-xs">
              {candidateCards.map((c, i) => (
                <motion.div
                  key={c.name}
                  className={`bg-white/5 border border-white/10 rounded-2xl p-4 ${
                    i === 1 ? "translate-x-6" : i === 2 ? "translate-x-3" : ""
                  }`}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: i === 1 ? 24 : i === 2 ? 12 : 0 }}
                  transition={{ delay: 1.1 + i * 0.15, duration: 0.65, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full ${c.color} flex items-center justify-center text-white text-sm font-semibold`}>
                        {c.name[0]}
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">{c.name}</p>
                        <p className="text-gray-400 text-xs">{c.role}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-blue-400 text-lg font-bold">{c.score}</p>
                      <p className="text-gray-500 text-xs">match</p>
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-blue-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${c.score}%` }}
                      transition={{ delay: 1.3 + i * 0.15, duration: 0.9, ease: "easeOut" }}
                    />
                  </div>
                  <div className="flex gap-1.5 mt-2">
                    {c.tags.map((t) => (
                      <span key={t} className="text-xs text-gray-400 bg-white/5 px-2 py-0.5 rounded-md">{t}</span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 opacity-50">
            <span className="text-gray-500 text-xs tracking-widest uppercase">Scroll</span>
            <div className="w-px h-10 bg-gradient-to-b from-gray-500 to-transparent" />
          </div>
        </section>

        {/* ── How it Works ───────────────────────────────── */}
        <section id="how-it-works" className="bg-[#F0F4F8] py-28">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="text-blue-600 text-xs font-semibold uppercase tracking-widest mb-3">How it works</p>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Three steps to your<br />perfect shortlist
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto mb-16">
              From job post to shortlist in minutes — no spreadsheets, no guesswork.
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                { step: "01", title: "Create a Job", desc: "Define the role, required skills, experience level and employment type in under 2 minutes.", icon: "📝" },
                { step: "02", title: "Add Candidates", desc: "Import from Rankr's talent pool or upload CVs directly. Supports bulk PDF uploads.", icon: "👥" },
                { step: "03", title: "Let AI Screen", desc: "Rankr scores every candidate, explains its reasoning, and delivers a ranked shortlist instantly.", icon: "⚡" },
              ].map((s) => (
                <div
                  key={s.step}
                  className="bg-white rounded-2xl p-8 text-left border border-gray-100 shadow-sm h-full"
                >
                  <span className="text-blue-600 text-xs font-bold uppercase tracking-widest">{s.step}</span>
                  <div className="text-4xl my-4">{s.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{s.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Feature Cards ──────────────────────────────── */}
        <section className="bg-[#F0F4F8] pb-28">
          <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-6" id="companies">
            {/* Companies card */}
            <div className="bg-white rounded-3xl p-10 border border-gray-100 shadow-sm h-full">
              <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-600 text-xs font-semibold px-3 py-1 rounded-full mb-6">
                <Zap size={11} /> For Companies
              </span>
              <h3 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
                Screen 100 candidates<br />in 30 seconds
              </h3>
              <ul className="space-y-3 mb-8">
                {[
                  "AI evaluates candidates against your job criteria",
                  "Ranked match scores with transparent reasoning",
                  "Shortlist the best without reading every CV",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-gray-600">
                    <Check size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-full text-sm transition-colors"
              >
                Post a Job <ArrowRight size={14} />
              </Link>
            </div>

            {/* Candidates card */}
            <div id="candidates" className="bg-white rounded-3xl p-10 border border-gray-100 shadow-sm h-full">
              <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-600 text-xs font-semibold px-3 py-1 rounded-full mb-6">
                <Users size={11} /> For Candidates
              </span>
              <h3 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
                Let your profile<br />speak for itself
              </h3>
              <ul className="space-y-3 mb-8">
                {[
                  "Upload your CV once, apply everywhere",
                  "AI-generated match scores and reasoning",
                  "Works with Unicorn profiles and external uploads",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-gray-600">
                    <Check size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/auth"
                className="inline-flex items-center gap-2 border border-gray-300 hover:border-gray-400 text-gray-700 font-semibold px-5 py-2.5 rounded-full text-sm transition-colors"
              >
                Create Profile <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>

        {/* ── Stats + CTA + Footer ── */}
        <div className="relative">
          <SplineBottom />
          <div className="absolute inset-0 bg-[#0A0A0F]/60 z-[1]" />

          {/* Stats */}
          <section className="relative z-[2] py-24">
            <div className="max-w-7xl mx-auto px-6">
              <div className="grid grid-cols-3 divide-x divide-white/10">
                {[
                  { value: "10,000+", label: "Candidates screened" },
                  { value: "500+", label: "Companies hiring" },
                  { value: "30 sec", label: "Average screen time" },
                ].map((stat) => (
                  <div key={stat.label} className="px-8 text-center">
                    <p className="text-4xl font-bold text-white mb-2">{stat.value}</p>
                    <p className="text-gray-400 text-sm">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="relative z-[2] pb-24 px-6">
            <div className="max-w-3xl mx-auto bg-blue-600 border border-blue-500/30 rounded-3xl p-14 text-center">
              <span className="inline-flex items-center gap-1.5 bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full mb-6">
                <Zap size={11} /> Available today
              </span>
              <h2 className="text-4xl font-bold text-white mb-4">Ready to hire smarter?</h2>
              <p className="text-blue-100 text-lg mb-8 max-w-md mx-auto">
                Join hundreds of companies already using Rankr to find the best talent faster.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/dashboard"
                  className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-6 py-3 rounded-full text-sm transition-colors flex items-center gap-2"
                >
                  Post a Job <ArrowRight size={14} />
                </Link>
                <Link href="/auth" className="text-white/80 hover:text-white text-sm transition-colors">
                  View Demo
                </Link>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="relative z-[2] border-t border-white/5 py-10 px-6">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
                  <span className="text-white text-xs font-bold">R</span>
                </div>
                <span className="text-white font-bold">Rankr</span>
              </div>
              <div className="flex gap-6 text-sm text-gray-500">
                {["Privacy", "Terms", "Contact", "Blog"].map((l) => (
                  <a key={l} href="#" className="hover:text-gray-300 transition-colors">{l}</a>
                ))}
              </div>
              <div className="flex gap-4 text-xs font-medium text-gray-500">
                {["X", "LinkedIn", "GitHub"].map((name) => (
                  <a key={name} href="#" className="hover:text-gray-300 transition-colors">{name}</a>
                ))}
              </div>
            </div>
            <p className="text-center text-gray-600 text-xs mt-6">© 2026 Rankr. All rights reserved.</p>
          </footer>
        </div>
      </div>
    </>
  );
}
