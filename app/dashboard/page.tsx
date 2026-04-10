'use client'

import React, { useState } from 'react'
import { Sparkles, ChevronDown, Plus, Minus, X, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'motion/react'
import Navbar from '../components/Navbar'

const DEPARTMENTS = ['Engineering', 'Design', 'Marketing', 'Operations', 'Sales', 'Other']
const EDUCATION_OPTIONS = ["High School", "Bachelor's", "Master's", "PhD", "Any"]
const EXPERIENCE_LEVELS = ['Entry Level', 'Intermediate', 'Expert']
const EMPLOYMENT_TYPES = ['Full-Time', 'Part-Time', 'Contract', 'Remote']

export default function RankrDashboard() {
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
    <div className="min-h-screen bg-[#f0f5fa]">
      <Navbar type="app" activeNav="Jobs" />

      {/* Hero Banner (seamless dark block) */}
      <div className="bg-[#070707] pt-20 sm:pt-24 lg:pt-32 pb-12 sm:pb-20 overflow-hidden relative">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between relative z-10 gap-8">
          {/* Left text */}
          <div className="flex-1 max-w-2xl text-center md:text-left">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h1 className="text-white font-extrabold text-4xl sm:text-5xl lg:text-7xl leading-[1.1] tracking-tight mb-4 sm:mb-6">
                Find the Right<br />Talent, Faster{' '}
                <span className="text-[#2a85ff]">✦</span>
              </h1>
              <p className="text-white/50 text-sm sm:text-lg font-normal max-w-md mx-auto md:mx-0">
                Create a precision job profile and let AI screen your candidates in seconds
              </p>
            </motion.div>
          </div>

          {/* Right: grayscale image cutout */}
          <div className="hidden md:block relative w-[320px] lg:w-[420px] h-[200px] lg:h-[280px] flex-shrink-0 self-end">
            <img
              src="https://uxcanvas.ai/api/generated-images/a41dbe01-2ec5-4de6-bde6-a96289ed1c5f/9bf07167-e189-46c3-9b0b-84e832c5a707"
              alt="Team collaborating"
              className="w-full h-full object-cover object-top grayscale-[100%] brightness-[0.7] contrast-[1.1]"
              style={{
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

      {/* Main content */}
      <main className="max-w-[900px] mx-auto px-4 sm:px-6 -mt-8 sm:-mt-12 relative z-20 pb-20">
        
        {/* Form Card */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-[0_4px_40px_rgba(0,0,0,0.08)] p-5 sm:p-10 flex flex-col gap-8 sm:gap-10 border border-white">
          
          <div className="flex items-center justify-between border-b border-[#f0f5fa] pb-6 sm:pb-8">
            <div>
              <h2 className="text-[#070707] text-xl sm:text-2xl font-bold">New Job Post</h2>
              <p className="text-[#8a9ab0] text-xs sm:text-sm mt-1">Define your requirements for AI screening</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#f0f5fa] flex items-center justify-center text-[#2a85ff]">
              <Sparkles size={20} className="sm:size-24" />
            </div>
          </div>

          {/* Grid for small controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10">
            {/* Job Title */}
            <div className="flex flex-col gap-2.5">
              <label className="text-sm font-bold text-[#070707] tracking-tight">Job Title</label>
              <input
                type="text"
                value={jobTitle}
                onChange={e => setJobTitle(e.target.value)}
                placeholder="e.g. Senior Frontend Engineer"
                className="w-full border border-[#e2eaf2] rounded-xl px-4 py-3.5 text-sm text-[#070707] placeholder-[#b0bac6] focus:outline-none focus:border-[#2a85ff] focus:ring-4 focus:ring-[#2a85ff]/5 transition-all bg-[#fcfdfe]"
              />
            </div>

            {/* Department */}
            <div className="flex flex-col gap-2.5">
              <label className="text-sm font-bold text-[#070707] tracking-tight">Department</label>
              <div className="relative">
                <select
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                  className="w-full appearance-none border border-[#e2eaf2] rounded-xl px-4 py-3.5 text-sm text-[#070707] bg-[#fcfdfe] focus:outline-none focus:border-[#2a85ff] focus:ring-4 focus:ring-[#2a85ff]/5 transition-all cursor-pointer"
                >
                  <option value="" disabled>Select department</option>
                  {DEPARTMENTS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#b0bac6] pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Level & Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10">
            <div className="flex flex-col gap-3">
              <label className="text-sm font-bold text-[#070707] tracking-tight">Experience Level</label>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {EXPERIENCE_LEVELS.map(level => (
                  <button
                    key={level}
                    onClick={() => setExpLevel(level)}
                    className={`px-4 sm:px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all border ${
                      expLevel === level
                        ? 'bg-[#2a85ff] text-white border-[#2a85ff] shadow-lg shadow-[#2a85ff]/20'
                        : 'bg-white text-[#5a6a7a] border-[#e2eaf2] hover:border-[#2a85ff]/40 hover:text-[#2a85ff]'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-sm font-bold text-[#070707] tracking-tight">Employment Type</label>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {EMPLOYMENT_TYPES.map(type => (
                  <button
                    key={type}
                    onClick={() => setEmpType(type)}
                    className={`px-4 sm:px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all border ${
                      empType === type
                        ? 'bg-[#2a85ff] text-white border-[#2a85ff] shadow-lg shadow-[#2a85ff]/20'
                        : 'bg-white text-[#5a6a7a] border-[#e2eaf2] hover:border-[#2a85ff]/40 hover:text-[#2a85ff]'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Required Skills */}
          <div className="flex flex-col gap-3">
            <label className="text-sm font-bold text-[#070707] tracking-tight">Required Skills</label>
            <div className="min-h-[60px] w-full border border-[#e2eaf2] rounded-2xl px-4 py-3 flex flex-wrap gap-2 focus-within:border-[#2a85ff] focus-within:ring-4 focus-within:ring-[#2a85ff]/5 transition-all bg-[#fcfdfe]">
              {skills.map(skill => (
                <span
                  key={skill}
                  className="flex items-center gap-2 bg-[#e8f1ff] text-[#2a85ff] text-xs font-bold px-3.5 py-1.5 rounded-lg border border-[#2a85ff]/10"
                >
                  {skill}
                  <button
                    onClick={() => removeSkill(skill)}
                    className="hover:text-[#1a65df] transition-colors cursor-pointer"
                  >
                    <X size={14} strokeWidth={3} />
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                onKeyDown={handleSkillKeyDown}
                placeholder={skills.length === 0 ? 'Type skill and press Enter…' : ''}
                className="flex-1 min-w-[160px] text-sm text-[#070707] placeholder-[#b0bac6] bg-transparent focus:outline-none"
              />
            </div>
            <p className="text-[11px] text-[#b0bac6] font-medium uppercase tracking-wider">Press Enter to add tags</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-10">
            {/* Experience stepper */}
            <div className="flex flex-col gap-3">
              <label className="text-sm font-bold text-[#070707] tracking-tight">Years (Min)</label>
              <div className="flex items-center gap-5 bg-[#fcfdfe] border border-[#e2eaf2] rounded-2xl p-2 w-fit">
                <button
                  onClick={decrementYears}
                  className="w-10 h-10 rounded-xl bg-white border border-[#e2eaf2] flex items-center justify-center text-[#5a6a7a] hover:border-[#2a85ff] hover:text-[#2a85ff] transition-all cursor-pointer shadow-sm"
                >
                  <Minus size={18} strokeWidth={2.5} />
                </button>
                <div className="flex flex-col items-center min-w-[40px]">
                  <span className="text-[#070707] font-black text-2xl leading-none">
                    {yearsExp === 20 ? '20+' : yearsExp}
                  </span>
                </div>
                <button
                  onClick={incrementYears}
                  className="w-10 h-10 rounded-xl bg-white border border-[#e2eaf2] flex items-center justify-center text-[#5a6a7a] hover:border-[#2a85ff] hover:text-[#2a85ff] transition-all cursor-pointer shadow-sm"
                >
                  <Plus size={18} strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {/* Education */}
            <div className="flex flex-col gap-3">
              <label className="text-sm font-bold text-[#070707] tracking-tight">Education</label>
              <div className="relative">
                <select
                  value={education}
                  onChange={e => setEducation(e.target.value)}
                  className="w-full appearance-none border border-[#e2eaf2] rounded-2xl px-4 py-3.5 text-sm text-[#070707] bg-[#fcfdfe] focus:outline-none focus:border-[#2a85ff] focus:ring-4 focus:ring-[#2a85ff]/5 transition-all cursor-pointer"
                >
                  <option value="" disabled>Required degree</option>
                  {EDUCATION_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#b0bac6] pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Textareas */}
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-3">
              <label className="text-sm font-bold text-[#070707] tracking-tight">Job Description</label>
              <textarea
                value={jobDesc}
                onChange={e => setJobDesc(e.target.value)}
                rows={5}
                placeholder="Key responsibilities and expectations..."
                className="w-full border border-[#e2eaf2] rounded-2xl px-5 py-4 text-sm text-[#070707] placeholder-[#b0bac6] focus:outline-none focus:border-[#2a85ff] focus:ring-4 focus:ring-[#2a85ff]/5 transition-all resize-none bg-[#fcfdfe]"
              />
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-sm font-bold text-[#070707] tracking-tight">Bonus Qualifications (Optional)</label>
              <textarea
                value={niceToHave}
                onChange={e => setNiceToHave(e.target.value)}
                rows={3}
                placeholder="Certifications, specific industry experience..."
                className="w-full border border-[#e2eaf2] rounded-2xl px-5 py-4 text-sm text-[#070707] placeholder-[#b0bac6] focus:outline-none focus:border-[#2a85ff] focus:ring-4 focus:ring-[#2a85ff]/5 transition-all resize-none bg-[#fcfdfe]"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-8 border-t border-[#f0f5fa]">
            <button className="w-full sm:w-auto px-8 py-3.5 rounded-full text-sm font-bold text-[#5a6a7a] border border-[#e2eaf2] hover:border-[#2a85ff]/40 hover:text-[#2a85ff] transition-all bg-white">
              Save for Later
            </button>
            <Link 
              href="/candidates" 
              className="w-full sm:w-auto px-10 py-4 rounded-full text-sm font-black text-white bg-[#2a85ff] hover:bg-[#1a75ef] shadow-2xl shadow-[#2a85ff]/30 hover:shadow-[#2a85ff]/50 transition-all flex items-center justify-center gap-3 group"
            >
              Next: Add Candidates
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

        </div>
      </main>
    </div>
  )
}
