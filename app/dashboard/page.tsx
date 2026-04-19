'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { ArrowRight, ChevronDown, Clock, MapPin, Minus, Pencil, Plus, Sparkles, Tag, X } from 'lucide-react'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import { apiFetch, setCurrentJobId } from '../../utils/api-client'
import { useRouter } from 'next/navigation'

const DEPARTMENTS = ['Engineering', 'Design', 'Marketing', 'Operations', 'Sales', 'Other']
const EDUCATION_OPTIONS = ["High School", "Bachelor's", "Master's", 'PhD', 'Any']
const EXPERIENCE_LEVELS = ['Entry Level', 'Intermediate', 'Expert']
const EMPLOYMENT_TYPES = ['Full-Time', 'Part-Time', 'Contract', 'Remote']

type DashboardJob = {
  id: string
  title: string
  department: string
  experienceLevel: string
  employmentType: string
  requiredSkills: string[]
  minYearsExperience: number
  education: string
  description: string
  niceToHave: string
  location: string
  status: string
  createdAt?: string
  shortlistedCount?: number
}

type PanelKey = 'jobs' | 'new-job'

const emptyForm = {
  title: '',
  department: '',
  experienceLevel: 'Intermediate',
  employmentType: 'Full-Time',
  requiredSkills: ['React', 'TypeScript'] as string[],
  skillInput: '',
  minYearsExperience: 3,
  education: '',
  description: '',
  niceToHave: '',
  location: '',
}

function formatDate(value?: string): string {
  if (!value) return 'Recently'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Recently'
  return date.toLocaleDateString()
}

function toRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object') return value as Record<string, unknown>
  return {}
}

function readString(value: unknown, fallback = ''): string {
  return typeof value === 'string' && value.length > 0 ? value : fallback
}

function readNumber(value: unknown, fallback = 0): number {
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function readStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
}

