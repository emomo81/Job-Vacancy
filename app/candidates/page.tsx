'use client'

import React, { useState, useRef } from 'react'
import { Sparkles, Check, Upload, FileJson, FileSpreadsheet, FileText, X, ChevronRight, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { animate, motion } from 'motion/react'
import Navbar from '../components/Navbar'

const STEPS = [
  { label: 'Create Job', status: 'done' },
  { label: 'Add Candidates', status: 'active' },
  { label: 'AI Screening', status: 'inactive' },
]

export default function RankrCandidates() {
  const [rankrFiles, setRankrFiles] = useState<{ name: string; size: string; status: 'uploading' | 'done' }[]>([
    { name: 'talent_pool_frontend.json', size: '156KB', status: 'done' },
  ])
  const [rankrDragging, setRankrDragging] = useState(false)
  const rankrInputRef = useRef<HTMLInputElement>(null)

  const [externalFiles, setExternalFiles] = useState<{ name: string; size: string; type: 'csv' | 'pdf'; status: 'uploading' | 'done' }[]>([
    { name: 'applicants_v1.csv', size: '1.2MB', type: 'csv', status: 'done' },
  ])
  const [externalDragging, setExternalDragging] = useState(false)
  const externalInputRef = useRef<HTMLInputElement>(null)

  const handleRankrUpload = (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
    let newFiles: File[] = []
    if ('files' in e.target && e.target.files) {
      newFiles = Array.from(e.target.files)
    } else if ('dataTransfer' in e && e.dataTransfer.files) {
      newFiles = Array.from(e.dataTransfer.files)
    }

    newFiles.forEach(file => {
      const entry = { name: file.name, size: (file.size / 1024).toFixed(1) + 'KB', status: 'uploading' as const }
      setRankrFiles(prev => [...prev, entry])
      setTimeout(() => {
        setRankrFiles(prev => prev.map(f => f.name === file.name ? { ...f, status: 'done' } : f))
      }, 1500)
    })
  }

  const handleExternalUpload = (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent, type: 'csv' | 'pdf') => {
    let newFiles: File[] = []
    if ('files' in e.target && e.target.files) {
      newFiles = Array.from(e.target.files)
    } else if ('dataTransfer' in e && e.dataTransfer.files) {
      newFiles = Array.from(e.dataTransfer.files)
    }

    newFiles.forEach(file => {
      const entry = { name: file.name, size: (file.size / 1024).toFixed(1) + 'KB', type, status: 'uploading' as const }
      setExternalFiles(prev => [...prev, entry])
      setTimeout(() => {
        setExternalFiles(prev => prev.map(f => f.name === file.name ? { ...f, status: 'done' } : f))
      }, 2000)
    })
  }

  return (
    <div className="min-h-screen bg-[#f0f5fa]">
      <Navbar type="app" activeNav="Candidates" />

      {/* Hero */}
      <div className="bg-[#070707] pt-28 sm:pt-36 lg:pt-40 pb-12 sm:pb-20 relative overflow-hidden">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 relative z-10">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-white font-extrabold text-4xl sm:text-6xl lg:text-7xl leading-[1.08] tracking-tight mb-4 text-center sm:text-left">
              Add Your<br className="hidden sm:block" />Candidates{' '}
              <span className="text-[#2a85ff]">✦</span>
            </h1>
            <p className="text-white/50 text-sm sm:text-base font-normal text-center sm:text-left">
              Import from Rankr or upload externally from your local database
            </p>
          </motion.div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#2a85ff]/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 rounded-full bg-[#2a85ff]/5 blur-3xl pointer-events-none" />
      </div>

      <main className="max-w-[1100px] mx-auto px-4 sm:px-6 py-10 lg:py-16">
        
        {/* Breadcrumb Steps (Responsive) */}
        <div className="flex items-center gap-2 sm:gap-4 mb-10 sm:mb-16 overflow-x-auto no-scrollbar pb-2">
          {STEPS.map((step, i) => (
            <React.Fragment key={step.label}>
              <div className="flex items-center gap-2.5 flex-shrink-0">
                {step.status === 'done' ? (
                  <div className="w-8 h-8 rounded-full bg-[#2a85ff] flex items-center justify-center">
                    <Check size={14} color="white" strokeWidth={3} />
                  </div>
                ) : step.status === 'active' ? (
                  <div className="w-8 h-8 rounded-full bg-[#2a85ff] flex items-center justify-center ring-4 ring-[#2a85ff]/20">
                    <div className="w-2.5 h-2.5 rounded-full bg-white" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full border-2 border-[#c8d6e5] flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-[#c8d6e5]" />
                  </div>
                )}
                <span className={`text-xs sm:text-sm font-bold whitespace-nowrap ${
                  step.status === 'inactive' ? 'text-[#b0bac6]' : 'text-[#070707]'
                }`}>
                  {step.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-px w-8 sm:w-16 ${i === 0 ? 'bg-[#2a85ff]' : 'bg-[#d8e5f0]'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        <h2 className="text-[#070707] text-2xl font-bold mb-8">Candidate Sources</h2>

        {/* Source Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-8">
          
          {/* Card 1: Rankr */}
          <div className="bg-white rounded-[2rem] shadow-[0_4px_32px_rgba(0,0,0,0.06)] p-6 sm:p-8 flex flex-col gap-6">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-[#e8f1ff] flex items-center justify-center">
                <Sparkles size={24} color="#2a85ff" />
              </div>
              <span className="text-[10px] sm:text-xs font-bold text-[#2a85ff] bg-[#e8f1ff] px-4 py-1.5 rounded-full uppercase tracking-widest">
                Rankr Pool
              </span>
            </div>
            <div>
              <h3 className="text-[#070707] font-extrabold text-xl mb-1.5">Import Talent Profiles</h3>
              <p className="text-[#8a9ab0] text-sm leading-relaxed">
                Connect your Rankr talent pool to automatically pull profiles matching this role.
              </p>
            </div>

            <div
              onClick={() => rankrInputRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setRankrDragging(true) }}
              onDragLeave={() => setRankrDragging(false)}
              onDrop={e => { e.preventDefault(); setRankrDragging(false); handleRankrUpload(e) }}
              className={`border-2 border-dashed rounded-3xl p-6 sm:p-10 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all ${
                rankrDragging ? 'border-[#2a85ff] bg-[#e8f1ff]' : 'border-[#d0dce8] bg-[#f8fbff] hover:bg-[#f0f7ff]'
              }`}
            >
              <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-lg">
                <FileJson size={32} color="#2a85ff" />
              </div>
              <div className="text-center">
                <p className="text-[#070707] font-bold text-sm">Drop JSON profiles here</p>
                <p className="text-[#8a9ab0] text-xs mt-1">or click to browse library</p>
              </div>
              <input ref={rankrInputRef} type="file" accept=".json" className="hidden" onChange={handleRankrUpload} />
            </div>

            {/* List */}
            <div className="space-y-3">
              {rankrFiles.map((file, i) => (
                <div key={i} className="bg-[#fcfdfe] hover:bg-white border border-[#f0f5fa] rounded-2xl p-4 flex items-center gap-4 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-[#2a85ff]/10 flex items-center justify-center">
                    <FileJson size={18} color="#2a85ff" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[#070707] truncate">{file.name}</p>
                    <p className="text-[10px] text-[#b0bac6] font-medium">{file.size} • JSON</p>
                  </div>
                  <Check size={18} color="#16a34a" strokeWidth={3} />
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: External */}
          <div className="bg-white rounded-[2rem] shadow-[0_4px_32px_rgba(0,0,0,0.06)] p-6 sm:p-8 flex flex-col gap-6">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-[#fff3e8] flex items-center justify-center">
                <Upload size={24} color="#f07830" />
              </div>
              <span className="text-[10px] sm:text-xs font-bold text-[#f07830] bg-[#fff3e8] px-4 py-1.5 rounded-full uppercase tracking-widest">
                External
              </span>
            </div>
            <div>
              <h3 className="text-[#070707] font-extrabold text-xl mb-1.5">Direct Uploads</h3>
              <p className="text-[#8a9ab0] text-sm leading-relaxed">
                Bulk upload resumes in PDF/CSV format from external databases or job boards.
              </p>
            </div>

            <div
              onClick={() => externalInputRef.current?.click()}
              className="border-2 border-dashed border-[#d0dce8] bg-[#fcfdfe] hover:bg-[#fff9f4] rounded-3xl p-6 sm:p-10 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-lg"><FileSpreadsheet size={28} color="#f07830" /></div>
                <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-lg"><FileText size={28} color="#e74c3c" /></div>
              </div>
              <div className="text-center">
                <p className="text-[#070707] font-bold text-sm">Upload CSV or PDF Resumes</p>
                <p className="text-[#8a9ab0] text-xs mt-1">Multi-select files supported</p>
              </div>
              <input ref={externalInputRef} type="file" multiple className="hidden" onChange={e => handleExternalUpload(e, 'pdf')} />
            </div>

             {/* List */}
             <div className="space-y-3">
              {externalFiles.map((file, i) => (
                <div key={i} className="bg-[#fcfdfe] hover:bg-white border border-[#f0f5fa] rounded-2xl p-4 flex items-center gap-4 transition-all">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${file.type === 'csv' ? 'bg-[#f07830]/10' : 'bg-[#e74c3c]/10'}`}>
                    {file.type === 'csv' ? <FileSpreadsheet size={18} color="#f07830" /> : <FileText size={18} color="#e74c3c" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[#070707] truncate">{file.name}</p>
                    <p className="text-[10px] text-[#b0bac6] font-medium">{file.size} • {file.type.toUpperCase()}</p>
                  </div>
                  <Check size={18} color="#16a34a" strokeWidth={3} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Counter Summary Bar */}
        <div className="bg-[#070707] rounded-[2rem] p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-8 shadow-2xl">
          <div className="flex-1 text-center sm:text-left">
            <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">Total Candidates Found</p>
            <div className="flex items-baseline justify-center sm:justify-start gap-2">
              <span className="text-white text-5xl font-black">{rankrFiles.length * 6 + externalFiles.length * 4}</span>
              <span className="text-[#2a85ff] text-xl font-bold italic">Profiles</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
             <Link 
              href="/screening" 
              className="w-full sm:w-auto px-10 py-5 rounded-full text-base font-black text-white bg-[#2a85ff] hover:bg-[#1a75ef] shadow-xl transition-all flex items-center justify-center gap-3 group"
            >
              Next: AI Screening
              <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between mt-12">
          <Link href="/dashboard" className="text-[#8a9ab0] hover:text-[#070707] text-sm font-bold flex items-center gap-2 transition-colors">
            <ArrowLeft size={16} />
            Edit Job Profile
          </Link>
        </div>

      </main>
    </div>
  )
}
