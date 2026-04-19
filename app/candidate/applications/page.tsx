'use client'

import React from 'react'
import { 
  FileText, Trash2, AlertCircle, Sparkles
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { apiFetch } from '../../../utils/api-client'
import { SharedJobData, getTypeLabel } from '../../../utils/job-utils'
import JobDetailsModal from '../../components/JobDetailsModal'
import { useToast } from '../../components/ui/Toast'

type ApplicationItem = SharedJobData & {
  applicationId: string
  jobId: string
  status: string
  statusColor: string
  feedback: string
  skills: string[]
}

function toRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object') return value as Record<string, unknown>
  return {}
}

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationItem[]>([])
  const [selectedApplication, setSelectedApplication] = useState<ApplicationItem | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [profilePct, setProfilePct] = useState(0)
  const [error, setError] = useState('')
  const { showToast } = useToast()

  useEffect(() => {
    void (async () => {
      try {
        const [applicationsResult, profileResult] = await Promise.all([
          apiFetch('/candidate/applications'),
          apiFetch('/candidate/profile')
        ])

        const prof = toRecord(profileResult.data)
        setProfilePct(Number(prof.completionPct || 0))

        const result = applicationsResult
        const mapped = Array.isArray(result.data)
          ? result.data.map((item, idx: number) => {
              const app = toRecord(item)
              const statusValue = String(app.status || 'applied')

              return {
                id: String(app.id || idx + 1),
                applicationId: String(app.id || idx + 1),
                jobId: String(app.jobId || ''),
                title: String(app.role || app.jobTitle || 'Unknown Role'),
                company: String(app.company || 'Recruiter Organization'),
                posted: typeof app.date === 'string' ? new Date(app.date).toLocaleDateString() : 'Recently',
                status: statusValue.replace('_', ' ').replace(/\b\w/g, (ch: string) => ch.toUpperCase()),
                statusColor: statusValue === 'shortlisted'
            ? 'text-[#16a34a] bg-[#16a34a]/10 border-[#16a34a]/20'
            : statusValue === 'in_review'
              ? 'text-[#2a85ff] bg-[#2a85ff]/10 border-[#2a85ff]/20'
              : 'text-[#8a9ab0] bg-[#f0f5fa] border-[#e2eaf2]',
                match: Number(app.match || 0),
                feedback: String(app.feedback || 'Application received and pending initial screening.'),
                location: String(app.location || 'Remote'),
                description: String(app.description || ''),
                skills: Array.isArray(app.skills) ? app.skills.filter((skill): skill is string => typeof skill === 'string') : [],
                requiredSkills: Array.isArray(app.skills) ? app.skills.filter((skill): skill is string => typeof skill === 'string') : [],
                department: String(app.department || 'Other'),
                experienceLevel: String(app.experienceLevel || 'Intermediate'),
                education: String(app.education || 'Any'),
                salary: String(app.salary || 'Competitive'),
                type: getTypeLabel(String(app.employmentType || 'Full-Time')),
                minYearsExperience: Number(app.minYearsExperience || 0),
                niceToHave: String(app.niceToHave || ''),
                tags: [] 
              } satisfies ApplicationItem
            })
          : []
        setApplications(mapped)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load applications')
      }
    })()
  }, [])

  const handleWithdraw = async (applicationId: string) => {
    if (!confirm('Are you sure you want to withdraw this application? This action cannot be undone.')) return
    try {
      await apiFetch(`/candidate/applications/${applicationId}`, { method: 'DELETE' })
      setApplications(prev => prev.filter(app => app.applicationId !== applicationId))
      showToast('Application withdrawn successfully', 'success')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to withdraw application'
      setError(msg)
      showToast(msg, 'error')
    }
  }

  const formatStatusUpdate = (status: string, feedback: string) => {
    const s = status.toLowerCase()
    if (s.includes('shortlisted')) return 'Congratulations! You have been shortlisted for this role. The hiring team will reach out soon.'
    if (s.includes('review')) return 'Your application is currently being evaluated by the hiring team.'
    if (s.includes('rejected') || s.includes('pass')) return 'Thank you for your interest. The hiring team has decided to move forward with other candidates at this time.'
    return 'Your application has been received and is pending initial screening.'
  }

  const stats = {
    total: applications.length,
    active: applications.filter(a => ['Applied', 'In Review'].includes(a.status)).length,
    shortlisted: applications.filter(a => a.status === 'Shortlisted').length
  }

  return (
    <div className="flex flex-col gap-8">
      
      {/* ── STATS SUMMARY ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Applications', value: stats.total.toString(), color: '#2a85ff' },
          { label: 'Active Reviews', value: stats.active.toString(), color: '#f07830' },
          { label: 'Shortlisted', value: stats.shortlisted.toString(), color: '#16a34a' },
          { label: 'Profile Completion', value: `${profilePct}%`, color: '#6366f1' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-3xl p-6 border border-[#e2eaf2]/60 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
            <p className="text-[#8a9ab0] text-xs font-bold uppercase tracking-wider mb-2">{stat.label}</p>
            <p className="text-[#070707] text-3xl font-black">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* ── APPLICATIONS LIST ── */}
      <div className="space-y-6">
        <h2 className="text-[#070707] text-xl font-bold px-1">Recent Applications</h2>
        
        <div className="flex flex-col gap-4">
          {applications.map((app, i) => (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl sm:rounded-4xl border border-[#e2eaf2]/60 p-5 sm:p-8 hover:shadow-[0_12px_40px_rgba(0,0,0,0.04)] transition-all group"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                
                {/* Left: Role & Company */}
                <div className="flex items-start gap-5 min-w-0">
                  <div className="w-14 h-14 rounded-2xl bg-[#f8fbff] border border-[#e2eaf2] flex items-center justify-center text-[#2a85ff] shrink-0">
                    <FileText size={24} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-[#070707] text-lg sm:text-xl font-extrabold truncate group-hover:text-[#2a85ff] transition-colors">
                      {app.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-[#5a6a7a] font-bold text-sm">{app.company}</span>
                      <span className="text-[#e2eaf2]">·</span>
                      <span className="text-[#8a9ab0] text-xs font-medium">Applied on {app.posted}</span>
                    </div>
                  </div>
                </div>

                {/* Center: Status & Match */}
                <div className="flex flex-wrap items-center gap-6 sm:gap-10 lg:px-10 lg:border-x lg:border-[#e2eaf2]">
                  <div className="text-center">
                    <p className="text-[#8a9ab0] text-[10px] font-bold uppercase tracking-widest mb-1.5">Your Match</p>
                    <div className="inline-flex items-center gap-1.5 text-[#2a85ff] font-black text-xl">
                      {app.match}%
                    </div>
                  </div>
                  <div>
                    <p className="text-[#8a9ab0] text-[10px] font-bold uppercase tracking-widest mb-1.5">Status</p>
                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold border ${app.statusColor}`}>
                      {app.status}
                    </span>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setSelectedApplication(app)
                      setIsModalOpen(true)
                    }}
                    className="flex-1 lg:flex-none px-6 py-3 rounded-xl bg-[#f0f5fa] hover:bg-[#e2eaf2] text-[#070707] text-sm font-bold transition-all cursor-pointer text-center"
                  >
                    View Details
                  </button>
                  <button 
                    onClick={() => handleWithdraw(app.applicationId)}
                    aria-label="Withdraw application" 
                    className="p-3 rounded-xl bg-white border border-[#e2eaf2] text-[#8a9ab0] hover:text-[#dc2626] hover:border-[#dc2626]/30 transition-all cursor-pointer"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>

              {/* Status Update / Feedback Alert */}
              <div className="mt-5 sm:mt-8 p-4 sm:p-5 rounded-2xl bg-[#f8fbff] border border-[#2a85ff]/5 flex items-start gap-3 sm:gap-4">
                <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-[#2a85ff] shrink-0">
                  <AlertCircle size={16} />
                </div>
                <div>
                  <p className="text-[#070707] text-sm font-bold">Latest Update</p>
                  <p className="text-[#5a6a7a] text-sm mt-1">{formatStatusUpdate(app.status, app.feedback)}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {error ? <p className="text-sm font-bold text-[#dc2626]">{error}</p> : null}

      <JobDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        job={selectedApplication}
        applicationStatus={selectedApplication ? {
          status: selectedApplication.status,
          match: selectedApplication.match,
          feedback: selectedApplication.feedback
        } : undefined}
        isApplied={true}
      />
    </div>
  )
}

