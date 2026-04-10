'use client'

import React, { useState } from 'react'
import {
  Bell, Sparkles, User, Heart, ChevronDown, Download,
  X, Star, AlertTriangle, CheckCircle, ArrowUpDown, Filter, Menu
} from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'
import Navbar from '../components/Navbar'

const CANDIDATES = [
  {
    id: 1, rank: 1, name: 'Amara Osei', role: 'Senior Backend Engineer', initials: 'AO',
    source: 'Rankr', score: 94, skills: ['Node.js', 'TypeScript', 'GraphQL'],
    recommendation: 'Hire', expLevel: 'Expert', years: 7, education: "Master's",
    location: 'Nairobi, Kenya',
    reasoning: 'Exceptional Node.js background with 7 years of hands-on experience. Exceeds technical requirements.',
    strengths: ['Deep Node.js mastery', 'GraphQL design expertise', 'Led team of 8 engineers'],
    gaps: ['No AWS certification'],
    matched: ['Node.js', 'TypeScript', 'GraphQL', 'Leadership'],
  },
  {
    id: 2, rank: 2, name: 'Lena Müller', role: 'Full Stack Developer', initials: 'LM',
    source: 'Rankr', score: 88, skills: ['React', 'Node.js', 'Docker'],
    recommendation: 'Hire', expLevel: 'Expert', years: 6, education: "Bachelor's",
    location: 'Berlin, Germany',
    reasoning: 'Strong full-stack profile. Docker and CI/CD experience are a plus.',
    strengths: ['Startup CTO background', 'CI/CD expertise'],
    gaps: ['Limited GraphQL'],
    matched: ['Node.js', 'React', 'Docker'],
  },
  {
    id: 3, rank: 3, name: 'James Park', role: 'Backend Engineer', initials: 'JP',
    source: 'External', score: 85, skills: ['Python', 'FastAPI', 'AWS'],
    recommendation: 'Hire', expLevel: 'Intermediate', years: 5, education: "Bachelor's",
    location: 'Seoul, South Korea',
    reasoning: 'Strong Python/FastAPI background. AWS Solutions Architect certified.',
    strengths: ['AWS Solutions Architect', '98th percentile LeetCode'],
    gaps: ['Python primary, not TS'],
    matched: ['AWS', 'FastAPI', 'Python'],
  },
]

type Recommendation = 'Hire' | 'Consider' | 'Pass'

const recColor: Record<Recommendation, string> = {
  Hire: 'bg-[#e6f9f0] text-[#16a34a] border border-[#16a34a]/20',
  Consider: 'bg-[#fff9e6] text-[#ca8a04] border border-[#ca8a04]/20',
  Pass: 'bg-[#fef2f2] text-[#dc2626] border border-[#dc2626]/20',
}

const recDot: Record<Recommendation, string> = {
  Hire: 'bg-[#16a34a]',
  Consider: 'bg-[#ca8a04]',
  Pass: 'bg-[#dc2626]',
}

