'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Briefcase, Users, RefreshCw, Sparkles, MapPin, CalendarDays, BadgeCheck, Upload, FileText } from 'lucide-react'
import Navbar from '../components/Navbar'
import { apiFetch, getToken, getApiBase, setCurrentJobId } from '../../utils/api-client'
import { useRouter } from 'next/navigation'

type JobItem = {
  id: string
  title: string
  department: string
  location: string
  status: string
  shortlistedCount: number
  createdAt?: string
}

type ApplicantItem = {
  id: string
  jobId: string
  jobTitle: string
  candidateName: string
  candidateTitle: string
  location: string
  status: string
  matchScore: number
  appliedAt?: string
  feedback: string
  skills: string[]
}

type Summary = {
  total: number
  rankr: number
  external: number
}

function toRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
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

function formatDate(value?: string): string {
  if (!value) return 'Recently'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Recently' : date.toLocaleDateString()
}

function statusClass(status: string): string {
  if (status === 'shortlisted' || status === 'hired') return 'bg-emerald-500/10 text-emerald-700 border-emerald-200'
  if (status === 'in_review') return 'bg-sky-500/10 text-sky-700 border-sky-200'
  return 'bg-slate-100 text-slate-600 border-slate-200'
}

function statusLabel(status: string): string {
  return String(status || 'applied')
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

export default function CandidatesPage() {
  const router = useRouter()
  const [jobs, setJobs] = useState<JobItem[]>([])
  const [applicants, setApplicants] = useState<ApplicantItem[]>([])
  const [summary, setSummary] = useState<Summary>({ total: 0, rankr: 0, external: 0 })
  const [selectedJobId, setSelectedJobId] = useState('')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [analyzingJobId, setAnalyzingJobId] = useState('')
  const [shortlistingAppId, setShortlistingAppId] = useState('')
  const [unshortlistingAppId, setUnshortlistingAppId] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'shortlisted'>('all')
  const [selectedCandidate, setSelectedCandidate] = useState<ApplicantItem | null>(null)
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<{ imported: number; skipped: number } | null>(null)
  const csvInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let mounted = true

    void (async () => {
      try {
        if (mounted) {
          setLoading(true)
          setError('')
        }

        const [jobsResult, applicationsResult] = await Promise.all([
          apiFetch('/jobs'),
          apiFetch('/recruiter/applications'),
        ])

        const jobsData: Record<string, unknown>[] = Array.isArray(jobsResult.data) ? jobsResult.data.map(toRecord) : []
        const applicationsData: Record<string, unknown>[] = Array.isArray(applicationsResult.data?.applications)
          ? applicationsResult.data.applications.map(toRecord)
          : []

        const mappedJobs = jobsData.map((job) => ({
          id: String(job.id || job._id || ''),
          title: readString(job.title, 'Untitled Job'),
          department: readString(job.department, 'Other'),
          location: readString(job.location, 'Remote'),
          status: readString(job.status, 'open'),
          shortlistedCount: readNumber(job.shortlistedCount, 0),
          createdAt: typeof job.createdAt === 'string' ? job.createdAt : undefined,
        }))

        const mappedApplicants = applicationsData.map((app) => ({
          id: String(app.id || app._id || ''),
          jobId: String(app.jobId || ''),
          jobTitle: readString(app.jobTitle, 'Unknown Role'),
          candidateName: readString(app.candidateName, 'Unknown Candidate'),
          candidateTitle: readString(app.candidateTitle, 'Candidate'),
          location: readString(app.location, 'Remote'),
          status: readString(app.status, 'applied'),
          matchScore: readNumber(app.matchScore, 0),
          appliedAt: typeof app.appliedAt === 'string' ? app.appliedAt : undefined,
          feedback: readString(app.feedback, 'Application received.'),
          skills: readStringArray(app.skills),
        }))

        if (!mounted) return

        setJobs(mappedJobs)
        setApplicants(mappedApplicants)
        setSummary({
          total: readNumber(applicationsResult.data?.shortlistTotal, mappedApplicants.length),
          rankr: mappedApplicants.filter((app) => app.skills.length > 0).length,
          external: Math.max(0, mappedApplicants.length - mappedApplicants.filter((app) => app.skills.length > 0).length),
        })
        setSelectedJobId((current) => current || mappedJobs[0]?.id || '')
      } catch (fetchError) {
        if (!mounted) return
        setError(fetchError instanceof Error ? fetchError.message : 'Failed to load candidates')
      } finally {
        if (mounted) setLoading(false)
      }
    })()

    return () => {
      mounted = false
    }
  }, [])

  const selectedJob = useMemo(
    () => jobs.find((job) => job.id === selectedJobId) || jobs[0] || null,
    [jobs, selectedJobId]
  )

  const jobApplicants = useMemo(
    () => {
      const perJob = applicants.filter((applicant) => !selectedJob || applicant.jobId === selectedJob.id);
      if (activeTab === 'shortlisted') {
        return perJob.filter(a => a.status === 'shortlisted');
      }
      return perJob;
    },
    [applicants, selectedJob, activeTab]
  )

  const openJob = (jobId: string) => {
    setSelectedJobId(jobId)
    setCurrentJobId(jobId)
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      const [jobsResult, applicationsResult] = await Promise.all([
        apiFetch('/jobs'),
        apiFetch('/recruiter/applications'),
      ])

      const jobsData: Record<string, unknown>[] = Array.isArray(jobsResult.data) ? jobsResult.data.map(toRecord) : []
      const applicationsData: Record<string, unknown>[] = Array.isArray(applicationsResult.data?.applications)
        ? applicationsResult.data.applications.map(toRecord)
        : []

      const mappedJobs = jobsData.map((job) => ({
        id: String(job.id || job._id || ''),
        title: readString(job.title, 'Untitled Job'),
        department: readString(job.department, 'Other'),
        location: readString(job.location, 'Remote'),
        status: readString(job.status, 'open'),
        shortlistedCount: readNumber(job.shortlistedCount, 0),
        createdAt: typeof job.createdAt === 'string' ? job.createdAt : undefined,
      }))

      const mappedApplicants = applicationsData.map((app) => ({
        id: String(app.id || app._id || ''),
        jobId: String(app.jobId || ''),
        jobTitle: readString(app.jobTitle, 'Unknown Role'),
        candidateName: readString(app.candidateName, 'Unknown Candidate'),
        candidateTitle: readString(app.candidateTitle, 'Candidate'),
        location: readString(app.location, 'Remote'),
        status: readString(app.status, 'applied'),
        matchScore: readNumber(app.matchScore, 0),
        appliedAt: typeof app.appliedAt === 'string' ? app.appliedAt : undefined,
        feedback: readString(app.feedback, 'Application received.'),
        skills: readStringArray(app.skills),
      }))

      setJobs(mappedJobs)
      setApplicants(mappedApplicants)
      setSummary({
        total: readNumber(applicationsResult.data?.shortlistTotal, mappedApplicants.length),
        rankr: mappedApplicants.filter((app) => app.skills.length > 0).length,
        external: Math.max(0, mappedApplicants.length - mappedApplicants.filter((app) => app.skills.length > 0).length),
      })
      setSelectedJobId((current) => current || mappedJobs[0]?.id || '')
    } catch (refreshError) {
      setError(refreshError instanceof Error ? refreshError.message : 'Failed to refresh candidates')
    } finally {
      setRefreshing(false)
    }
  }

  const handleAnalyze = async (jobId: string) => {
    setAnalyzingJobId(jobId)
    try {
      await apiFetch(`/jobs/${jobId}/analyze-applications`, { method: 'POST' })
      router.push('/results?jobId=' + jobId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze applicants')
      setAnalyzingJobId('')
    }
  }

  const handleShortlist = async (appId: string) => {
    setShortlistingAppId(appId)
    try {
      await apiFetch(`/applications/${appId}/shortlist`, { method: 'POST' })
      await handleRefresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to shortlist applicant')
    } finally {
      setShortlistingAppId(appId === shortlistingAppId ? '' : shortlistingAppId)
      setShortlistingAppId('')
    }
  }

  const handleUnshortlist = async (appId: string) => {
    setUnshortlistingAppId(appId)
    try {
      await apiFetch(`/applications/${appId}/shortlist`, { method: 'DELETE' })
      await handleRefresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove from shortlist')
    } finally {
      setUnshortlistingAppId('')
    }
  }

  const handleImportCsv = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !selectedJob) return
    e.target.value = ''

    setImporting(true)
    setImportResult(null)
    setError('')

    try {
      const form = new FormData()
      form.append('file', file)
      const response = await fetch(
        `${getApiBase()}/jobs/${selectedJob.id}/candidates/import/external-csv`,
        { method: 'POST', headers: { Authorization: `Bearer ${getToken()}` }, body: form }
      )
      const payload = await response.json()
      if (!response.ok || !payload?.success) throw new Error(payload?.error?.message || 'Import failed')
      setImportResult(payload.data)
      await handleRefresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import file')
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f3f7fb]">
      <Navbar type="app" activeNav="Candidates" />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 pt-28 pb-12 sm:pt-32 sm:pb-16">
        <section className="relative overflow-hidden rounded-4xl bg-[#070707] px-6 py-8 sm:px-8 sm:py-10 text-white shadow-[0_24px_60px_rgba(0,0,0,0.16)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(42,133,255,0.28),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(42,133,255,0.15),transparent_35%)]" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white/70">
                <Sparkles size={12} /> Recruiter access
              </div>
              <h1 className="text-4xl font-black tracking-tight sm:text-6xl">Candidates</h1>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/60 sm:text-base">
                View current jobs and their applicants in one place.
              </p>
            </div>
            <button
              type="button"
              onClick={() => void handleRefresh()}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-[#070707] transition-colors hover:bg-white/90"
            >
              <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
              Refresh data
            </button>
          </div>
        </section>

        <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="rounded-3xl bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Open jobs</p>
            <p className="mt-2 text-3xl font-black text-slate-900">{jobs.length}</p>
          </div>
          <div className="rounded-3xl bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Total Applicants</p>
            <p className="mt-2 text-3xl font-black text-slate-900">{applicants.length}</p>
          </div>
          <div className="rounded-3xl bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Total Shortlisted</p>
            <p className="mt-2 text-3xl font-black text-[#16a34a]">{applicants.filter(a => a.status === 'shortlisted').length}</p>
          </div>
          <div className="rounded-3xl bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.06)] border border-blue-50">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Job Applicants</p>
            <p className="mt-2 text-3xl font-black text-[#2a85ff]">{jobApplicants.length}</p>
          </div>
        </section>

        {error && (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {error}
          </div>
        )}

        {importResult && (
          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            <FileText size={16} className="shrink-0" />
            <span>
              <strong>{importResult.imported}</strong> candidate{importResult.imported !== 1 ? 's' : ''} imported successfully.
              {importResult.skipped > 0 && <> {importResult.skipped} row{importResult.skipped !== 1 ? 's' : ''} skipped (missing name).</>}
              {' '}Click <strong>Analyze with AI</strong> to score them.
            </span>
            <button type="button" onClick={() => setImportResult(null)} className="ml-auto text-emerald-600 hover:text-emerald-800">✕</button>
          </div>
        )}

        <section className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
          <aside className="rounded-[1.75rem] bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.06)] sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Current jobs</p>
                <h2 className="mt-1 text-2xl font-black text-slate-900">Open roles</h2>
              </div>
              <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                {jobs.length} live
              </div>
            </div>

            {loading ? (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
                Loading jobs and applicants...
              </div>
            ) : jobs.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
                No jobs found yet.
              </div>
            ) : (
              <div className="space-y-3">
                {jobs.map((job) => {
                  const isSelected = job.id === selectedJob?.id
                  return (
                    <button
                      key={job.id}
                      type="button"
                      onClick={() => openJob(job.id)}
                      className={`w-full rounded-[1.4rem] border p-4 text-left transition-all ${
                        isSelected ? 'border-[#2a85ff] bg-[#f4f8ff]' : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-base font-bold text-slate-900">{job.title}</p>
                          <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                            <Briefcase size={14} /> {job.department}
                          </p>
                          <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                            <MapPin size={14} /> {job.location}
                          </p>
                        </div>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                          {job.shortlistedCount} shortlisted
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </aside>

          <section className="rounded-[1.75rem] bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.06)] sm:p-6">
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Applicants</p>
                <div className="mt-2 flex items-center gap-6">
                  <h2 className="text-2xl font-black text-slate-900 leading-tight">
                    {selectedJob ? selectedJob.title : 'Select a job'}
                  </h2>
                </div>
                <div className="mt-4 flex items-center bg-slate-100 p-1 rounded-full w-fit">
                  <button 
                    onClick={() => setActiveTab('all')}
                    className={`px-6 py-1.5 rounded-full text-xs font-bold transition-all ${activeTab === 'all' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    All Applicants ({applicants.filter(a => !selectedJob || a.jobId === selectedJob.id).length})
                  </button>
                  <button 
                    onClick={() => setActiveTab('shortlisted')}
                    className={`px-6 py-1.5 rounded-full text-xs font-bold transition-all ${activeTab === 'shortlisted' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Shortlisted ({applicants.filter(a => (!selectedJob || a.jobId === selectedJob.id) && a.status === 'shortlisted').length})
                  </button>
                </div>
              </div>
              {selectedJob && (
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    ref={csvInputRef}
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    className="hidden"
                    onChange={handleImportCsv}
                  />
                  <button
                    type="button"
                    onClick={() => csvInputRef.current?.click()}
                    disabled={importing}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:scale-105 active:scale-95 disabled:opacity-50"
                    title="Upload CSV or Excel with candidate data"
                  >
                    {importing ? <RefreshCw className="animate-spin" size={16} /> : <Upload size={16} />}
                    {importing ? 'Importing...' : 'Import CSV'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAnalyze(selectedJob.id)}
                    disabled={analyzingJobId === selectedJob.id}
                    className="inline-flex items-center gap-2 rounded-full bg-[#ff3366] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-pink-100 transition-all hover:bg-[#e6295b] hover:scale-105 active:scale-95 disabled:opacity-50"
                    title="Analyze applied users"
                  >
                    {analyzingJobId === selectedJob.id ? <RefreshCw className="animate-spin" size={16} /> : <Sparkles size={16} />}
                    Analyze with AI
                  </button>
                </div>
              )}
            </div>

            {loading ? (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
                Loading applicants...
              </div>
            ) : jobApplicants.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
                No applicants have been submitted for the selected job yet.
              </div>
            ) : (
              <div className="space-y-4">
                {jobApplicants.map((applicant) => (
                  <article key={applicant.id} onClick={() => setSelectedCandidate(applicant)} className="rounded-[1.4rem] border border-slate-200 p-5 transition-colors hover:bg-slate-50 cursor-pointer">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-bold text-slate-900">{applicant.candidateName}</h3>
                          <span className={`rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ${statusClass(applicant.status)}`}>
                            {statusLabel(applicant.status)}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-slate-500">
                          {applicant.candidateTitle} • {applicant.location} • Applied {formatDate(applicant.appliedAt)}
                        </p>
                        <p className="mt-3 text-sm leading-relaxed text-slate-700">{applicant.feedback}</p>
                        {applicant.skills.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {applicant.skills.map((skill) => (
                              <span key={skill} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                        {applicant.status === 'shortlisted' ? (
                          <div className="mt-4 pt-4 border-t border-slate-100">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleUnshortlist(applicant.id); }}
                              disabled={unshortlistingAppId === applicant.id}
                              className="rounded-full bg-red-50 px-5 py-2 text-sm font-bold text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50 flex items-center gap-2"
                            >
                              {unshortlistingAppId === applicant.id ? 'Removing...' : 'Remove from Shortlist'}
                            </button>
                          </div>
                        ) : applicant.status !== 'hired' && (
                          <div className="mt-4 pt-4 border-t border-slate-100">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleShortlist(applicant.id); }}
                              disabled={shortlistingAppId === applicant.id}
                              className="rounded-full bg-slate-900 px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-slate-800 disabled:opacity-50 flex items-center gap-2"
                            >
                              {shortlistingAppId === applicant.id ? 'Shortlisting...' : 'Shortlist Candidate'}
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="rounded-2xl bg-[#f4f8ff] p-4 text-center lg:min-w-28 shrink-0">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Match</p>
                        <p className="mt-1 text-3xl font-black text-slate-900">{applicant.matchScore}%</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </section>

        <section className="mt-8 rounded-[1.75rem] bg-[#070707] p-6 text-white sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/45">Quick summary</p>
              <h2 className="mt-1 text-2xl font-black">What is on this page</h2>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-white/60">
              <BadgeCheck size={12} /> Recruiter view
            </div>
          </div>
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <Users size={18} className="text-[#2a85ff]" />
              <p className="mt-3 text-sm text-white/75">Jobs and applicants stay on one page for quick review.</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <CalendarDays size={18} className="text-[#2a85ff]" />
              <p className="mt-3 text-sm text-white/75">Latest application dates and statuses are shown per applicant.</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <Sparkles size={18} className="text-[#2a85ff]" />
              <p className="mt-3 text-sm text-white/75">This version removes the old extra workflow so access is easier to verify.</p>
            </div>
          </div>
        </section>
      </main>
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#000000]/40 p-4 backdrop-blur-sm" onClick={() => setSelectedCandidate(null)}>
          <div className="w-full max-w-2xl rounded-[1.75rem] bg-white p-8 shadow-2xl overflow-y-auto max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-black text-slate-900">{selectedCandidate.candidateName}</h2>
                <p className="text-slate-500 mt-2 font-medium">{selectedCandidate.candidateTitle} • {selectedCandidate.location}</p>
                <div className="mt-3">
                  <span className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${statusClass(selectedCandidate.status)}`}>
                    {statusLabel(selectedCandidate.status)}
                  </span>
                </div>
              </div>
              <button type="button" onClick={() => setSelectedCandidate(null)} className="rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            <div className="mt-8 flex items-stretch gap-6 flex-col sm:flex-row border-t border-slate-100 pt-8">
              <div className="rounded-3xl bg-[#f4f8ff] p-6 text-center sm:min-w-36 flex flex-col justify-center border border-blue-100">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-500">Match Score</p>
                <p className="mt-2 text-5xl font-black text-[#2a85ff]">{selectedCandidate.matchScore}%</p>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-slate-900 flex items-center gap-2"><Sparkles size={16} className="text-[#2a85ff]" /> AI Analysis</h4>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed bg-slate-50 p-4 rounded-2xl">{selectedCandidate.feedback}</p>
              </div>
            </div>

            {selectedCandidate.skills.length > 0 && (
              <div className="mt-8 border-t border-slate-100 pt-8">
                <h4 className="font-bold text-slate-900 mb-4">Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedCandidate.skills.map((s) => (
                    <span key={s} className="rounded-full bg-slate-100 border border-slate-200 px-4 py-1.5 text-sm font-semibold text-slate-700">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {selectedCandidate.status === 'shortlisted' ? (
              <div className="mt-8 flex justify-end gap-3 border-t border-slate-100 pt-6">
                <button 
                  type="button"
                  onClick={() => setSelectedCandidate(null)}
                  className="rounded-full px-6 py-3 font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Close
                </button>
                <button 
                  type="button"
                  onClick={() => { handleUnshortlist(selectedCandidate.id); setSelectedCandidate(null); }}
                  disabled={unshortlistingAppId === selectedCandidate.id}
                  className="rounded-full bg-red-50 px-8 py-3 font-bold text-red-600 hover:bg-red-100 transition-all border border-red-200"
                >
                  {unshortlistingAppId === selectedCandidate.id ? 'Removing...' : 'Remove from Shortlist'}
                </button>
              </div>
            ) : selectedCandidate.status !== 'hired' && (
              <div className="mt-8 flex justify-end gap-3 border-t border-slate-100 pt-6">
                <button 
                  type="button"
                  onClick={() => setSelectedCandidate(null)}
                  className="rounded-full px-6 py-3 font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  onClick={() => { handleShortlist(selectedCandidate.id); setSelectedCandidate(null); }}
                  disabled={shortlistingAppId === selectedCandidate.id}
                  className="rounded-full bg-[#101010] px-8 py-3 font-bold text-white hover:bg-black shadow-[0_4px_14px_0_rgba(0,0,0,0.39)] transition-all"
                >
                  {shortlistingAppId === selectedCandidate.id ? 'Shortlisting...' : 'Shortlist Candidate'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

