'use client'

import React, { useState } from 'react'
import { Poppins } from 'next/font/google'
import { Sparkles, Briefcase, Users, Star, CheckCircle, ArrowRight, Upload, Building2, User, Clock } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'motion/react'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-poppins',
})

const NAV_LINKS = ['How it Works', 'For Companies', 'For Candidates']

const STEPS = [
  {
    icon: <Briefcase size={28} color="#2a85ff" strokeWidth={2} />,
    title: 'Post a Job',
    desc: 'Define the role, skills, and experience you need in minutes.',
    num: '01',
  },
  {
    icon: <Upload size={28} color="#2a85ff" strokeWidth={2} />,
    title: 'Add Candidates',
    desc: 'Import Umurava profiles or upload CVs and spreadsheets directly.',
    num: '02',
  },
  {
    icon: <Star size={28} color="#2a85ff" strokeWidth={2} />,
    title: 'Get Your Shortlist',
    desc: 'Gemini AI scores, ranks, and explains every candidate instantly.',
    num: '03',
  },
]

const COMPANY_BULLETS = [
  'AI ranks candidates by match score',
  'Clear reasoning for every shortlisted candidate',
  'Import from Umurava or upload your own CVs',
]

const CANDIDATE_BULLETS = [
  'Upload your CV once',
  'Get matched to relevant roles automatically',
  'See where you rank and why',
]

const STATS = [
  { value: '10,000+', label: 'Candidates Screened', icon: <Users size={20} color="#2a85ff" strokeWidth={2} /> },
  { value: '500+', label: 'Jobs Posted', icon: <Briefcase size={20} color="#2a85ff" strokeWidth={2} /> },
  { value: '30 sec', label: 'Average Screening Time', icon: <Clock size={20} color="#2a85ff" strokeWidth={2} /> },
]

