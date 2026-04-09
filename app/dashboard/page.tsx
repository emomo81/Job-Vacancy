'use client'

import React, { useState } from 'react'
import { Poppins } from 'next/font/google'
import { Bell, Sparkles, X, ChevronDown, Plus, Minus, User } from 'lucide-react'
import Link from 'next/link'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-poppins',
})

const DEPARTMENTS = ['Engineering', 'Design', 'Marketing', 'Operations', 'Sales', 'Other']
const EDUCATION_OPTIONS = ["High School", "Bachelor's", "Master's", "PhD", "Any"]
const EXPERIENCE_LEVELS = ['Entry Level', 'Intermediate', 'Expert']
const EMPLOYMENT_TYPES = ['Full-Time', 'Part-Time', 'Contract', 'Remote']
const NAV_LINKS = ['Jobs', 'Candidates', 'Shortlists', 'Settings']

export default function RankrDashboard() {
  const [activeNav, setActiveNav] = useState('Jobs')
  const [jobTitle, setJobTitle] = useState('')
  const [department, setDepartment] = useState('')
  const [expLevel, setExpLevel] = useState('Intermediate')
  const [empType, setEmpType] = useState('Full-Time')
  const [skills, setSkills] = useState<string[]>(['React', 'TypeScript'])
  const [skillInput, setSkillInput] = useState('')
  const [yearsExp, setYearsExp] = useState(3)
  const [education, setEducation] = useState('')
  const [jobDesc, setJobDesc] = useState('')
  const [niceToHave, setNiceToHave] = useState('')

  const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault()
      if (!skills.includes(skillInput.trim())) {
        setSkills([...skills, skillInput.trim()])
      }
      setSkillInput('')
    }
  }

  const removeSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill))
  }

  const incrementYears = () => setYearsExp(prev => Math.min(prev + 1, 20))
  const decrementYears = () => setYearsExp(prev => Math.max(prev - 1, 0))

  return (
    <div className={`${poppins.className} min-h-screen bg-[#f0f5fa]`}>

      {/* Navbar + Hero (seamless dark block) */}
      <div className="bg-[#070707]">

        {/* Navbar */}
        <header className="max-w-[1280px] mx-auto px-6 flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2 select-none">
            <div className="w-8 h-8 rounded-lg bg-[#2a85ff] flex items-center justify-center">
              <Sparkles size={17} color="white" strokeWidth={2.2} />
            </div>
            <span className="text-white text-xl font-bold tracking-tight">Rankr</span>
          </div>

          {/* Nav links */}
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

          {/* Right side */}
          <div className="flex items-center gap-4">
            <button className="relative text-white/60 hover:text-white transition-colors cursor-pointer">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#2a85ff] rounded-full"></span>
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
        <div className="relative overflow-hidden" style={{ minHeight: 220 }}>
          <div className="max-w-[1280px] mx-auto px-6 py-12 flex items-center justify-between relative z-10">
            {/* Left text */}
            <div className="flex-1 max-w-2xl">
              <h1 className="text-white font-extrabold text-5xl lg:text-6xl leading-[1.08] tracking-tight mb-4">
                Find the Right<br />Talent, Faster{' '}
                <span className="text-[#2a85ff]">✦</span>
              </h1>
              <p className="text-white/50 text-base font-normal">
                Let AI screen your candidates in seconds
              </p>
            </div>

            {/* Right: grayscale image cutout */}
            <div className="hidden md:block relative w-[380px] h-[220px] flex-shrink-0 self-end">
              <img
                src="https://uxcanvas.ai/api/generated-images/a41dbe01-2ec5-4de6-bde6-a96289ed1c5f/9bf07167-e189-46c3-9b0b-84e832c5a707"
                alt="Team collaborating"
                className="w-full h-full object-cover object-top"
                style={{
                  filter: 'grayscale(100%) brightness(0.7) contrast(1.1)',
                  maskImage: 'linear-gradient(to bottom, transparent 0%, black 20%, black 70%, transparent 100%), linear-gradient(to left, black 55%, transparent 100%)',
                  WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 20%, black 70%, transparent 100%), linear-gradient(to left, black 55%, transparent 100%)',
                  maskComposite: 'intersect',
                  WebkitMaskComposite: 'source-in',
                }}
              />
            </div>
          </div>

          {/* Subtle background decoration */}
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#2a85ff]/5 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-64 h-64 rounded-full bg-[#2a85ff]/5 blur-3xl pointer-events-none" />
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-[860px] mx-auto px-6 py-12">

        {/* Section heading */}
        <h2 className="text-[#070707] text-2xl font-bold mb-6">Create a New Job</h2>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-[0_4px_32px_rgba(0,0,0,0.07)] p-8 flex flex-col gap-7">

          {/* Job Title */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-[#070707]">Job Title</label>
            <input
              type="text"
              value={jobTitle}
              onChange={e => setJobTitle(e.target.value)}
              placeholder="e.g. Senior Frontend Engineer"
              className="w-full border border-[#e2eaf2] rounded-xl px-4 py-3 text-sm text-[#070707] placeholder-[#b0bac6] focus:outline-none focus:border-[#2a85ff] focus:ring-2 focus:ring-[#2a85ff]/10 transition-all"
            />
          </div>

          {/* Department */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-[#070707]">Department</label>
            <div className="relative">
              <select
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="w-full appearance-none border border-[#e2eaf2] rounded-xl px-4 py-3 text-sm text-[#070707] bg-white focus:outline-none focus:border-[#2a85ff] focus:ring-2 focus:ring-[#2a85ff]/10 transition-all cursor-pointer"
              >
                <option value="" disabled>Select department</option>
                {DEPARTMENTS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#b0bac6] pointer-events-none" />
            </div>
          </div>

          {/* Experience Level */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-[#070707]">Experience Level</label>
            <div className="flex flex-wrap gap-3">
              {EXPERIENCE_LEVELS.map(level => (
                <button
                  key={level}
                  onClick={() => setExpLevel(level)}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all cursor-pointer border ${
                    expLevel === level
                      ? 'bg-[#2a85ff] text-white border-[#2a85ff] shadow-sm'
                      : 'bg-[#f0f5fa] text-[#5a6a7a] border-transparent hover:border-[#2a85ff]/30 hover:text-[#2a85ff]'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Employment Type */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-[#070707]">Employment Type</label>
            <div className="flex flex-wrap gap-3">
              {EMPLOYMENT_TYPES.map(type => (
                <button
                  key={type}
                  onClick={() => setEmpType(type)}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all cursor-pointer border ${
                    empType === type
                      ? 'bg-[#2a85ff] text-white border-[#2a85ff] shadow-sm'
                      : 'bg-[#f0f5fa] text-[#5a6a7a] border-transparent hover:border-[#2a85ff]/30 hover:text-[#2a85ff]'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Required Skills */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-[#070707]">Required Skills</label>
            <div className="min-h-[52px] w-full border border-[#e2eaf2] rounded-xl px-4 py-3 flex flex-wrap gap-2 focus-within:border-[#2a85ff] focus-within:ring-2 focus-within:ring-[#2a85ff]/10 transition-all">
              {skills.map(skill => (
                <span
                  key={skill}
                  className="flex items-center gap-1.5 bg-[#e8f1ff] text-[#2a85ff] text-xs font-semibold px-3 py-1.5 rounded-full"
                >
                  {skill}
                  <button
                    onClick={() => removeSkill(skill)}
                    className="hover:text-[#1a65df] transition-colors cursor-pointer"
                    aria-label={`Remove ${skill}`}
                  >
                    <X size={12} strokeWidth={2.5} />
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                onKeyDown={handleSkillKeyDown}
                placeholder={skills.length === 0 ? 'Type a skill and press Enter…' : ''}
                className="flex-1 min-w-[140px] text-sm text-[#070707] placeholder-[#b0bac6] bg-transparent focus:outline-none"
              />
            </div>
            <p className="text-xs text-[#b0bac6]">Press Enter to add each skill as a tag</p>
          </div>

          {/* Two col: Years of Experience + Education */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

            {/* Years of Experience stepper */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-[#070707]">Years of Experience</label>
              <div className="flex items-center gap-4">
                <button
                  onClick={decrementYears}
                  className="w-10 h-10 rounded-full border border-[#e2eaf2] flex items-center justify-center text-[#5a6a7a] hover:border-[#2a85ff] hover:text-[#2a85ff] transition-all cursor-pointer"
                  aria-label="Decrease years"
                >
                  <Minus size={16} />
                </button>
                <span className="text-[#070707] font-bold text-xl w-12 text-center">
                  {yearsExp === 20 ? '20+' : yearsExp}
                </span>
                <button
                  onClick={incrementYears}
                  className="w-10 h-10 rounded-full border border-[#e2eaf2] flex items-center justify-center text-[#5a6a7a] hover:border-[#2a85ff] hover:text-[#2a85ff] transition-all cursor-pointer"
                  aria-label="Increase years"
                >
                  <Plus size={16} />
                </button>
                <span className="text-[#b0bac6] text-xs">years min.</span>
              </div>
            </div>

            {/* Education Requirement */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-[#070707]">Education Requirement</label>
              <div className="relative">
                <select
                  value={education}
                  onChange={e => setEducation(e.target.value)}
                  className="w-full appearance-none border border-[#e2eaf2] rounded-xl px-4 py-3 text-sm text-[#070707] bg-white focus:outline-none focus:border-[#2a85ff] focus:ring-2 focus:ring-[#2a85ff]/10 transition-all cursor-pointer"
                >
                  <option value="" disabled>Select education</option>
                  {EDUCATION_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#b0bac6] pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Job Description */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-[#070707]">Job Description</label>
            <textarea
              value={jobDesc}
              onChange={e => setJobDesc(e.target.value)}
              rows={6}
              placeholder="Describe the role, responsibilities, and ideal candidate..."
              className="w-full border border-[#e2eaf2] rounded-xl px-4 py-3 text-sm text-[#070707] placeholder-[#b0bac6] focus:outline-none focus:border-[#2a85ff] focus:ring-2 focus:ring-[#2a85ff]/10 transition-all resize-none"
            />
          </div>

          {/* Nice to Have */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-[#070707]">
              Nice to Have{' '}
              <span className="text-[#b0bac6] font-normal">(optional)</span>
            </label>
            <textarea
              value={niceToHave}
              onChange={e => setNiceToHave(e.target.value)}
              rows={3}
              placeholder="Any bonus skills, certifications, or experiences…"
              className="w-full border border-[#e2eaf2] rounded-xl px-4 py-3 text-sm text-[#070707] placeholder-[#b0bac6] focus:outline-none focus:border-[#2a85ff] focus:ring-2 focus:ring-[#2a85ff]/10 transition-all resize-none"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-4 pt-2 border-t border-[#f0f5fa]">
            <button className="px-6 py-2.5 rounded-full text-sm font-semibold text-[#5a6a7a] border border-[#e2eaf2] hover:border-[#2a85ff]/40 hover:text-[#2a85ff] transition-all cursor-pointer bg-white">
              Save Draft
            </button>
            <Link href="/candidates" className="px-7 py-2.5 rounded-full text-sm font-semibold text-white bg-[#2a85ff] hover:bg-[#1a75ef] shadow-[0_4px_16px_rgba(42,133,255,0.35)] hover:shadow-[0_4px_20px_rgba(42,133,255,0.5)] transition-all cursor-pointer flex items-center gap-2">
              Next: Add Candidates
              <span className="text-base leading-none">→</span>
            </Link>
          </div>

        </div>
      </main>
    </div>
  )
}
