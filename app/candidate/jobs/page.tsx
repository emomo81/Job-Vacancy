'use client'

import React, { useState } from 'react'
import { 
  Search, MapPin, Briefcase, Clock, 
  Filter, ChevronRight, Star, Sparkles, Building2
} from 'lucide-react'
import { motion } from 'motion/react'

const JOBS = [
  {
    id: 1,
    title: 'Senior Backend Engineer',
    company: 'TechCorp',
    location: 'Remote',
    type: 'Full-time',
    salary: '$140k - $180k',
    posted: '2 days ago',
    match: 94,
    tags: ['Node.js', 'PostgreSQL', 'Cloud'],
    logo: 'TC',
    color: '#2a85ff'
  },
  {
    id: 2,
    title: 'Full Stack Developer',
    company: 'InnovateAI',
    location: 'San Francisco, CA',
    type: 'Full-time',
    salary: '$130k - $160k',
    posted: '5h ago',
    match: 88,
    tags: ['React', 'Python', 'AWS'],
    logo: 'IA',
    color: '#9f6ef5'
  },
  {
    id: 3,
    title: 'Backend Systems Architect',
    company: 'ScaleX',
    location: 'Remote',
    type: 'Contract',
    salary: '$90 - $120 / hr',
    posted: '1 day ago',
    match: 82,
    tags: ['Go', 'Kubernetes', 'Redis'],
    logo: 'SX',
    color: '#f07830'
  },
  {
    id: 4,
    title: 'Senior Product Engineer',
    company: 'Umurava',
    location: 'Kigali, Rwanda (Hybrid)',
    type: 'Full-time',
    salary: 'Competitive',
    posted: '3 days ago',
    match: 76,
    tags: ['Next.js', 'TypeScript', 'Prisma'],
    logo: 'U',
    color: '#16a34a'
  }
]

export default function BrowseJobsPage() {
  const [searchTerm, setSearchTerm] = useState('')

  return (
    <div className="flex flex-col gap-8">
      
      {/* ── SEARCH & FILTER ── */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative group">
          <input 
            type="text"
            placeholder="Search for roles, companies, or keywords..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-[#e2eaf2] rounded-[1.25rem] px-6 py-4 pl-14 text-sm font-semibold text-[#070707] placeholder-[#b0bac6] focus:outline-none focus:border-[#2a85ff] focus:ring-4 focus:ring-[#2a85ff]/5 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.02)]"
          />
          <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-[#b0bac6] group-focus-within:text-[#2a85ff] transition-colors" />
        </div>
        <button className="px-6 py-4 rounded-[1.25rem] bg-white border border-[#e2eaf2] flex items-center gap-2 text-sm font-bold text-[#5a6a7a] hover:bg-[#f8fbff] hover:border-[#2a85ff]/30 transition-all cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <Filter size={18} />
          Filters
        </button>
      </div>

      {/* ── MATCH RECOMMENDATION ── */}
      <div className="bg-[#070707] rounded-2xl sm:rounded-[2rem] p-5 sm:p-8 relative overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.1)]">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#2a85ff]/10 blur-[60px] pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 sm:gap-6">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-[#2a85ff]/20 flex items-center justify-center text-[#2a85ff] border border-[#2a85ff]/30 flex-shrink-0">
              <Sparkles size={24} className="sm:hidden" />
              <Sparkles size={32} className="hidden sm:block" />
            </div>
            <div>
              <h2 className="text-white text-lg sm:text-2xl font-extrabold tracking-tight">AI Matching is active</h2>
              <p className="text-white/40 text-sm mt-1">We found 12 jobs that match your &quot;Senior Backend Engineer&quot; profile.</p>
            </div>
          </div>
          <button className="px-6 sm:px-8 py-3 rounded-xl bg-[#2a85ff] hover:bg-[#1a75ef] text-white text-sm font-bold transition-all cursor-pointer shadow-[0_4px_16px_rgba(42,133,255,0.4)] w-full sm:w-auto text-center">
            View Smart Matches
          </button>
        </div>
      </div>

      {/* ── JOB LIST ── */}
      <div className="grid grid-cols-1 gap-5">
        {JOBS.map((job, i) => (
          <motion.div
            key={job.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-2xl sm:rounded-[1.5rem] border border-[#e2eaf2]/60 p-4 sm:p-6 flex flex-col md:flex-row items-start md:items-center gap-4 sm:gap-6 hover:shadow-[0_12px_32px_rgba(0,0,0,0.04)] hover:border-[#2a85ff]/20 transition-all group"
          >
            {/* Company Logo */}
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black flex-shrink-0"
              style={{ background: `${job.color}10`, color: job.color }}
            >
              {job.logo}
            </div>

            {/* Main Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-[#070707] text-lg font-extrabold truncate group-hover:text-[#2a85ff] transition-colors">{job.title}</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f0f5fa] text-[#8a9ab0] uppercase tracking-wider">{job.type}</span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-[#8a9ab0] text-sm">
                <div className="flex items-center gap-1.5">
                  <Building2 size={14} />
                  <span className="font-semibold text-[#5a6a7a]">{job.company}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin size={14} />
                  {job.location}
                </div>
                <div className="flex items-center gap-1.5">
                  <Briefcase size={14} />
                  {job.salary}
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={14} />
                  {job.posted}
                </div>
              </div>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-4">
                {job.tags.map(tag => (
                  <span key={tag} className="text-[10px] font-bold text-[#5a6a7a] bg-[#f0f5fa] px-3 py-1 rounded-lg border border-[#e2eaf2]">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Match Score */}
            <div className="flex items-center justify-between w-full md:w-auto gap-4 md:border-l md:border-[#e2eaf2] md:pl-8 flex-shrink-0">
              <div className="text-center">
                <div className="text-[#2a85ff] text-2xl font-black leading-none">{job.match}%</div>
                <div className="text-[#8a9ab0] text-[10px] font-bold uppercase tracking-widest mt-1">Match</div>
              </div>
              <button className="px-6 py-2.5 rounded-xl bg-[#070707] hover:bg-[#202020] text-white text-xs font-bold transition-all cursor-pointer">
                Apply Now
              </button>
            </div>
          </motion.div>
        ))}
      </div>

    </div>
  )
}
