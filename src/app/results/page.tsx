'use client'

import React, { useState } from 'react'
import { Poppins } from 'next/font/google'
import {
  Bell, Sparkles, User, Heart, ChevronDown, Download,
  X, Star, AlertTriangle, CheckCircle, ArrowUpDown
} from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-poppins',
})

const NAV_LINKS = ['Jobs', 'Candidates', 'Shortlists', 'Settings']

const CANDIDATES = [
  {
    id: 1, rank: 1, name: 'Amara Osei', role: 'Senior Backend Engineer', initials: 'AO',
    source: 'Rankr', score: 94, skills: ['Node.js', 'TypeScript', 'GraphQL'],
    recommendation: 'Hire', expLevel: 'Expert', years: 7, education: "Master's",
    location: 'Nairobi, Kenya',
    reasoning: 'Exceptional Node.js background with 7 years of hands-on experience. Exceeds technical requirements across all key areas.',
    strengths: [
      'Deep Node.js & TypeScript mastery — 7 years production experience',
      'GraphQL API design expertise matching job requirements exactly',
      'Led distributed team of 8 engineers at prior role',
      'Open-source contributor with 2.3k GitHub stars',
    ],
    gaps: [
      'No explicit AWS certification, though has 4 years cloud experience',
    ],
    matched: ['Node.js', 'TypeScript', 'GraphQL', 'PostgreSQL', 'Leadership'],
  },
  {
    id: 2, rank: 2, name: 'Lena Müller', role: 'Full Stack Developer', initials: 'LM',
    source: 'Rankr', score: 88, skills: ['React', 'Node.js', 'Docker'],
    recommendation: 'Hire', expLevel: 'Expert', years: 6, education: "Bachelor's",
    location: 'Berlin, Germany',
    reasoning: 'Strong full-stack profile with solid Node.js backend. Docker and CI/CD experience are a plus. Communication skills stand out.',
    strengths: [
      'Balanced full-stack experience with strong backend focus',
      'Docker & CI/CD pipeline expertise',
      'Previous startup CTO — high ownership mindset',
      'Excellent written portfolio & code samples',
    ],
    gaps: [
      'GraphQL usage is limited to hobby projects',
      'No direct experience with microservices at scale',
    ],
    matched: ['Node.js', 'React', 'Docker', 'TypeScript', 'PostgreSQL'],
  },
  {
    id: 3, rank: 3, name: 'James Park', role: 'Backend Engineer', initials: 'JP',
    source: 'External', score: 85, skills: ['Python', 'FastAPI', 'AWS'],
    recommendation: 'Hire', expLevel: 'Intermediate', years: 5, education: "Bachelor's",
    location: 'Seoul, South Korea',
    reasoning: 'Strong Python/FastAPI background. AWS Lambda experience aligns with cloud-first infrastructure needs.',
    strengths: [
      'Certified AWS Solutions Architect',
      'Strong algorithmic problem-solving — 98th percentile LeetCode',
      'FastAPI microservices at 10M+ req/day',
    ],
    gaps: [
      'Primary language is Python, not TypeScript — learning curve expected',
      'Less experience with GraphQL',
    ],
    matched: ['AWS', 'FastAPI', 'Python', 'Microservices', 'Docker'],
  },
  {
    id: 4, rank: 4, name: 'Sara Kimani', role: 'Senior Developer', initials: 'SK',
    source: 'Rankr', score: 82, skills: ['Node.js', 'MongoDB', 'Vue.js'],
    recommendation: 'Consider', expLevel: 'Intermediate', years: 4, education: "Bachelor's",
    location: 'Lagos, Nigeria',
    reasoning: 'Solid Node.js backend skills with good project track record. Vue-heavy frontend may need adjustment to team React stack.',
    strengths: [
      'Node.js Express architecture with 4 years depth',
      'Strong mentoring track record — ran 3 junior bootcamps',
    ],
    gaps: [
      'Primarily Vue-based frontend, team uses React exclusively',
      'MongoDB only — no relational DB experience listed',
    ],
    matched: ['Node.js', 'MongoDB', 'Express', 'REST APIs'],
  },
  {
    id: 5, rank: 5, name: 'David Rousseau', role: 'API Engineer', initials: 'DR',
    source: 'External', score: 79, skills: ['Go', 'gRPC', 'Kubernetes'],
    recommendation: 'Consider', expLevel: 'Expert', years: 8, education: "Master's",
    location: 'Paris, France',
    reasoning: 'Highly senior profile in Go/gRPC. Tech stack diverges from TypeScript-first requirements but architecture skills are strong.',
    strengths: [
      'Deep systems-level engineering — Kubernetes & Helm',
      'gRPC API design at Fortune 500 company',
      'Performance optimisation expertise',
    ],
    gaps: [
      'Primary language is Go — no TypeScript projects listed',
      'May be overqualified, risk of early attrition',
    ],
    matched: ['Kubernetes', 'gRPC', 'Microservices', 'API Design'],
  },
  {
    id: 6, rank: 6, name: 'Yuki Tanaka', role: 'Backend Developer', initials: 'YT',
    source: 'External', score: 76, skills: ['Java', 'Spring Boot', 'MySQL'],
    recommendation: 'Consider', expLevel: 'Intermediate', years: 5, education: "Bachelor's",
    location: 'Tokyo, Japan',
    reasoning: 'Strong Java/Spring background. Transitioning to Node.js ecosystem — learning evidence found in recent projects.',
    strengths: [
      'Microservices architecture with Spring Boot',
      'Recent Node.js side projects show active upskilling',
      'Excellent test coverage discipline (95%+ coverage records)',
    ],
    gaps: [
      'Java primary — Node.js still early stage for production',
      'No GraphQL experience',
    ],
    matched: ['Java', 'Spring Boot', 'MySQL', 'Microservices', 'Testing'],
  },
]

