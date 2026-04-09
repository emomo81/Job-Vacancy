'use client'

import React, { useState, useRef } from 'react'
import { useGoogleFont } from '../utils/fonts'
import { Bell, Sparkles, User, Check, Upload, FileJson, FileSpreadsheet, FileText, X, ChevronRight } from 'lucide-react'
import { Link } from '@/lib'

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
  const font = useGoogleFont('Poppins')
  const [activeNav, setActiveNav] = useState('Candidates')

  const [rankrLoaded, setRankrLoaded] = useState(true)
  const [rankrCount] = useState(12)
  const [rankrDragging, setRankrDragging] = useState(false)
  const rankrInputRef = useRef<HTMLInputElement>(null)

  const [csvLoaded, setCsvLoaded] = useState(true)
  const [csvDragging, setCsvDragging] = useState(false)
  const csvInputRef = useRef<HTMLInputElement>(null)

  const [pdfLoaded, setPdfLoaded] = useState(true)
  const [pdfCount] = useState(22)
  const [pdfDragging, setPdfDragging] = useState(false)
  const pdfInputRef = useRef<HTMLInputElement>(null)

  const totalExternal = pdfCount
  const total = (rankrLoaded ? rankrCount : 0) + (pdfLoaded ? totalExternal : 0)

  return (
    <div style={{ fontFamily: font }} className="min-h-screen bg-[#f0f5fa]">

      {/* Navbar + Hero */}
      <div className="bg-[#070707]">

        {/* Navbar */}
        <header className="max-w-[1280px] mx-auto px-6 flex items-center justify-between h-16">
          <Link to="/RankrDashboard" className="flex items-center gap-2 select-none">
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
            <button className="relative text-white/60 hover:text-white transition-colors cursor-pointer">
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
        <div className="relative overflow-hidden" style={{ minHeight: 220 }}>
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
                <div className="flex-1 h-px mx-4 min-w-[40px]" style={{
                  background: i === 0 ? '#2a85ff' : '#d8e5f0'
                }} />
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
            {!rankrLoaded ? (
              <div
                onClick={() => rankrInputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setRankrDragging(true) }}
                onDragLeave={() => setRankrDragging(false)}
                onDrop={e => { e.preventDefault(); setRankrDragging(false); setRankrLoaded(true) }}
                className={`border-2 border-dashed rounded-xl px-6 py-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
                  rankrDragging
                    ? 'border-[#2a85ff] bg-[#e8f1ff]'
                    : 'border-[#d0dce8] bg-[#f8fbff] hover:border-[#2a85ff]/50 hover:bg-[#f0f7ff]'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-[#e8f1ff] flex items-center justify-center">
                  <FileJson size={24} color="#2a85ff" strokeWidth={1.8} />
                </div>
                <p className="text-sm text-[#5a6a7a] font-medium text-center">Drop JSON file here or click to browse</p>
                <input ref={rankrInputRef} type="file" accept=".json" className="hidden" onChange={() => setRankrLoaded(true)} />
              </div>
            ) : (
              <div className="border-2 border-dashed border-[#2a85ff]/40 rounded-xl px-5 py-4 bg-[#f4f9ff] flex flex-col gap-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-[#2a85ff] uppercase tracking-wide">Loaded Profiles</span>
                  <button onClick={() => setRankrLoaded(false)} className="text-[#b0bac6] hover:text-[#5a6a7a] cursor-pointer transition-colors">
                    <X size={14} />
                  </button>
                </div>
                {MOCK_PROFILES.map(p => (
                  <div key={p.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#2a85ff] flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">{initials(p.name)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[#070707] truncate">{p.name}</p>
                      <p className="text-xs text-[#8a9ab0] truncate">{p.role}</p>
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                      {p.skills.slice(0, 2).map(s => (
                        <span key={s} className="text-[10px] font-semibold text-[#2a85ff] bg-[#e8f1ff] px-2 py-0.5 rounded-full">{s}</span>
                      ))}
                    </div>
                  </div>
                ))}
                <button className="text-xs text-[#2a85ff] font-semibold hover:underline cursor-pointer text-left">
                  and 9 more →
                </button>
              </div>
            )}

            <p className="text-xs text-[#b0bac6]">Supports .json files · Follows Rankr Talent Schema v1</p>

            {/* Count badge */}
            <div className="mt-auto pt-2 border-t border-[#f0f5fa] flex items-center justify-between">
              {rankrLoaded ? (
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#2a85ff] bg-[#e8f1ff] px-4 py-1.5 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-[#2a85ff]" />
                  {rankrCount} profiles loaded
                </span>
              ) : (
                <span className="text-sm text-[#b0bac6]">No profiles loaded yet</span>
              )}
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

            {/* Spreadsheet Upload Zone */}
            <div className="flex flex-col gap-3">
              <p className="text-xs font-semibold text-[#5a6a7a] uppercase tracking-wide">Spreadsheet Upload</p>
              {!csvLoaded ? (
                <div
                  onClick={() => csvInputRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); setCsvDragging(true) }}
                  onDragLeave={() => setCsvDragging(false)}
                  onDrop={e => { e.preventDefault(); setCsvDragging(false); setCsvLoaded(true) }}
                  className={`border-2 border-dashed rounded-xl px-5 py-5 flex flex-col items-center gap-2 cursor-pointer transition-all ${
                    csvDragging
                      ? 'border-[#f07830] bg-[#fff3e8]'
                      : 'border-[#d0dce8] bg-[#fdf8f5] hover:border-[#f07830]/50 hover:bg-[#fff8f3]'
                  }`}
                >
                  <FileSpreadsheet size={22} color="#f07830" strokeWidth={1.8} />
                  <p className="text-sm text-[#5a6a7a] font-medium">Drop CSV or Excel file here</p>
                  <input ref={csvInputRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={() => setCsvLoaded(true)} />
                </div>
              ) : (
                <div className="border-2 border-dashed border-[#f07830]/40 rounded-xl px-4 py-3 bg-[#fff8f3] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet size={20} color="#f07830" strokeWidth={1.8} />
                    <div>
                      <p className="text-xs font-semibold text-[#070707]">applicants_batch_1.csv</p>
                      <p className="text-xs text-[#8a9ab0]">14 rows detected</p>
                    </div>
                  </div>
                  <button onClick={() => setCsvLoaded(false)} className="text-[#b0bac6] hover:text-[#5a6a7a] cursor-pointer transition-colors">
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* Resume Upload Zone */}
            <div className="flex flex-col gap-3">
              <p className="text-xs font-semibold text-[#5a6a7a] uppercase tracking-wide">Resume Upload</p>
              {!pdfLoaded ? (
                <div
                  onClick={() => pdfInputRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); setPdfDragging(true) }}
                  onDragLeave={() => setPdfDragging(false)}
                  onDrop={e => { e.preventDefault(); setPdfDragging(false); setPdfLoaded(true) }}
                  className={`border-2 border-dashed rounded-xl px-5 py-5 flex flex-col items-center gap-2 cursor-pointer transition-all ${
                    pdfDragging
                      ? 'border-[#f07830] bg-[#fff3e8]'
                      : 'border-[#d0dce8] bg-[#fdf8f5] hover:border-[#f07830]/50 hover:bg-[#fff8f3]'
                  }`}
                >
                  <FileText size={22} color="#f07830" strokeWidth={1.8} />
                  <p className="text-sm text-[#5a6a7a] font-medium">Drop PDF resumes here (multiple)</p>
                  <input ref={pdfInputRef} type="file" accept=".pdf" multiple className="hidden" onChange={() => setPdfLoaded(true)} />
                </div>
              ) : (
                <div className="border-2 border-dashed border-[#f07830]/40 rounded-xl px-4 py-3 bg-[#fff8f3] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText size={20} color="#f07830" strokeWidth={1.8} />
                    <div>
                      <p className="text-xs font-semibold text-[#070707]">8 PDF resumes uploaded</p>
                      <p className="text-xs text-[#8a9ab0]">resume_01.pdf … resume_08.pdf</p>
                    </div>
                  </div>
                  <button onClick={() => setPdfLoaded(false)} className="text-[#b0bac6] hover:text-[#5a6a7a] cursor-pointer transition-colors">
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* Count badge */}
            <div className="mt-auto pt-2 border-t border-[#f0f5fa] flex items-center justify-between">
              {(csvLoaded || pdfLoaded) ? (
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#f07830] bg-[#fff3e8] px-4 py-1.5 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-[#f07830]" />
                  {pdfCount} applicants loaded
                </span>
              ) : (
                <span className="text-sm text-[#b0bac6]">No applicants loaded yet</span>
              )}
            </div>
          </div>
        </div>

        {/* Unified counter bar */}
        <div className="bg-white rounded-2xl shadow-[0_4px_32px_rgba(0,0,0,0.07)] px-7 py-5 flex flex-wrap items-center gap-4 mb-8">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-[#8a9ab0] uppercase tracking-wide mb-1">Total Candidates Ready</p>
            <p className="text-[#070707] font-extrabold text-4xl leading-none tracking-tight">34</p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#2a85ff] bg-[#e8f1ff] px-4 py-1.5 rounded-full">
              <div className="w-2 h-2 rounded-full bg-[#2a85ff]" />
              12 Rankr
            </span>
            <span className="text-[#d0dce8] font-light text-lg">|</span>
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#f07830] bg-[#fff3e8] px-4 py-1.5 rounded-full">
              <div className="w-2 h-2 rounded-full bg-[#f07830]" />
              22 External
            </span>
          </div>
          <Link to="/RankrScreening" className="flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold text-white bg-[#2a85ff] hover:bg-[#1a75ef] shadow-[0_4px_16px_rgba(42,133,255,0.35)] hover:shadow-[0_4px_20px_rgba(42,133,255,0.5)] transition-all cursor-pointer flex items-center gap-2">
            Next: Screen Candidates
            <ChevronRight size={16} strokeWidth={2.5} />
          </Link>
        </div>

        {/* Bottom actions */}
        <div className="flex items-center justify-between">
          <Link
            to="/RankrDashboard"
            className="px-6 py-2.5 rounded-full text-sm font-semibold text-[#5a6a7a] border border-[#e2eaf2] hover:border-[#2a85ff]/40 hover:text-[#2a85ff] transition-all cursor-pointer bg-white inline-flex items-center gap-2"
          >
            ← Back
          </Link>
          <Link to="/RankrScreening" className="px-7 py-2.5 rounded-full text-sm font-semibold text-white bg-[#2a85ff] hover:bg-[#1a75ef] shadow-[0_4px_16px_rgba(42,133,255,0.35)] hover:shadow-[0_4px_20px_rgba(42,133,255,0.5)] transition-all cursor-pointer flex items-center gap-2">
            Screen All Candidates →
          </Link>
        </div>
      </main>
    </div>
  )
}
