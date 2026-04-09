'use client'

import React, { useState, useEffect } from 'react'
import { 
  Sparkles, Briefcase, Users, Star, 
  CheckCircle2, ArrowRight, Upload, 
  Building2, User, Clock, ShieldCheck,
  Zap, ChevronRight, Play, Globe
} from 'lucide-react'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'motion/react'

export default function EnhancedLandingPage() {
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 500], [0, 200])
  const opacity = useTransform(scrollY, [0, 200], [1, 0])

  return (
    <div className="min-h-screen bg-[#070707] text-white selection:bg-[#2a85ff]/30 overflow-x-hidden">
      
      {/* ── AMBIENT GLASS BACKGROUND ── */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#2a85ff]/10 blur-[120px]" />
        <div className="absolute bottom-[20%] right-[-5%] w-[40%] h-[60%] rounded-full bg-[#9f6ef5]/5 blur-[100px]" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-[#2a85ff]/5 blur-[80px]" />
      </div>

      {/* ── NAVBAR ── */}
      <nav className="fixed top-0 w-full z-50 px-6 py-6 flex justify-center">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="max-w-7xl w-full h-16 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full px-8 flex items-center justify-between shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
        >
          <div className="flex items-center gap-2.5 group cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-[#2a85ff] flex items-center justify-center group-hover:rotate-12 transition-transform">
              <Sparkles size={16} className="text-white" />
            </div>
            <span className="text-xl font-black tracking-tight text-white">Rankr</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {['Product', 'Pricing', 'Company', 'Careers'].map(item => (
              <Link key={item} href="#" className="text-sm font-bold text-white/50 hover:text-white transition-colors">{item}</Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <Link href="/auth" className="text-sm font-bold text-white/70 hover:text-white transition-colors px-4 py-2">Login</Link>
            <Link 
              href="/auth" 
              className="px-6 py-2.5 rounded-full bg-white text-[#070707] text-sm font-black hover:bg-[#2a85ff] hover:text-white transition-all shadow-lg hover:shadow-[#2a85ff]/30 active:scale-95"
            >
              Sign Up
            </Link>
          </div>
        </motion.div>
      </nav>

      {/* ── HERO SECTION ── */}
      <section className="relative pt-48 pb-32 px-6 flex flex-col items-center text-center overflow-hidden">
        
        {/* Floating elements visual background */}
        <motion.div style={{ y: y1 }} className="absolute inset-0 z-0">
          <div className="absolute top-40 left-20 w-32 h-32 rounded-3xl bg-[#2a85ff]/10 border border-white/5 rotate-12 flex items-center justify-center backdrop-blur-sm">
            <div className="w-12 h-1.5 bg-[#2a85ff]/40 rounded-full" />
          </div>
          <div className="absolute bottom-40 right-20 w-40 h-40 rounded-[2.5rem] bg-[#9f6ef5]/10 border border-white/5 -rotate-12 flex flex-col gap-2 p-6 backdrop-blur-md">
            <div className="w-full h-2 bg-white/10 rounded-full" />
            <div className="w-2/3 h-2 bg-white/10 rounded-full" />
            <div className="w-1/2 h-2 bg-white/10 rounded-full" />
          </div>
        </motion.div>

        <div className="max-w-4xl relative z-10 scale-100 sm:scale-110">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#2a85ff]/15 border border-[#2a85ff]/30 text-[#2a85ff] text-[10px] font-black uppercase tracking-widest mb-10"
          >
            <Zap size={10} strokeWidth={3} />
            The Future of Recruitment is Here
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-6xl md:text-8xl font-black leading-[0.95] tracking-tight mb-8"
          >
            Hire top 1% talent<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2a85ff] to-[#9f6ef5]">with AI Precision.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-white/40 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed mb-12"
          >
            Rankr automates candidate screening, ranking your pipeline in seconds using Gemini AI. Stop reading CVs, start hiring people.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link 
              href="/auth" 
              className="px-12 py-5 rounded-[2rem] bg-[#2a85ff] text-white text-lg font-black flex items-center justify-center gap-3 hover:bg-[#1a75ef] transition-all hover:scale-105 shadow-[0_12px_40px_rgba(42,133,255,0.4)] active:scale-95 group"
            >
              Get Started Free
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" strokeWidth={3} />
            </Link>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="mt-20 flex flex-wrap items-center justify-center gap-10 opacity-30 grayscale contrast-125"
          >
            <div className="flex items-center gap-2 font-black text-2xl uppercase tracking-tighter italic lg:scale-110">Microsoft</div>
            <div className="flex items-center gap-2 font-black text-2xl uppercase tracking-tighter italic lg:scale-110">Airbnb</div>
            <div className="flex items-center gap-2 font-black text-2xl uppercase tracking-tighter italic lg:scale-110">Uber</div>
            <div className="flex items-center gap-2 font-black text-2xl uppercase tracking-tighter italic lg:scale-110">Stripe</div>
          </motion.div>
        </div>

      </section>

      {/* ── INTERACTIVE FEATURES SECTION ── */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          
          <div className="relative">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <h2 className="text-4xl md:text-6xl font-black leading-tight tracking-tight">
                AI that understands<br/>
                <span className="text-[#2a85ff]">human expertise.</span>
              </h2>
              <p className="text-white/40 text-lg leading-relaxed max-w-md">
                Our Gemini-powered engine doesn&apos;t just keyword match. It understands context, experience depth, and cultural fit.
              </p>
              
              <div className="space-y-4 pt-6">
                {[
                  { icon: <ShieldCheck className="text-[#16a34a]" />, title: 'Bias-Free Screening', desc: 'Objective ranking based on skills and merit.' },
                  { icon: <Zap className="text-[#f07830]" />, title: 'Instant Processing', desc: 'Process 1,000+ CVs in less than a minute.' },
                  { icon: <Globe className="text-[#2a85ff]" />, title: 'Universal Support', desc: 'Works with any major global CV format.' },
                ].map((item, i) => (
                  <motion.div 
                    key={item.title}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-4 p-4 rounded-2xl hover:bg-white/5 transition-all group"
                  >
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 group-hover:scale-110 transition-transform">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-white">{item.title}</h4>
                      <p className="text-white/30 text-sm mt-1">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          <div className="relative">
             {/* Mock Dashboard Visual */}
             <motion.div 
                initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
                whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
                viewport={{ once: true }}
                className="relative bg-[#1a1a1a] rounded-[2.5rem] border border-white/10 p-8 shadow-[0_32px_120px_rgba(42,133,255,0.15)] overflow-hidden group hover:scale-[1.02] transition-all duration-700"
             >
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#2a85ff]/10 blur-[60px] group-hover:bg-[#2a85ff]/20 transition-all" />
                
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                    <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                    <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                  </div>
                  <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-white/40">
                    Live Score Tracking
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    { name: 'Amara Osei', score: 98, role: 'Backend Expert', color: '#2a85ff' },
                    { name: 'John Doe', score: 85, role: 'Full Stack', color: '#9f6ef5' },
                    { name: 'Lena Müller', score: 72, role: 'DevOps', color: '#f07830' },
                  ].map((c, i) => (
                    <motion.div 
                      key={c.name}
                      initial={{ width: 0 }}
                      whileInView={{ width: '100%' }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5 + i * 0.2, duration: 1 }}
                      className="bg-white/5 rounded-2xl p-5 border border-white/5 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-white/10" />
                        <div>
                          <p className="text-sm font-bold text-white">{c.name}</p>
                          <p className="text-[10px] text-white/30 font-medium">{c.role}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black" style={{ color: c.color }}>{c.score}%</p>
                        <p className="text-[8px] uppercase font-bold text-white/20 tracking-widest">Match</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between text-[#2a85ff]">
                   <span className="text-xs font-bold">GEMINI SCREENING ACTIVE</span>
                   <motion.div 
                    animate={{ scale: [1, 1.2, 1] }} 
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="w-2 h-2 rounded-full bg-[#4ade80]" 
                  />
                </div>
             </motion.div>

             {/* Background glow for the visual */}
             <div className="absolute -inset-4 bg-gradient-to-r from-[#2a85ff]/30 to-[#9f6ef5]/30 blur-3xl opacity-20 -z-10" />
          </div>

        </div>
      </section>

      {/* ── CALL TO ACTION ── */}
      <section className="py-40 px-6 relative overflow-hidden">
        <div className="max-w-5xl mx-auto bg-gradient-to-br from-[#2a85ff] to-[#9f6ef5] rounded-[3rem] p-16 md:p-24 text-center relative overflow-hidden shadow-[0_32px_120px_rgba(42,133,255,0.3)]">
          <div className="absolute inset-0 bg-[#070707]/10" />
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 blur-[80px] rounded-full" />
          
          <div className="relative z-10">
            <h2 className="text-5xl md:text-7xl font-black tracking-tight text-white mb-8">
              Ready to hire your<br className="hidden md:block"/> next superstar?
            </h2>
            <p className="text-white/80 text-lg md:text-xl font-medium max-w-xl mx-auto mb-12">
              Join 2,000+ modern companies already using Rankr to transform their talent pipeline.
            </p>
            <Link 
              href="/auth" 
              className="inline-flex items-center gap-3 px-10 py-5 rounded-full bg-white text-[#070707] text-xl font-black hover:bg-[#070707] hover:text-white transition-all hover:scale-105 active:scale-95 shadow-2xl"
            >
              Start Your Free Trial
              <ArrowRight size={22} strokeWidth={3} />
            </Link>
            <p className="mt-8 text-white/60 text-sm font-bold tracking-wide">
              NO CREDIT CARD REQUIRED · 14-DAY FREE TRIAL
            </p>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-20 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#2a85ff] flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <span className="text-xl font-black tracking-tight text-white">Rankr</span>
          </div>

          <div className="flex flex-wrap justify-center gap-8">
            {['Privacy', 'Terms', 'Security', 'Legal', 'Contact'].map(link => (
              <Link key={link} href="#" className="text-sm font-bold text-white/40 hover:text-white transition-colors">{link}</Link>
            ))}
          </div>

          <p className="text-white/20 text-xs font-bold uppercase tracking-widest">
            © 2024 Rankr AI. Built with Gemini.
          </p>
        </div>
      </footer>

    </div>
  )
}