const MORE_CANDIDATES = [
  { id: 7, rank: 7, name: 'Fatima Al-Hassan', role: 'Software Engineer', initials: 'FA', source: 'Rankr', score: 73, skills: ['Node.js', 'React', 'Redis'], recommendation: 'Consider', expLevel: 'Intermediate', years: 3, education: "Bachelor's", location: 'Dubai, UAE', reasoning: 'Node.js skills are promising. Full profile analysis shows strong potential for growth.', strengths: ['Node.js REST APIs', 'Redis caching patterns', 'Well-structured code samples'], gaps: ['Limited production-scale experience', 'No TypeScript exposure yet'], matched: ['Node.js', 'Redis', 'REST APIs'] },
  { id: 8, rank: 8, name: 'Carlos Mendes', role: 'Junior Backend Dev', initials: 'CM', source: 'External', score: 68, skills: ['Python', 'Django', 'SQL'], recommendation: 'Consider', expLevel: 'Intermediate', years: 3, education: "Bachelor's", location: 'São Paulo, Brazil', reasoning: 'Solid foundations but stack mismatch is significant. Strong upside if willing to reskill.', strengths: ['Clean architecture fundamentals', 'Django REST framework expertise'], gaps: ['Python/Django primary — significant reskill needed', 'No Node.js or TypeScript experience'], matched: ['REST APIs', 'SQL', 'Django'] },
  { id: 9, rank: 9, name: 'Priya Sharma', role: 'Backend Engineer', initials: 'PS', source: 'Rankr', score: 65, skills: ['Ruby', 'Rails', 'PostgreSQL'], recommendation: 'Consider', expLevel: 'Intermediate', years: 4, education: "Bachelor's", location: 'Bangalore, India', reasoning: 'Good backend instincts but language mismatch creates onboarding risk.', strengths: ['PostgreSQL schema design', 'RSpec TDD discipline'], gaps: ['Ruby/Rails only — no JavaScript backend experience', 'No cloud platform experience'], matched: ['PostgreSQL', 'REST APIs', 'Testing'] },
  { id: 10, rank: 10, name: 'Martin Kofi', role: 'DevOps Engineer', initials: 'MK', source: 'External', score: 52, skills: ['Terraform', 'CI/CD', 'Bash'], recommendation: 'Pass', expLevel: 'Intermediate', years: 4, education: "Bachelor's", location: 'Accra, Ghana', reasoning: 'Primarily DevOps profile — backend development skills are insufficient for this role.', strengths: ['Infrastructure as code', 'CI/CD pipeline expert'], gaps: ['No backend development experience', 'Role mismatch — DevOps vs. Software Engineering'], matched: ['CI/CD', 'Docker'] },
]