export default function RankrDashboard() {
  const router = useRouter()
  const [panel, setPanel] = useState<PanelKey>('jobs')
  const [jobs, setJobs] = useState<DashboardJob[]>([])
  const [selectedJobId, setSelectedJobId] = useState('')
  const [editingJobId, setEditingJobId] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const tab = new URLSearchParams(window.location.search).get('tab')
    if (tab === 'notifications') {
      router.push('/dashboard/notifications')
    }
  }, [router])

  useEffect(() => {
    void (async () => {
      try {
        setLoading(true)
        const [jobsResult, applicantsResult] = await Promise.all([
          apiFetch('/jobs'),
          apiFetch('/recruiter/applications'),
        ])

        const jobsData: Record<string, unknown>[] = Array.isArray(jobsResult.data) ? jobsResult.data.map(toRecord) : []
        const applicantJobsData: Record<string, unknown>[] = Array.isArray(applicantsResult.data?.jobs) ? applicantsResult.data.jobs.map(toRecord) : []

        const applicantJobMap = new Map<string, number>()
        applicantJobsData.forEach((job) => {
          applicantJobMap.set(String(job.id || job._id || ''), readNumber(job.shortlistedCount, 0))
        })

        const mappedJobs = jobsData.map((job) => ({
          id: String(job._id || job.id || ''),
          title: readString(job.title, 'Untitled Job'),
          department: readString(job.department, 'Other'),
          experienceLevel: readString(job.experienceLevel, 'Intermediate'),
          employmentType: readString(job.employmentType, 'Full-Time'),
          requiredSkills: readStringArray(job.requiredSkills),
          minYearsExperience: readNumber(job.minYearsExperience, 0),
          education: readString(job.education, 'Any'),
          description: readString(job.description, ''),
          niceToHave: readString(job.niceToHave, ''),
          location: readString(job.location, 'Remote'),
          status: readString(job.status, 'open'),
          createdAt: typeof job.createdAt === 'string' ? job.createdAt : undefined,
          shortlistedCount: applicantJobMap.get(String(job._id || job.id || '')) || 0,
        }))

        setJobs(mappedJobs)
        if (mappedJobs.length > 0) {
          setSelectedJobId((current) => current || String(mappedJobs[0].id))
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const selectedJob = useMemo(
    () => jobs.find((job) => job.id === selectedJobId) || jobs[0] || null,
    [jobs, selectedJobId]
  )

  useEffect(() => {
    if (!selectedJobId && jobs.length > 0) {
      setSelectedJobId(jobs[0].id)
    }
  }, [jobs, selectedJobId])

  const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && form.skillInput.trim()) {
      e.preventDefault()
      if (!form.requiredSkills.includes(form.skillInput.trim())) {
        setForm((prev) => ({ ...prev, requiredSkills: [...prev.requiredSkills, prev.skillInput.trim()], skillInput: '' }))
      }
    }
  }

  const editJob = (job: DashboardJob) => {
    setEditingJobId(job.id)
    setForm({
      title: job.title,
      department: job.department,
      experienceLevel: job.experienceLevel,
      employmentType: job.employmentType,
      requiredSkills: [...job.requiredSkills],
      skillInput: '',
      minYearsExperience: job.minYearsExperience,
      education: job.education,
      description: job.description,
      niceToHave: job.niceToHave,
      location: job.location,
    })
    setPanel('new-job')
  }

  const removeSkill = (skill: string) => {
    setForm((prev) => ({ ...prev, requiredSkills: prev.requiredSkills.filter((item) => item !== skill) }))
  }

  const saveJob = async () => {
    try {
      setSaving(true)
      setError('')

      const payload = {
        title: form.title,
        department: form.department,
        experienceLevel: form.experienceLevel,
        employmentType: form.employmentType,
        requiredSkills: form.requiredSkills,
        minYearsExperience: form.minYearsExperience,
        education: form.education,
        description: form.description,
        niceToHave: form.niceToHave,
        location: form.location || (form.employmentType === 'Remote' ? 'Remote' : ''),
      }

      const result = editingJobId
        ? await apiFetch(`/jobs/${editingJobId}`, { method: 'PATCH', body: payload })
        : await apiFetch('/jobs', { method: 'POST', body: payload })

      const savedJob = result.data
      const normalizedJob: DashboardJob = {
        id: String(savedJob._id || savedJob.id),
        title: savedJob.title || form.title,
        department: savedJob.department || form.department,
        experienceLevel: savedJob.experienceLevel || form.experienceLevel,
        employmentType: savedJob.employmentType || form.employmentType,
        requiredSkills: Array.isArray(savedJob.requiredSkills) ? savedJob.requiredSkills : form.requiredSkills,
        minYearsExperience: Number(savedJob.minYearsExperience ?? form.minYearsExperience),
        education: savedJob.education || form.education,
        description: savedJob.description || form.description,
        niceToHave: savedJob.niceToHave || form.niceToHave,
        location: savedJob.location || form.location,
        status: savedJob.status || 'open',
        createdAt: savedJob.createdAt,
        shortlistedCount: 0,
      }

      setJobs((prev) => {
        const exists = prev.some((job) => job.id === normalizedJob.id)
        if (exists) {
          return prev.map((job) => (job.id === normalizedJob.id ? normalizedJob : job))
        }
        return [normalizedJob, ...prev]
      })
      setSelectedJobId(normalizedJob.id)
      setCurrentJobId(normalizedJob.id)
      setEditingJobId('')
      setForm(emptyForm)
      setPanel('jobs')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save job')
    } finally {
      setSaving(false)
    }
  }

  const activeTitle =
    panel === 'jobs'
      ? 'All Jobs'
      : panel === 'new-job'
          ? editingJobId
            ? 'Edit Job'
            : 'Add New Job'
          : 'Dashboard'

  return (
    <div className="min-h-screen bg-[#f0f5fa]">
      <Navbar type="app" activeNav="Jobs" />

      <div className="bg-[#070707] pt-24 sm:pt-32 pb-12 sm:pb-16 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between relative z-10 gap-8">
          <div className="flex-1 max-w-2xl text-center md:text-left">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <h1 className="text-white font-extrabold text-4xl sm:text-5xl lg:text-7xl leading-[1.1] tracking-tight mb-4 sm:mb-6">
                Recruiter Dashboard <span className="text-[#2a85ff]">✦</span>
              </h1>
              <p className="text-white/50 text-sm sm:text-lg font-normal max-w-md mx-auto md:mx-0">
                Review company jobs and live notifications from one place.
              </p>
            </motion.div>
          </div>

          <div className="hidden md:block relative w-[320px] lg:w-105 h-50 lg:h-70 shrink-0 self-end">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://uxcanvas.ai/api/generated-images/a41dbe01-2ec5-4de6-bde6-a96289ed1c5f/9bf07167-e189-46c3-9b0b-84e832c5a707"
              alt="Team collaborating"
              className="dashboard-hero-mask w-full h-full object-cover object-top grayscale-100 brightness-[0.7] contrast-[1.1]"
            />
          </div>
        </div>

        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#2a85ff]/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 rounded-full bg-[#2a85ff]/5 blur-3xl pointer-events-none" />
      </div>

      <main className="max-w-400 mx-auto px-4 sm:px-6 -mt-8 sm:-mt-12 relative z-20 pb-20">
        <div className="grid grid-cols-1 xl:grid-cols-[280px_minmax(0,1fr)] gap-6 xl:gap-8">
          <aside className="bg-white rounded-3xl shadow-[0_4px_40px_rgba(0,0,0,0.08)] border border-white p-4 sm:p-5 h-fit sticky top-24">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-[#f0f5fa]">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#8a9ab0]">Workspace</p>
                <h2 className="text-[#070707] text-lg font-bold mt-1">{activeTitle}</h2>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-[#f0f5fa] flex items-center justify-center text-[#2a85ff]">
                <Sparkles size={18} />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {([
                { key: 'jobs', label: 'All Jobs', icon: Tag },
                { key: 'new-job', label: editingJobId ? 'Edit Job' : 'Add New Job', icon: Plus },
              ] as { key: PanelKey; label: string; icon: React.ComponentType<{ size?: number }> }[]).map((item) => {
                const Icon = item.icon
                const active = panel === item.key
                return (
                  <button
                    key={item.key}
                    onClick={() => setPanel(item.key)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all text-left ${
                      active
                        ? 'bg-[#2a85ff] text-white shadow-lg shadow-[#2a85ff]/20'
                        : 'bg-[#f8fbff] text-[#5a6a7a] hover:bg-[#f0f5fa] border border-[#e2eaf2]'
                    }`}
                  >
                    <Icon size={17} />
                    <span>{item.label}</span>
                  </button>
                )
              })}
            </div>
          </aside>

          <section className="bg-white rounded-3xl shadow-[0_4px_40px_rgba(0,0,0,0.08)] border border-white p-5 sm:p-8">
            {loading ? (
              <div className="py-20 text-center text-[#8a9ab0] font-medium">Loading dashboard data...</div>
            ) : null}

            {error ? <p className="mb-6 text-sm font-bold text-[#dc2626]">{error}</p> : null}

            {panel === 'jobs' && (
              <div className="grid grid-cols-1 xl:grid-cols-[360px_minmax(0,1fr)] gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-[#070707] text-xl font-bold">Created Jobs</h3>
                      <p className="text-[#8a9ab0] text-sm">Select a job to see its full details.</p>
                    </div>
                    <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-[#f0f5fa] text-[#2a85ff]">{jobs.length} total</span>
                  </div>

                  <div className="space-y-3 max-h-162.5 overflow-auto pr-1">
                    {jobs.map((job) => (
                      <div
                        key={job.id}
                        onClick={() => {
                          setSelectedJobId(job.id)
                          setCurrentJobId(job.id)
                        }}
                        className={`w-full text-left rounded-2xl border p-4 transition-all cursor-pointer ${
                          selectedJob?.id === job.id
                            ? 'border-[#2a85ff] bg-[#e8f1ff] shadow-lg shadow-[#2a85ff]/10'
                            : 'border-[#e2eaf2] bg-[#fcfdfe] hover:bg-white hover:border-[#cfe0f6]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-[#8a9ab0]">{job.department}</p>
                            <h4 className="text-[#070707] text-lg font-bold mt-1">{job.title}</h4>
                            <p className="text-[#5a6a7a] text-sm mt-1">{job.employmentType} · {job.location || 'Remote'}</p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              editJob(job)
                            }}
                            title={`Edit ${job.title}`}
                            className="shrink-0 px-3 py-2 rounded-xl bg-white border border-[#e2eaf2] text-[#2a85ff] hover:border-[#2a85ff]/40 hover:bg-[#f8fbff] transition-all"
                            aria-label={`Edit ${job.title}`}
                          >
                            <Pencil size={16} />
                          </button>
                        </div>
                      </div>
                    ))}

                    {jobs.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-[#d8e5f0] p-8 text-center text-[#8a9ab0]">
                        No jobs have been created yet.
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="rounded-3xl border border-[#e2eaf2] bg-[#fcfdfe] p-5 sm:p-8">
                  {selectedJob ? (
                    <>
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#e2eaf2] pb-5 mb-5">
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.25em] text-[#8a9ab0]">Job details</p>
                          <h3 className="text-[#070707] text-2xl font-extrabold mt-2">{selectedJob.title}</h3>
                          <p className="text-[#5a6a7a] mt-1">{selectedJob.department} · Created {formatDate(selectedJob.createdAt)}</p>
                        </div>
                        <button
                          onClick={() => editJob(selectedJob)}
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#070707] text-white text-sm font-bold hover:bg-[#202020] transition-all"
                        >
                          <Pencil size={16} /> Edit Job
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="rounded-2xl bg-white border border-[#e2eaf2] p-4">
                          <p className="text-[10px] uppercase tracking-widest text-[#8a9ab0] font-black">Experience</p>
                          <p className="text-[#070707] font-bold mt-2">{selectedJob.experienceLevel}</p>
                        </div>
                        <div className="rounded-2xl bg-white border border-[#e2eaf2] p-4">
                          <p className="text-[10px] uppercase tracking-widest text-[#8a9ab0] font-black">Employment</p>
                          <p className="text-[#070707] font-bold mt-2">{selectedJob.employmentType}</p>
                        </div>
                        <div className="rounded-2xl bg-white border border-[#e2eaf2] p-4">
                          <p className="text-[10px] uppercase tracking-widest text-[#8a9ab0] font-black">Education</p>
                          <p className="text-[#070707] font-bold mt-2">{selectedJob.education}</p>
                        </div>
                        <div className="rounded-2xl bg-white border border-[#e2eaf2] p-4">
                          <p className="text-[10px] uppercase tracking-widest text-[#8a9ab0] font-black">Status</p>
                          <p className="text-[#070707] font-bold mt-2 capitalize">{selectedJob.status}</p>
                        </div>
                      </div>

                      <div className="space-y-5">
                        <div>
                          <p className="text-xs font-black uppercase tracking-widest text-[#8a9ab0] mb-2">Description</p>
                          <p className="text-[#5a6a7a] leading-relaxed">{selectedJob.description || 'No job description was added.'}</p>
                        </div>

                        <div>
                          <p className="text-xs font-black uppercase tracking-widest text-[#8a9ab0] mb-2">Required Skills</p>
                          <div className="flex flex-wrap gap-2">
                            {selectedJob.requiredSkills.length ? selectedJob.requiredSkills.map((skill) => (
                              <span key={skill} className="px-3 py-1.5 rounded-full bg-[#e8f1ff] text-[#2a85ff] text-xs font-bold">
                                {skill}
                              </span>
                            )) : <span className="text-sm text-[#8a9ab0]">No required skills were added.</span>}
                          </div>
                        </div>

                        <div>
                          <p className="text-xs font-black uppercase tracking-widest text-[#8a9ab0] mb-2">Bonus Qualifications</p>
                          <p className="text-[#5a6a7a] leading-relaxed">{selectedJob.niceToHave || 'None specified.'}</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                          <div className="flex items-center gap-2 text-sm text-[#5a6a7a]"><MapPin size={16} className="text-[#2a85ff]" /> {selectedJob.location || 'Remote'}</div>
                          <div className="flex items-center gap-2 text-sm text-[#5a6a7a]"><Clock size={16} className="text-[#2a85ff]" /> {selectedJob.minYearsExperience}+ years</div>
                          <div className="flex items-center gap-2 text-sm text-[#5a6a7a]"><Tag size={16} className="text-[#2a85ff]" /> {selectedJob.department}</div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="h-full min-h-105 flex items-center justify-center text-[#8a9ab0] font-medium text-center">
                      No job selected yet.
                    </div>
                  )}
                </div>
              </div>
            )}

            {panel === 'new-job' && (
              <div className="flex flex-col gap-8 sm:gap-10">
                <div className="flex items-center justify-between border-b border-[#f0f5fa] pb-6 sm:pb-8">
                  <div>
                    <h2 className="text-[#070707] text-xl sm:text-2xl font-bold">{editingJobId ? 'Edit Job' : 'New Job Post'}</h2>
                    <p className="text-[#8a9ab0] text-xs sm:text-sm mt-1">Define the requirements and update the company role details.</p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#f0f5fa] flex items-center justify-center text-[#2a85ff]">
                    <Sparkles size={20} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10">
                  <div className="flex flex-col gap-2.5">
                    <label className="text-sm font-bold text-[#070707] tracking-tight">Job Title</label>
                    <input value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} placeholder="e.g. Senior Frontend Engineer" className="w-full border border-[#e2eaf2] rounded-xl px-4 py-3.5 text-sm text-[#070707] placeholder-[#b0bac6] focus:outline-none focus:border-[#2a85ff] focus:ring-4 focus:ring-[#2a85ff]/5 transition-all bg-[#fcfdfe]" />
                  </div>

                  <div className="flex flex-col gap-2.5">
                    <label className="text-sm font-bold text-[#070707] tracking-tight">Department</label>
                    <div className="relative">
                      <select title="Department" aria-label="Department" value={form.department} onChange={(e) => setForm((prev) => ({ ...prev, department: e.target.value }))} className="w-full appearance-none border border-[#e2eaf2] rounded-xl px-4 py-3.5 text-sm text-[#070707] bg-[#fcfdfe] focus:outline-none focus:border-[#2a85ff] focus:ring-4 focus:ring-[#2a85ff]/5 transition-all cursor-pointer">
                        <option value="" disabled>Select department</option>
                        {DEPARTMENTS.map((department) => <option key={department} value={department}>{department}</option>)}
                      </select>
                      <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#b0bac6] pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10">
                  <div className="flex flex-col gap-3">
                    <label className="text-sm font-bold text-[#070707] tracking-tight">Experience Level</label>
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                      {EXPERIENCE_LEVELS.map((level) => (
                        <button key={level} onClick={() => setForm((prev) => ({ ...prev, experienceLevel: level }))} className={`px-4 sm:px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all border ${form.experienceLevel === level ? 'bg-[#2a85ff] text-white border-[#2a85ff] shadow-lg shadow-[#2a85ff]/20' : 'bg-white text-[#5a6a7a] border-[#e2eaf2] hover:border-[#2a85ff]/40 hover:text-[#2a85ff]'}`}>
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <label className="text-sm font-bold text-[#070707] tracking-tight">Employment Type</label>
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                      {EMPLOYMENT_TYPES.map((type) => (
                        <button key={type} onClick={() => setForm((prev) => ({ ...prev, employmentType: type }))} className={`px-4 sm:px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all border ${form.employmentType === type ? 'bg-[#2a85ff] text-white border-[#2a85ff] shadow-lg shadow-[#2a85ff]/20' : 'bg-white text-[#5a6a7a] border-[#e2eaf2] hover:border-[#2a85ff]/40 hover:text-[#2a85ff]'}`}>
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <label className="text-sm font-bold text-[#070707] tracking-tight">Required Skills</label>
                  <div className="min-h-15 w-full border border-[#e2eaf2] rounded-2xl px-4 py-3 flex flex-wrap gap-2 focus-within:border-[#2a85ff] focus-within:ring-4 focus-within:ring-[#2a85ff]/5 transition-all bg-[#fcfdfe]">
                    {form.requiredSkills.map((skill) => (
                      <span key={skill} className="flex items-center gap-2 bg-[#e8f1ff] text-[#2a85ff] text-xs font-bold px-3.5 py-1.5 rounded-lg border border-[#2a85ff]/10">
                        {skill}
                        <button onClick={() => removeSkill(skill)} className="hover:text-[#1a65df] transition-colors cursor-pointer" aria-label={`Remove ${skill}`}>
                          <X size={14} strokeWidth={3} />
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      value={form.skillInput}
                      onChange={(e) => setForm((prev) => ({ ...prev, skillInput: e.target.value }))}
                      onKeyDown={handleSkillKeyDown}
                      placeholder={form.requiredSkills.length === 0 ? 'Type skill and press Enter…' : ''}
                      className="flex-1 min-w-40 text-sm text-[#070707] placeholder-[#b0bac6] bg-transparent focus:outline-none"
                    />
                  </div>
                  <p className="text-[11px] text-[#b0bac6] font-medium uppercase tracking-wider">Press Enter to add tags</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-10">
                  <div className="flex flex-col gap-3">
                    <label className="text-sm font-bold text-[#070707] tracking-tight">Years (Min)</label>
                    <div className="flex items-center gap-5 bg-[#fcfdfe] border border-[#e2eaf2] rounded-2xl p-2 w-fit">
                      <button title="Decrease minimum years" aria-label="Decrease minimum years" onClick={() => setForm((prev) => ({ ...prev, minYearsExperience: Math.max(prev.minYearsExperience - 1, 0) }))} className="w-10 h-10 rounded-xl bg-white border border-[#e2eaf2] flex items-center justify-center text-[#5a6a7a] hover:border-[#2a85ff] hover:text-[#2a85ff] transition-all cursor-pointer shadow-sm">
                        <Minus size={18} strokeWidth={2.5} />
                      </button>
                      <div className="flex flex-col items-center min-w-10">
                        <span className="text-[#070707] font-black text-2xl leading-none">{form.minYearsExperience === 20 ? '20+' : form.minYearsExperience}</span>
                      </div>
                      <button title="Increase minimum years" aria-label="Increase minimum years" onClick={() => setForm((prev) => ({ ...prev, minYearsExperience: Math.min(prev.minYearsExperience + 1, 20) }))} className="w-10 h-10 rounded-xl bg-white border border-[#e2eaf2] flex items-center justify-center text-[#5a6a7a] hover:border-[#2a85ff] hover:text-[#2a85ff] transition-all cursor-pointer shadow-sm">
                        <Plus size={18} strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <label className="text-sm font-bold text-[#070707] tracking-tight">Education</label>
                    <div className="relative">
                      <select title="Education requirement" aria-label="Education requirement" value={form.education} onChange={(e) => setForm((prev) => ({ ...prev, education: e.target.value }))} className="w-full appearance-none border border-[#e2eaf2] rounded-2xl px-4 py-3.5 text-sm text-[#070707] bg-[#fcfdfe] focus:outline-none focus:border-[#2a85ff] focus:ring-4 focus:ring-[#2a85ff]/5 transition-all cursor-pointer">
                        <option value="" disabled>Required degree</option>
                        {EDUCATION_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                      </select>
                      <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#b0bac6] pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-10">
                  <div className="flex flex-col gap-3">
                    <label className="text-sm font-bold text-[#070707] tracking-tight">Location</label>
                    <input value={form.location} onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))} placeholder="Remote or city" className="w-full border border-[#e2eaf2] rounded-2xl px-5 py-3.5 text-sm text-[#070707] placeholder-[#b0bac6] focus:outline-none focus:border-[#2a85ff] focus:ring-4 focus:ring-[#2a85ff]/5 transition-all bg-[#fcfdfe]" />
                  </div>
                </div>

                <div className="flex flex-col gap-8">
                  <div className="flex flex-col gap-3">
                    <label className="text-sm font-bold text-[#070707] tracking-tight">Job Description</label>
                    <textarea value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} rows={5} placeholder="Key responsibilities and expectations..." className="w-full border border-[#e2eaf2] rounded-2xl px-5 py-4 text-sm text-[#070707] placeholder-[#b0bac6] focus:outline-none focus:border-[#2a85ff] focus:ring-4 focus:ring-[#2a85ff]/5 transition-all resize-none bg-[#fcfdfe]" />
                  </div>

                  <div className="flex flex-col gap-3">
                    <label className="text-sm font-bold text-[#070707] tracking-tight">Bonus Qualifications (Optional)</label>
                    <textarea value={form.niceToHave} onChange={(e) => setForm((prev) => ({ ...prev, niceToHave: e.target.value }))} rows={3} placeholder="Certifications, specific industry experience..." className="w-full border border-[#e2eaf2] rounded-2xl px-5 py-4 text-sm text-[#070707] placeholder-[#b0bac6] focus:outline-none focus:border-[#2a85ff] focus:ring-4 focus:ring-[#2a85ff]/5 transition-all resize-none bg-[#fcfdfe]" />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-8 border-t border-[#f0f5fa]">
                  <button onClick={() => setForm(emptyForm)} className="w-full sm:w-auto px-8 py-3.5 rounded-full text-sm font-bold text-[#5a6a7a] border border-[#e2eaf2] hover:border-[#2a85ff]/40 hover:text-[#2a85ff] transition-all bg-white">
                    Clear Form
                  </button>
                  <button type="button" onClick={() => void saveJob()} disabled={saving} className="w-full sm:w-auto px-10 py-4 rounded-full text-sm font-black text-white bg-[#2a85ff] hover:bg-[#1a75ef] shadow-2xl shadow-[#2a85ff]/30 hover:shadow-[#2a85ff]/50 transition-all flex items-center justify-center gap-3 group">
                    {saving ? (editingJobId ? 'Saving Job...' : 'Creating Job...') : editingJobId ? 'Save Job' : 'Create Job'}
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            )}

          </section>
        </div>
      </main>
    </div>
  )
}
