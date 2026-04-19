'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Check, Pencil, ArrowLeft, Zap } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Navbar from '../components/Navbar'
import { apiFetch, getCurrentJobId, setCurrentJobId } from '../../utils/api-client'
import ProgressBar from '../components/ui/ProgressBar'

const STEPS = [
  { label: 'Create Job', status: 'done' },
  { label: 'Add Candidates', status: 'done' },
  { label: 'AI Screening', status: 'active' },
]

type ScreeningRun = {
  _id: string
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled'
  progressPct: number
  totalCandidates: number
  processedCandidates: number
}

export default function RankrScreening() {
  const router = useRouter()

  const [jobId, setJobId] = useState('')
  const [runId, setRunId] = useState('')
  const [jobTitle, setJobTitle] = useState('Selected Job')
  const [department, setDepartment] = useState('')
  const [candidateTotal, setCandidateTotal] = useState(0)
  const [run, setRun] = useState<ScreeningRun | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (typeof window === 'undefined') return
    const query = new URLSearchParams(window.location.search)
    const queryJobId = query.get('jobId') || ''
    const queryRunId = query.get('runId') || ''
    const localJobId = getCurrentJobId()
    const activeJobId = queryJobId || localJobId

    if (activeJobId) {
      setJobId(activeJobId)
      setCurrentJobId(activeJobId)
    }
    if (queryRunId) setRunId(queryRunId)
  }, [])

  useEffect(() => {
    if (!jobId) return

    void (async () => {
      try {
        const [jobResult, candidateResult] = await Promise.all([
          apiFetch(`/jobs/${jobId}`),
          apiFetch(`/jobs/${jobId}/candidates`),
        ])

        setJobTitle(jobResult.data?.title || 'Selected Job')
        setDepartment(jobResult.data?.department || '')
        setCandidateTotal(Number(candidateResult.data?.total || 0))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load screening details')
      }
    })()
  }, [jobId])

  useEffect(() => {
    if (!runId) return

    const poll = setInterval(() => {
      void (async () => {
        try {
          const result = await apiFetch(`/screening-runs/${runId}`)
          const runData = result.data as ScreeningRun
          setRun(runData)

          if (runData.status === 'completed') {
            clearInterval(poll)
            router.push(`/results?jobId=${jobId}`)
          }

          if (runData.status === 'failed' || runData.status === 'cancelled') {
            clearInterval(poll)
            setError('Screening did not complete successfully.')
          }
        } catch (err) {
          clearInterval(poll)
          setError(err instanceof Error ? err.message : 'Failed to read screening progress')
        }
      })()
    }, 1200)

    return () => clearInterval(poll)
  }, [jobId, router, runId])

  const progress = useMemo(() => Number(run?.progressPct || 0), [run])

  return (
    <div className="min-h-screen bg-[#f0f5fa]">
      <Navbar type="app" activeNav="Candidates" />

      <div className="bg-[#070707] pt-28 sm:pt-36 lg:pt-40 pb-12 sm:pb-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-white font-extrabold text-4xl sm:text-6xl lg:text-7xl leading-[1.08] tracking-tight mb-4 text-center sm:text-left">
              AI Screening<br className="hidden sm:block" />in Progress{' '}
              <span className="text-[#2a85ff]">✦</span>
            </h1>
            <p className="text-white/50 text-sm sm:text-base font-normal text-center sm:text-left">
              Gemini is analyzing more candidates and preparing your shortlist.
            </p>
          </motion.div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#2a85ff]/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 rounded-full bg-[#2a85ff]/5 blur-3xl pointer-events-none" />
      </div>

      <main className="max-w-215 mx-auto px-4 sm:px-6 py-10 lg:py-16">
        <div className="flex items-center gap-2 sm:gap-4 mb-10 sm:mb-16 overflow-x-auto no-scrollbar pb-2">
          {STEPS.map((step, i) => (
            <React.Fragment key={step.label}>
              <div className="flex items-center gap-2.5 shrink-0">
                {step.status === 'done' ? (
                  <div className="w-8 h-8 rounded-full bg-[#2a85ff] flex items-center justify-center">
                    <Check size={14} color="white" strokeWidth={3} />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#2a85ff] flex items-center justify-center ring-4 ring-[#2a85ff]/20">
                    <div className="w-2.5 h-2.5 rounded-full bg-white" />
                  </div>
                )}
                <span className="text-xs sm:text-sm font-bold whitespace-nowrap text-[#070707]">{step.label}</span>
              </div>
              {i < STEPS.length - 1 && <div className="h-px w-8 sm:w-16 bg-[#2a85ff]" />}
            </React.Fragment>
          ))}
        </div>

        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-[#e2eaf2] p-5 sm:p-7 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <h2 className="text-[#070707] font-extrabold text-xl sm:text-2xl tracking-tight">{jobTitle}</h2>
              <div className="flex items-center gap-2">
                {department ? <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-[#e8f1ff] text-[#2a85ff] border border-[#2a85ff]/10">{department}</span> : null}
                <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-[#e6f9f0] text-[#16a34a] border border-[#16a34a]/10">{run?.status || 'running'}</span>
              </div>
            </div>
            <div className="flex items-center gap-5 text-[#8a9ab0] text-sm">
              <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[#b0bac6]" /> {candidateTotal} Candidates</span>
              <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[#2a85ff]" /> AI Screening active</span>
            </div>
          </div>
          <Link
            href="/dashboard"
            className="w-full sm:w-auto flex items-center justify-center gap-2 h-11 px-5 rounded-xl border border-[#e2eaf2] text-[#5a6a7a] font-bold text-sm hover:border-[#2a85ff] hover:text-[#2a85ff] transition-all bg-[#fcfdfe]"
          >
            <Pencil size={14} />
            Edit Profile
          </Link>
        </div>

        <div className="bg-white rounded-4xl sm:rounded-[3rem] shadow-xl border border-white p-6 sm:p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(42,133,255,0.05),transparent)] pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center gap-10">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24">
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#2a85ff]"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Zap size={32} color="#2a85ff" fill="#2a85ff" className="opacity-20" />
              </div>
            </div>

            <div className="w-full max-w-md bg-[#fcfdfe] border border-[#e2eaf2] rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-[#070707]">Analyzing more candidates...</span>
                <span className="text-sm font-black text-[#2a85ff]">{Math.round(progress)}%</span>
              </div>

              <ProgressBar value={progress} />

              <div className="mt-4 text-xs text-[#8a9ab0] font-medium">
                {run?.processedCandidates || 0} / {run?.totalCandidates || candidateTotal} processed
              </div>
            </div>

            {run?.status === 'completed' ? (
              <div className="text-sm font-bold text-[#16a34a]">Analysis complete. Redirecting to shortlists...</div>
            ) : null}

            {error ? <div className="text-sm font-bold text-[#dc2626]">{error}</div> : null}
          </div>
        </div>

        <div className="mt-12 flex items-center justify-between">
          <Link href="/candidates" className="flex items-center gap-2 text-[#8a9ab0] font-bold hover:text-[#070707] transition-all">
            <ArrowLeft size={18} />
            Add More Candidates
          </Link>
        </div>
      </main>
    </div>
  )
}
