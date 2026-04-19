'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowRight, CheckCircle2 } from 'lucide-react'
import { SharedJobData, getTagTone } from '../../utils/job-utils'

interface ApplicationStatus {
  status: string
  match: number
  feedback?: string
}

interface JobDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  job: SharedJobData | null
  applicationStatus?: ApplicationStatus
  isApplied?: boolean
  onApply?: (job: SharedJobData) => Promise<void>
}

export default function JobDetailsModal({
  isOpen,
  onClose,
  job,
  applicationStatus,
  isApplied = false,
  onApply
}: JobDetailsModalProps) {
  if (!job) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-10">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-5xl max-h-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="absolute top-0 right-0 p-6 z-20">
              <button
                onClick={onClose}
                className="p-3 bg-white/80 backdrop-blur-sm border border-[#e2eaf2] rounded-full text-[#5a6a7a] hover:bg-[#070707] hover:text-white transition-all shadow-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 sm:p-10 lg:p-14">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8 border-b border-[#e2eaf2] pb-10 mb-10">
                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f0f7ff] text-[#2a85ff] text-[10px] font-black uppercase tracking-widest mb-4">
                    Role Overview
                  </div>
                  <h3 className="text-[#070707] text-3xl sm:text-4xl font-black tracking-tight">{job.title}</h3>
                  <p className="text-[#5a6a7a] text-lg mt-4 font-medium">
                    {job.company} · {job.department} · {job.location}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-6">
                    {job.tags && job.tags.map((tag) => (
                      <span key={tag} className={`text-[11px] font-bold px-4 py-1.5 rounded-full border ${getTagTone(tag)}`}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex flex-col gap-4 min-w-[240px]">
                  <div className="flex items-center justify-between bg-[#f8fbff] border border-[#e2eaf2] rounded-2xl p-4">
                    <span className="text-xs font-bold text-[#8a9ab0]">Match Score</span>
                    <span className="text-[#2a85ff] font-black text-xl">
                      {applicationStatus ? applicationStatus.match : job.match}%
                    </span>
                  </div>
                  
                  {onApply && (
                    <button
                      type="button"
                      onClick={() => onApply(job)}
                      disabled={isApplied}
                      className={`inline-flex items-center justify-center gap-2 w-full py-4 rounded-2xl text-base font-black transition-all shadow-xl shadow-[#2a85ff]/20 ${
                        isApplied
                          ? 'bg-[#e6f9f0] text-[#16a34a] border border-[#16a34a]/20 cursor-default shadow-none'
                          : 'bg-[#2a85ff] text-white hover:bg-[#1a75ef] hover:scale-[1.02]'
                      }`}
                    >
                      {isApplied ? 'Application Submitted' : 'Apply for this Job'}
                      {!isApplied && <ArrowRight size={18} />}
                    </button>
                  )}
                  
                  {applicationStatus && (
                    <div className={`p-4 rounded-2x border font-bold text-sm flex items-center gap-2 justify-center ${
                      applicationStatus.status.toLowerCase().includes('shortlisted') 
                        ? 'bg-[#e6f9f0] text-[#16a34a] border-[#16a34a]/20'
                        : 'bg-[#f0f5fa] text-[#5a6a7a] border-[#e2eaf2]'
                    }`}>
                      {applicationStatus.status.toLowerCase().includes('shortlisted') && <CheckCircle2 size={16} />}
                      {applicationStatus.status}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12">
                <div className="space-y-12">
                  <section>
                    <h4 className="flex items-center gap-3 text-[#070707] text-sm font-black uppercase tracking-[0.2em] mb-6">
                      <div className="w-1.5 h-6 bg-[#2a85ff] rounded-full" /> Job Description
                    </h4>
                    <div className="bg-[#f8fbff] rounded-3xl p-8 border border-[#e2eaf2]/60">
                      <p className="text-[#5a6a7a] text-base leading-relaxed whitespace-pre-line font-medium">
                        {job.description || 'No detailed job description has been provided.'}
                      </p>
                    </div>
                  </section>

                  {job.requiredSkills && job.requiredSkills.length > 0 && (
                    <section>
                      <h4 className="flex items-center gap-3 text-[#070707] text-sm font-black uppercase tracking-[0.2em] mb-6">
                        <div className="w-1.5 h-6 bg-[#2a85ff] rounded-full" /> Required Expertise
                      </h4>
                      <div className="flex flex-wrap gap-3">
                        {job.requiredSkills.map((skill) => (
                          <div key={skill} className="px-5 py-3 rounded-2xl bg-white border border-[#e2eaf2] text-[#2a85ff] text-sm font-bold shadow-sm hover:border-[#2a85ff]/30 transition-all">
                            {skill}
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {job.niceToHave && (
                    <section>
                      <h4 className="flex items-center gap-3 text-[#070707] text-sm font-black uppercase tracking-[0.2em] mb-6">
                        <div className="w-1.5 h-6 bg-[#9f6ef5] rounded-full" /> Distinguishing Skills
                      </h4>
                      <div className="bg-[#fdfaff] rounded-3xl p-8 border border-[#9f6ef5]/10">
                        <p className="text-[#5a6a7a] text-base leading-relaxed font-medium">
                          {job.niceToHave}
                        </p>
                      </div>
                    </section>
                  )}

                  {applicationStatus?.feedback && (
                    <section>
                      <h4 className="flex items-center gap-3 text-[#070707] text-sm font-black uppercase tracking-[0.2em] mb-6">
                        <div className="w-1.5 h-6 bg-[#f07830] rounded-full" /> Latest Update
                      </h4>
                      <div className="bg-[#fff9f4] rounded-3xl p-8 border border-[#f07830]/10">
                        <p className="text-[#5a6a7a] text-base leading-relaxed font-medium">
                          {(() => {
                            const s = applicationStatus.status.toLowerCase();
                            if (s.includes('shortlisted')) return 'Congratulations! Your profile has been shortlisted for this role. The hiring team will review your details end-to-end and will reach out shortly.';
                            if (s.includes('review')) return 'The hiring team is currently evaluating your application against the role requirements. We will notify you of any progress.';
                            if (s.includes('rejected') || s.includes('pass')) return 'Thank you for your interest. After careful consideration, the team has decided to proceed with other candidates whose experience more closely aligns with current needs.';
                            return 'Your application has been received successfully and is currently in the initial screening queue.';
                          })()}
                        </p>
                      </div>
                    </section>
                  )}
                </div>

                <aside className="space-y-4">
                  <h4 className="flex items-center gap-3 text-[#070707] text-sm font-black uppercase tracking-[0.2em] mb-6">
                    <div className="w-1.5 h-6 bg-[#070707] rounded-full" /> Details
                  </h4>
                  <div className="grid gap-3">
                    {[
                      { label: 'Employment Type', value: job.type },
                      { label: 'Experience Level', value: job.experienceLevel },
                      { label: 'Academic Standing', value: job.education },
                      { label: 'Tenure Requirement', value: `${job.minYearsExperience}+ Years` },
                    ].map((detail) => (
                      <div key={detail.label} className="flex items-center justify-between p-5 bg-[#f8fbff] border border-[#e2eaf2] rounded-[1.25rem]">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#8a9ab0]">{detail.label}</span>
                        <span className="text-[#070707] font-black text-sm">{detail.value}</span>
                      </div>
                    ))}
                  </div>
                </aside>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
