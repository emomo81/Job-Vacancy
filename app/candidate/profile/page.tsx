'use client'

import React, { useState, useRef, useEffect } from 'react'
import {
  User, MapPin, Upload, FileText,
  Plus, X, Briefcase, GraduationCap, Check, 
  ExternalLink, Minus, Sparkles, AlertCircle
} from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'

const COMPLETION_ITEMS = [
  { id: 'info', label: 'Basic Information', done: true },
  { id: 'skills', label: 'Skills', done: true },
  { id: 'exp', label: 'Work Experience', done: true },
  { id: 'cv', label: 'Upload CV', done: true },
  { id: 'edu', label: 'Education', done: true },
  { id: 'avail', label: 'Availability', done: false },
]

interface Experience {
  id: string;
  role: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string;
}

export default function CandidateProfilePage() {
  // Load initial data from localStorage if exists
  const [fullName, setFullName] = useState('New Candidate')
  const [proTitle, setProTitle] = useState('Product Engineer')
  const [location, setLocation] = useState('Kigali, Rwanda')
  const [yearsExp, setYearsExp] = useState(2)
  const [linkedin, setLinkedin] = useState('')
  const [skills, setSkills] = useState<string[]>(['TypeScript', 'React'])
  const [completionPct, setCompletionPct] = useState(75)

  const [workHistory, setWorkHistory] = useState<Experience[]>([])
  const [isExpModalOpen, setIsExpModalOpen] = useState(false)
  const [editingExp, setEditingExp] = useState<Experience | null>(null)

  const [skillInput, setSkillInput] = useState('')
  const [availability, setAvailability] = useState<'open' | 'closed'>('open')
  const [visible, setVisible] = useState(true)
  const [remote, setRemote] = useState(true)
  const [fulltime, setFulltime] = useState(true)
  const [cvUploaded, setCvUploaded] = useState(false)
  
  const cvRef = useRef<HTMLInputElement>(null)

  // Initialize from session/example
  useEffect(() => {
    const savedName = localStorage.getItem('rankr_user_name')
    if (savedName) setFullName(savedName)
    else {
      // Default demo content if brand new
      setFullName('Jordan Reeves')
      setProTitle('Senior Backend Engineer')
      setLocation('San Francisco, CA')
      setYearsExp(7)
      setSkills(['Node.js', 'TypeScript', 'MongoDB', 'React', 'GraphQL', 'Docker'])
      setCvUploaded(true)
      setWorkHistory([
        {
          id: '1',
          role: 'Senior Backend Engineer',
          company: 'TechFlow Systems',
          startDate: 'Jan 2021',
          endDate: 'Present',
          description: 'Architected high-performance microservices using Node.js and Go. Reduced API latency by 40% through Redis caching and PostgreSQL optimization.'
        },
        {
          id: '2',
          role: 'Full Stack Developer',
          company: 'GreenLogic',
          startDate: 'Jun 2018',
          endDate: 'Dec 2020',
          description: 'Built scalable web applications using React and Python/Django. Led the migration of legacy systems to AWS.'
        }
      ])
    }
  }, [])

  const handleSave = () => {
    localStorage.setItem('rankr_user_name', fullName)
    localStorage.setItem('rankr_profile_completion', completionPct.toString())
    // In a real app we'd save the rest too
    alert('Profile saved successfully! Your changes are now live.')
    window.location.reload() // Refresh to update layout sync
  }

  const handleExpSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const newExp: Experience = {
      id: editingExp?.id || Date.now().toString(),
      role: formData.get('role') as string,
      company: formData.get('company') as string,
      startDate: formData.get('startDate') as string,
      endDate: formData.get('endDate') as string,
      description: formData.get('description') as string,
    }

    if (editingExp) {
      setWorkHistory(prev => prev.map(exp => exp.id === editingExp.id ? newExp : exp))
    } else {
      setWorkHistory(prev => [newExp, ...prev])
    }
    setIsExpModalOpen(false)
    setEditingExp(null)
  }

  const handleDeleteExp = (id: string) => {
    if (confirm('Are you sure you want to delete this experience?')) {
      setWorkHistory(prev => prev.filter(exp => exp.id !== id))
    }
  }

  const handleSkillKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault()
      if (!skills.includes(skillInput.trim())) setSkills([...skills, skillInput.trim()])
      setSkillInput('')
    }
  }

  return (
    <div className="flex flex-col gap-8 pb-32">
      
      {/* ── EXPERIENCE MODAL ── */}
      <AnimatePresence>
        {isExpModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsExpModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-white rounded-[2.5rem] p-8 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#2a85ff]/5 blur-3xl" />
              <h3 className="text-2xl font-black text-[#070707] mb-6">
                {editingExp ? 'Edit Experience' : 'Add Experience'}
              </h3>
              
              <form onSubmit={handleExpSave} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#8a9ab0] uppercase tracking-wider px-1">Role / Title</label>
                    <input name="role" defaultValue={editingExp?.role} required className="w-full bg-[#f8fbff] border border-[#e2eaf2] rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-[#2a85ff]" placeholder="e.g. Senior Backend Engineer" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#8a9ab0] uppercase tracking-wider px-1">Company</label>
                    <input name="company" defaultValue={editingExp?.company} required className="w-full bg-[#f8fbff] border border-[#e2eaf2] rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-[#2a85ff]" placeholder="e.g. Google" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#8a9ab0] uppercase tracking-wider px-1">Start Date</label>
                    <input name="startDate" defaultValue={editingExp?.startDate} required className="w-full bg-[#f8fbff] border border-[#e2eaf2] rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-[#2a85ff]" placeholder="e.g. Jan 2021" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#8a9ab0] uppercase tracking-wider px-1">End Date</label>
                    <input name="endDate" defaultValue={editingExp?.endDate} required className="w-full bg-[#f8fbff] border border-[#e2eaf2] rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-[#2a85ff]" placeholder="e.g. Present" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#8a9ab0] uppercase tracking-wider px-1">Description / Achievements</label>
                  <textarea name="description" defaultValue={editingExp?.description} required rows={4} className="w-full bg-[#f8fbff] border border-[#e2eaf2] rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-[#2a85ff] resize-none" placeholder="Describe your key impact..." />
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setIsExpModalOpen(false)} className="flex-1 py-3.5 rounded-xl text-sm font-bold text-[#5a6a7a] bg-[#f0f5fa] hover:bg-[#e2eaf2] transition-all">Cancel</button>
                  <button type="submit" className="flex-2 py-3.5 rounded-xl text-sm font-bold text-white bg-[#2a85ff] hover:bg-[#1a75ef] shadow-lg shadow-[#2a85ff]/20">Save Experience</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── TOP SECTION: PROFILE SUMMARY ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Profile Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl sm:rounded-[2.5rem] shadow-[0_8px_40px_rgba(0,0,0,0.04)] p-5 sm:p-8 lg:p-10 flex flex-col sm:flex-row items-center gap-6 sm:gap-10">
          <div className="relative group">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-[#2a85ff] to-[#6eb3ff] flex items-center justify-center ring-[8px] sm:ring-[12px] ring-[#2a85ff]/10">
              <span className="text-white text-2xl sm:text-4xl font-extrabold tracking-tight">
                {fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </span>
            </div>
            <button aria-label="Upload photo" className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-white shadow-lg border border-[#e2eaf2] flex items-center justify-center text-[#2a85ff] hover:scale-110 transition-transform cursor-pointer">
              <Upload size={16} strokeWidth={2.5} />
            </button>
          </div>

          <div className="flex-1 min-w-0 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-2">
              <h1 className="text-[#070707] text-2xl sm:text-4xl font-extrabold tracking-tight">{fullName}</h1>
              <div className="inline-flex items-center gap-1.5 bg-[#e6f9f0] text-[#16a34a] text-xs font-bold px-3 py-1 rounded-full border border-[#16a34a]/20">
                <Check size={12} strokeWidth={3} /> Verified
              </div>
            </div>
            <p className="text-[#5a6a7a] text-lg font-medium">{proTitle}</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-4 text-[#8a9ab0] text-sm">
              <div className="flex items-center gap-1.5">
                <MapPin size={16} strokeWidth={2} />
                {location}
              </div>
              <div className="w-1 h-1 rounded-full bg-[#d0dce8] hidden sm:block" />
              <div className="flex items-center gap-1.5">
                <Briefcase size={16} strokeWidth={2} />
                {yearsExp} yrs experience
              </div>
            </div>
          </div>
        </div>

        {/* Completion Card */}
        <div className="bg-[#070707] rounded-2xl sm:rounded-[2.5rem] p-5 sm:p-8 lg:p-10 flex flex-col justify-between relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.2)]">
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#2a85ff]/10 blur-[60px] pointer-events-none" />
          
          <div className="flex items-center justify-between mb-5 sm:mb-8">
            <h3 className="text-white text-xl font-bold">Profile Completion</h3>
            <span className="text-[#2a85ff] text-2xl font-black">{completionPct}%</span>
          </div>

          <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden mb-5 sm:mb-8">
            <motion.div 
              className="h-full bg-[#2a85ff] shadow-[0_0_20px_rgba(42,133,255,0.5)]"
              initial={{ width: 0 }}
              animate={{ width: `${completionPct}%` }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
            />
          </div>

          <div className="grid grid-cols-2 gap-y-3">
            {COMPLETION_ITEMS.map((item, i) => (
              <div key={item.id} className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${item.done ? 'bg-[#2a85ff]' : 'bg-white/10'}`}>
                  {item.done && <Check size={10} color="white" strokeWidth={4} />}
                </div>
                <span className={`text-[11px] font-bold tracking-tight uppercase {item.done ? 'text-white/80' : 'text-white/30'}`}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── MAIN GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Settings/Availability */}
        <div className="space-y-8">
          
          {/* Availability */}
          <div className="bg-white rounded-2xl sm:rounded-[2rem] p-5 sm:p-8 shadow-[0_4px_32px_rgba(0,0,0,0.03)] border border-[#e2eaf2]/60">
            <div className="flex items-center justify-between mb-5 sm:mb-8">
              <h3 className="text-[#070707] font-bold text-lg">Availability</h3>
              <Sparkles size={18} className="text-[#2a85ff]" />
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#070707] text-sm font-bold">Open to Work</p>
                  <p className="text-[#8a9ab0] text-[11px] mt-0.5">Let companies know you&apos;re looking</p>
                </div>
                <button 
                  onClick={() => setAvailability(availability === 'open' ? 'closed' : 'open')}
                  aria-label="Toggle availability"
                  className={`w-12 h-6 rounded-full p-1 transition-all ${availability === 'open' ? 'bg-[#2a85ff]' : 'bg-[#d0dce8]'} cursor-pointer`}
                >
                  <motion.div 
                    className="w-4 h-4 rounded-full bg-white shadow-sm"
                    animate={{ x: availability === 'open' ? 24 : 0 }}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-[#5a6a7a] text-sm font-semibold">Visible to recruiters</p>
                <div className={`w-2 h-2 rounded-full ${visible ? 'bg-[#16a34a]' : 'bg-[#8a9ab0]'} animate-pulse`} />
              </div>

              <div className="h-px bg-[#e2eaf2]" />

              <div className="space-y-3">
                <button 
                  onClick={() => setRemote(!remote)}
                  className={`w-full flex items-center justify-between px-5 py-3 rounded-xl border transition-all cursor-pointer ${remote ? 'bg-[#e8f1ff] border-[#2a85ff]/30 text-[#2a85ff]' : 'bg-[#f0f5fa] border-transparent text-[#8a9ab0]'}`}
                >
                  <span className="text-sm font-bold">Remote Opportunity</span>
                  {remote && <Check size={14} strokeWidth={3} />}
                </button>
                <button 
                  onClick={() => setFulltime(!fulltime)}
                  className={`w-full flex items-center justify-between px-5 py-3 rounded-xl border transition-all cursor-pointer ${fulltime ? 'bg-[#e8f1ff] border-[#2a85ff]/30 text-[#2a85ff]' : 'bg-[#f0f5fa] border-transparent text-[#8a9ab0]'}`}
                >
                  <span className="text-sm font-bold">Full-time Roles</span>
                  {fulltime && <Check size={14} strokeWidth={3} />}
                </button>
              </div>
            </div>
          </div>

          {/* CV Section */}
          <div className="bg-white rounded-2xl sm:rounded-[2rem] p-5 sm:p-8 shadow-[0_4px_32px_rgba(0,0,0,0.03)] border border-[#e2eaf2]/60">
            <h3 className="text-[#070707] font-bold text-lg mb-6">Upload Current CV</h3>
            
            {!cvUploaded ? (
              <div 
                onClick={() => cvRef.current?.click()}
                className="border-2 border-dashed border-[#d0dce8] rounded-2xl p-8 flex flex-col items-center gap-3 hover:border-[#2a85ff]/50 hover:bg-[#f8fbff] transition-all cursor-pointer text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-[#f0f5fa] flex items-center justify-center text-[#b0bac6]">
                  <Upload size={20} />
                </div>
                <p className="text-[#070707] text-sm font-bold">Drop CV here</p>
                <p className="text-[#b0bac6] text-[10px]">PDF, DOCX (Max 5MB)</p>
                <input ref={cvRef} type="file" className="hidden" aria-label="Upload CV file" onChange={() => setCvUploaded(true)} />
              </div>
            ) : (
              <div className="bg-[#f0f5fa] rounded-2xl p-4 flex items-center gap-3 border border-[#2a85ff]/10">
                <div className="w-10 h-10 rounded-lg bg-[#2a85ff] flex items-center justify-center text-white">
                  <FileText size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[#070707] text-xs font-bold truncate">My_Professional_CV.pdf</p>
                  <p className="text-[#16a34a] text-[10px] font-bold mt-0.5 uppercase tracking-wider">Uploaded</p>
                </div>
                <button onClick={() => setCvUploaded(false)} aria-label="Remove uploaded CV" className="text-[#b0bac6] hover:text-[#5a6a7a] transition-colors cursor-pointer p-1">
                  <X size={14} />
                </button>
              </div>
            )}
            <button className="w-full mt-4 py-3 rounded-xl text-sm font-bold text-[#2a85ff] bg-[#e8f1ff] hover:bg-[#d0e4ff] transition-all cursor-pointer">
              {cvUploaded ? 'Update CV' : 'Select File'}
            </button>
          </div>
        </div>

        {/* Center & Right column (2/3 width) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Basic Information Edit */}
          <div className="bg-white rounded-2xl sm:rounded-[2rem] p-5 sm:p-8 lg:p-10 shadow-[0_4px_32px_rgba(0,0,0,0.03)] border border-[#e2eaf2]/60">
            <div className="flex items-center justify-between mb-5 sm:mb-8">
              <h2 className="text-[#070707] font-extrabold text-xl sm:text-2xl tracking-tight">Basic Information</h2>
              <button className="px-5 py-2 rounded-full text-xs font-bold text-[#2a85ff] bg-[#e8f1ff] hover:bg-[#d0e4ff] transition-all cursor-pointer">Edit</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#8a9ab0] uppercase tracking-wider px-1">Full Name</label>
                <input 
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  aria-label="Full Name"
                  className="w-full bg-[#f8fbff] border border-[#e2eaf2] rounded-2xl px-5 py-3.5 text-sm font-semibold text-[#070707] focus:outline-none focus:border-[#2a85ff]/50 focus:ring-4 focus:ring-[#2a85ff]/5 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#8a9ab0] uppercase tracking-wider px-1">Professional Title</label>
                <input 
                  value={proTitle}
                  onChange={e => setProTitle(e.target.value)}
                  aria-label="Professional Title"
                  className="w-full bg-[#f8fbff] border border-[#e2eaf2] rounded-2xl px-5 py-3.5 text-sm font-semibold text-[#070707] focus:outline-none focus:border-[#2a85ff]/50 focus:ring-4 focus:ring-[#2a85ff]/5 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#8a9ab0] uppercase tracking-wider px-1">Location</label>
                <div className="relative">
                  <input 
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    aria-label="Location"
                    className="w-full bg-[#f8fbff] border border-[#e2eaf2] rounded-2xl px-5 py-3.5 pl-12 text-sm font-semibold text-[#070707] focus:outline-none focus:border-[#2a85ff]/50 focus:ring-4 focus:ring-[#2a85ff]/5 transition-all"
                  />
                  <MapPin size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#b0bac6]" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#8a9ab0] uppercase tracking-wider px-1">Years of Experience</label>
                <div className="flex items-center gap-2">
                  <button aria-label="Decrease experience years" onClick={() => setYearsExp(v => Math.max(0, v - 1))} className="w-12 h-12 rounded-2xl border border-[#e2eaf2] flex items-center justify-center text-[#5a6a7a] hover:bg-[#f0f5fa] transition-all cursor-pointer"><Minus size={16} /></button>
                  <div className="flex-1 h-12 bg-[#f8fbff] border border-[#e2eaf2] rounded-2xl flex items-center justify-center text-sm font-bold text-[#070707]">{yearsExp} yrs</div>
                  <button aria-label="Increase experience years" onClick={() => setYearsExp(v => v + 1)} className="w-12 h-12 rounded-2xl border border-[#e2eaf2] flex items-center justify-center text-[#5a6a7a] hover:bg-[#f0f5fa] transition-all cursor-pointer"><Plus size={16} /></button>
                </div>
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[11px] font-bold text-[#8a9ab0] uppercase tracking-wider px-1">Social Link (LinkedIn / Portfolio)</label>
                <div className="relative">
                  <input 
                    value={linkedin}
                    onChange={e => setLinkedin(e.target.value)}
                    aria-label="LinkedIn URL"
                    className="w-full bg-[#f8fbff] border border-[#e2eaf2] rounded-2xl px-5 py-3.5 pl-12 text-sm font-semibold text-[#070707] focus:outline-none focus:border-[#2a85ff]/50 focus:ring-4 focus:ring-[#2a85ff]/5 transition-all"
                  />
                  <ExternalLink size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#b0bac6]" />
                </div>
              </div>
            </div>
          </div>

          {/* Skills Section */}
          <div className="bg-white rounded-2xl sm:rounded-[2rem] p-5 sm:p-8 lg:p-10 shadow-[0_4px_32px_rgba(0,0,0,0.03)] border border-[#e2eaf2]/60">
            <div className="flex items-center justify-between mb-5 sm:mb-8">
              <h2 className="text-[#070707] font-extrabold text-xl sm:text-2xl tracking-tight">Skills & Core Competencies</h2>
              <button className="px-5 py-2 rounded-full text-xs font-bold text-[#2a85ff] bg-[#e8f1ff] hover:bg-[#d0e4ff] transition-all cursor-pointer">Manage</button>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {skills.map(s => (
                <div key={s} className="bg-[#f0f5fa] border border-[#e2eaf2] rounded-2xl px-5 py-3 flex items-center gap-3 group transition-all hover:border-[#2a85ff]/30">
                  <span className="text-sm font-bold text-[#070707]">{s}</span>
                  <button 
                    onClick={() => setSkills(skills.filter(x => x !== s))}
                    aria-label={`Remove ${s} skill`}
                    className="text-[#b0bac6] hover:text-[#dc2626] transition-colors cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              <div className="relative flex-1 min-w-[200px]">
                <input 
                  value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={handleSkillKey}
                  aria-label="Add a skill"
                  placeholder="Type skill and press Enter..."
                  className="w-full bg-[#f8fbff] border-2 border-dashed border-[#e2eaf2] rounded-2xl px-5 py-3 text-sm font-semibold text-[#070707] focus:outline-none focus:border-[#2a85ff]/40 focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>

          {/* Work Experience Section */}
          <div className="bg-white rounded-2xl sm:rounded-[2rem] p-5 sm:p-8 lg:p-10 shadow-[0_4px_32px_rgba(0,0,0,0.03)] border border-[#e2eaf2]/60">
            <div className="flex items-center justify-between mb-6 sm:mb-10 gap-3">
              <h2 className="text-[#070707] font-extrabold text-xl sm:text-2xl tracking-tight">Work History</h2>
              <button 
                onClick={() => { setEditingExp(null); setIsExpModalOpen(true); }}
                className="flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold text-white bg-[#070707] hover:bg-[#202020] transition-all cursor-pointer flex-shrink-0"
              >
                <Plus size={16} strokeWidth={2.5} />
                <span className="hidden sm:inline">Add Experience</span>
                <span className="sm:hidden">Add</span>
              </button>
            </div>

            <div className="space-y-12">
              {workHistory.length > 0 ? (
                workHistory.map((exp, idx) => (
                  <div key={exp.id} className="relative pl-10 group">
                    <div className={`absolute left-0 top-2 bottom-0 w-px ${idx === workHistory.length - 1 ? 'h-0' : 'bg-gradient-to-b from-[#2a85ff] to-[#e2eaf2]'}`} />
                    <div className="absolute left-[-5px] top-2 w-[11px] h-[11px] rounded-full bg-[#2a85ff] ring-4 ring-[#e8f1ff]" />
                    
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex-1 min-w-[200px]">
                        <h4 className="text-[#070707] text-xl font-bold">{exp.role}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <p className="text-[#2a85ff] font-bold">{exp.company}</p>
                          <span className="w-1 h-1 rounded-full bg-[#d0dce8]" />
                          <span className="text-[#8a9ab0] text-xs font-bold">{exp.startDate} – {exp.endDate}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => { setEditingExp(exp); setIsExpModalOpen(true); }}
                          className="p-2 rounded-lg bg-[#f0f5fa] text-[#5a6a7a] hover:bg-[#2a85ff] hover:text-white transition-all cursor-pointer"
                          aria-label="Edit experience"
                        >
                          <FileText size={14} />
                        </button>
                        <button 
                          onClick={() => handleDeleteExp(exp.id)}
                          className="p-2 rounded-lg bg-[#fff0f0] text-[#ef4444] hover:bg-[#ef4444] hover:text-white transition-all cursor-pointer"
                          aria-label="Delete experience"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                    <p className="text-[#5a6a7a] text-sm leading-relaxed mt-5 max-w-2xl bg-[#f8fbff] p-6 rounded-2xl border border-dashed border-[#e2eaf2]">
                      {exp.description}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 bg-[#f8fbff] rounded-3xl border border-dashed border-[#e2eaf2]">
                  <p className="text-[#8a9ab0] font-bold">No work history added yet.</p>
                  <button 
                    onClick={() => { setEditingExp(null); setIsExpModalOpen(true); }}
                    className="mt-2 text-[#2a85ff] text-sm font-bold hover:underline"
                  >
                    Click to add your first role
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Final Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 sm:gap-4 pt-4">
            <button className="px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl text-sm sm:text-base font-bold text-[#5a6a7a] bg-white border border-[#e2eaf2] hover:bg-[#f0f5fa] transition-all cursor-pointer shadow-sm text-center">
              Discard
            </button>
            <button onClick={handleSave} className="px-8 sm:px-10 py-3.5 sm:py-4 rounded-2xl text-sm sm:text-base font-bold text-white bg-[#2a85ff] hover:bg-[#1a75ef] shadow-[0_8px_24px_rgba(42,133,255,0.4)] hover:scale-[1.02] transition-all cursor-pointer text-center">
              Save Changes
            </button>
          </div>

        </div>
      </div>

    </div>
  )
}
