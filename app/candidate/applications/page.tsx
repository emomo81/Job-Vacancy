'use client'

import React from 'react'
import { 
  FileText, CheckCircle2, Clock, ChevronRight, 
  ExternalLink, MessageCircle, AlertCircle
} from 'lucide-react'
import { motion } from 'motion/react'

const APPLICATIONS = [
  {
    id: 1,
    role: 'Senior Backend Engineer',
    company: 'TechCorp',
    date: 'April 12, 2024',
    status: 'In Review',
    statusColor: 'text-[#2a85ff] bg-[#2a85ff]/10 border-[#2a85ff]/20',
    match: 94,
    feedback: 'Your profile is currently being reviewed by the technical team.'
  },
  {
    id: 2,
    role: 'Full Stack Developer',
    company: 'InnovateAI',
    date: 'April 10, 2024',
    status: 'Shortlisted',
    statusColor: 'text-[#16a34a] bg-[#16a34a]/10 border-[#16a34a]/20',
    match: 88,
    feedback: 'Congratulations! You have been moved to the next round.'
  },
  {
    id: 3,
    role: 'Backend Systems Architect',
    company: 'ScaleX',
    date: 'April 05, 2024',
    status: 'Applied',
    statusColor: 'text-[#8a9ab0] bg-[#f0f5fa] border-[#e2eaf2]',
    match: 82,
    feedback: 'Application received and pending initial screening.'
  }
]

export default function MyApplicationsPage() {
  const handleViewDetails = (role: string) => {
    alert(`Viewing details for ${role}. This feature will be available in the next update!`)
  }

  const handleMessage = (company: string) => {
    alert(`Starting conversation with ${company}...`)
  }

  return (
    <div className="flex flex-col gap-8">
      
      {/* ── STATS SUMMARY ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Applications', value: '12', color: '#2a85ff' },
          { label: 'Active Reviews', value: '4', color: '#f07830' },
          { label: 'Shortlisted', value: '2', color: '#16a34a' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-[1.5rem] p-6 border border-[#e2eaf2]/60 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
            <p className="text-[#8a9ab0] text-xs font-bold uppercase tracking-wider mb-2">{stat.label}</p>
            <p className="text-[#070707] text-3xl font-black">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* ── APPLICATIONS LIST ── */}
      <div className="space-y-6">
        <h2 className="text-[#070707] text-xl font-bold px-1">Recent Applications</h2>
        
        <div className="flex flex-col gap-4">
          {APPLICATIONS.map((app, i) => (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl sm:rounded-[2rem] border border-[#e2eaf2]/60 p-5 sm:p-8 hover:shadow-[0_12px_40px_rgba(0,0,0,0.04)] transition-all group"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                
                {/* Left: Role & Company */}
                <div className="flex items-start gap-5 min-w-0">
                  <div className="w-14 h-14 rounded-2xl bg-[#f8fbff] border border-[#e2eaf2] flex items-center justify-center text-[#2a85ff] flex-shrink-0">
                    <FileText size={24} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-[#070707] text-lg sm:text-xl font-extrabold truncate group-hover:text-[#2a85ff] transition-colors">
                      {app.role}
                    </h3>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-[#5a6a7a] font-bold text-sm">{app.company}</span>
                      <span className="text-[#e2eaf2]">·</span>
                      <span className="text-[#8a9ab0] text-xs font-medium">Applied on {app.date}</span>
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
                    onClick={() => handleViewDetails(app.role)}
                    aria-label="View application details" 
                    className="flex-1 lg:flex-none px-6 py-3 rounded-xl bg-[#f0f5fa] hover:bg-[#e2eaf2] text-[#070707] text-sm font-bold transition-all cursor-pointer"
                  >
                    View Details
                  </button>
                  <button 
                    onClick={() => handleMessage(app.company)}
                    aria-label="Message company" 
                    className="p-3 rounded-xl bg-white border border-[#e2eaf2] text-[#8a9ab0] hover:text-[#2a85ff] hover:border-[#2a85ff]/30 transition-all cursor-pointer"
                  >
                    <MessageCircle size={20} />
                  </button>
                </div>
              </div>

              {/* Status Update / Feedback Alert */}
              <div className="mt-5 sm:mt-8 p-4 sm:p-5 rounded-2xl bg-[#f8fbff] border border-[#2a85ff]/5 flex items-start gap-3 sm:gap-4">
                <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-[#2a85ff] flex-shrink-0">
                  <AlertCircle size={16} />
                </div>
                <div>
                  <p className="text-[#070707] text-sm font-bold">Latest Update</p>
                  <p className="text-[#5a6a7a] text-sm mt-1">{app.feedback}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

    </div>
  )
}
