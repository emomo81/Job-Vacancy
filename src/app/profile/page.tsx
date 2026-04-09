'use client'

import React, { useState, useRef } from 'react'
import { Poppins } from 'next/font/google'
import {
  Bell, Sparkles, User, MapPin, Upload, FileText,
  Plus, X, Briefcase, GraduationCap, Check, ChevronRight,
  ExternalLink, Minus, Building2
} from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-poppins',
})

const NAV_LINKS = ['Browse Jobs', 'My Profile', 'My Applications']

const INITIAL_SKILLS = ['Node.js', 'TypeScript', 'MongoDB', 'React', 'GraphQL', 'Docker']

const WORK_EXP = [
  {
    id: 1,
    initials: 'AC',
    color: '#2a85ff',
    title: 'Senior Backend Engineer',
    company: 'Acme Corp',
    range: 'Jan 2022 — Present',
    desc: 'Led backend architecture for a SaaS platform serving 200k+ users. Designed and maintained RESTful and GraphQL APIs using Node.js and TypeScript.',
  },
]

const EDUCATION = [
  {
    id: 1,
    initials: 'MU',
    color: '#9f6ef5',
    degree: "Bachelor's in Computer Science",
    institution: 'MIT — Massachusetts Institute of Technology',
    year: '2018 — 2022',
  },
]

const COMPLETION_ITEMS = [
  { label: 'Basic info', done: true },
  { label: 'Skills added', done: true },
  { label: 'CV uploaded', done: true },
  { label: 'Work experience', done: false },
  { label: 'Education', done: false },
]

const COMPLETION_PCT = 75

function CircularProgress({ pct }: { pct: number }) {
  const r = 52
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ
  return (
    <div className="relative w-36 h-36 flex-shrink-0">
      <svg width={144} height={144} viewBox="0 0 144 144" className="-rotate-90">
        <circle cx={72} cy={72} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={10} />
        <circle
          cx={72} cy={72} r={r}
          fill="none"
          stroke="#2a85ff"
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-1000 ease-in-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center rotate-0">
        <span className="text-white font-extrabold text-2xl leading-none">{pct}%</span>
        <span className="text-white/50 text-xs font-medium mt-1">Complete</span>
      </div>
    </div>
  )
}

