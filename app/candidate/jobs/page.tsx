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
  },
  {
    id: 5,
    title: 'Frontend Lead',
    company: 'VibeCheck',
    location: 'New York, NY',
    type: 'Full-time',
    salary: '$150k - $190k',
    posted: '1 week ago',
    match: 91,
    tags: ['React', 'Tailwind', 'Framer Motion'],
    logo: 'VC',
    color: '#ec4899'
  },
  {
    id: 6,
    title: 'DevOps Engineer',
    company: 'CloudFlow',
    location: 'Remote',
    type: 'Full-time',
    salary: '$135k - $175k',
    posted: '4h ago',
    match: 85,
    tags: ['Terraform', 'AWS', 'Docker'],
    logo: 'CF',
    color: '#06b6d4'
  },
  {
    id: 7,
    title: 'ML Engineer',
    company: 'DeepMinded',
    location: 'London, UK',
    type: 'Full-time',
    salary: '£90k - £120k',
    posted: '12h ago',
    match: 64,
    tags: ['PyTorch', 'Python', 'CUDA'],
    logo: 'DM',
    color: '#8b5cf6'
  },
  {
    id: 8,
    title: 'Mobile App Developer',
    company: 'Swiftly',
    location: 'Austin, TX',
    type: 'Contract',
    salary: '$80 - $110 / hr',
    posted: '2 days ago',
    match: 72,
    tags: ['React Native', 'TypeScript', 'Firebase'],
    logo: 'S',
    color: '#f59e0b'
  },
  {
    id: 9,
    title: 'Security Engineer',
    company: 'SafeGuard',
    location: 'Remote',
    type: 'Full-time',
    salary: '$145k - $185k',
    posted: '6h ago',
    match: 90,
    tags: ['Security', 'Go', 'Networking'],
    logo: 'SG',
    color: '#ef4444'
  },
  {
    id: 10,
    title: 'UI/UX Designer',
    company: 'PixelPerfect',
    location: 'Berlin, Germany',
    type: 'Part-time',
    salary: '€40k - €55k',
    posted: '3 days ago',
    match: 55,
    tags: ['Figma', 'Prototyping', 'Design Systems'],
    logo: 'PP',
    color: '#10b981'
  }
]

export default function BrowseJobsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [appliedJobs, setAppliedJobs] = useState<Set<number>>(new Set())
  const [showSmartMatches, setShowSmartMatches] = useState(false)
  const [filterType, setFilterType] = useState<string>('All')
  const [showFilters, setShowFilters] = useState(false)

  const handleApply = (id: number) => {
    setAppliedJobs(prev => {
      const next = new Set(prev)
      next.add(id)
      return next
    })
  }

  const filteredJobs = JOBS.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesType = filterType === 'All' || job.type === filterType
    const matchesSmart = !showSmartMatches || job.match >= 85

    return matchesSearch && matchesType && matchesSmart
  })

  return (
    <div className="flex flex-col gap-8">
      
      {/* ── SEARCH & FILTER ── */}
      <div className="flex flex-col gap-4">
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
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`px-6 py-4 rounded-[1.25rem] border flex items-center gap-2 text-sm font-bold transition-all cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.02)] ${
              showFilters || filterType !== 'All' 
                ? 'bg-[#f0f7ff] border-[#2a85ff] text-[#2a85ff]' 
                : 'bg-white border-[#e2eaf2] text-[#5a6a7a] hover:bg-[#f8fbff]'
            }`}
          >
            <Filter size={18} />
            {filterType === 'All' ? 'Filters' : filterType}
          </button>
        </div>

        {/* Quick Filters */}
        {showFilters && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="flex flex-wrap gap-2 overflow-hidden"
          >
            {['All', 'Full-time', 'Contract', 'Part-time'].map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                  filterType === type 
                    ? 'bg-[#2a85ff] border-[#2a85ff] text-white shadow-md' 
                    : 'bg-white border-[#e2eaf2] text-[#5a6a7a] hover:border-[#2a85ff]/30'
                }`}
              >
                {type}
              </button>
            ))}
          </motion.div>
        )}
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
              <h2 className="text-white text-lg sm:text-2xl font-extrabold tracking-tight">
                {showSmartMatches ? 'Smart Matches Only' : 'AI Matching is active'}
              </h2>
              <p className="text-white/40 text-sm mt-1">
                {showSmartMatches 
                  ? 'Showing the best roles for your "Senior Backend Engineer" profile.'
                  : 'We found 12 jobs that match your "Senior Backend Engineer" profile.'}
              </p>
            </div>
          </div>
          <button 
            onClick={() => setShowSmartMatches(!showSmartMatches)}
            className={`px-6 sm:px-8 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer shadow-[0_4px_16px_rgba(42,133,255,0.4)] w-full sm:w-auto text-center ${
              showSmartMatches 
                ? 'bg-white text-[#070707] hover:bg-white/90' 
                : 'bg-[#2a85ff] text-white hover:bg-[#1a75ef]'
            }`}
          >
            {showSmartMatches ? 'Show All Jobs' : 'View Smart Matches'}
          </button>
        </div>
      </div>

      {/* ── JOB LIST ── */}
      <div className="grid grid-cols-1 gap-5">
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job, i) => {
            const isApplied = appliedJobs.has(job.id)
            return (
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
                  <button 
                    onClick={() => handleApply(job.id)}
                    disabled={isApplied}
                    className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isApplied 
                        ? 'bg-[#e6f9f0] text-[#16a34a] border border-[#16a34a]/20 cursor-default' 
                        : 'bg-[#070707] hover:bg-[#202020] text-white'
                    }`}
                  >
                    {isApplied ? 'Applied' : 'Apply Now'}
                  </button>
                </div>
              </motion.div>
            )
          })
        ) : (
          <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-[#e2eaf2]">
            <p className="text-[#8a9ab0] font-bold">No jobs match your current filters.</p>
            <button 
              onClick={() => {setSearchTerm(''); setFilterType('All'); setShowSmartMatches(false)}}
              className="mt-4 text-[#2a85ff] text-sm font-bold hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

    </div>
  )
}
