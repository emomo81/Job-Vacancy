'use client'

import React, { useState, useEffect } from 'react'
import { Sparkles, Check, Zap, Pencil, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'
import Navbar from '../components/Navbar'

const STEPS = [
  { label: 'Create Job', status: 'done' },
  { label: 'Add Candidates', status: 'done' },
  { label: 'AI Screening', status: 'active' },
]

const CHECKLIST = [
  { label: 'Job requirements defined' },
  { label: '12 Rankr profiles loaded' },
  { label: '22 external applicants loaded' },
]

export default function RankrScreening() {
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
    <div className="min-h-screen bg-[#f0f5fa]">
      <Navbar type="app" activeNav="Candidates" />

      {/* Hero Banner */}
      <div className="bg-[#070707] pt-28 sm:pt-36 lg:pt-40 pb-12 sm:pb-20 relative overflow-hidden">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 relative z-10">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-white font-extrabold text-4xl sm:text-6xl lg:text-7xl leading-[1.08] tracking-tight mb-4 text-center sm:text-left">
              AI Screening<br className="hidden sm:block" />in Progress{' '}
              <span className="text-[#2a85ff]">✦</span>
            </h1>
            <p className="text-white/50 text-sm sm:text-base font-normal text-center sm:text-left">
              Gemini is analysing your candidates in real-time
            </p>
          </motion.div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#2a85ff]/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 rounded-full bg-[#2a85ff]/5 blur-3xl pointer-events-none" />
      </div>

      <main className="max-w-[860px] mx-auto px-4 sm:px-6 py-10 lg:py-16">

        {/* Breadcrumb Steps (Responsive) */}
        <div className="flex items-center gap-2 sm:gap-4 mb-10 sm:mb-16 overflow-x-auto no-scrollbar pb-2">
          {STEPS.map((step, i) => (
            <React.Fragment key={step.label}>
              <div className="flex items-center gap-2.5 flex-shrink-0">
                {step.status === 'done' ? (
                  <div className="w-8 h-8 rounded-full bg-[#2a85ff] flex items-center justify-center">
                    <Check size={14} color="white" strokeWidth={3} />
                  </div>
                ) : step.status === 'active' ? (
                  <div className="w-8 h-8 rounded-full bg-[#2a85ff] flex items-center justify-center ring-4 ring-[#2a85ff]/20">
                    <div className="w-2.5 h-2.5 rounded-full bg-white" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full border-2 border-[#c8d6e5] flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-[#c8d6e5]" />
                  </div>
                )}
                <span className={`text-xs sm:text-sm font-bold whitespace-nowrap ${
                  step.status === 'inactive' ? 'text-[#b0bac6]' : 'text-[#070707]'
                }`}>
                  {step.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="h-px w-8 sm:w-16 bg-[#2a85ff]" />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Job Summary Card */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-[#e2eaf2] p-5 sm:p-7 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <h2 className="text-[#070707] font-extrabold text-xl sm:text-2xl tracking-tight">Senior Backend Engineer</h2>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-[#e6f9f0] text-[#16a34a] border border-[#16a34a]/10">Expert</span>
                <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-[#e8f1ff] text-[#2a85ff] border border-[#2a85ff]/10">Remote</span>
              </div>
            </div>
            <div className="flex items-center gap-5 text-[#8a9ab0] text-sm">
              <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[#b0bac6]" /> 34 Candidates</span>
              <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[#2a85ff]" /> AI Screening active</span>
            </div>
          </div>
          <Link
            href="/dashboard"
            className="w-full sm:w-auto flex items-center justify-center gap-2 h-11 px-5 rounded-xl border border-[#e2eaf2] text-[#5a6a7a] font-bold text-sm hover:border-[#2a85ff] hover:text-[#2a85ff] transition-all bg-[#fcfdfe]"
          >
            <Pencil size={14} />
            Edit Profile
          </Link>
        </div>

        {/* CTA Area */}
        <div className="bg-white rounded-[2rem] sm:rounded-[3rem] shadow-xl border border-white p-6 sm:p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(42,133,255,0.05),transparent)] pointer-events-none" />
          
          <AnimatePresence mode="wait">
            {!screening ? (
              <motion.div
                key="idle"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                className="relative z-10 flex flex-col items-center gap-8"
              >
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-[2rem] bg-[#2a85ff] shadow-[0_20px_60px_rgba(42,133,255,0.4)] flex items-center justify-center relative">
                  <Sparkles size={40} className="sm:size-56" color="white" />
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
                    className="absolute inset-0 rounded-full border-2 border-dashed border-white/20 scale-125"
                  />
                </div>
                <div>
                  <h2 className="text-[#070707] text-2xl sm:text-4xl font-black mb-3">Begin AI Assessment</h2>
                  <p className="text-[#8a9ab0] text-sm sm:text-base max-w-md mx-auto leading-relaxed italic">
                    "Ranking each candidate by technical fit and experience, while providing detailed reasoning."
                  </p>
                </div>
                <button
                  onClick={() => setScreening(true)}
                  className="w-full sm:w-auto px-12 py-5 rounded-full bg-[#2a85ff] text-white font-black text-lg shadow-2xl hover:scale-105 transition-all"
                >
                  Start Screening
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative z-10 flex flex-col items-center gap-10"
              >
                <div className="relative w-20 h-20 sm:w-24 sm:h-24">
                   <motion.div
                    className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#2a85ff]"
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Zap size={32} color="#2a85ff" fill="#2a85ff" className="opacity-20" />
                  </div>
                </div>

                <div className="w-full max-w-md bg-[#fcfdfe] border border-[#e2eaf2] rounded-3xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-bold text-[#070707]">Analysing 34 Candidates</span>
                    <span className="text-sm font-black text-[#2a85ff]">{Math.round(progress)}%</span>
                  </div>
                  <div className="h-3 bg-[#f0f5fa] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-[#2a85ff]"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {['Amara O.', 'Lena M.', 'James P.', 'Sara K.'].map((n, i) => (
                      <motion.div 
                        key={n}
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.3 }}
                        className="text-[10px] font-bold text-[#2a85ff] bg-[#e8f1ff] px-2.5 py-1 rounded-lg"
                      >
                        Evaluating {n}
                      </motion.div>
                    ))}
                  </div>
                </div>

                {progress >= 100 && (
                  <Link
                    href="/results"
                    className="px-10 py-5 rounded-full bg-[#16a34a] text-white font-black text-lg shadow-2xl animate-bounce"
                  >
                    View Top Talent Results
                  </Link>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-12 flex items-center justify-between">
           <Link href="/candidates" className="flex items-center gap-2 text-[#8a9ab0] font-bold hover:text-[#070707] transition-all">
             <ArrowLeft size={18} />
             Add More Candidates
           </Link>
        </div>
      </main>
    </div>
  )
}