export default function RankrLanding() {
  const [activeNav, setActiveNav] = useState('')

  return (
    <div className={`${poppins.className} min-h-screen bg-[#f0f5fa]`}>

      {/* ── NAVBAR ── */}
      <header className="bg-[#070707] sticky top-0 z-50">
        <div className="max-w-[1280px] mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 select-none">
            <div className="w-8 h-8 rounded-lg bg-[#2a85ff] flex items-center justify-center flex-shrink-0">
              <Sparkles size={17} color="white" strokeWidth={2.2} />
            </div>
            <span className="text-white text-xl font-bold tracking-tight">Rankr</span>
          </Link>

          {/* Center nav */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(link => (
              <button
                key={link}
                onClick={() => setActiveNav(link)}
                className={`text-sm font-medium pb-1 transition-colors cursor-pointer ${
                  activeNav === link
                    ? 'text-white border-b-2 border-[#2a85ff]'
                    : 'text-white/55 hover:text-white/85 border-b-2 border-transparent'
                }`}
              >
                {link}
              </button>
            ))}
          </nav>

          {/* Right CTAs */}
          <div className="flex items-center gap-3">
            <Link href="/auth" className="hidden sm:inline-flex px-5 py-2 rounded-full text-sm font-semibold text-white border border-white/30 hover:border-white/60 hover:bg-white/5 transition-all cursor-pointer">
              Sign In
            </Link>
            <Link href="/auth" className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-semibold text-white bg-[#2a85ff] hover:bg-[#1a75ef] shadow-[0_4px_16px_rgba(42,133,255,0.4)] hover:shadow-[0_4px_20px_rgba(42,133,255,0.55)] transition-all cursor-pointer">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="bg-[#070707] relative overflow-hidden">
        {/* Ambient glows */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-[#2a85ff]/6 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full bg-[#2a85ff]/4 blur-[100px] pointer-events-none" />

        <div className="max-w-[1280px] mx-auto px-6 pt-20 pb-24 flex items-center gap-12 relative z-10">

          {/* Left */}
          <div className="flex-1 min-w-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-[#2a85ff]/15 border border-[#2a85ff]/30 text-[#6eb3ff] text-xs font-bold px-4 py-1.5 rounded-full mb-7 tracking-wide">
                <Sparkles size={12} strokeWidth={2.5} />
                AI-Powered Screening
              </div>

              {/* Headline */}
              <h1 className="text-white font-extrabold text-6xl lg:text-7xl leading-[1.04] tracking-tight mb-6">
                Hire Smarter.<br />
                <span className="text-[#2a85ff]">Screen Faster.</span>
              </h1>

              {/* Subtitle */}
              <p className="text-white/50 text-base lg:text-lg leading-relaxed max-w-[520px] mb-10">
                Rankr uses Gemini AI to screen hundreds of candidates in seconds — scoring, ranking, and explaining every decision so recruiters can focus on people, not paperwork.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4">
                <Link href="/dashboard" className="flex items-center gap-2 px-8 py-3.5 rounded-full text-base font-bold text-white bg-[#2a85ff] hover:bg-[#1a75ef] shadow-[0_6px_28px_rgba(42,133,255,0.45)] hover:shadow-[0_8px_36px_rgba(42,133,255,0.6)] transition-all cursor-pointer">
                  Post a Job
                  <ArrowRight size={17} strokeWidth={2.5} />
                </Link>
                <Link href="/profile" className="flex items-center gap-2 px-8 py-3.5 rounded-full text-base font-semibold text-white border border-white/25 hover:border-white/50 hover:bg-white/5 transition-all cursor-pointer">
                  <Upload size={15} strokeWidth={2} />
                  Upload Your CV
                </Link>
              </div>

              {/* Social proof strip */}
              <div className="flex items-center gap-5 mt-10">
                <div className="flex -space-x-2.5">
                  {['#4f7ef7', '#6eb3ff', '#2a85ff', '#1a65df', '#92c4ff'].map((c, i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-[#070707] flex items-center justify-center flex-shrink-0" style={{ background: `linear-gradient(135deg, ${c}, ${c}aa)` }}>
                      <User size={13} color="white" strokeWidth={2} />
                    </div>
                  ))}
                </div>
                <p className="text-white/40 text-sm">
                  <span className="text-white/70 font-semibold">10,000+</span> candidates screened this month
                </p>
              </div>
            </motion.div>
          </div>

          {/* Right: decorative visual */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.65, delay: 0.15 }}
            className="hidden lg:flex flex-col gap-4 flex-shrink-0 w-[340px]"
          >
            {/* Candidate score cards preview */}
            {[
              { name: 'Amara Osei', role: 'Senior Backend Eng.', score: 94, rec: 'Hire', recColor: 'text-[#4ade80] bg-[#4ade80]/10 border-[#4ade80]/25', initials: 'AO', pct: 94 },
              { name: 'Lena Müller', role: 'Full Stack Developer', score: 88, rec: 'Hire', recColor: 'text-[#4ade80] bg-[#4ade80]/10 border-[#4ade80]/25', initials: 'LM', pct: 88 },
              { name: 'James Park', role: 'Backend Engineer', score: 79, rec: 'Consider', recColor: 'text-[#fbbf24] bg-[#fbbf24]/10 border-[#fbbf24]/25', initials: 'JP', pct: 79 },
            ].map((c, i) => (
              <motion.div
                key={c.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.12 }}
                className="bg-white/8 border border-white/10 rounded-2xl px-4 py-4 backdrop-blur-sm flex items-center gap-4"
                style={{ transform: i === 1 ? 'translateX(24px)' : i === 2 ? 'translateX(12px)' : undefined }}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2a85ff] to-[#6eb3ff] flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">{c.initials}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-bold leading-tight truncate">{c.name}</p>
                  <p className="text-white/40 text-xs truncate mt-0.5">{c.role}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-[#2a85ff] to-[#6eb3ff]"
                        initial={{ width: 0 }}
                        animate={{ width: `${c.pct}%` }}
                        transition={{ duration: 1, delay: 0.6 + i * 0.12 }}
                      />
                    </div>
                    <span className="text-[#6eb3ff] text-xs font-extrabold">{c.score}</span>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border flex-shrink-0 ${c.recColor}`}>
                  {c.rec}
                </span>
              </motion.div>
            ))}

            {/* AI chip */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.75 }}
              className="flex items-center gap-3 bg-[#2a85ff]/15 border border-[#2a85ff]/30 rounded-xl px-4 py-3 ml-4"
            >
              <div className="w-7 h-7 rounded-full bg-[#2a85ff] flex items-center justify-center flex-shrink-0">
                <Sparkles size={13} color="white" strokeWidth={2.2} />
              </div>
              <div>
                <p className="text-[#6eb3ff] text-xs font-bold">Gemini AI</p>
                <p className="text-white/50 text-[10px]">Screening 34 candidates...</p>
              </div>
              <motion.div
                className="w-2 h-2 rounded-full bg-[#4ade80] ml-auto flex-shrink-0"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ repeat: Infinity, duration: 1.4 }}
              />
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom fade into content area */}
        <div className="h-12 bg-gradient-to-b from-[#070707] to-[#f0f5fa]" />
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="bg-[#f0f5fa] py-20">
        <div className="max-w-[1280px] mx-auto px-6">

          {/* Section header */}
          <div className="text-center mb-14">
            <span className="text-[#2a85ff] text-xs font-bold uppercase tracking-[0.18em] mb-4 block">How It Works</span>
            <h2 className="text-[#070707] font-extrabold text-4xl lg:text-5xl tracking-tight leading-tight">
              Three steps to your<br />perfect shortlist
            </h2>
          </div>

          {/* Step cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white rounded-2xl shadow-[0_4px_32px_rgba(0,0,0,0.07)] p-8 flex flex-col gap-5 hover:shadow-[0_8px_40px_rgba(42,133,255,0.1)] hover:-translate-y-1 transition-all"
              >
                {/* Step number + icon row */}
                <div className="flex items-start justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-[#e8f1ff] flex items-center justify-center">
                    {step.icon}
                  </div>
                  <span className="text-[#e8f1ff] font-extrabold text-5xl leading-none select-none">{step.num}</span>
                </div>
                <div>
                  <h3 className="text-[#070707] font-extrabold text-xl mb-2">{step.title}</h3>
                  <p className="text-[#8a9ab0] text-sm leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AUDIENCE SECTIONS ── */}
      <section className="bg-[#f0f5fa] py-6 pb-20">
        <div className="max-w-[1280px] mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* For Companies */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-[0_4px_32px_rgba(0,0,0,0.07)] p-10 flex flex-col gap-6"
          >
            <div>
              <span className="inline-flex items-center gap-1.5 bg-[#e8f1ff] text-[#2a85ff] text-xs font-bold px-4 py-1.5 rounded-full mb-6">
                <Building2 size={12} strokeWidth={2.5} />
                Recruiters
              </span>
              <h3 className="text-[#070707] font-extrabold text-3xl leading-tight tracking-tight mb-5">
                Screen 100 candidates<br />in 30 seconds
              </h3>
            </div>

            <ul className="flex flex-col gap-4">
              {COMPANY_BULLETS.map((b, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#e8f1ff] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle size={12} color="#2a85ff" strokeWidth={2.5} />
                  </div>
                  <span className="text-[#5a6a7a] text-sm leading-relaxed">{b}</span>
                </li>
              ))}
            </ul>

            <div className="pt-2">
              <Link href="/dashboard" className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-sm font-bold text-white bg-[#2a85ff] hover:bg-[#1a75ef] shadow-[0_4px_16px_rgba(42,133,255,0.35)] hover:shadow-[0_4px_20px_rgba(42,133,255,0.5)] transition-all cursor-pointer">
                Post a Job
                <ArrowRight size={15} strokeWidth={2.5} />
              </Link>
            </div>
          </motion.div>

          {/* For Candidates */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-2xl shadow-[0_4px_32px_rgba(0,0,0,0.07)] p-10 flex flex-col gap-6 relative overflow-hidden"
          >
            {/* Subtle purple tint decoration */}
            <div className="absolute top-0 right-0 w-56 h-56 rounded-full bg-[#7c3aed]/4 blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <span className="inline-flex items-center gap-1.5 bg-[#f0e8ff] text-[#7c3aed] text-xs font-bold px-4 py-1.5 rounded-full mb-6">
                <User size={12} strokeWidth={2.5} />
                Job Seekers
              </span>
              <h3 className="text-[#070707] font-extrabold text-3xl leading-tight tracking-tight mb-5">
                Let your profile<br />speak for itself
              </h3>
            </div>

            <ul className="flex flex-col gap-4 relative z-10">
              {CANDIDATE_BULLETS.map((b, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#f0e8ff] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle size={12} color="#7c3aed" strokeWidth={2.5} />
                  </div>
                  <span className="text-[#5a6a7a] text-sm leading-relaxed">{b}</span>
                </li>
              ))}
            </ul>

            <div className="pt-2 relative z-10">
              <Link href="/profile" className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-sm font-bold text-[#070707] bg-white border-2 border-[#070707] hover:bg-[#070707] hover:text-white transition-all cursor-pointer">
                Create Profile
                <ArrowRight size={15} strokeWidth={2.5} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="bg-[#070707] py-16 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-80 h-48 rounded-full bg-[#2a85ff]/6 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-48 rounded-full bg-[#2a85ff]/4 blur-3xl" />
        </div>
        <div className="max-w-[1280px] mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-0 md:divide-x md:divide-white/10">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.1 }}
                className="flex flex-col items-center text-center px-8 gap-2"
              >
                <div className="w-10 h-10 rounded-full bg-[#2a85ff]/15 border border-[#2a85ff]/25 flex items-center justify-center mb-2">
                  {stat.icon}
                </div>
                <span className="text-white font-extrabold text-4xl tracking-tight">{stat.value}</span>
                <span className="text-white/45 text-sm font-medium">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BAND ── */}
      <section className="bg-[#f0f5fa] py-20">
        <div className="max-w-[860px] mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-[#070707] rounded-3xl px-8 py-14 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#2a85ff]/8 blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-[#2a85ff]/5 blur-3xl pointer-events-none" />
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 bg-[#2a85ff]/15 border border-[#2a85ff]/30 text-[#6eb3ff] text-xs font-bold px-4 py-1.5 rounded-full mb-6 tracking-wide">
                  <Sparkles size={11} strokeWidth={2.5} />
                  Start for free today
                </div>
                <h2 className="text-white font-extrabold text-4xl lg:text-5xl tracking-tight leading-tight mb-4">
                  Ready to hire smarter?
                </h2>
                <p className="text-white/45 text-base leading-relaxed mb-10 max-w-md mx-auto">
                  Join thousands of recruiters saving hours every week with AI-powered screening.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <Link href="/dashboard" className="flex items-center gap-2 px-8 py-3.5 rounded-full text-base font-bold text-white bg-[#2a85ff] hover:bg-[#1a75ef] shadow-[0_6px_28px_rgba(42,133,255,0.45)] hover:shadow-[0_8px_36px_rgba(42,133,255,0.6)] transition-all cursor-pointer">
                    Post a Job Now
                    <ArrowRight size={17} strokeWidth={2.5} />
                  </Link>
                  <Link href="/auth" className="flex items-center gap-2 px-8 py-3.5 rounded-full text-base font-semibold text-white border border-white/25 hover:border-white/50 hover:bg-white/5 transition-all cursor-pointer">
                    View Demo
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#070707] py-10 border-t border-white/8">
        <div className="max-w-[1280px] mx-auto px-6 flex flex-wrap items-center justify-between gap-5">
          {/* Wordmark */}
          <div className="flex items-center gap-2 select-none">
            <div className="w-7 h-7 rounded-lg bg-[#2a85ff] flex items-center justify-center">
              <Sparkles size={14} color="white" strokeWidth={2.2} />
            </div>
            <span className="text-white text-lg font-bold tracking-tight">Rankr</span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-5">
            {['Privacy', 'Terms', 'Contact'].map((link, i, arr) => (
              <React.Fragment key={link}>
                <button className="text-white/40 text-sm hover:text-white/70 transition-colors cursor-pointer">{link}</button>
                {i < arr.length - 1 && <span className="text-white/15 text-sm">·</span>}
              </React.Fragment>
            ))}
          </div>

          {/* Powered by */}
          <div className="flex items-center gap-2">
            <span className="text-white/30 text-xs">Powered by</span>
            <span className="text-white/50 text-xs font-semibold tracking-wide">Gemini AI</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
