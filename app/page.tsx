'use client'

import React from 'react'
import { Sparkles, ChevronRight, Play, Globe, Shield, Zap, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'motion/react'
import Navbar from './components/Navbar'

const STATS = [
  { label: 'Screening Time', value: '2s', sub: 'per candidate' },
  { label: 'Accuracy Rate', value: '98%', sub: 'AI evaluation' },
  { label: 'Cost Savings', value: '85%', sub: 'vs manual' },
]

export default function RankrLanding() {
  return (
    <div className="min-h-screen bg-[#070707] selection:bg-[#2a85ff]/30 selection:text-[#2a85ff]">
      <Navbar type="landing" />

      <main>
        {/* HERO SECTION */}
        <section className="relative pt-32 pb-20 sm:pt-48 sm:pb-40 overflow-hidden">
          {/* Background effects */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1400px] h-full pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#2a85ff]/10 blur-[120px]" />
            <div className="absolute bottom-[20%] right-[-5%] w-[40%] h-[40%] rounded-full bg-[#2a85ff]/5 blur-[100px]" />
          </div>

          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 sm:mb-10 backdrop-blur-sm">
                <Sparkles size={14} className="text-[#2a85ff]" />
                <span className="text-white/60 text-[10px] sm:text-xs font-bold tracking-widest uppercase">AI-Powered Recruitment</span>
              </div>

              <h1 className="text-white font-extrabold text-5xl sm:text-7xl md:text-8xl lg:text-9xl leading-[0.95] tracking-tight mb-8 sm:mb-10">
                Hire without<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2a85ff] via-[#6eb3ff] to-[#2a85ff] bg-[length:200%_auto] animate-gradient-flow px-2 italic">sorting.</span>
              </h1>

              <p className="text-white/50 text-base sm:text-xl md:text-2xl max-w-2xl mx-auto leading-relaxed mb-10 sm:mb-14 px-4 sm:px-0">
                Rankr uses AI to screen hundreds of CVs in seconds, Ranking every candidate and explaining exactly why they fit.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 px-4 sm:px-0">
                <Link href="/auth" className="w-full sm:w-auto px-8 sm:px-10 py-5 rounded-full bg-[#2a85ff] text-white text-base sm:text-lg font-bold hover:bg-[#1a75ef] shadow-[0_8px_32px_rgba(42,133,255,0.4)] transition-all hover:-translate-y-1 flex items-center justify-center gap-2 group">
                  Start Recruiting
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <button className="w-full sm:w-auto px-8 sm:px-10 py-5 rounded-full bg-white/5 text-white text-base sm:text-lg font-bold border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                  <Play size={18} fill="white" />
                  Watch Demo
                </button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* STATS SECTION */}
        <section className="py-20 border-y border-white/5 bg-white/[0.01]">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 sm:gap-12 text-center">
              {STATS.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <p className="text-white/40 text-xs sm:text-sm font-bold tracking-widest uppercase mb-4">{stat.label}</p>
                  <p className="text-white text-5xl sm:text-6xl font-extrabold tracking-tighter mb-2">{stat.value}</p>
                  <p className="text-[#2a85ff] text-xs sm:text-sm font-semibold italic">{stat.sub}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* PRODUCT PREVIEW */}
        <section className="py-24 sm:py-48 relative overflow-hidden">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
            <div className="relative rounded-[2rem] sm:rounded-[3rem] p-0.5 bg-gradient-to-br from-white/20 via-white/5 to-white/20 overflow-hidden shadow-2xl">
              <div className="bg-[#0f0f12] rounded-[1.95rem] sm:rounded-[2.95rem] overflow-hidden aspect-[16/10] sm:aspect-[16/9] relative">
                <img
                  src="https://uxcanvas.ai/api/generated-images/a41dbe01-2ec5-4de6-bde6-a96289ed1c5f/9bf07167-e189-46c3-9b0b-84e832c5a707"
                  alt="Rankr Dashboard Interface"
                  className="w-full h-full object-cover opacity-60 grayscale-[40%]"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#2a85ff] shadow-[0_0_50px_rgba(42,133,255,0.5)] flex items-center justify-center group"
                  >
                    <Play size={32} fill="white" className="ml-1 text-white" />
                  </motion.button>
                </div>
                {/* Overlay details */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#070707] via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-10 left-10 hidden md:block">
                  <div className="flex gap-4">
                    <div className="px-5 py-3 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10">
                      <p className="text-white/40 text-[10px] font-bold uppercase mb-1">AI Match</p>
                      <p className="text-white text-xl font-bold italic">94% Score</p>
                    </div>
                    <div className="px-5 py-3 rounded-2xl bg-[#2a85ff]/20 backdrop-blur-xl border border-[#2a85ff]/30">
                      <p className="text-[#6eb3ff] text-[10px] font-bold uppercase mb-1">Status</p>
                      <p className="text-white text-xl font-bold">Recommended</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES GRID */}
        <section className="py-24 sm:py-32 relative bg-white/[0.01]">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
            <div className="flex flex-col lg:flex-row gap-16 lg:items-center">
              <div className="flex-1">
                <h2 className="text-white text-4xl sm:text-6xl font-extrabold tracking-tight mb-12">
                  Everything you need to <br className="hidden sm:block" />
                  <span className="text-[#2a85ff]">build a world-class team.</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                  {[
                    { icon: Globe, title: 'Global Sourcing', desc: 'Sync with 50+ job boards and talent networks instantly.' },
                    { icon: Shield, title: 'Bias-Free AI', desc: 'Blind screening models ensure diversity and fair assessment.' },
                    { icon: Zap, title: 'Real-time Ranking', desc: 'See scores updated as soon as a new candidate applies.' },
                    { icon: Sparkles, title: 'Reasoning Engine', desc: 'AI explains precisely why a candidate was ranked.' },
                  ].map((f, i) => (
                    <div key={i} className="flex flex-col gap-5 group">
                      <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-[#2a85ff]/20 group-hover:border-[#2a85ff]/30 transition-all">
                        <f.icon className="text-[#2a85ff]" size={28} />
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-xl mb-2">{f.title}</h4>
                        <p className="text-white/40 text-[15px] leading-relaxed">{f.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex-1 relative">
                 <img 
                  src="https://uxcanvas.ai/api/generated-images/a41dbe01-2ec5-4de6-bde6-a96289ed1c5f/9bf07167-e189-46c3-9b0b-84e832c5a707"
                  alt="Feature showcase"
                  className="w-full h-auto rounded-3xl grayscale brightness-75 border border-white/10 shadow-2xl"
                />
                <div className="absolute -bottom-6 -left-6 bg-[#2a85ff] p-8 rounded-2xl shadow-3xl hidden sm:block">
                  <p className="text-white text-3xl font-black mb-1">10x</p>
                  <p className="text-white/80 text-[10px] font-bold uppercase tracking-wider">Hiring Efficiency</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="py-32 sm:py-56 relative overflow-hidden">
          <div className="absolute inset-0 bg-[#2a85ff] pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent)] opacity-50 pointer-events-none" />
          
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 relative z-10 text-center">
            <h2 className="text-white text-6xl sm:text-9xl font-black tracking-tighter mb-10 sm:mb-16 leading-[0.85]">
              READY TO<br />HIRE SMARTER?
            </h2>
            <Link href="/auth" className="inline-flex items-center gap-2 px-10 sm:px-14 py-6 sm:py-8 rounded-full bg-white text-[#2a85ff] text-xl sm:text-2xl font-black hover:scale-105 transition-all shadow-[0_20px_50px_rgba(0,0,0,0.2)]">
              Get Started Now
              <ChevronRight size={28} strokeWidth={3} />
            </Link>
          </div>
        </section>
      </main>

      <footer className="py-24 sm:py-32 border-t border-white/5">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-16 md:gap-0">
            <div className="flex flex-col gap-8">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="w-11 h-11 rounded-xl bg-[#2a85ff] flex items-center justify-center shadow-lg shadow-[#2a85ff]/20">
                  <Sparkles size={22} color="white" />
                </div>
                <span className="text-white text-2xl font-bold tracking-tight">Rankr</span>
              </Link>
              <p className="text-white/30 text-sm max-w-[320px] leading-relaxed">
                The AI-first platform for modern recruitment teams to build better companies, faster.
              </p>
              <div className="flex gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 hover:border-white/20 transition-all cursor-pointer" />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-16 md:gap-24 w-full md:w-auto">
              <div className="flex flex-col gap-6">
                <p className="text-white text-xs font-bold uppercase tracking-widest">Platform</p>
                <Link href="#" className="text-white/40 hover:text-white text-sm transition-colors">Screening</Link>
                <Link href="#" className="text-white/40 hover:text-white text-sm transition-colors">Ranking</Link>
                <Link href="#" className="text-white/40 hover:text-white text-sm transition-colors">Sourcing</Link>
              </div>
              <div className="flex flex-col gap-6">
                <p className="text-white text-xs font-bold uppercase tracking-widest">Company</p>
                <Link href="#" className="text-white/40 hover:text-white text-sm transition-colors">About</Link>
                <Link href="#" className="text-white/40 hover:text-white text-sm transition-colors">Blog</Link>
                <Link href="#" className="text-white/40 hover:text-white text-sm transition-colors">Careers</Link>
              </div>
              <div className="flex flex-col gap-6">
                <p className="text-white text-xs font-bold uppercase tracking-widest">Legal</p>
                <Link href="#" className="text-white/40 hover:text-white text-sm transition-colors">Privacy</Link>
                <Link href="#" className="text-white/40 hover:text-white text-sm transition-colors">Terms</Link>
                <Link href="#" className="text-white/40 hover:text-white text-sm transition-colors">Security</Link>
              </div>
            </div>
          </div>
          <div className="mt-24 sm:mt-32 pt-10 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-6">
            <p className="text-white/20 text-[10px] sm:text-xs">© 2024 Rankr AI Platform. All rights reserved.</p>
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10">
              <div className="w-1.5 h-1.5 rounded-full bg-[#16a34a] animate-pulse" />
              <p className="text-white/40 text-[10px] sm:text-xs font-bold tracking-widest uppercase">System Operational</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