export default function RankrResults() {
  const [liked, setLiked] = useState<Set<number>>(new Set())
  const [activeTab, setActiveTab] = useState<'All' | 'Rankr' | 'External'>('All')
  const [selectedId, setSelectedId] = useState<number | null>(1)
  const [scoreMin, setScoreMin] = useState(60)
  const [scoreMax, setScoreMax] = useState(100)
  const [recFilters, setRecFilters] = useState<Set<Recommendation>>(new Set(['Hire', 'Consider']))
  const [sourceFilters, setSourceFilters] = useState<Set<string>>(new Set(['Rankr', 'External']))
  const [expFilters, setExpFilters] = useState<Set<string>>(new Set(['Intermediate', 'Expert']))
  const [shortlisted, setShortlisted] = useState<Set<number>>(new Set([1, 2, 3]))
  const [panelTab, setPanelTab] = useState<'reasoning' | 'meta'>('reasoning')
  const [showFilters, setShowFilters] = useState(false)

  const toggleLike = (id: number) => {
    setLiked(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleFilter = (set: Set<any>, val: any, setter: Function) => {
    const next = new Set(set)
    next.has(val) ? next.delete(val) : next.add(val)
    setter(next)
  }

  const filtered = CANDIDATES.filter(c => {
    const tabMatch = activeTab === 'All' || c.source === activeTab
    const scoreMatch = c.score >= scoreMin && c.score <= scoreMax
    const recMatch = recFilters.has(c.recommendation as Recommendation)
    const srcMatch = sourceFilters.has(c.source)
    const expMatch = expFilters.has(c.expLevel)
    return tabMatch && scoreMatch && recMatch && srcMatch && expMatch
  })

  const selected = selectedId ? CANDIDATES.find(c => c.id === selectedId) : null

  return (
    <div className="min-h-screen bg-[#f0f5fa]">
      <Navbar type="app" activeNav="Shortlists" />

      {/* Hero */}
      <div className="bg-[#070707] pt-24 sm:pt-32 pb-12 sm:pb-16 overflow-hidden">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-8 relative z-10">
          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-[#16a34a]/20 flex items-center justify-center border border-[#16a34a]/30">
                <CheckCircle size={17} color="#4ade80" strokeWidth={2.2} />
              </div>
              <h1 className="text-white font-extrabold text-3xl sm:text-5xl tracking-tight">
                Screening Complete <span className="text-[#2a85ff]">✦</span>
              </h1>
            </div>
            <p className="text-white/50 text-sm sm:text-base ml-0 sm:ml-11">
              Top candidates shortlisted from your latest search
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-full bg-white/10 border border-white/10 text-white text-xs font-bold">34 Screened</div>
            <div className="px-4 py-2 rounded-full bg-[#2a85ff]/20 border border-[#2a85ff]/30 text-[#6eb3ff] text-xs font-bold">20 Shortlisted</div>
          </div>
        </div>
      </div>

      <main className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8">
        
        {/* Top bar controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h2 className="text-[#070707] text-xl font-bold">Results Browser</h2>
            <p className="text-[#8a9ab0] text-sm">Ranked by AI match score</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={() => setShowFilters(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#e2eaf2] text-sm font-bold text-[#5a6a7a]"
            >
              <Filter size={16} /> Filters
            </button>
            <div className="hidden sm:flex items-center bg-white border border-[#e2eaf2] rounded-xl p-1">
              {(['All', 'Rankr', 'External'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === tab ? 'bg-[#2a85ff] text-white' : 'text-[#8a9ab0] hover:text-[#2a85ff]'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#070707] text-white text-sm font-bold shadow-lg">
              <Download size={16} /> Export
            </button>
          </div>
        </div>

        <div className="flex gap-8 relative">
          
          {/* Desktop Left Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24 space-y-8">
              {/* Filter sections remain similar but with better touch targets */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#b0bac6] mb-4">Match Score</p>
                <div className="flex justify-between mb-4">
                  <span className="text-xs font-bold bg-[#f0f5fa] px-2 py-1 rounded text-[#2a85ff]">{scoreMin}%</span>
                  <span className="text-xs font-bold bg-[#f0f5fa] px-2 py-1 rounded text-[#2a85ff]">{scoreMax}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" value={scoreMin} 
                  onChange={e => setScoreMin(Number(e.target.value))}
                  className="w-full h-1.5 bg-[#f0f5fa] rounded-lg appearance-none cursor-pointer accent-[#2a85ff]"
                />
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#b0bac6] mb-4">Recommendation</p>
                <div className="space-y-3">
                  {(['Hire', 'Consider', 'Pass'] as Recommendation[]).map(r => (
                    <label key={r} className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="checkbox" checked={recFilters.has(r)} 
                        onChange={() => toggleFilter(recFilters, r, setRecFilters)}
                        className="w-4 h-4 rounded text-[#2a85ff] border-[#e2eaf2]"
                      />
                      <span className="text-sm font-bold text-[#5a6a7a] group-hover:text-[#2a85ff] transition-colors">{r}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Cards Area */}
          <div className="flex-1 min-w-0">
            <div className={`grid gap-6 ${selectedId ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'}`}>
              {filtered.map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setSelectedId(c.id)}
                  className={`bg-white rounded-[2rem] p-6 shadow-sm hover:shadow-xl transition-all cursor-pointer border-2 ${selectedId === c.id ? 'border-[#2a85ff]' : 'border-transparent'}`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[#2a85ff] font-black text-xl">#{c.rank}</span>
                    <button aria-label="Toggle favorite" onClick={e => { e.stopPropagation(); toggleLike(c.id) }}>
                      <Heart size={20} fill={liked.has(c.id) ? '#ff4757' : 'none'} color={liked.has(c.id) ? '#ff4757' : '#c8d6e5'} />
                    </button>
                  </div>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#2a85ff] to-[#6eb3ff] flex items-center justify-center text-white font-bold">{c.initials}</div>
                    <div>
                      <h3 className="text-[#070707] font-bold text-sm leading-none mb-1">{c.name}</h3>
                      <p className="text-[#8a9ab0] text-xs">{c.role}</p>
                    </div>
                  </div>
                  <div className="flex items-end gap-3 mb-6">
                    <span className="text-[#2a85ff] text-3xl font-black leading-none">{c.score}</span>
                    <div className="flex-1 h-1.5 bg-[#f0f5fa] rounded-full overflow-hidden mb-1">
                      <div className="h-full bg-[#2a85ff]" style={{ width: `${c.score}%` }} />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {c.skills.map(s => (
                      <span key={s} className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#f0f5fa] text-[#5a6a7a]">{s}</span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Desktop Detail Panel */}
          <AnimatePresence>
            {selected && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="hidden lg:block w-[380px] flex-shrink-0"
              >
                <div className="bg-white rounded-3xl p-8 shadow-2xl sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto">
                   <div className="flex items-center justify-between mb-8">
                     <h3 className="text-xl font-bold">Candidate Info</h3>
                     <button aria-label="Close panel" onClick={() => setSelectedId(null)} className="p-2 hover:bg-[#f0f5fa] rounded-full transition-colors">
                       <X size={20} className="text-[#b0bac6]" />
                     </button>
                   </div>
                   {/* Info content */}
                   <div className="space-y-8">
                     <div className="flex items-center gap-4">
                       <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#2a85ff] to-[#6eb3ff] flex items-center justify-center text-white text-xl font-bold">{selected.initials}</div>
                       <div>
                         <h4 className="text-xl font-bold">{selected.name}</h4>
                         <p className="text-[#8a9ab0]">{selected.role}</p>
                       </div>
                     </div>
                     
                     <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-[#f0f5fa]">
                          <p className="text-[10px] font-bold text-[#b0bac6] uppercase mb-1">Score</p>
                          <p className="text-2xl font-black text-[#2a85ff]">{selected.score}</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-[#f0f5fa]">
                          <p className="text-[10px] font-bold text-[#b0bac6] uppercase mb-1">Exp</p>
                          <p className="text-2xl font-black text-[#070707]">{selected.years}y</p>
                        </div>
                     </div>

                     <div className="space-y-4">
                        <p className="text-sm font-bold uppercase tracking-widest text-[#b0bac6]">AI Reasoning</p>
                        <p className="text-sm text-[#5a6a7a] leading-relaxed italic">"{selected.reasoning}"</p>
                        <div className="space-y-2">
                          {selected.strengths.map((s, i) => (
                            <div key={i} className="flex gap-2 text-sm text-[#16a34a] font-medium">
                              <CheckCircle size={16} className="mt-0.5 flex-shrink-0" /> {s}
                            </div>
                          ))}
                        </div>
                     </div>

                     <button className="w-full py-4 rounded-2xl bg-[#2a85ff] text-white font-bold shadow-xl shadow-[#2a85ff]/20">
                        Add to Shortlist
                     </button>
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mobile Detail Panel (Overlay) */}
          <AnimatePresence>
            {selected && (
              <motion.div
                initial={{ opacity: 0, y: '100%' }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: '100%' }}
                className="lg:hidden fixed inset-0 z-50 flex flex-col pointer-events-none"
              >
                <div 
                  className="absolute inset-0 bg-black/60 pointer-events-auto" 
                  onClick={() => setSelectedId(null)}
                />
                <div className="mt-auto bg-white rounded-t-[2.5rem] p-6 sm:p-10 pointer-events-auto shadow-[0_-20px_50px_rgba(0,0,0,0.3)] max-h-[90vh] overflow-y-auto">
                    {/* Simplified mobile panel content */}
                    <div className="w-12 h-1.5 bg-[#e2eaf2] rounded-full mx-auto mb-8" />
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-[#2a85ff] flex items-center justify-center text-white font-bold text-xl">{selected.initials}</div>
                        <div>
                          <h3 className="text-xl font-bold">{selected.name}</h3>
                          <p className="text-sm text-[#8a9ab0]">{selected.role}</p>
                        </div>
                      </div>
                      <button aria-label="Close details" onClick={() => setSelectedId(null)} className="p-3 bg-[#f0f5fa] rounded-full">
                        <X size={20} />
                      </button>
                    </div>

                    <div className="space-y-8 pb-10">
                      <div className="p-6 rounded-3xl bg-[#f0f5fa] flex items-center justify-between">
                         <div>
                            <p className="text-[10px] font-bold text-[#b0bac6] uppercase mb-1">AI Match Score</p>
                            <p className="text-4xl font-black text-[#2a85ff]">{selected.score}</p>
                         </div>
                         <div className={`px-4 py-2 rounded-full font-bold ${recColor[selected.recommendation as Recommendation]}`}>
                            {selected.recommendation}
                         </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-bold text-[#b0bac6] text-xs uppercase tracking-widest">Reasoning</h4>
                        <p className="text-[#5a6a7a] leading-relaxed font-medium italic">"{selected.reasoning}"</p>
                      </div>

                      <button className="w-full py-5 rounded-3xl bg-[#2a85ff] text-white font-bold text-lg shadow-2xl">
                        Shortlist Candidate
                      </button>
                    </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mobile Filter Drawer */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, x: '-100%' }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: '-100%' }}
                className="lg:hidden fixed inset-0 z-[60] flex"
              >
                <div className="w-full max-w-[300px] bg-white h-full shadow-2xl p-8 flex flex-col gap-10 overflow-y-auto">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-extrabold tracking-tight">Filters</h3>
                    <button onClick={() => setShowFilters(false)} className="p-2"><X size={24} /></button>
                  </div>
                  
                  {/* Reuse Sidebar contents but styled for mobile */}
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#b0bac6] mb-6">Score Range</p>
                    <div className="flex justify-between mb-4">
                      <span className="text-sm font-bold text-[#2a85ff]">{scoreMin}%</span>
                      <span className="text-sm font-bold text-[#2a85ff]">{scoreMax}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="100" value={scoreMin} 
                      onChange={e => setScoreMin(Number(e.target.value))}
                      className="w-full h-2 bg-[#f0f5fa] rounded-full appearance-none accent-[#2a85ff]"
                    />
                  </div>

                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#b0bac6] mb-6">Recommendation</p>
                    <div className="space-y-5">
                      {(['Hire', 'Consider', 'Pass'] as Recommendation[]).map(r => (
                        <label key={r} className="flex items-center gap-4 cursor-pointer">
                          <input 
                            type="checkbox" checked={recFilters.has(r)} 
                            onChange={() => toggleFilter(recFilters, r, setRecFilters)}
                            className="w-5 h-5 rounded text-[#2a85ff] border-[#e2eaf2]"
                          />
                          <span className="text-lg font-bold text-[#5a6a7a]">{r}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <button 
                    onClick={() => setShowFilters(false)}
                    className="mt-auto w-full py-4 rounded-2xl bg-[#070707] text-white font-bold"
                  >
                    Apply Filters
                  </button>
                </div>
                <div className="flex-1 bg-black/40" onClick={() => setShowFilters(false)} />
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </main>
    </div>
  )
}
