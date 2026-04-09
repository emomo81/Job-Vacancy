'use client'

import React, { useState, useEffect } from 'react'
import { Poppins } from 'next/font/google'
import { Bell, Sparkles, User, Check, ChevronRight, Pencil, Zap } from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-poppins',
})

const NAV_LINKS = ['Jobs', 'Candidates', 'Shortlists', 'Settings']

const STEPS = [
  { label: 'Create Job', status: 'done' },
  { label: 'Add Candidates', status: 'done' },
  { label: 'AI Screening', status: 'active' },
]

const CHECKLIST = [
  { label: 'Job requirements defined' },
  { label: '12 Umurava profiles loaded' },
  { label: '22 external applicants loaded' },
]

export default function RankrScreening() {
  const [activeNav, setActiveNav] = useState('Candidates')
  const [screening, setScreening] = useState(false)
  const [progress, setProgress] = useState(0)
  const [completed, setCompleted] = useState(0)

  useEffect(() => {
    if (!screening) {
      setProgress(0)
      setCompleted(0)
      return
    }
    const total = 34
    const duration = 4000
    const interval = 60
    const steps = duration / interval
    let step = 0
    const timer = setInterval(() => {
      step++
      const pct = Math.min((step / steps) * 100, 100)
      setProgress(pct)
      setCompleted(Math.floor((pct / 100) * total))
      if (step >= steps) clearInterval(timer)
    }, interval)
    return () => clearInterval(timer)
  }, [screening])

  return (
    <div className={`${poppins.className} min-h-screen bg-[#f0f5fa]`}>

      {/* Navbar + Hero */}
      <div className="bg-[#070707]">

        {/* Navbar */}
        <header className="max-w-[1280px] mx-auto px-6 flex items-center justify-between h-16">
          <Link href="/dashboard" className="flex items-center gap-2 select-none">
            <div className="w-8 h-8 rounded-lg bg-[#2a85ff] flex items-center justify-center">
              <Sparkles size={17} color="white" strokeWidth={2.2} />
            </div>
            <span className="text-white text-xl font-bold tracking-tight">Rankr</span>
          </Link>

          <nav className="flex items-center gap-8">
            {NAV_LINKS.map(link => (
              <button
                key={link}
                onClick={() => setActiveNav(link)}
                className={`text-sm font-medium pb-1 transition-colors cursor-pointer ${
                  activeNav === link
                    ? 'text-white border-b-2 border-[#2a85ff]'
                    : 'text-white/50 hover:text-white/80 border-b-2 border-transparent'
                }`}
              >
                {link}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <button className="relative text-white/60 hover:text-white transition-colors cursor-pointer">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#2a85ff] rounded-full" />
            </button>
            <div className="flex items-center gap-2 cursor-pointer group">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2a85ff] to-[#6eb3ff] flex items-center justify-center">
                <User size={15} color="white" strokeWidth={2} />
              </div>
              <span className="text-white/80 text-sm font-medium group-hover:text-white transition-colors">Recruiter name</span>
            </div>
          </div>
        </header>

        {/* Hero Banner */}
        <div className="relative overflow-hidden" style={{ minHeight: 180 }}>
          <div className="max-w-[1280px] mx-auto px-6 py-10 relative z-10">
            <h1 className="text-white font-extrabold text-5xl lg:text-6xl leading-[1.08] tracking-tight mb-4">
              AI Screening<br />in Progress{' '}
              <span className="text-[#2a85ff]">✦</span>
            </h1>
            <p className="text-white/50 text-base font-normal">
              Gemini is analysing your candidates
            </p>
          </div>
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#2a85ff]/5 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-64 h-64 rounded-full bg-[#2a85ff]/5 blur-3xl pointer-events-none" />

          {/* Decorative dots grid */}
          <div className="absolute right-16 top-1/2 -translate-y-1/2 grid grid-cols-6 gap-3 opacity-10 pointer-events-none">
            {Array.from({ length: 30 }).map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#2a85ff]" />
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-[860px] mx-auto px-6 py-10">

        {/* Breadcrumb */}
        <div className="flex items-center gap-0 mb-10">
          {STEPS.map((step, i) => (
            <React.Fragment key={step.label}>
              <div className="flex items-center gap-2.5">
                {step.status === 'done' ? (
                  <div className="w-7 h-7 rounded-full bg-[#2a85ff] flex items-center justify-center flex-shrink-0">
                    <Check size={14} color="white" strokeWidth={3} />
                  </div>
                ) : step.status === 'active' ? (
                  <div className="w-7 h-7 rounded-full bg-[#2a85ff] flex items-center justify-center flex-shrink-0 ring-4 ring-[#2a85ff]/20">
                    <div className="w-2.5 h-2.5 rounded-full bg-white" />
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-full border-2 border-[#c8d6e5] flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-[#c8d6e5]" />
                  </div>
                )}
                <span className={`text-sm font-semibold whitespace-nowrap ${
                  step.status === 'inactive' ? 'text-[#b0bac6]' : 'text-[#070707]'
                }`}>
                  {step.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="flex-1 h-px mx-4 min-w-[40px] bg-[#2a85ff]" />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Job Summary Card */}
        <div className="bg-white rounded-2xl shadow-[0_4px_32px_rgba(0,0,0,0.07)] px-7 py-5 mb-5 flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h2 className="text-[#070707] font-extrabold text-xl tracking-tight">Senior Backend Engineer</h2>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#f0e8ff] text-[#7c3aed] border border-[#7c3aed]/20">Expert</span>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#e6f9f0] text-[#16a34a] border border-[#16a34a]/20">Full-Time</span>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#fff3e8] text-[#f07830] border border-[#f07830]/20">Remote</span>
              </div>
            </div>
            <div className="flex items-center gap-5">
              <span className="text-sm text-[#8a9ab0] font-medium flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#b0bac6]" />
                34 Candidates
              </span>
              <span className="text-sm text-[#8a9ab0] font-medium flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#2a85ff]" />
                Screening Top 20
              </span>
            </div>
          </div>
          <Link
            href="/dashboard"
            className="flex-shrink-0 flex items-center gap-1.5 text-sm font-semibold text-[#5a6a7a] border border-[#e2eaf2] hover:border-[#2a85ff]/40 hover:text-[#2a85ff] transition-all cursor-pointer px-4 py-2 rounded-full bg-white"
          >
            <Pencil size={13} strokeWidth={2} />
            Edit Job
          </Link>
        </div>

        {/* Pre-screening Checklist Card */}
        <div className="bg-white rounded-2xl shadow-[0_4px_32px_rgba(0,0,0,0.07)] px-7 py-6 mb-8">
          <h3 className="text-[#070707] font-bold text-lg mb-4">Ready to Screen</h3>
          <div className="flex flex-col gap-3">
            {CHECKLIST.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#e6f9f0] flex items-center justify-center flex-shrink-0">
                  <Check size={13} color="#16a34a" strokeWidth={3} />
                </div>
                <span className="text-sm font-medium text-[#3a4a5a]">{item.label}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 pt-4 border-t border-[#f0f5fa]">
            <p className="text-sm text-[#8a9ab0]">
              <span className="font-bold text-[#070707]">34 candidates</span> will be evaluated
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-white rounded-2xl shadow-[0_4px_32px_rgba(0,0,0,0.07)] px-8 py-12 flex flex-col items-center text-center relative overflow-hidden">

          {/* Background glow */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#2a85ff]/5 rounded-full blur-3xl" />
          </div>

          <AnimatePresence mode="wait">
            {!screening ? (
              <motion.div
                key="idle"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center gap-6 w-full relative z-10"
              >
                {/* Animated AI Icon */}
                <div className="relative w-24 h-24">
                  <motion.div
                    className="absolute inset-0 rounded-full bg-[#2a85ff]/10"
                    animate={{ scale: [1, 1.18, 1] }}
                    transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                  />
                  <motion.div
                    className="absolute inset-2 rounded-full bg-[#2a85ff]/15"
                    animate={{ scale: [1, 1.12, 1] }}
                    transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut', delay: 0.2 }}
                  />
                  <div className="absolute inset-4 rounded-full bg-[#2a85ff] flex items-center justify-center shadow-[0_8px_32px_rgba(42,133,255,0.45)]">
                    <motion.div
                      animate={{ rotate: [0, 15, -15, 0] }}
                      transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                    >
                      <Sparkles size={28} color="white" strokeWidth={2} />
                    </motion.div>
                  </div>
                  {/* Orbiting dots */}
                  {[0, 60, 120, 180, 240, 300].map((deg, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 rounded-full bg-[#2a85ff]"
                      style={{
                        top: '50%',
                        left: '50%',
                        marginTop: -4,
                        marginLeft: -4,
                        transformOrigin: '4px 4px',
                      }}
                      animate={{ rotate: [deg, deg + 360] }}
                      transition={{ repeat: Infinity, duration: 4 + i * 0.3, ease: 'linear' }}
                      initial={false}
                    >
                      <motion.div
                        className="w-2 h-2 rounded-full bg-[#2a85ff]"
                        style={{ transform: `translate(42px, 0px)` }}
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.25 }}
                      />
                    </motion.div>
                  ))}
                </div>

                <div>
                  <h2 className="text-[#070707] font-extrabold text-3xl mb-3 tracking-tight">
                    Start AI Screening
                  </h2>
                  <p className="text-[#8a9ab0] text-sm leading-relaxed max-w-md">
                    Gemini will score, rank, and explain every candidate against your job requirements.
                    This takes about <span className="font-semibold text-[#5a6a7a]">15–30 seconds</span>.
                  </p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setScreening(true)}
                  className="px-10 py-4 rounded-full text-base font-bold text-white bg-[#2a85ff] hover:bg-[#1a75ef] shadow-[0_6px_28_rgba(42,133,255,0.45)] hover:shadow-[0_8px_36_rgba(42,133,255,0.6)] transition-all cursor-pointer flex items-center gap-3"
                >
                  <Sparkles size={18} strokeWidth={2.2} />
                  Screen All Candidates Now
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                key="loading"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center gap-6 w-full relative z-10"
              >
                {/* Pulsing glow */}
                <motion.div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-40 rounded-full bg-[#2a85ff]/10 blur-2xl"
                  animate={{ opacity: [0.5, 1, 0.5], scale: [0.95, 1.08, 0.95] }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                />

                {/* Animated spinner icon */}
                <div className="relative w-20 h-20 flex-shrink-0">
                  <div className="absolute inset-0 rounded-full bg-[#2a85ff]/10" />
                  <motion.div
                    className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#2a85ff]"
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1.1, ease: 'linear' }}
                  />
                  <motion.div
                    className="absolute inset-3 rounded-full border-4 border-transparent border-t-[#2a85ff]/40"
                    animate={{ rotate: -360 }}
                    transition={{ repeat: Infinity, duration: 1.8, ease: 'linear' }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Zap size={22} color="#2a85ff" strokeWidth={2.2} />
                  </div>
                </div>

                <div className="w-full max-w-md">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-[#070707]">Analysing 34 candidates...</span>
                    <span className="text-sm font-bold text-[#2a85ff]">{completed} complete</span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-3 bg-[#e8f1ff] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-[#2a85ff] to-[#6eb3ff]"
                      style={{ width: `${progress}%` }}
                      transition={{ ease: 'linear' }}
                    />
                  </div>

                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-xs text-[#b0bac6]">{Math.round(progress)}%</span>
                    <span className="text-xs text-[#b0bac6]">34 total</span>
                  </div>
                </div>

                <p className="text-[#8a9ab0] text-sm leading-relaxed max-w-sm text-center">
                  Gemini is evaluating skills, experience, and role fit for each applicant
                </p>

                {/* Subtle animated candidate pills */}
                <div className="flex flex-wrap justify-center gap-2 max-w-sm">
                  {['Amara O.', 'Lena M.', 'James P.', 'Sara K.', 'David R.', 'Yuki T.'].map((name, i) => (
                    <motion.span
                      key={name}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ repeat: Infinity, duration: 2, delay: i * 0.35 }}
                      className="text-xs font-semibold text-[#2a85ff] bg-[#e8f1ff] px-3 py-1.5 rounded-full"
                    >
                      {name}
                    </motion.span>
                  ))}
                </div>

                <div className="flex flex-col items-center gap-3">
                  {progress >= 100 && (
                    <Link
                      href="/results"
                      className="px-8 py-3 rounded-full text-sm font-bold text-white bg-[#16a34a] hover:bg-[#15803d] shadow-[0_4px_16px_rgba(22,163,74,0.4)] transition-all cursor-pointer flex items-center gap-2"
                    >
                      View Shortlist Results →
                    </Link>
                  )}
                  <button
                    onClick={() => setScreening(false)}
                    className="text-xs text-[#b0bac6] hover:text-[#5a6a7a] transition-colors cursor-pointer underline"
                  >
                    Cancel screening
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Back link */}
        <div className="mt-8 flex items-center">
          <Link
            href="/candidates"
            className="px-6 py-2.5 rounded-full text-sm font-semibold text-[#5a6a7a] border border-[#e2eaf2] hover:border-[#2a85ff]/40 hover:text-[#2a85ff] transition-all cursor-pointer bg-white inline-flex items-center gap-2"
          >
            ← Back to Candidates
          </Link>
        </div>
      </main>
    </div>
  )
}
