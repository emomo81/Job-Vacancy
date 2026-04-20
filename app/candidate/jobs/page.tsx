'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  Building2,
  CalendarClock,
  Clock,
  Filter,
  MapPin,
  Search,
  Sparkles,
  Briefcase,
  CheckCircle2,
  X
} from 'lucide-react'
import { apiFetch } from '../../../utils/api-client'
import {
  SharedJobData,
  normalizeEmploymentType,
  formatPostedDate,
  formatDeadline,
  buildInitials,
  getTypeLabel,
  getTagTone
} from '../../../utils/job-utils'
import JobDetailsModal from '../../components/JobDetailsModal'

type CandidateJobCard = SharedJobData & { backendId: string }



export default function BrowseJobsPage() {
  const [jobsData, setJobsData] = useState<CandidateJobCard[]>([])
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set())
  const [showSmartMatches, setShowSmartMatches] = useState(false)
  const [filterType, setFilterType] = useState<string>('All')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedJobId, setSelectedJobId] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    void (async () => {
      try {
        const [jobsResult, applicationsResult] = await Promise.all([
          apiFetch('/candidate/jobs'),
          apiFetch('/candidate/applications'),
        ])

        const jobs = Array.isArray(jobsResult.data) ? jobsResult.data : []
        const applications = Array.isArray(applicationsResult.data) ? applicationsResult.data : []

        const mappedJobs = jobs.map((job: any) => {
          const backendId = String(job.id || job._id || '')
          return {
            id: backendId,
            backendId,
            title: job.title || 'Untitled Role',
            company: job.company || 'Recruiter Organization',
            department: job.department || 'Other',
            experienceLevel: job.experienceLevel || 'Intermediate',
            education: job.education || 'Any',
            location: job.location || 'Remote',
            type: getTypeLabel(job.type || 'Full-Time'),
            salary: job.salary || 'Competitive',
            posted: formatPostedDate(job.posted),
            match: Number(job.match || 50),
            tags: Array.isArray(job.tags) ? job.tags : [],
            requiredSkills: Array.isArray(job.requiredSkills) ? job.requiredSkills : [],
            minYearsExperience: Number(job.minYearsExperience || 0),
            description: job.description || '',
            niceToHave: job.niceToHave || '',
            deadline: job.deadline ?? null,
          } satisfies CandidateJobCard
        })

        const appliedIds = new Set<string>()
        applications.forEach((application: any) => {
          const jobId = String(application.jobId || '')
          if (jobId) appliedIds.add(jobId)
        })

        setJobsData(mappedJobs)
        setAppliedJobIds(appliedIds)

        if (mappedJobs.length > 0) {
          const queryJobId = typeof window !== 'undefined'
            ? new URLSearchParams(window.location.search).get('jobId') || ''
            : ''
          const selected = queryJobId || mappedJobs[0].id
          setSelectedJobId(selected)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load jobs')
      }
    })()
  }, [])

  const selectedJob = useMemo(
    () => jobsData.find((job) => job.id === selectedJobId) || jobsData[0] || null,
    [jobsData, selectedJobId]
  )

  const filteredJobs = useMemo(() => {
    const search = searchTerm.trim().toLowerCase()
    return jobsData.filter((job) => {
      const matchesSearch = !search || [job.title, job.company, job.department, ...job.tags, ...job.requiredSkills]
        .some((value) => String(value || '').toLowerCase().includes(search))

      const matchesType = filterType === 'All' || normalizeEmploymentType(job.type) === normalizeEmploymentType(filterType)
      const matchesSmart = !showSmartMatches || job.match >= 85

      return matchesSearch && matchesType && matchesSmart
    })
  }, [filterType, jobsData, searchTerm, showSmartMatches])

  const handleApply = async (job: SharedJobData) => {
    try {
      if (appliedJobIds.has(job.id)) return
      if (!job.backendId) throw new Error('Missing job identifier')

      await apiFetch(`/candidate/jobs/${job.backendId}/apply`, { method: 'POST' })
      setAppliedJobIds((prev) => new Set(prev).add(job.id))
      setSelectedJobId(job.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply')
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="bg-[#070707] rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.12)]">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#2a85ff]/10 blur-[60px] pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-[#2a85ff]/20 flex items-center justify-center text-[#2a85ff] border border-[#2a85ff]/30 shrink-0">
              <Sparkles size={28} />
            </div>
            <div>
              <h2 className="text-white text-2xl sm:text-3xl font-extrabold tracking-tight">Browse roles that fit your profile</h2>
              <p className="text-white/45 text-sm mt-1">Open a job to see the full details and apply from the detail panel.</p>
            </div>
          </div>

          <button
            onClick={() => setShowSmartMatches((prev) => !prev)}
            className={`px-6 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer w-full lg:w-auto ${showSmartMatches ? 'bg-white text-[#070707]' : 'bg-[#2a85ff] text-white hover:bg-[#1a75ef]'
              }`}
          >
            {showSmartMatches ? 'Show All Jobs' : 'View Smart Matches'}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative group">
            <input
              type="text"
              placeholder="Search for roles, companies, departments, or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-[#e2eaf2] rounded-[1.25rem] px-6 py-4 pl-14 text-sm font-semibold text-[#070707] placeholder-[#b0bac6] focus:outline-none focus:border-[#2a85ff] focus:ring-4 focus:ring-[#2a85ff]/5 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.02)]"
            />
            <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-[#b0bac6] group-focus-within:text-[#2a85ff] transition-colors" />
          </div>

          <button
            onClick={() => setShowFilters((prev) => !prev)}
            className={`px-6 py-4 rounded-[1.25rem] border flex items-center gap-2 text-sm font-bold transition-all cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.02)] ${showFilters || filterType !== 'All'
                ? 'bg-[#f0f7ff] border-[#2a85ff] text-[#2a85ff]'
                : 'bg-white border-[#e2eaf2] text-[#5a6a7a] hover:bg-[#f8fbff]'
              }`}
          >
            <Filter size={18} />
            {filterType === 'All' ? 'Filters' : filterType}
          </button>
        </div>

        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="flex flex-wrap gap-2 overflow-hidden"
          >
            {['All', 'Full-Time', 'Part-Time', 'Contract', 'Remote'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 rounded-full text-xs font-bold border transition-all cursor-pointer ${filterType === type
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

      {error ? <p className="text-sm font-bold text-[#dc2626]">{error}</p> : null}

      <div className="grid grid-cols-1 gap-5">
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job, index) => {
            const isApplied = appliedJobIds.has(job.id)
            const isSelected = selectedJob?.id === job.id

            return (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                onClick={() => { setSelectedJobId(job.id); setIsModalOpen(true); }}
                className={`w-full text-left bg-white rounded-3xl border p-4 sm:p-6 flex flex-col xl:flex-row items-start gap-4 sm:gap-6 hover:shadow-[0_12px_32px_rgba(0,0,0,0.04)] transition-all group cursor-pointer ${isSelected ? 'border-[#2a85ff] shadow-[0_10px_30px_rgba(42,133,255,0.08)]' : 'border-[#e2eaf2]/60 hover:border-[#2a85ff]/20'
                  }`}
              >
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black shrink-0 bg-[#e8f1ff] text-[#2a85ff] border border-[#2a85ff]/10">
                  {buildInitials(job.company)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-[#070707] text-lg font-extrabold truncate group-hover:text-[#2a85ff] transition-colors">{job.title}</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f0f5fa] text-[#8a9ab0] uppercase tracking-wider">{job.type}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-[#8a9ab0] text-sm">
                    <div className="flex items-center gap-1.5"><Building2 size={14} /> <span className="font-semibold text-[#5a6a7a]">{job.company}</span></div>
                    <div className="flex items-center gap-1.5"><MapPin size={14} />{job.location}</div>
                    <div className="flex items-center gap-1.5"><Briefcase size={14} />{job.salary}</div>
                    <div className="flex items-center gap-1.5"><Clock size={14} />{job.posted}</div>
                    {(() => {
                      const dl = formatDeadline(job.deadline)
                      if (!dl) return null
                      return (
                        <div className={`flex items-center gap-1.5 font-semibold ${dl.expired ? 'text-red-500' : dl.urgent ? 'text-amber-600' : 'text-[#16a34a]'}`}>
                          <CalendarClock size={14} />
                          {dl.label}
                        </div>
                      )
                    })()}
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4">
                    {job.tags.map((tag) => (
                      <span key={tag} className={`text-[10px] font-bold px-3 py-1 rounded-lg border ${getTagTone(tag)}`}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between w-full xl:w-auto gap-4 xl:border-l xl:border-[#e2eaf2] xl:pl-8 shrink-0">
                  <div className="text-center">
                    <div className="text-[#2a85ff] text-2xl font-black leading-none">{job.match}%</div>
                    <div className="text-[#8a9ab0] text-[10px] font-bold uppercase tracking-widest mt-1">Match</div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation()
                        setSelectedJobId(job.id)
                        setIsModalOpen(true)
                      }}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#f0f5fa] hover:bg-[#e2eaf2] text-[#070707]"
                    >
                      View Details
                    </button>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation()
                        void handleApply(job)
                      }}
                      disabled={isApplied}
                      className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${isApplied
                          ? 'bg-[#e6f9f0] text-[#16a34a] border border-[#16a34a]/20 cursor-default'
                          : 'bg-[#070707] hover:bg-[#202020] text-white'
                        }`}
                    >
                      {isApplied ? 'Applied' : 'Apply Now'}
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })
        ) : (
          <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-[#e2eaf2]">
            <p className="text-[#8a9ab0] font-bold">No jobs match your current filters.</p>
            <button
              onClick={() => {
                setSearchTerm('')
                setFilterType('All')
                setShowSmartMatches(false)
              }}
              className="mt-4 text-[#2a85ff] text-sm font-bold hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      <JobDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        job={selectedJob}
        isApplied={selectedJob ? appliedJobIds.has(selectedJob.id) : false}
        onApply={handleApply}
      />
    </div>
  )
}

