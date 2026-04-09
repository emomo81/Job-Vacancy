'use client'

import React, { useState, useRef } from 'react'
import { Poppins } from 'next/font/google'
import { Bell, Sparkles, User, Check, Upload, FileJson, FileSpreadsheet, FileText, X, ChevronRight } from 'lucide-react'
import Link from 'next/link'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-poppins',
})

const NAV_LINKS = ['Jobs', 'Candidates', 'Shortlists', 'Settings']

const MOCK_PROFILES = [
  { id: 1, name: 'Amara Osei', role: 'Frontend Engineer', skills: ['React', 'TypeScript', 'CSS'] },
  { id: 2, name: 'Lena Müller', role: 'UX Designer', skills: ['Figma', 'Prototyping'] },
  { id: 3, name: 'James Park', role: 'Full Stack Dev', skills: ['Node.js', 'GraphQL', 'React'] },
]

const STEPS = [
  { label: 'Create Job', status: 'done' },
  { label: 'Add Candidates', status: 'active' },
  { label: 'AI Screening', status: 'inactive' },
]

function initials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
}

export default function RankrCandidates() {
  const [activeNav, setActiveNav] = useState('Candidates')

  const [rankrFiles, setRankrFiles] = useState<{ name: string; size: string; status: 'uploading' | 'done' }[]>([
    { name: 'talent_pool_frontend.json', size: '156KB', status: 'done' },
    { name: 'q1_backup.json', size: '42KB', status: 'done' }
  ])
  const [rankrDragging, setRankrDragging] = useState(false)
  const rankrInputRef = useRef<HTMLInputElement>(null)

  const [externalFiles, setExternalFiles] = useState<{ name: string; size: string; type: 'csv' | 'pdf'; status: 'uploading' | 'done' }[]>([
    { name: 'applicants_v1.csv', size: '1.2MB', type: 'csv', status: 'done' },
    { name: 'resume_oscar.pdf', size: '250KB', type: 'pdf', status: 'done' }
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
    <div className={`${poppins.className} min-h-screen bg-[#f0f5fa]`}>

      {/* Navbar + Hero */}
      <div className="bg-[#070707]">

        {/* Navbar */}
        <header className="max-w-[1280px] mx-auto px-6 flex items-center justify-between h-16">
          <Link href="/dashboard" className="flex items-center gap-2 select-none">
            <div className="w-8 h-8 rounded-lg bg-[#2a85ff] flex items-center justify-center">
              <Sparkles size={17} color="white" strokeWidth={2.2} />
            </div>
            <span className="text-white text-xl font-bold tracking-tight">Rankr</span>
          </Link>

          <nav className="flex items-center gap-8">
            {NAV_LINKS.map(link => (
              <button
                key={link}
                onClick={() => setActiveNav(link)}
                className={`text-sm font-medium pb-1 transition-colors cursor-pointer ${
                  activeNav === link
                    ? 'text-white border-b-2 border-[#2a85ff]'
                    : 'text-white/50 hover:text-white/80 border-b-2 border-transparent'
                }`}
              >
                {link}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <button className="relative text-white/60 hover:text-white transition-colors cursor-pointer" aria-label="Notifications">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#2a85ff] rounded-full"></span>
            </button>
            <div className="flex items-center gap-2 cursor-pointer group">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2a85ff] to-[#6eb3ff] flex items-center justify-center">
                <User size={15} color="white" strokeWidth={2} />
              </div>
              <span className="text-white/80 text-sm font-medium group-hover:text-white transition-colors">Recruiter name</span>
            </div>
          </div>
        </header>

        {/* Hero Banner */}
        <div className="relative overflow-hidden min-h-[220px]">
          <div className="max-w-[1280px] mx-auto px-6 py-10 relative z-10">
            <h1 className="text-white font-extrabold text-5xl lg:text-6xl leading-[1.08] tracking-tight mb-4">
              Add Your<br />Candidates{' '}
              <span className="text-[#2a85ff]">✦</span>
            </h1>
            <p className="text-white/50 text-base font-normal">
              Import from Rankr or upload externally
            </p>
          </div>
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#2a85ff]/5 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-64 h-64 rounded-full bg-[#2a85ff]/5 blur-3xl pointer-events-none" />
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-[1100px] mx-auto px-6 py-10">

        {/* Breadcrumb Steps */}
        <div className="flex items-center gap-0 mb-10">
          {STEPS.map((step, i) => (
            <React.Fragment key={step.label}>
              <div className="flex items-center gap-2.5">
                {/* Circle */}
                {step.status === 'done' ? (
                  <div className="w-7 h-7 rounded-full bg-[#2a85ff] flex items-center justify-center flex-shrink-0">
                    <Check size={14} color="white" strokeWidth={3} />
                  </div>
                ) : step.status === 'active' ? (
                  <div className="w-7 h-7 rounded-full bg-[#2a85ff] flex items-center justify-center flex-shrink-0 ring-4 ring-[#2a85ff]/20">
                    <div className="w-2.5 h-2.5 rounded-full bg-white" />
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-full border-2 border-[#c8d6e5] flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-[#c8d6e5]" />
                  </div>
                )}
                <span className={`text-sm font-semibold whitespace-nowrap ${
                  step.status === 'inactive' ? 'text-[#b0bac6]' : 'text-[#070707]'
                }`}>
                  {step.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-px mx-4 min-w-[40px] ${i === 0 ? 'bg-[#2a85ff]' : 'bg-[#d8e5f0]'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Section Heading */}
        <h2 className="text-[#070707] text-2xl font-bold mb-6">Candidate Sources</h2>

        {/* Two tab cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

          {/* LEFT — Rankr Platform */}
          <div className="bg-white rounded-2xl shadow-[0_4px_32px_rgba(0,0,0,0.07)] p-6 flex flex-col gap-5">
            {/* Card header */}
            <div className="flex items-start justify-between">
              <div className="w-11 h-11 rounded-xl bg-[#e8f1ff] flex items-center justify-center">
                <Sparkles size={20} color="#2a85ff" strokeWidth={2.2} />
              </div>
              <span className="text-xs font-semibold text-[#2a85ff] bg-[#e8f1ff] px-3 py-1 rounded-full">
                Structured Data
              </span>
            </div>
            <div>
              <h3 className="text-[#070707] font-bold text-lg mb-1">Import Talent Profiles</h3>
              <p className="text-[#8a9ab0] text-sm leading-relaxed">
                Upload structured JSON profiles from Rankr's talent pool following the official schema
              </p>
            </div>

            {/* Upload Zone */}
            <div
              onClick={() => rankrInputRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setRankrDragging(true) }}
              onDragLeave={() => setRankrDragging(false)}
              onDrop={e => { e.preventDefault(); setRankrDragging(false); handleRankrUpload(e) }}
              className={`border-2 border-dashed rounded-xl px-6 py-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
                rankrDragging
                  ? 'border-[#2a85ff] bg-[#e8f1ff]'
                  : 'border-[#d0dce8] bg-[#f8fbff] hover:border-[#2a85ff]/50 hover:bg-[#f0f7ff]'
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-[#e8f1ff] flex items-center justify-center">
                <FileJson size={24} color="#2a85ff" strokeWidth={1.8} />
              </div>
              <p className="text-sm text-[#5a6a7a] font-medium text-center">Drop JSON file here or click to browse</p>
              <input ref={rankrInputRef} type="file" accept=".json" className="hidden" aria-label="Upload Rankr JSON file" onChange={handleRankrUpload} />
            </div>

            {/* File List */}
            {rankrFiles.length > 0 && (
              <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
                {rankrFiles.map((file, i) => (
                  <div key={i} className="flex items-center gap-3 bg-[#f8fbff] border border-[#e8f1ff] rounded-xl p-3">
                    <div className="w-8 h-8 rounded-lg bg-[#2a85ff]/10 flex items-center justify-center">
                      <FileJson size={16} color="#2a85ff" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className="text-xs font-bold text-[#070707] truncate">{file.name}</p>
                        <span className="text-[10px] text-[#8a9ab0]">{file.size}</span>
                      </div>
                      <div className="h-1 w-full bg-[#e8f1ff] rounded-full overflow-hidden">
                        <div 
                          className={`h-full bg-[#2a85ff] transition-all duration-1000 ${file.status === 'done' ? 'w-full' : 'w-[40%]'}`}
                        />
                      </div>
                    </div>
                    {file.status === 'done' ? (
                      <Check size={14} color="#16a34a" strokeWidth={3} />
                    ) : (
                      <button aria-label="Remove file" onClick={e => { e.stopPropagation(); setRankrFiles(prev => prev.filter((_, idx) => idx !== i)) }}>
                        <X size={14} color="#b0bac6" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            <p className="text-xs text-[#b0bac6]">Supports .json files · Follows Rankr Talent Schema v1</p>

            {/* Count badge */}
            <div className="mt-auto pt-2 border-t border-[#f0f5fa] flex items-center justify-between">
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#2a85ff] bg-[#e8f1ff] px-4 py-1.5 rounded-full">
                <div className="w-2 h-2 rounded-full bg-[#2a85ff]" />
                {rankrFiles.filter(f => f.status === 'done').length * 6} profiles found
              </span>
            </div>
          </div>

          {/* RIGHT — External Sources */}
          <div className="bg-white rounded-2xl shadow-[0_4px_32px_rgba(0,0,0,0.07)] p-6 flex flex-col gap-5">
            {/* Card header */}
            <div className="flex items-start justify-between">
              <div className="w-11 h-11 rounded-xl bg-[#fff3e8] flex items-center justify-center">
                <Upload size={20} color="#f07830" strokeWidth={2} />
              </div>
              <span className="text-xs font-semibold text-[#f07830] bg-[#fff3e8] px-3 py-1 rounded-full">
                External Upload
              </span>
            </div>
            <div>
              <h3 className="text-[#070707] font-bold text-lg mb-1">Upload Applicants</h3>
              <p className="text-[#8a9ab0] text-sm leading-relaxed">
                Upload a CSV/Excel spreadsheet or drag and drop PDF resumes from external job boards
              </p>
            </div>

            {/* External Upload Zone */}
            <div
              onClick={() => externalInputRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setExternalDragging(true) }}
              onDragLeave={() => setExternalDragging(false)}
              onDrop={e => { e.preventDefault(); setExternalDragging(false); handleExternalUpload(e, 'pdf') }}
              className={`border-2 border-dashed rounded-xl px-6 py-10 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all ${
                externalDragging
                  ? 'border-[#f07830] bg-[#fff3e8]'
                  : 'border-[#d0dce8] bg-[#fdf8f5] hover:border-[#f07830]/50 hover:bg-[#fff8f3]'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileSpreadsheet size={24} color="#f07830" strokeWidth={1.8} />
                <FileText size={24} color="#f07830" strokeWidth={1.8} />
              </div>
              <div className="text-center">
                <p className="text-sm text-[#5a6a7a] font-bold">Drag and drop resumes or CSV</p>
                <p className="text-xs text-[#8a9ab0] mt-1">Supports PDF, DOCX, CSV and Excel</p>
              </div>
              <input ref={externalInputRef} type="file" multiple className="hidden" aria-label="Upload external resumes or CSV" onChange={e => handleExternalUpload(e, 'pdf')} />
            </div>

            {/* External File List */}
            {externalFiles.length > 0 && (
              <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                {externalFiles.map((file, i) => (
                  <div key={i} className="flex items-center gap-3 bg-[#fffaf5] border border-[#fff3e8] rounded-xl p-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${file.type === 'csv' ? 'bg-[#f07830]/10' : 'bg-[#e74c3c]/10'}`}>
                      {file.type === 'csv' ? <FileSpreadsheet size={16} color="#f07830" /> : <FileText size={16} color="#e74c3c" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className="text-xs font-bold text-[#070707] truncate">{file.name}</p>
                        <span className="text-[10px] text-[#8a9ab0]">{file.size}</span>
                      </div>
                      <div className="h-1 w-full bg-[#fff3e8] rounded-full overflow-hidden">
                        <div 
                          className={`h-full bg-[#f07830] transition-all duration-1000 ${file.status === 'done' ? 'w-full' : 'w-[20%]'}`}
                        />
                      </div>
                    </div>
                    {file.status === 'done' ? (
                      <Check size={14} color="#16a34a" strokeWidth={3} />
                    ) : (
                      <button aria-label="Remove file" onClick={e => { e.stopPropagation(); setExternalFiles(prev => prev.filter((_, idx) => idx !== i)) }}>
                        <X size={14} color="#b0bac6" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Count badge */}
            <div className="mt-auto pt-2 border-t border-[#f0f5fa] flex items-center justify-between">
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#f07830] bg-[#fff3e8] px-4 py-1.5 rounded-full">
                <div className="w-2 h-2 rounded-full bg-[#f07830]" />
                {externalFiles.filter(f => f.status === 'done').length * 4} applicants loaded
              </span>
            </div>
          </div>
        </div>

        {/* Unified counter bar */}
        <div className="bg-white rounded-2xl shadow-[0_4px_32px_rgba(0,0,0,0.07)] px-7 py-5 flex flex-wrap items-center gap-4 mb-8">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-[#8a9ab0] uppercase tracking-wide mb-1">Total Candidates Ready</p>
            <p className="text-[#070707] font-extrabold text-4xl leading-none tracking-tight">
              {rankrFiles.filter(f => f.status === 'done').length * 6 + externalFiles.filter(f => f.status === 'done').length * 4}
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#2a85ff] bg-[#e8f1ff] px-4 py-1.5 rounded-full">
              <div className="w-2 h-2 rounded-full bg-[#2a85ff]" />
              {rankrFiles.filter(f => f.status === 'done').length * 6} Rankr
            </span>
            <span className="text-[#d0dce8] font-light text-lg">|</span>
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#f07830] bg-[#fff3e8] px-4 py-1.5 rounded-full">
              <div className="w-2 h-2 rounded-full bg-[#f07830]" />
              {externalFiles.filter(f => f.status === 'done').length * 4} External
            </span>
          </div>
          <Link href="/screening" className="flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold text-white bg-[#2a85ff] hover:bg-[#1a75ef] shadow-[0_4px_16px_rgba(42,133,255,0.35)] hover:shadow-[0_4px_20px_rgba(42,133,255,0.5)] transition-all cursor-pointer flex items-center gap-2">
            Next: Screen Candidates
            <ChevronRight size={16} strokeWidth={2.5} />
          </Link>
        </div>

        {/* Bottom actions */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="px-6 py-2.5 rounded-full text-sm font-semibold text-[#5a6a7a] border border-[#e2eaf2] hover:border-[#2a85ff]/40 hover:text-[#2a85ff] transition-all cursor-pointer bg-white inline-flex items-center gap-2"
          >
            ← Back
          </Link>
          <Link href="/screening" className="px-7 py-2.5 rounded-full text-sm font-semibold text-white bg-[#2a85ff] hover:bg-[#1a75ef] shadow-[0_4px_16px_rgba(42,133,255,0.35)] hover:shadow-[0_4px_20px_rgba(42,133,255,0.5)] transition-all cursor-pointer flex items-center gap-2">
            Screen All Candidates →
          </Link>
        </div>
      </main>
    </div>
  )
}