const ALL_CANDIDATES = [...CANDIDATES, ...MORE_CANDIDATES]

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
  const [activeNav, setActiveNav] = useState('Shortlists')
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

  const toggleLike = (id: number) => {
    setLiked(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleRec = (r: Recommendation) => {
    setRecFilters(prev => {
      const next = new Set(prev)
      next.has(r) ? next.delete(r) : next.add(r)
      return next
    })
  }

  const toggleSource = (s: string) => {
    setSourceFilters(prev => {
      const next = new Set(prev)
      next.has(s) ? next.delete(s) : next.add(s)
      return next
    })
  }

  const toggleExp = (e: string) => {
    setExpFilters(prev => {
      const next = new Set(prev)
      next.has(e) ? next.delete(e) : next.add(e)
      return next
    })
  }

  const filtered = ALL_CANDIDATES.filter(c => {
    const tabMatch = activeTab === 'All' || c.source === activeTab
    const scoreMatch = c.score >= scoreMin && c.score <= scoreMax
    const recMatch = recFilters.has(c.recommendation as Recommendation)
    const srcMatch = sourceFilters.has(c.source)
    const expMatch = expFilters.has(c.expLevel)
    return tabMatch && scoreMatch && recMatch && srcMatch && expMatch
  })

  const selected = selectedId ? ALL_CANDIDATES.find(c => c.id === selectedId) : null

  const handleExport = (format: 'json' | 'csv') => {
    const data = ALL_CANDIDATES.filter(c => shortlisted.has(c.id))
    
    let content = ''
    let filename = `rankr_shortlist_${Date.now()}`
    let type = ''

    if (format === 'json') {
      content = JSON.stringify(data, null, 2)
      filename += '.json'
      type = 'application/json'
    } else {
      const headers = ['Rank', 'Name', 'Role', 'Score', 'Source', 'Recommendation']
      const rows = data.map(c => [c.rank, c.name, c.role, c.score, c.source, c.recommendation])
      content = [headers, ...rows].map(r => r.join(',')).join('\n')
      filename += '.csv'
      type = 'text/csv'
    }

    const blob = new Blob([content], { type })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleScoreTrack = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const pct = Math.round((x / rect.width) * 100)
    const midpoint = (scoreMin + scoreMax) / 2
    if (pct <= midpoint) {
      setScoreMin(Math.min(pct, scoreMax - 5))
    } else {
      setScoreMax(Math.max(pct, scoreMin + 5))
    }
  }

  return (
    <div className={`${poppins.className} min-h-screen bg-[#f0f5fa]`}>

      {/* Navbar */}
      <div className="bg-[#070707]">
        <header className="max-w-[1280px] mx-auto px-6 flex items-center justify-between h-16">
          <Link href="/dashboard" className="flex items-center gap-2 select-none">
            <div className="w-8 h-8 rounded-lg bg-[#2a85ff] flex items-center justify-center">
              <Sparkles size={17} color="white" strokeWidth={2.2} />
            </div>
            <span className="text-white text-xl font-bold tracking-tight">Rankr</span>
          </Link>
          <nav className="flex items-center gap-8">
            {NAV_LINKS.map(link => (
              <button key={link} onClick={() => setActiveNav(link)}
                className={`text-sm font-medium pb-1 transition-colors cursor-pointer ${activeNav === link ? 'text-white border-b-2 border-[#2a85ff]' : 'text-white/50 hover:text-white/80 border-b-2 border-transparent'}`}>
                {link}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            <button className="relative text-white/60 hover:text-white transition-colors cursor-pointer" aria-label="Notifications">
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
        <div className="relative overflow-hidden min-h-[140px]">
          <div className="max-w-[1280px] mx-auto px-6 py-8 flex items-center justify-between relative z-10">
            <div>
              <div className="flex items-center gap-3 mb-1.5">
                <div className="w-8 h-8 rounded-full bg-[#16a34a]/20 flex items-center justify-center border border-[#16a34a]/30">
                  <CheckCircle size={17} color="#4ade80" strokeWidth={2.2} />
                </div>
                <h1 className="text-white font-extrabold text-5xl leading-[1.1] tracking-tight">
                  Screening Complete <span className="text-[#2a85ff]">✦</span>
                </h1>
              </div>
              <p className="text-white/50 text-base font-normal ml-11">
                Top 20 candidates shortlisted from 34 applicants
              </p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="flex items-center gap-2 bg-white/10 border border-white/10 rounded-full px-5 py-2.5 backdrop-blur-sm">
                <div className="w-2 h-2 rounded-full bg-white/40" />
                <span className="text-white/80 text-sm font-semibold">34 Screened</span>
              </div>
              <div className="flex items-center gap-2 bg-[#2a85ff]/20 border border-[#2a85ff]/40 rounded-full px-5 py-2.5 backdrop-blur-sm">
                <div className="w-2 h-2 rounded-full bg-[#2a85ff]" />
                <span className="text-[#6eb3ff] text-sm font-semibold">20 Shortlisted</span>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-[#2a85ff]/5 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-48 h-48 rounded-full bg-[#16a34a]/5 blur-3xl pointer-events-none" />
          <div className="absolute right-16 top-1/2 -translate-y-1/2 grid grid-cols-5 gap-3 opacity-10 pointer-events-none">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#2a85ff]" />
            ))}
          </div>
        </div>
      </div>

      {/* Main */}
      <main className="max-w-[1280px] mx-auto px-6 py-8">

        {/* Top Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-7">
          <div>
            <h2 className="text-[#070707] text-xl font-bold leading-tight">Shortlisted Candidates</h2>
            <p className="text-[#8a9ab0] text-sm mt-0.5">Ranked by AI match score</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Sort pill */}
            <button className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-[#5a6a7a] bg-white border border-[#e2eaf2] hover:border-[#2a85ff]/40 hover:text-[#2a85ff] transition-all cursor-pointer shadow-sm">
              <ArrowUpDown size={14} strokeWidth={2} />
              Most recent
            </button>
            {/* Export ghost button */}
            <button 
              onClick={() => handleExport('json')}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-[#5a6a7a] bg-white border border-[#e2eaf2] hover:border-[#2a85ff]/40 hover:text-[#2a85ff] transition-all cursor-pointer shadow-sm"
            >
              <Download size={14} strokeWidth={2} />
              Export JSON
            </button>
            <button 
              onClick={() => handleExport('csv')}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-[#5a6a7a] bg-white border border-[#e2eaf2] hover:border-[#2a85ff]/40 hover:text-[#2a85ff] transition-all cursor-pointer shadow-sm"
            >
              <Download size={14} strokeWidth={2} />
              Export CSV
            </button>
            {/* Source filter tabs */}
            <div className="flex items-center bg-white border border-[#e2eaf2] rounded-full p-1 shadow-sm">
              {(['All (20)', 'Rankr (8)', 'External (12)'] as const).map((tab) => {
                const key = tab.split(' ')[0] as 'All' | 'Rankr' | 'External'
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(key)}
                    className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all cursor-pointer ${activeTab === key ? 'bg-[#2a85ff] text-white shadow-sm' : 'text-[#5a6a7a] hover:text-[#2a85ff]'}`}
                  >
                    {tab}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Layout: sidebar + content */}
        <div className="flex gap-6">

          {/* Left Sidebar */}
          <div className="w-56 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-[0_4px_32px_rgba(0,0,0,0.07)] p-5 flex flex-col gap-6 sticky top-6">

              {/* Match Score */}
              <div>
                <p className="text-xs font-bold text-[#070707] uppercase tracking-wider mb-3">Match Score</p>
                <div className="relative select-none mb-2 h-[20px]">
                  <div
                    className="absolute top-1/2 -translate-y-1/2 h-1.5 w-full bg-[#e8f1ff] rounded-full cursor-pointer"
                    onClick={handleScoreTrack}
                  >
                    {/* filled track */}
                    <div
                      className="absolute h-full bg-[#2a85ff] rounded-full"
                      style={{ left: `${scoreMin}%`, width: `${scoreMax - scoreMin}%` }}
                    />
                  </div>
                  {/* Min thumb */}
                  <input
                    type="range" min={0} max={100} value={scoreMin}
                    onChange={e => setScoreMin(Math.min(Number(e.target.value), scoreMax - 5))}
                    aria-label="Minimum score"
                    className={`absolute w-full top-1/2 -translate-y-1/2 cursor-pointer opacity-0 pointer-events-auto ${scoreMin > 50 ? 'z-[5]' : 'z-[4]'}`}
                  />
                  {/* Max thumb */}
                  <input
                    type="range" min={0} max={100} value={scoreMax}
                    onChange={e => setScoreMax(Math.max(Number(e.target.value), scoreMin + 5))}
                    aria-label="Maximum score"
                    className={`absolute w-full top-1/2 -translate-y-1/2 cursor-pointer opacity-0 pointer-events-auto ${scoreMax < 50 ? 'z-[5]' : 'z-[4]'}`}
                  />
                  {/* Visible thumbs */}
                  <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-[#2a85ff] shadow-md pointer-events-none"
                    style={{ left: `calc(${scoreMin}% - 8px)` }} />
                  <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-[#2a85ff] shadow-md pointer-events-none"
                    style={{ left: `calc(${scoreMax}% - 8px)` }} />
                </div>
                <div className="flex justify-between mt-3">
                  <span className="text-xs font-semibold text-[#2a85ff] bg-[#e8f1ff] px-2.5 py-1 rounded-full">{scoreMin}</span>
                  <span className="text-xs font-semibold text-[#2a85ff] bg-[#e8f1ff] px-2.5 py-1 rounded-full">{scoreMax}</span>
                </div>
              </div>

              <div className="h-px bg-[#f0f5fa]" />

              {/* Recommendation */}
              <div>
                <p className="text-xs font-bold text-[#070707] uppercase tracking-wider mb-3">Recommendation</p>
                <div className="flex flex-col gap-2.5">
                  {([['Hire', 8], ['Consider', 9], ['Pass', 3]] as [Recommendation, number][]).map(([r, count]) => (
                    <label key={r} className="flex items-center gap-2.5 cursor-pointer group">
                      <div
                        onClick={() => toggleRec(r)}
                        className={`w-[18px] h-[18px] rounded flex items-center justify-center border-2 transition-all cursor-pointer flex-shrink-0 ${recFilters.has(r) ? 'bg-[#2a85ff] border-[#2a85ff]' : 'border-[#d0dce8] bg-white hover:border-[#2a85ff]/50'}`}
                      >
                        {recFilters.has(r) && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 2.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                      </div>
                      <div className="flex items-center gap-1.5 flex-1">
                        <div className={`w-2 h-2 rounded-full ${recDot[r]}`} />
                        <span className="text-sm text-[#3a4a5a] font-medium">{r}</span>
                      </div>
                      <span className="text-xs text-[#b0bac6] font-medium">({count})</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="h-px bg-[#f0f5fa]" />

              {/* Source */}
              <div>
                <p className="text-xs font-bold text-[#070707] uppercase tracking-wider mb-3">Source</p>
                <div className="flex flex-col gap-2.5">
                  {['Rankr Platform', 'External Upload'].map((s) => {
                    const key = s.includes('Rankr') ? 'Rankr' : 'External'
                    return (
                      <label key={s} className="flex items-center gap-2.5 cursor-pointer">
                        <div
                          onClick={() => toggleSource(key)}
                          className={`w-[18px] h-[18px] rounded flex items-center justify-center border-2 transition-all cursor-pointer flex-shrink-0 ${sourceFilters.has(key) ? 'bg-[#2a85ff] border-[#2a85ff]' : 'border-[#d0dce8] bg-white hover:border-[#2a85ff]/50'}`}
                        >
                          {sourceFilters.has(key) && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 2.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                        </div>
                        <span className="text-sm text-[#3a4a5a] font-medium">{s}</span>
                      </label>
                    )
                  })}
                </div>
              </div>

              <div className="h-px bg-[#f0f5fa]" />

              {/* Experience Level */}
              <div>
                <p className="text-xs font-bold text-[#070707] uppercase tracking-wider mb-3">Experience Level</p>
                <div className="flex flex-col gap-2.5">
                  {([['Entry Level', 2], ['Intermediate', 11], ['Expert', 7]] as [string, number][]).map(([e, count]) => (
                    <label key={e} className="flex items-center gap-2.5 cursor-pointer">
                      <div
                        onClick={() => toggleExp(e)}
                        className={`w-[18px] h-[18px] rounded flex items-center justify-center border-2 transition-all cursor-pointer flex-shrink-0 ${expFilters.has(e) ? 'bg-[#2a85ff] border-[#2a85ff]' : 'border-[#d0dce8] bg-white hover:border-[#2a85ff]/50'}`}
                      >
                        {expFilters.has(e) && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 2.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                      </div>
                      <span className="text-sm text-[#3a4a5a] font-medium flex-1">{e}</span>
                      <span className="text-xs text-[#b0bac6] font-medium">— {count}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Cards + Detail Panel */}
          <div className="flex-1 min-w-0 flex gap-5">

            {/* Card Grid */}
            <div className={`flex-1 min-w-0 transition-all duration-300 ${selectedId ? 'max-w-[calc(100%-380px)]' : ''}`}>
              <div className={`grid gap-5 ${selectedId ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'}`}>
                <AnimatePresence>
                  {filtered.map((c, idx) => (
                    <motion.div
                      key={c.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.25, delay: idx * 0.04 }}
                      onClick={() => setSelectedId(selectedId === c.id ? null : c.id)}
                      className={`bg-white rounded-2xl shadow-[0_4px_32px_rgba(0,0,0,0.07)] p-5 flex flex-col gap-4 cursor-pointer transition-all hover:shadow-[0_8px_40px_rgba(42,133,255,0.12)] hover:-translate-y-0.5 ${selectedId === c.id ? 'ring-2 ring-[#2a85ff] shadow-[0_8px_40px_rgba(42,133,255,0.15)]' : ''}`}
                    >
                      {/* Top row: rank + heart */}
                      <div className="flex items-center justify-between">
                        <span className="text-[#2a85ff] font-extrabold text-lg leading-none">#{c.rank}</span>
                         <button
                          onClick={e => { e.stopPropagation(); toggleLike(c.id) }}
                          aria-label={`Like ${c.name}`}
                          className="text-[#c8d6e5] hover:text-[#ff6b8a] transition-colors cursor-pointer"
                        >
                          <Heart size={18} fill={liked.has(c.id) ? '#ff6b8a' : 'none'} color={liked.has(c.id) ? '#ff6b8a' : '#c8d6e5'} strokeWidth={2} />
                        </button>
                      </div>

                      {/* Avatar + name + role + source */}
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#2a85ff] to-[#6eb3ff] flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-sm font-bold">{c.initials}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-[#070707] font-bold text-sm leading-tight truncate">{c.name}</p>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 border ${c.source === 'Rankr' ? 'bg-[#e8f1ff] text-[#2a85ff] border-[#2a85ff]/20' : 'bg-[#fff3e8] text-[#f07830] border-[#f07830]/20'}`}>
                              {c.source}
                            </span>
                          </div>
                          <p className="text-[#8a9ab0] text-xs mt-0.5 truncate">{c.role}</p>
                        </div>
                      </div>

                      {/* Score */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-baseline gap-0.5">
                          <span className="text-[#2a85ff] font-extrabold text-2xl leading-none">{c.score}</span>
                          <span className="text-[#b0bac6] text-sm font-medium">/100</span>
                        </div>
                        <div className="flex-1 h-2 bg-[#e8f1ff] rounded-full overflow-hidden">
                          <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-[#2a85ff] to-[#6eb3ff]"
                            initial={{ width: 0 }}
                            animate={{ width: `${c.score}%` }}
                            transition={{ duration: 0.8, delay: idx * 0.06, ease: 'easeOut' }}
                          />
                        </div>
                      </div>

                      {/* Skills pills */}
                      <div className="flex flex-wrap gap-1.5">
                        {c.skills.map(s => (
                          <span key={s} className="text-[10px] font-semibold text-[#2a85ff] bg-[#e8f1ff] px-2.5 py-1 rounded-full">
                            {s}
                          </span>
                        ))}
                      </div>

                      {/* AI reasoning preview */}
                      <p className="text-xs text-[#8a9ab0] italic leading-relaxed line-clamp-2">
                        "{c.reasoning}"
                      </p>

                      {/* Bottom: rec pill + view details */}
                      <div className="flex items-center justify-between pt-2 border-t border-[#f0f5fa]">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${recColor[c.recommendation as Recommendation]}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${recDot[c.recommendation as Recommendation]}`} />
                          {c.recommendation}
                        </span>
                        <button
                          onClick={e => { e.stopPropagation(); setSelectedId(c.id) }}
                          className="text-xs font-semibold text-[#2a85ff] hover:text-[#1a65df] transition-colors cursor-pointer flex items-center gap-1"
                        >
                          View Details →
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-14 h-14 rounded-full bg-[#e8f1ff] flex items-center justify-center mb-4">
                    <Sparkles size={22} color="#2a85ff" strokeWidth={2} />
                  </div>
                  <p className="text-[#070707] font-bold text-lg mb-1">No candidates match filters</p>
                  <p className="text-[#8a9ab0] text-sm">Try adjusting your score range or recommendation filters</p>
                </div>
              )}
            </div>

            {/* Detail Panel */}
            <AnimatePresence>
              {selected && (
                <motion.div
                  key="panel"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 30 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="w-[360px] flex-shrink-0 bg-white rounded-2xl shadow-[0_8px_48px_rgba(42,133,255,0.13)] flex flex-col overflow-hidden sticky top-6"
                  style={{ maxHeight: 'calc(100vh - 48px)' }}
                >
                  {/* Panel Header */}
                  <div className="px-6 pt-5 pb-4 border-b border-[#f0f5fa]">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#2a85ff] to-[#6eb3ff] flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-base font-bold">{selected.initials}</span>
                        </div>
                        <div>
                          <p className="text-[#070707] font-extrabold text-base leading-tight">{selected.name}</p>
                          <p className="text-[#8a9ab0] text-xs mt-0.5">{selected.role}</p>
                          <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${selected.source === 'Rankr' ? 'bg-[#e8f1ff] text-[#2a85ff]' : 'bg-[#fff3e8] text-[#f07830]'}`}>
                            {selected.source}
                          </span>
                        </div>
                      </div>
                       <button
                        onClick={() => setSelectedId(null)}
                        aria-label="Close details panel"
                        className="text-[#b0bac6] hover:text-[#5a6a7a] transition-colors cursor-pointer flex-shrink-0 mt-1"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    {/* Score badge */}
                    <div className="flex items-center gap-3 bg-[#f4f9ff] rounded-xl px-4 py-3">
                      <span className="text-[#2a85ff] font-extrabold text-3xl leading-none">{selected.score}</span>
                      <div className="flex-1">
                        <p className="text-xs text-[#b0bac6] mb-1.5">Match Score</p>
                        <div className="h-2 bg-[#e8f1ff] rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-[#2a85ff] to-[#6eb3ff]"
                            style={{ width: `${selected.score}%` }} />
                        </div>
                      </div>
                      <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${recColor[selected.recommendation as Recommendation]}`}>
                        {selected.recommendation}
                      </span>
                    </div>

                    {/* Panel tabs */}
                    <div className="flex gap-1 mt-4 bg-[#f0f5fa] rounded-xl p-1">
                      <button
                        onClick={() => setPanelTab('reasoning')}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${panelTab === 'reasoning' ? 'bg-white text-[#070707] shadow-sm' : 'text-[#8a9ab0] hover:text-[#5a6a7a]'}`}
                      >
                        AI Reasoning
                      </button>
                      <button
                        onClick={() => setPanelTab('meta')}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${panelTab === 'meta' ? 'bg-white text-[#070707] shadow-sm' : 'text-[#8a9ab0] hover:text-[#5a6a7a]'}`}
                      >
                        Candidate Info
                      </button>
                    </div>
                  </div>

                  {/* Panel body — scrollable */}
                  <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
                    <AnimatePresence mode="wait">
                      {panelTab === 'reasoning' ? (
                        <motion.div key="reasoning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="flex flex-col gap-5">

                          {/* Strengths */}
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <div className="w-6 h-6 rounded-full bg-[#e6f9f0] flex items-center justify-center">
                                <Star size={12} color="#16a34a" strokeWidth={2.5} fill="#16a34a" />
                              </div>
                              <p className="text-sm font-bold text-[#070707]">Strengths</p>
                            </div>
                            <div className="flex flex-col gap-2.5">
                              {selected.strengths.map((s, i) => (
                                <div key={i} className="flex items-start gap-2.5">
                                  <div className="w-4 h-4 rounded-full bg-[#e6f9f0] flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 4l2 2L6.5 1.5" stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                  </div>
                                  <p className="text-xs text-[#3a4a5a] leading-relaxed">{s}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Gaps */}
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <div className="w-6 h-6 rounded-full bg-[#fff9e6] flex items-center justify-center">
                                <AlertTriangle size={12} color="#ca8a04" strokeWidth={2.5} />
                              </div>
                              <p className="text-sm font-bold text-[#070707]">Gaps & Risks</p>
                            </div>
                            <div className="flex flex-col gap-2.5">
                              {selected.gaps.map((g, i) => (
                                <div key={i} className="flex items-start gap-2.5">
                                  <div className="w-4 h-4 rounded-full bg-[#fff9e6] flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#ca8a04]" />
                                  </div>
                                  <p className="text-xs text-[#5a6a7a] leading-relaxed">{g}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Final Recommendation */}
                          <div className="bg-[#f8fbff] rounded-xl px-4 py-3.5 border border-[#e8f1ff]">
                            <p className="text-xs font-bold text-[#070707] mb-2">Final Recommendation</p>
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-extrabold px-4 py-2 rounded-full ${recColor[selected.recommendation as Recommendation]}`}>
                                {selected.recommendation}
                              </span>
                              <p className="text-xs text-[#5a6a7a] leading-relaxed flex-1">
                                {selected.recommendation === 'Hire' ? 'Strongly recommend for interview' : selected.recommendation === 'Consider' ? 'Worth interviewing with caveats' : 'Does not meet requirements'}
                              </p>
                            </div>
                          </div>

                          {/* Matched Skills */}
                          <div>
                            <p className="text-xs font-bold text-[#070707] mb-2.5">Skills Matched</p>
                            <div className="flex flex-wrap gap-1.5">
                              {selected.matched.map(s => (
                                <span key={s} className="text-[10px] font-semibold text-[#2a85ff] bg-[#e8f1ff] px-2.5 py-1 rounded-full">
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div key="meta" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="flex flex-col gap-4">

                          <div className="bg-[#f8fbff] rounded-xl border border-[#e8f1ff] divide-y divide-[#e8f1ff]">
                            {[
                              ['Source', selected.source],
                              ['Experience', `${selected.years} years`],
                              ['Level', selected.expLevel],
                              ['Education', selected.education],
                              ['Location', selected.location || '—'],
                            ].map(([label, value]) => (
                              <div key={label} className="flex items-center justify-between px-4 py-3">
                                <span className="text-xs text-[#8a9ab0] font-medium">{label}</span>
                                <span className="text-xs font-bold text-[#070707]">{value}</span>
                              </div>
                            ))}
                          </div>

                          {selected.source === 'External' && (
                            <button className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border-2 border-dashed border-[#e2eaf2] text-sm font-semibold text-[#5a6a7a] hover:border-[#2a85ff]/40 hover:text-[#2a85ff] transition-all cursor-pointer bg-white">
                              <Download size={15} strokeWidth={2} />
                              Download CV
                            </button>
                          )}

                          {/* Matched skills */}
                          <div>
                            <p className="text-xs font-bold text-[#070707] mb-2.5">Skills Matched</p>
                            <div className="flex flex-wrap gap-1.5">
                              {selected.matched.map(s => (
                                <span key={s} className="text-[10px] font-semibold text-[#2a85ff] bg-[#e8f1ff] px-2.5 py-1 rounded-full">
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Panel footer actions */}
                  <div className="px-6 py-4 border-t border-[#f0f5fa] flex flex-col gap-2.5">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        setShortlisted(prev => {
                          const next = new Set(prev)
                          if (next.has(selected.id)) { next.delete(selected.id) } else { next.add(selected.id) }
                          return next
                        })
                      }}
                      className={`w-full py-3 rounded-xl text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                        shortlisted.has(selected.id)
                          ? 'bg-[#e6f9f0] text-[#16a34a] hover:bg-[#dcf7eb]'
                          : 'bg-[#2a85ff] text-white shadow-[0_4px_16px_rgba(42,133,255,0.35)] hover:bg-[#1a75ef]'
                      }`}
                    >
                      {shortlisted.has(selected.id) ? (
                        <><CheckCircle size={16} strokeWidth={2.2} /> Shortlisted ✓</>
                      ) : (
                        <><Sparkles size={16} strokeWidth={2.2} /> Add to Shortlist</>
                      )}
                    </motion.button>
                    {shortlisted.has(selected.id) && (
                      <button
                        onClick={() => setShortlisted(prev => { const n = new Set(prev); n.delete(selected.id); return n })}
                        className="w-full py-2 rounded-xl text-xs font-semibold text-[#b0bac6] hover:text-[#dc2626] hover:bg-[#fef2f2] transition-all cursor-pointer border border-[#e2eaf2] hover:border-[#dc2626]/30"
                      >
                        Remove from List
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom nav */}
        <div className="mt-10 flex items-center justify-between">
          <Link
            href="/screening"
            className="px-6 py-2.5 rounded-full text-sm font-semibold text-[#5a6a7a] border border-[#e2eaf2] hover:border-[#2a85ff]/40 hover:text-[#2a85ff] transition-all cursor-pointer bg-white inline-flex items-center gap-2"
          >
            ← Back to Screening
          </Link>
          <button 
            onClick={() => handleExport('json')}
            className="px-7 py-2.5 rounded-full text-sm font-semibold text-white bg-[#2a85ff] hover:bg-[#1a75ef] shadow-[0_4px_16px_rgba(42,133,255,0.35)] hover:shadow-[0_4px_20px_rgba(42,133,255,0.5)] transition-all cursor-pointer flex items-center gap-2"
          >
            <Download size={15} strokeWidth={2.2} />
            Export Shortlist report
          </button>
        </div>
      </main>
    </div>
  )
}