export default function RankrCandidateProfile() {
  const [activeNav, setActiveNav] = useState('My Profile')

  const [availability, setAvailability] = useState<'open' | 'closed'>('open')
  const [jobTypes, setJobTypes] = useState<Set<string>>(new Set(['Full-Time', 'Remote']))

  const [skills, setSkills] = useState<string[]>(INITIAL_SKILLS)
  const [skillInput, setSkillInput] = useState('')
  const [expLevel, setExpLevel] = useState('Expert')

  const [cvUploaded, setCvUploaded] = useState(true)
  const [cvDragging, setCvDragging] = useState(false)
  const cvRef = useRef<HTMLInputElement>(null)

  const [fullName, setFullName] = useState('Jordan Reeves')
  const [proTitle, setProTitle] = useState('Senior Backend Engineer')
  const [location, setLocation] = useState('San Francisco, CA')
  const [yearsExp, setYearsExp] = useState(7)
  const [linkedin, setLinkedin] = useState('linkedin.com/in/jordanreeves')

  const toggleJobType = (t: string) => {
    setJobTypes(prev => {
      const n = new Set(prev)
      if (n.has(t)) {
        n.delete(t)
      } else {
        n.add(t)
      }
      return n
    })
  }

  const handleSkillKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault()
      if (!skills.includes(skillInput.trim())) setSkills([...skills, skillInput.trim()])
      setSkillInput('')
    }
  }

  return (
    <div className={`${poppins.className} min-h-screen bg-[#f0f5fa] pb-24`}>

      {/* Navbar + Hero */}
      <div className="bg-[#070707]">

        {/* Navbar */}
        <header className="max-w-[1280px] mx-auto px-6 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 select-none">
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
            <button className="relative text-white/60 hover:text-white transition-colors cursor-pointer" aria-label="Notifications">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#2a85ff] rounded-full" />
            </button>
            <div className="flex items-center gap-2 cursor-pointer group">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2a85ff] to-[#6eb3ff] flex items-center justify-center">
                <span className="text-white text-xs font-bold">JR</span>
              </div>
              <span className="text-white/80 text-sm font-medium group-hover:text-white transition-colors">Jordan Reeves</span>
            </div>
          </div>
        </header>

        {/* Hero Banner */}
        <div className="relative overflow-hidden min-h-[160px]">
          <div className="max-w-[1280px] mx-auto px-6 py-8 flex items-center justify-between relative z-10">
            <div>
              <h1 className="text-white font-extrabold text-5xl lg:text-6xl leading-[1.08] tracking-tight mb-2">
                Your Profile <span className="text-[#2a85ff]">✦</span>
              </h1>
              <p className="text-white/50 text-base font-normal">
                Help recruiters find the right version of you
              </p>
            </div>
            <CircularProgress pct={COMPLETION_PCT} />
          </div>
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-[#2a85ff]/5 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-48 h-48 rounded-full bg-[#2a85ff]/5 blur-3xl pointer-events-none" />
        </div>
      </div>

      {/* Content */}
      <main className="max-w-[1280px] mx-auto px-6 py-10">
        <div className="flex gap-7 items-start">

          {/* ── LEFT COLUMN ── */}
          <div className="w-[300px] flex-shrink-0 flex flex-col gap-5">

            {/* Profile Card */}
            <div className="bg-white rounded-2xl shadow-[0_4px_32px_rgba(0,0,0,0.07)] p-6 flex flex-col items-center gap-4">
              {/* Avatar */}
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#2a85ff] to-[#6eb3ff] flex items-center justify-center ring-4 ring-[#2a85ff]/20">
                  <span className="text-white text-2xl font-extrabold tracking-tight">JR</span>
                </div>
                <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-white shadow-md flex items-center justify-center border border-[#e2eaf2]">
                  <Upload size={13} color="#2a85ff" strokeWidth={2.2} />
                </div>
              </div>
              <button className="text-xs font-semibold text-[#2a85ff] hover:underline cursor-pointer">Upload Photo</button>

              {/* Name + role + location */}
              <div className="text-center">
                <p className="text-[#070707] font-extrabold text-lg leading-tight">{fullName}</p>
                <p className="text-[#8a9ab0] text-sm mt-0.5">{proTitle}</p>
                <div className="flex items-center justify-center gap-1 mt-1.5">
                  <MapPin size={12} color="#b0bac6" strokeWidth={2} />
                  <span className="text-[#b0bac6] text-xs">{location}</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-[#070707]">Profile Completion</span>
                  <span className="text-xs font-bold text-[#2a85ff]">{COMPLETION_PCT}%</span>
                </div>
                <div className="w-full h-2 bg-[#e8f1ff] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-[#2a85ff] to-[#6eb3ff]"
                    initial={{ width: 0 }}
                    animate={{ width: `${COMPLETION_PCT}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                  />
                </div>
              </div>

              {/* Checklist */}
              <div className="w-full flex flex-col gap-1.5">
                {COMPLETION_ITEMS.map(item => (
                  <div key={item.label} className="flex items-center gap-2">
                    {item.done ? (
                      <div className="w-4 h-4 rounded-full bg-[#e6f9f0] flex items-center justify-center flex-shrink-0">
                        <Check size={9} color="#16a34a" strokeWidth={3} />
                      </div>
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-[#d0dce8] flex-shrink-0" />
                    )}
                    <span className={`text-xs ${item.done ? 'text-[#5a6a7a]' : 'text-[#b0bac6]'}`}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Availability Card */}
            <div className="bg-white rounded-2xl shadow-[0_4px_32px_rgba(0,0,0,0.07)] p-5 flex flex-col gap-4">
              <p className="text-sm font-bold text-[#070707]">Availability</p>

              {/* Open/Not toggle */}
              <div className="flex gap-2">
                {[
                  { key: 'open', label: 'Open to Work', colorActive: 'bg-[#e6f9f0] text-[#16a34a] border border-[#16a34a]/30', colorInactive: 'bg-[#f0f5fa] text-[#8a9ab0] border border-transparent' },
                  { key: 'closed', label: 'Not Available', colorActive: 'bg-[#fef2f2] text-[#dc2626] border border-[#dc2626]/20', colorInactive: 'bg-[#f0f5fa] text-[#8a9ab0] border border-transparent' },
                ].map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => setAvailability(opt.key as 'open' | 'closed')}
                    className={`flex-1 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${availability === opt.key ? opt.colorActive : opt.colorInactive}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Job Type pills */}
              <div>
                <p className="text-xs font-semibold text-[#8a9ab0] uppercase tracking-wide mb-2">Job Type</p>
                <div className="flex flex-wrap gap-2">
                  {['Full-Time', 'Part-Time', 'Remote', 'Contract'].map(t => (
                    <button
                      key={t}
                      onClick={() => toggleJobType(t)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
                        jobTypes.has(t)
                          ? 'bg-[#2a85ff] text-white border-[#2a85ff] shadow-sm'
                          : 'bg-[#f0f5fa] text-[#5a6a7a] border-transparent hover:border-[#2a85ff]/30 hover:text-[#2a85ff]'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="flex-1 min-w-0 flex flex-col gap-5">

            {/* Card 1 — Basic Information */}
            <div className="bg-white rounded-2xl shadow-[0_4px_32px_rgba(0,0,0,0.07)] p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-[#070707] font-bold text-lg">Basic Information</h2>
                <button className="text-xs font-semibold text-[#2a85ff] hover:underline cursor-pointer">Edit</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#5a6a7a]">Full Name</label>
                  <input
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    aria-label="Full Name"
                    className="border border-[#e2eaf2] rounded-xl px-4 py-2.5 text-sm text-[#070707] placeholder-[#b0bac6] focus:outline-none focus:border-[#2a85ff] focus:ring-2 focus:ring-[#2a85ff]/10 transition-all"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#5a6a7a]">Professional Title</label>
                  <input
                    value={proTitle}
                    onChange={e => setProTitle(e.target.value)}
                    placeholder="e.g. Senior Backend Engineer"
                    className="border border-[#e2eaf2] rounded-xl px-4 py-2.5 text-sm text-[#070707] placeholder-[#b0bac6] focus:outline-none focus:border-[#2a85ff] focus:ring-2 focus:ring-[#2a85ff]/10 transition-all"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#5a6a7a]">Location</label>
                  <input
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder="City, Country"
                    className="border border-[#e2eaf2] rounded-xl px-4 py-2.5 text-sm text-[#070707] placeholder-[#b0bac6] focus:outline-none focus:border-[#2a85ff] focus:ring-2 focus:ring-[#2a85ff]/10 transition-all"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#5a6a7a]">Years of Experience</label>
                  <div className="flex items-center gap-3 border border-[#e2eaf2] rounded-xl px-4 py-2.5">
                    <button
                      onClick={() => setYearsExp(v => Math.max(0, v - 1))}
                      aria-label="Decrease years"
                      className="w-6 h-6 rounded-full border border-[#e2eaf2] flex items-center justify-center text-[#5a6a7a] hover:border-[#2a85ff] hover:text-[#2a85ff] transition-all cursor-pointer flex-shrink-0"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="text-[#070707] font-bold text-sm flex-1 text-center">{yearsExp === 20 ? '20+' : yearsExp} yrs</span>
                    <button
                      onClick={() => setYearsExp(v => Math.min(20, v + 1))}
                      aria-label="Increase years"
                      className="w-6 h-6 rounded-full border border-[#e2eaf2] flex items-center justify-center text-[#5a6a7a] hover:border-[#2a85ff] hover:text-[#2a85ff] transition-all cursor-pointer flex-shrink-0"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
                <div className="sm:col-span-2 flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#5a6a7a]">
                    LinkedIn URL <span className="text-[#b0bac6] font-normal">(optional)</span>
                  </label>
                  <div className="relative">
                    <input
                      value={linkedin}
                      onChange={e => setLinkedin(e.target.value)}
                      placeholder="linkedin.com/in/yourname"
                      className="w-full border border-[#e2eaf2] rounded-xl px-4 py-2.5 pr-10 text-sm text-[#070707] placeholder-[#b0bac6] focus:outline-none focus:border-[#2a85ff] focus:ring-2 focus:ring-[#2a85ff]/10 transition-all"
                    />
                    <ExternalLink size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#b0bac6]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2 — Skills */}
            <div className="bg-white rounded-2xl shadow-[0_4px_32px_rgba(0,0,0,0.07)] p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-[#070707] font-bold text-lg">Skills</h2>
                <button className="text-xs font-semibold text-[#2a85ff] hover:underline cursor-pointer">Edit</button>
              </div>
              {/* Skill tag input */}
              <div className="min-h-[52px] border border-[#e2eaf2] rounded-xl px-4 py-3 flex flex-wrap gap-2 focus-within:border-[#2a85ff] focus-within:ring-2 focus-within:ring-[#2a85ff]/10 transition-all mb-4">
                {skills.map(s => (
                  <span key={s} className="flex items-center gap-1.5 bg-[#e8f1ff] text-[#2a85ff] text-xs font-semibold px-3 py-1.5 rounded-full">
                    {s}
                    <button aria-label={`Remove skill ${s}`} onClick={() => setSkills(prev => prev.filter(x => x !== s))} className="hover:text-[#1a65df] cursor-pointer">
                      <X size={11} strokeWidth={2.5} />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={handleSkillKey}
                  aria-label="Add a skill"
                  placeholder={skills.length === 0 ? 'Type a skill and press Enter…' : ''}
                  className="flex-1 min-w-[160px] text-sm text-[#070707] placeholder-[#b0bac6] bg-transparent focus:outline-none"
                />
              </div>
              <p className="text-xs text-[#b0bac6] mb-4">Press Enter to add each skill</p>

              {/* Experience Level pills */}
              <div>
                <p className="text-xs font-semibold text-[#5a6a7a] uppercase tracking-wide mb-2.5">Experience Level</p>
                <div className="flex gap-3 flex-wrap">
                  {['Entry Level', 'Intermediate', 'Expert'].map(lvl => (
                    <button
                      key={lvl}
                      onClick={() => setExpLevel(lvl)}
                      className={`px-5 py-2 rounded-full text-sm font-medium transition-all cursor-pointer border ${
                        expLevel === lvl
                          ? 'bg-[#2a85ff] text-white border-[#2a85ff] shadow-sm'
                          : 'bg-[#f0f5fa] text-[#5a6a7a] border-transparent hover:border-[#2a85ff]/30 hover:text-[#2a85ff]'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Card 3 — CV Upload */}
            <div className="bg-white rounded-2xl shadow-[0_4px_32px_rgba(0,0,0,0.07)] p-6">
              <h2 className="text-[#070707] font-bold text-lg mb-5">Upload Your CV</h2>

              <AnimatePresence mode="wait">
                {!cvUploaded ? (
                  <motion.div
                    key="upload-zone"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => cvRef.current?.click()}
                    onDragOver={e => { e.preventDefault(); setCvDragging(true) }}
                    onDragLeave={() => setCvDragging(false)}
                    onDrop={e => { e.preventDefault(); setCvDragging(false); setCvUploaded(true) }}
                    className={`border-2 border-dashed rounded-2xl px-6 py-12 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all ${
                      cvDragging
                        ? 'border-[#2a85ff] bg-[#e8f1ff]'
                        : 'border-[#d0dce8] bg-[#f8fbff] hover:border-[#2a85ff]/50 hover:bg-[#f0f7ff]'
                    }`}
                  >
                    <div className="w-16 h-16 rounded-2xl bg-[#e8f1ff] flex items-center justify-center">
                      <FileText size={30} color="#2a85ff" strokeWidth={1.6} />
                    </div>
                    <div className="text-center">
                      <p className="text-[#070707] font-bold text-base">Drop your CV here</p>
                      <p className="text-[#8a9ab0] text-sm mt-1">PDF, DOC or DOCX · Max 5MB</p>
                    </div>
                    <button className="px-5 py-2 rounded-full text-sm font-semibold text-white bg-[#2a85ff] hover:bg-[#1a75ef] shadow-[0_4px_14px_rgba(42,133,255,0.35)] transition-all cursor-pointer">
                      Browse Files
                    </button>
                    <input ref={cvRef} type="file" accept=".pdf,.doc,.docx" className="hidden" aria-label="Upload CV file" onChange={() => setCvUploaded(true)} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="uploaded-state"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="border-2 border-dashed border-[#2a85ff]/30 rounded-2xl bg-[#f4f9ff] p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[#e8f1ff] flex items-center justify-center flex-shrink-0">
                        <FileText size={22} color="#2a85ff" strokeWidth={1.8} />
                      </div>
                      <div className="flex-1 min-0">
                        <p className="text-[#070707] font-bold text-sm truncate">Jordan_Reeves_CV.pdf</p>
                        <p className="text-[#8a9ab0] text-xs mt-0.5">243 KB · Uploaded just now</p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#16a34a] bg-[#e6f9f0] px-3 py-1.5 rounded-full border border-[#16a34a]/20">
                          <Check size={11} strokeWidth={3} />
                          Uploaded
                        </span>
                        <button
                          onClick={() => setCvUploaded(false)}
                          className="text-xs text-[#b0bac6] hover:text-[#5a6a7a] font-medium cursor-pointer transition-colors"
                        >
                          Replace
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <p className="text-xs text-[#b0bac6] mt-4 leading-relaxed">
                Your CV is used by Rankr's AI to match you to relevant jobs automatically
              </p>
            </div>

            {/* Card 4 — Work Experience */}
            <div className="bg-white rounded-2xl shadow-[0_4px_32px_rgba(0,0,0,0.07)] p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-[#070707] font-bold text-lg">Work Experience</h2>
                <button className="text-xs font-semibold text-[#2a85ff] hover:underline cursor-pointer flex items-center gap-1">
                  <Plus size={13} strokeWidth={2.5} />
                  Add Experience
                </button>
              </div>

              <div className="flex flex-col gap-4">
                {WORK_EXP.map(exp => (
                  <div key={exp.id} className="flex gap-4">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${exp.color}18` }}
                    >
                      <span className="text-sm font-extrabold" style={{ color: exp.color }}>{exp.initials}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-[#070707] font-bold text-sm leading-tight">{exp.title}</p>
                          <p className="text-[#8a9ab0] text-xs mt-0.5">{exp.company}</p>
                        </div>
                        <span className="text-xs text-[#b0bac6] font-medium flex-shrink-0">{exp.range}</span>
                      </div>
                      <p className="text-[#5a6a7a] text-xs mt-2 leading-relaxed line-clamp-2">{exp.desc}</p>
                    </div>
                  </div>
                ))}

                {/* Dashed add row */}
                <button className="flex items-center gap-3 border-2 border-dashed border-[#e2eaf2] rounded-xl px-4 py-3.5 hover:border-[#2a85ff]/40 hover:bg-[#f4f9ff] transition-all cursor-pointer group">
                  <div className="w-9 h-9 rounded-xl bg-[#f0f5fa] flex items-center justify-center group-hover:bg-[#e8f1ff] transition-colors">
                    <Briefcase size={16} color="#b0bac6" strokeWidth={2} />
                  </div>
                  <span className="text-sm font-semibold text-[#b0bac6] group-hover:text-[#2a85ff] transition-colors">Add another experience</span>
                </button>
              </div>
            </div>

            {/* Card 5 — Education */}
            <div className="bg-white rounded-2xl shadow-[0_4px_32px_rgba(0,0,0,0.07)] p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-[#070707] font-bold text-lg">Education</h2>
                <button className="text-xs font-semibold text-[#2a85ff] hover:underline cursor-pointer flex items-center gap-1">
                  <Plus size={13} strokeWidth={2.5} />
                  Add Education
                </button>
              </div>

              <div className="flex flex-col gap-4">
                {EDUCATION.map(edu => (
                  <div key={edu.id} className="flex gap-4">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${edu.color}18` }}
                    >
                      <span className="text-sm font-extrabold" style={{ color: edu.color }}>{edu.initials}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-[#070707] font-bold text-sm leading-tight">{edu.degree}</p>
                          <p className="text-[#8a9ab0] text-xs mt-0.5">{edu.institution}</p>
                        </div>
                        <span className="text-xs text-[#b0bac6] font-medium flex-shrink-0">{edu.year}</span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Dashed add row */}
                <button className="flex items-center gap-3 border-2 border-dashed border-[#e2eaf2] rounded-xl px-4 py-3.5 hover:border-[#2a85ff]/40 hover:bg-[#f4f9ff] transition-all cursor-pointer group">
                  <div className="w-9 h-9 rounded-xl bg-[#f0f5fa] flex items-center justify-center group-hover:bg-[#e8f1ff] transition-colors">
                    <GraduationCap size={16} color="#b0bac6" strokeWidth={2} />
                  </div>
                  <span className="text-sm font-semibold text-[#b0bac6] group-hover:text-[#2a85ff] transition-colors">Add education entry</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e8f1ff] shadow-[0_-4px_32px_rgba(0,0,0,0.08)] z-50">
        <div className="max-w-[1280px] mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-2 h-2 rounded-full bg-[#f07830] flex-shrink-0" />
            <p className="text-sm text-[#5a6a7a] truncate">
              <span className="font-semibold text-[#070707]">Profile {COMPLETION_PCT}% complete</span>
              {' '}— add work experience to reach 100%
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <button className="px-6 py-2.5 rounded-full text-sm font-semibold text-[#5a6a7a] border border-[#e2eaf2] hover:border-[#2a85ff]/40 hover:text-[#2a85ff] transition-all cursor-pointer bg-white">
              Save Draft
            </button>
            <button className="px-7 py-2.5 rounded-full text-sm font-semibold text-white bg-[#2a85ff] hover:bg-[#1a75ef] shadow-[0_4px_16px_rgba(42,133,255,0.35)] hover:shadow-[0_4px_20px_rgba(42,133,255,0.5)] transition-all cursor-pointer flex items-center gap-2">
              <Check size={15} strokeWidth={2.8} />
              Save Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
