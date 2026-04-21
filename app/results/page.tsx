'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { Heart, Download, X, CheckCircle, Filter, TriangleAlert, Sparkles, ArrowLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '../components/Navbar'
import { Candidate, Recommendation } from '../../utils/candidate-types'
import { apiFetch, getCurrentJobId, setCurrentJobId } from '../../utils/api-client'
import { useRouter } from 'next/navigation'
import { useToast } from '../components/ui/Toast'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const getExpLevel = (years: number): string => {
  if (years >= 10) return 'Expert';
  if (years >= 5) return 'Intermediate';
  return 'Entry Level';
};

const getInitials = (name: string): string => {
  if (!name) return '?'
  const parts = name.split(' ');
  return parts.slice(0, 2).map(p => p[0]).join('').toUpperCase();
};

const recColor: Record<'hire' | 'consider' | 'pass', string> = {
  'hire': 'bg-[#e6f9f0] text-[#16a34a] border border-[#16a34a]/20',
  'consider': 'bg-[#fff9e6] text-[#ca8a04] border border-[#ca8a04]/20',
  'pass': 'bg-[#fef2f2] text-[#dc2626] border border-[#dc2626]/20',
}

type CandidateView = Candidate & { initials: string; rank: number; expLevel: string; shortlisted?: boolean }

export default function RankrResults() {
  const router = useRouter()
  const [jobId, setJobId] = useState('')
  const [results, setResults] = useState<CandidateView[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [liked, setLiked] = useState<Set<string>>(new Set())
  const { showToast } = useToast()
  const [activeTab, setActiveTab] = useState<'All' | 'Rankr' | 'External'>('All')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const [scoreMin, setScoreMin] = useState(60)
  const [scoreMax] = useState(100)
  const [recFilters, setRecFilters] = useState<Set<'hire' | 'consider' | 'pass'>>(new Set(['hire', 'consider', 'pass']))
  const [sourceFilters, setSourceFilters] = useState<Set<string>>(new Set(['rankr', 'external']))
  const [expFilters, setExpFilters] = useState<Set<string>>(new Set(['Entry Level', 'Intermediate', 'Expert']))

  const [shortlisted, setShortlisted] = useState<Set<string>>(new Set())
  const [showFilters, setShowFilters] = useState(false)
  const [rightPanelTab, setRightPanelTab] = useState<'ai' | 'info'>('ai')

  const loadResults = useCallback(async (activeJobId: string) => {
    try {
      setLoading(true)
      setError('')

      const response = await apiFetch(
        `/jobs/${activeJobId}/results?minScore=0&maxScore=100&page=1&limit=100`
      )

      const rows = Array.isArray(response.data) ? (response.data as Array<Partial<CandidateView>>) : []

      const mapped: CandidateView[] = rows.map((c, idx) => ({
        id: String(c.id ?? idx + 1),
        name: c.name ?? 'Unknown Candidate',
        role: c.role ?? 'Candidate',
        score: Number(c.score ?? 0),
        recommendation: (c.recommendation ?? 'consider') as Recommendation,
        source: (c.source ?? 'external') as Candidate['source'],
        skills: Array.isArray(c.skills) ? c.skills : [],
        location: c.location ?? 'N/A',
        appliedDate: c.appliedDate ?? '',
        experienceYears: Number(c.experienceYears ?? 0),
        education: c.education ?? 'N/A',
        summary: c.summary ?? '',
        reasoning: c.reasoning,
        strengths: c.strengths,
        gaps: c.gaps,
        matched: c.matched,
        avatarUrl: c.avatarUrl,
        shortlisted: Boolean(c.shortlisted),
        initials: getInitials(c.name ?? 'NA'),
        rank: Number(c.rank ?? idx + 1),
        expLevel: getExpLevel(Number(c.experienceYears ?? 0)),
      }))

      setResults(mapped)
      setShortlisted(new Set(mapped.filter((c) => c.shortlisted).map((c) => String(c.id))))
      if (mapped.length > 0 && !selectedId) setSelectedId(String(mapped[0].id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load results')
    } finally {
      setLoading(false)
    }
  }, [selectedId])

  useEffect(() => {
    const queryJobId = typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('jobId') || ''
      : ''
    const localJobId = getCurrentJobId()
    const activeJobId = queryJobId || localJobId
    if (!activeJobId) return

    setJobId(activeJobId)
    setCurrentJobId(activeJobId)
    void loadResults(activeJobId)
  }, [loadResults])

  const toggleShortlist = async (candidateId: string) => {
    try {
      if (!jobId) return
      const isShortlisted = shortlisted.has(candidateId)

      if (isShortlisted) {
        await apiFetch(`/jobs/${jobId}/shortlist/${candidateId}`, { method: 'DELETE' })
        showToast('Removed from shortlist', 'info')
      } else {
        const res = await apiFetch(`/jobs/${jobId}/shortlist`, {
          method: 'POST',
          body: { candidateProfileId: candidateId },
        })

        // Show per-channel notification feedback
        const n = res?.data?.notification as {
          email?: { sent: boolean; error?: string } | null
          sms?: { sent: boolean; sid?: string; error?: string } | null
          whatsapp?: { sent: boolean; sid?: string; error?: string } | null
        } | null | undefined

        if (n) {
          const sent: string[] = []
          const failed: string[] = []

          if (n.email?.sent)   sent.push('📧 Email')
          else if (n.email)    failed.push(`📧 Email (${n.email.error ?? 'failed'})`)

          if (n.sms?.sent)     sent.push('📱 SMS')
          else if (n.sms)      failed.push(`📱 SMS (${n.sms.error ?? 'failed'})`)

          if (n.whatsapp?.sent) sent.push('💬 WhatsApp')
          else if (n.whatsapp)  failed.push(`💬 WhatsApp (${n.whatsapp.error ?? 'failed'})`)

          if (sent.length > 0) {
            showToast(`Shortlisted ✓ — Notified via ${sent.join(', ')}`, 'success')
          } else if (failed.length > 0) {
            showToast(`Shortlisted ✓ — Notification failed: ${failed.join('; ')}`, 'error')
          } else {
            showToast('Shortlisted ✓ — No contact details on file; notification skipped', 'info')
          }
        } else {
          showToast('Candidate shortlisted successfully!', 'success')
        }
      }

      setShortlisted((prev) => {
        const next = new Set(prev)
        if (next.has(candidateId)) next.delete(candidateId)
        else next.add(candidateId)
        return next
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update shortlist')
    }
  }

  const toggleLike = (id: string) => {
    setLiked((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleExport = () => {
    try {
      if (filtered.length === 0) {
        showToast('No candidates to export.', 'info')
        return
      }

      showToast('Generating high-fidelity PDF report...', 'info')

      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()
      
      // -- Header --
      doc.setFontSize(22)
      doc.setTextColor(42, 133, 255) // Brand Blue
      doc.text('Rankr Analysis Report', 14, 22)
      
      doc.setFontSize(10)
      doc.setTextColor(138, 154, 176) // slate-400
      doc.text(`Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 14, 30)
      doc.text(`Job ID: ${jobId}`, 14, 35)

      // -- Summary Table --
      autoTable(doc, {
        startY: 45,
        head: [['Rank', 'Name', 'Role', 'Match Score', 'Recommendation', 'Exp']],
        body: filtered.map(c => [
          `#${c.rank}`,
          c.name,
          c.role,
          `${c.score}%`,
          c.recommendation.toUpperCase(),
          c.expLevel
        ]),
        headStyles: { fillColor: [7, 7, 7] }, // Dark theme head
        alternateRowStyles: { fillColor: [248, 251, 255] },
        styles: { fontSize: 9, font: 'helvetica' }
      })

      // -- Detailed Candidate Sections --
      let finalY = (doc as any).lastAutoTable.finalY || 100
      
      filtered.forEach((c, index) => {
        // New page for each candidate if needed (checking remaining space)
        if (finalY > 220) {
          doc.addPage()
          finalY = 20
        } else {
          finalY += 15
        }

        doc.setFontSize(14)
        doc.setTextColor(7, 7, 7)
        doc.text(`${index + 1}. ${c.name} - ${c.role}`, 14, finalY)
        finalY += 8

        doc.setFontSize(10)
        doc.setTextColor(42, 133, 255)
        doc.text(`AI Match Score: ${c.score}% | Recommendation: ${c.recommendation.toUpperCase()}`, 14, finalY)
        finalY += 10

        // AI Reasoning
        doc.setFontSize(9)
        doc.setTextColor(90, 106, 122) // slate-600
        const reasoningLines = doc.splitTextToSize(`AI Reasoning: "${c.reasoning}"`, pageWidth - 28)
        doc.text(reasoningLines, 14, finalY)
        finalY += reasoningLines.length * 5 + 5

        // Strengths
        if (c.strengths && c.strengths.length > 0) {
          doc.setTextColor(22, 163, 74) // success green
          doc.text('Key Strengths:', 14, finalY)
          finalY += 5
          doc.setTextColor(90, 106, 122)
          c.strengths.forEach(s => {
            doc.text(`• ${s}`, 18, finalY)
            finalY += 5
          })
          finalY += 2
        }

        // Gaps
        if (c.gaps && c.gaps.length > 0) {
          doc.setTextColor(202, 138, 4) // consider gold
          doc.text('Gaps & Potential Risks:', 14, finalY)
          finalY += 5
          doc.setTextColor(90, 106, 122)
          c.gaps.forEach(g => {
            doc.text(`• ${g}`, 18, finalY)
            finalY += 5
          })
          finalY += 5
        }

        doc.setDrawColor(226, 234, 242)
        doc.line(14, finalY, pageWidth - 14, finalY)
      })

      doc.save(`Rankr_Selection_Report_${jobId}.pdf`)
      showToast('PDF Analysis Report generated successfully!', 'success')
    } catch (err) {
      console.error(err)
      showToast('Failed to generate PDF report.', 'error')
    }
  }

  const toggleFilter = <T,>(set: Set<T>, val: T, setter: React.Dispatch<React.SetStateAction<Set<T>>>) => {
    const next = new Set(set)
    if (next.has(val)) next.delete(val)
    else next.add(val)
    setter(next)
  }

  const filtered = results.filter(c => {
    const tabMatch = activeTab === 'All' || (c.source as string).toLowerCase() === activeTab.toLowerCase()
    const scoreMatch = c.score >= scoreMin && c.score <= scoreMax
    const recMatch = recFilters.has(c.recommendation.toLowerCase() as 'hire' | 'consider' | 'pass')
    const srcMatch = sourceFilters.has((c.source as string).toLowerCase())
    const expMatch = expFilters.has(c.expLevel)
    return tabMatch && scoreMatch && recMatch && srcMatch && expMatch
  })

  // Pre-calculate counts explicitly
  const hCount = results.filter(c => c.recommendation === 'hire').length;
  const cCount = results.filter(c => c.recommendation === 'consider').length;
  const pCount = results.filter(c => c.recommendation === 'pass').length;

  const rankrCount = results.filter(c => c.source === 'rankr').length;
  const extCount = results.filter(c => c.source === 'external').length;

  const enCount = results.filter(c => c.expLevel === 'Entry Level').length;
  const inCount = results.filter(c => c.expLevel === 'Intermediate').length;
  const exCount = results.filter(c => c.expLevel === 'Expert').length;

  const selected = selectedId ? results.find(c => String(c.id) === selectedId) : null

  if (!loading && results.length === 0 && !error) {
    return (
      <div className="min-h-screen bg-[#f3f7fb]">
        <Navbar type="app" activeNav="Shortlists" />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-24 flex flex-col items-center text-center">
          <div className="mb-6 w-24 h-24 flex items-center justify-center rounded-3xl bg-white shadow-[0_4px_24px_rgba(42,133,255,0.15)] relative">
            <Sparkles size={36} className="text-[#2a85ff]" />
          </div>
          <h2 className="text-3xl font-black text-slate-800">Nothing was analyzed yet</h2>
          <p className="mt-4 text-slate-500 max-w-sm mx-auto leading-relaxed">
            There are no analysis records for this job. Please go to Candidates and click &quot;Analyze with AI&quot;.
          </p>
          <button
            onClick={() => router.push('/candidates')}
            className="mt-8 px-8 py-3.5 rounded-full bg-[#101010] hover:bg-black text-white font-bold shadow-xl transition-all"
          >
            ← Back to Screening
          </button>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f3f7fb]">
      <Navbar type="app" activeNav="Shortlists" />

      {/* Hero */}
      <div className="bg-[#070707] pt-28 pb-14">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-8 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full border border-[#16a34a] bg-[#16a34a]/10 flex items-center justify-center">
              <CheckCircle size={20} className="text-[#16a34a]" />
            </div>
            <div>
              <h1 className="text-white font-black text-3xl mb-1 mt-1">Screening Complete <span className="text-[#2a85ff] ml-2">☒</span></h1>
              <p className="text-white/60 text-sm font-medium">Top {filtered.length} candidates shortlisted from {results.length} applicants</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-white/80 text-sm font-bold flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-white/40" /> {results.length} Screened</div>
            <div className="px-5 py-2.5 rounded-full bg-[#2a85ff]/20 border border-[#2a85ff]/30 text-[#6eb3ff] text-sm font-bold flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#2a85ff]" /> {shortlisted.size} Shortlisted</div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-10">

        {/* Top bar controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h2 className="text-slate-900 text-2xl font-black tracking-tight mb-1">Shortlisted Candidates</h2>
            <p className="text-slate-400 text-sm font-medium">Ranked by AI match score</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowFilters(true)} className="lg:hidden flex items-center gap-2 px-5 py-2.5 rounded-full bg-white font-bold text-slate-600 shadow-sm">
              <Filter size={16} /> Filters
            </button>
            <button 
              onClick={handleExport}
              className="hidden sm:flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#2a85ff] shadow-lg shadow-[#2a85ff]/30 hover:bg-blue-600 font-bold text-white transition-all transform active:scale-95"
            >
              <Download size={16} /> Export Analysis Report (PDF)
            </button>
            <div className="hidden sm:flex items-center bg-white rounded-full p-1 shadow-sm border border-slate-200/50">
              <button
                onClick={() => setActiveTab('All')}
                className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${activeTab === 'All' ? 'bg-[#2a85ff] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                All ({results.length})
              </button>
              <button
                onClick={() => setActiveTab('Rankr')}
                className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${activeTab === 'Rankr' ? 'bg-[#2a85ff] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Rankr ({rankrCount})
              </button>
              <button
                onClick={() => setActiveTab('External')}
                className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${activeTab === 'External' ? 'bg-[#2a85ff] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                External ({extCount})
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-8 items-start relative">

          {/* Desktop Left Sidebar Filters */}
          <aside className="hidden lg:block w-56 shrink-0">
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 sticky top-24 space-y-8">

              <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-900 mb-5">Match Score (Min)</p>
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center bg-slate-50 rounded-full px-4 py-2 border border-slate-100">
                    <span className="text-xs font-bold text-[#2a85ff]">{scoreMin}%</span>
                    <span className="text-xs font-bold text-slate-300">100%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={scoreMin}
                    onChange={(e) => setScoreMin(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-[#2a85ff]"
                  />
                </div>
              </div>

              <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-900 mb-5">Recommendation</p>
                <div className="space-y-4">
                  {(['hire', 'consider', 'pass'] as const).map((r) => (
                    <label
                      key={r}
                      className="flex items-center justify-between cursor-pointer group"
                      onClick={() => toggleFilter(recFilters, r, setRecFilters)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 flex items-center justify-center">
                          {recFilters.has(r) ? <CheckCircle size={14} className="text-[#2a85ff]" strokeWidth={3} /> : <div className="w-2 h-2 rounded-full bg-slate-200" />}
                        </div>
                        <span className={`text-xs font-bold transition-colors ${recFilters.has(r) ? 'text-slate-900' : 'text-slate-400'}`}>
                          {r.charAt(0).toUpperCase() + r.slice(1)}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 font-bold">({r === 'hire' ? hCount : r === 'consider' ? cCount : pCount})</span>
                    </label>
                  ))}
                </div>
              </div>



              <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-900 mb-5">Experience Level</p>
                <div className="space-y-4">
                  {(['Entry Level', 'Intermediate', 'Expert']).map(e => (
                    <label
                      key={e}
                      className="flex items-center justify-between cursor-pointer group"
                      onClick={() => toggleFilter(expFilters, e, setExpFilters)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 flex items-center justify-center">
                          {expFilters.has(e) ? <CheckCircle size={14} className="text-[#2a85ff]" strokeWidth={3} /> : <div className="w-2 h-2 rounded-full bg-slate-200" />}
                        </div>
                        <span className={`text-xs font-bold transition-colors ${expFilters.has(e) ? 'text-slate-900' : 'text-slate-400'}`}>{e}</span>
                      </div>
                      <span className="text-xs text-slate-400 font-bold"> - {e === 'Entry Level' ? enCount : e === 'Intermediate' ? inCount : exCount}</span>
                    </label>
                  ))}
                </div>
              </div>

            </div>
          </aside>

          {/* Grid Center Area */}
          <div className="flex-1 min-w-0">
            {loading && <p className="text-sm font-bold text-slate-400">Loading results...</p>}
            <div className={`grid gap-6 items-start ${selectedId ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'}`}>
              {filtered.slice(0, 15).map((c) => (
                <motion.div
                  key={String(c.id)}
                  onClick={() => setSelectedId(String(c.id))}
                  className={`bg-white rounded-[2rem] p-6 shadow-sm hover:shadow-xl transition-all cursor-pointer border-[2.5px] ${selectedId === String(c.id) ? 'border-[#2a85ff]' : 'border-transparent'}`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[#2a85ff] font-black text-xl">#{c.rank}</span>
                    <button aria-label="Toggle favorite" onClick={e => { e.stopPropagation(); toggleLike(String(c.id)) }}>
                      <Heart size={18} fill={liked.has(String(c.id)) ? '#2a85ff' : 'none'} color={liked.has(String(c.id)) ? '#2a85ff' : '#e2eaf2'} />
                    </button>
                  </div>
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-12 h-12 shrink-0 rounded-full bg-[#2a85ff] flex items-center justify-center text-white font-black">{c.initials}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flexItems-center gap-2 flex-wrap">
                        <h3 className="text-slate-900 font-black text-base truncate">{c.name}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest ${c.source === 'rankr' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>{c.source}</span>
                      </div>
                      <p className="text-slate-500 text-[11px] font-bold mt-1 truncate">{c.role}</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-baseline gap-1.5 mb-2.5">
                      <span className="text-4xl font-black text-[#2a85ff] tracking-tight">{c.score}</span>
                      <span className="text-sm font-bold text-slate-300">/ 100</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden flex">
                      <div className={`h-full bg-[#2a85ff] rounded-full`} style={{ width: `${c.score}%` }} />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {c.skills.slice(0, 3).map(s => (
                      <span key={s} className="px-3 py-1 bg-blue-50 text-[#2a85ff] text-[10px] font-extrabold rounded-full whitespace-nowrap">{s}</span>
                    ))}
                  </div>

                  <p className="text-[11px] text-slate-400 font-medium leading-relaxed line-clamp-2 mb-6 italic">
                    "{c.reasoning}"
                  </p>

                  <div className="flex items-center justify-between pt-5 border-t border-slate-100">
                    <span className={`px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-2 ${recColor[c.recommendation]}`}>
                      <div className="w-1.5 h-1.5 rounded-full bg-current" /> {c.recommendation}
                    </span>
                    <span className="text-[#2a85ff] text-[11px] font-extrabold">View Details ↗</span>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="flex justify-between items-center mt-8 pt-8 border-t border-slate-200">
              <button
                onClick={() => router.push('/candidates')}
                className="px-6 py-3 rounded-full bg-white border border-slate-200 text-slate-700 font-bold text-sm shadow-sm hover:bg-slate-50 transition-colors"
                title="Return"
              >
                <ArrowLeft size={16} /> Back to Screening
              </button>
              <button
                onClick={handleExport}
                className="px-6 py-3 rounded-full bg-[#2a85ff] hover:bg-blue-600 text-white font-bold text-sm shadow-lg shadow-[#2a85ff]/30 transition-colors flex items-center gap-2"
              >
                <Download size={16} /> Export PDF Analysis
              </button>
            </div>
          </div>

          {/* Desktop Right Sidebar */}
          <AnimatePresence>
            {selected && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="hidden lg:block w-[340px] shrink-0"
              >
                <div className="bg-white rounded-[2rem] p-6 shadow-xl border border-slate-100 sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto">

                  <div className="flex items-start justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#2a85ff] flex items-center justify-center text-white text-base font-black">{selected.initials}</div>
                      <div>
                        <h4 className="text-lg font-black text-slate-900 leading-tight">{selected.name}</h4>
                        <p className="text-slate-400 text-xs font-bold mt-1">{selected.role}</p>
                        <span className={`inline-block mt-2 px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-widest ${selected.source === 'rankr' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>{selected.source}</span>
                      </div>
                    </div>
                    <button aria-label="Close" onClick={() => setSelectedId(null)} className="p-1 hover:bg-slate-100 rounded-full transition-colors text-slate-300">
                      <X size={18} />
                    </button>
                  </div>

                  <div className="flex items-center gap-6 mb-8 pt-4 border-t border-slate-100">
                    <div className="text-4xl font-black text-[#2a85ff]">{selected.score}</div>
                    <div className="flex-1">
                      <p className="text-[10px] uppercase font-bold text-slate-300 tracking-widest mb-1">Match Score</p>
                      <div className="h-1.5 bg-slate-100 rounded-full w-full">
                        <div className="h-full bg-[#2a85ff] rounded-full" style={{ width: `${selected.score}%` }} />
                      </div>
                    </div>
                    <div className={`px-4 py-1.5 rounded-full text-xs font-bold ${recColor[selected.recommendation]}`}>
                      {selected.recommendation}
                    </div>
                  </div>

                  <div className="flex bg-slate-100 p-1 rounded-full mb-8">
                    <button onClick={() => setRightPanelTab('ai')} className={`flex-1 py-1.5 text-xs font-bold rounded-full transition-all ${rightPanelTab === 'ai' ? 'bg-white shadow text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}>AI Reasoning</button>
                    <button onClick={() => setRightPanelTab('info')} className={`flex-1 py-1.5 text-xs font-bold rounded-full transition-all ${rightPanelTab === 'info' ? 'bg-white shadow text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}>Candidate Info</button>
                  </div>

                  {rightPanelTab === 'ai' && (
                    <div className="space-y-8">
                      <div>
                        <h4 className="flex items-center gap-2 font-black text-sm text-slate-900 mb-4"><Sparkles size={16} className="text-[#16a34a]" /> Strengths</h4>
                        <div className="space-y-4">
                          {(selected.strengths ?? []).map((s, i) => (
                            <div key={i} className="flex gap-3 text-xs text-slate-600 font-medium leading-relaxed">
                              <CheckCircle size={14} className="mt-0.5 shrink-0 text-[#16a34a]" />
                              <span>{s}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="flex items-center gap-2 font-black text-sm text-slate-900 mb-4"><TriangleAlert size={16} className="text-[#ca8a04]" /> Gaps & Risks</h4>
                        <div className="space-y-4">
                          {(selected.gaps ?? []).map((s, i) => (
                            <div key={i} className="flex gap-3 text-xs text-slate-600 font-medium leading-relaxed">
                              <div className="mt-1.5 w-1.5 h-1.5 shrink-0 rounded-full bg-[#ca8a04]" />
                              <span>{s}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-black text-sm text-slate-900 mb-4">Final Recommendation</h4>
                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center gap-4">
                          <span className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 shrink-0 ${recColor[selected.recommendation]}`}>
                            <div className="w-1.5 h-1.5 rounded-full bg-current" /> {selected.recommendation}
                          </span>
                          <p className="text-xs text-slate-500 font-medium leading-relaxed italic">&ldquo;{(selected.reasoning || '').substring(0, 60)}{(selected.reasoning || '').length > 60 ? '...' : ''}&rdquo;</p>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-black text-sm text-slate-900 mb-4">Skills Matched</h4>
                        <div className="flex flex-wrap gap-2">
                          {(selected.matched ?? []).map(s => (
                            <span key={s} className="px-3 py-1.5 bg-blue-50 text-[#2a85ff] text-[10px] font-extrabold rounded-full">{s}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {rightPanelTab === 'info' && (
                    <div className="text-sm text-slate-600 font-medium space-y-5 px-1 pb-4">
                      <p><strong className="text-slate-900 opacity-60">Experience Level:</strong><br />{selected.expLevel} ({selected.experienceYears}y)</p>
                      <p><strong className="text-slate-900 opacity-60">Education:</strong><br />{selected.education}</p>
                      <p><strong className="text-slate-900 opacity-60">Location:</strong><br />{selected.location}</p>
                      <p><strong className="text-slate-900 opacity-60">Summary background:</strong><br />{selected.summary || 'Summary intentionally removed for blind screening review.'}</p>
                    </div>
                  )}

                  <div className="mt-10 flex flex-col gap-3">
                    <button
                      onClick={() => { void toggleShortlist(String(selected.id)) }}
                      className={`w-full py-4 rounded-[1.2rem] flex items-center justify-center gap-2 font-bold text-sm transition-all ${shortlisted.size > 0 && shortlisted.has(String(selected.id))
                          ? 'bg-[#16a34a] text-white shadow-lg shadow-green-100 scale-[1.02]'
                          : 'bg-white border-2 border-[#e6f9f0] text-[#16a34a] hover:bg-[#16a34a] hover:text-white hover:border-[#16a34a]'
                        }`}
                    >
                      {shortlisted.has(String(selected.id)) ? <><CheckCircle size={18} /> Shortlisted</> : 'Shortlist Candidate'}
                    </button>
                    {shortlisted.has(String(selected.id)) && (
                      <button 
                        onClick={() => toggleShortlist(String(selected.id))} 
                        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-red-50 text-[#dc2626] font-bold text-xs hover:bg-red-100 transition-colors mt-1"
                      >
                        <X size={14} /> Remove Candidate from Shortlist
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mobile Detail Panel (Overlay) */}
          <AnimatePresence>
            {selected && (
              <motion.div
                initial={{ opacity: 0, y: '100%' }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: '100%' }}
                className="lg:hidden fixed inset-0 z-[100] flex flex-col pointer-events-none"
              >
                <div
                  className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm pointer-events-auto"
                  onClick={() => setSelectedId(null)}
                />
                <div className="mt-auto bg-white rounded-t-[2.5rem] p-6 sm:p-8 pointer-events-auto shadow-[0_-20px_50px_rgba(0,0,0,0.15)] max-h-[90vh] overflow-y-auto">

                  <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6" />

                  <div className="flex items-start justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-[#2a85ff] flex items-center justify-center text-white text-xl font-black">{selected.initials}</div>
                      <div>
                        <h4 className="text-xl font-black text-slate-900 leading-tight">{selected.name}</h4>
                        <p className="text-slate-500 text-xs font-bold mt-1">{selected.role}</p>
                        <span className={`inline-block mt-2 px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-widest ${selected.source === 'rankr' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>{selected.source}</span>
                      </div>
                    </div>
                    <button aria-label="Close details" onClick={() => setSelectedId(null)} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                      <X size={20} />
                    </button>
                  </div>

                  <div className="flex items-center gap-6 mb-8 pt-6 border-t border-slate-100">
                    <div className="text-5xl font-black text-[#2a85ff]">{selected.score}</div>
                    <div className="flex-1">
                      <p className="text-[11px] uppercase font-bold text-slate-300 tracking-widest mb-2">Match Score</p>
                      <div className="h-2 bg-slate-100 rounded-full w-full">
                        <div className="h-full bg-[#2a85ff] rounded-full" style={{ width: `${selected.score}%` }} />
                      </div>
                    </div>
                    <div className={`px-4 py-2 rounded-full text-xs font-bold ${recColor[selected.recommendation]}`}>
                      {selected.recommendation}
                    </div>
                  </div>

                  <div className="flex bg-slate-50 p-1.5 rounded-full mb-8">
                    <button onClick={() => setRightPanelTab('ai')} className={`flex-1 py-2 text-sm font-bold rounded-full transition-all ${rightPanelTab === 'ai' ? 'bg-white shadow-md text-slate-900' : 'text-slate-400'}`}>AI Reasoning</button>
                    <button onClick={() => setRightPanelTab('info')} className={`flex-1 py-2 text-sm font-bold rounded-full transition-all ${rightPanelTab === 'info' ? 'bg-white shadow-md text-slate-900' : 'text-slate-400'}`}>Candidate Info</button>
                  </div>

                  {rightPanelTab === 'ai' && (
                    <div className="space-y-8">
                      <div>
                        <h4 className="flex items-center gap-2 font-black text-sm text-slate-900 mb-4"><Sparkles size={16} className="text-[#16a34a]" /> Strengths</h4>
                        <div className="space-y-4">
                          {(selected.strengths ?? []).map((s, i) => (
                            <div key={i} className="flex gap-3 text-sm text-slate-600 font-medium leading-relaxed">
                              <CheckCircle size={16} className="mt-0.5 shrink-0 text-[#16a34a]" />
                              <span>{s}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="flex items-center gap-2 font-black text-sm text-slate-900 mb-4"><TriangleAlert size={16} className="text-[#ca8a04]" /> Gaps & Risks</h4>
                        <div className="space-y-4">
                          {(selected.gaps ?? []).map((s, i) => (
                            <div key={i} className="flex gap-3 text-sm text-slate-600 font-medium leading-relaxed">
                              <div className="mt-2 w-2 h-2 shrink-0 rounded-full bg-[#ca8a04]" />
                              <span>{s}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-black text-sm text-slate-900 mb-4">Final Recommendation</h4>
                        <div className="bg-slate-50 border border-slate-100 rounded-3xl p-5 flex items-center gap-4">
                          <span className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 shrink-0 ${recColor[selected.recommendation]}`}>
                            <div className="w-1.5 h-1.5 rounded-full bg-current" /> {selected.recommendation}
                          </span>
                          <p className="text-sm text-slate-500 font-medium leading-relaxed italic">&ldquo;{(selected.reasoning || '').substring(0, 80)}{(selected.reasoning || '').length > 80 ? '...' : ''}&rdquo;</p>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-black text-sm text-slate-900 mb-4">Skills Matched</h4>
                        <div className="flex flex-wrap gap-2.5">
                          {(selected.matched ?? []).map(s => (
                            <span key={s} className="px-3.5 py-1.5 bg-blue-50 text-[#2a85ff] text-[11px] font-extrabold rounded-full">{s}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {rightPanelTab === 'info' && (
                    <div className="text-sm text-slate-600 font-medium space-y-6 px-1 pb-4">
                      <p><strong className="text-slate-900 opacity-60">Experience Level:</strong><br />{selected.expLevel} ({selected.experienceYears}y)</p>
                      <p><strong className="text-slate-900 opacity-60">Education:</strong><br />{selected.education}</p>
                      <p><strong className="text-slate-900 opacity-60">Location:</strong><br />{selected.location}</p>
                      <p><strong className="text-slate-900 opacity-60">Summary background:</strong><br />{selected.summary || 'Summary intentionally removed for blind screening review.'}</p>
                    </div>
                  )}

                  <div className="mt-10 flex flex-col gap-4 pb-4">
                    <button
                      onClick={() => { void toggleShortlist(String(selected.id)) }}
                      className={`w-full py-5 rounded-[1.2rem] flex items-center justify-center gap-2 font-black text-[15px] transition-all shadow-xl ${shortlisted.has(String(selected.id))
                          ? 'bg-[#e6f9f0] text-[#16a34a] border border-[#16a34a]/20 shadow-green-100'
                          : 'bg-[#2a85ff] border border-[#2a85ff] text-white shadow-[#2a85ff]/30 hover:bg-blue-600'
                        }`}
                    >
                      {shortlisted.has(String(selected.id)) ? <><CheckCircle size={20} /> Shortlisted</> : 'Shortlist Candidate'}
                    </button>
                    {shortlisted.has(String(selected.id)) && (
                      <button onClick={() => toggleShortlist(String(selected.id))} className="text-xs font-bold text-slate-400 hover:text-slate-600 text-center uppercase tracking-widest py-2">Remove from List</button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mobile Filter Drawer */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, x: '-100%' }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: '-100%' }}
                className="lg:hidden fixed inset-0 z-[100] flex"
              >
                <div className="w-[85%] max-w-[340px] bg-white h-full shadow-2xl p-6 flex flex-col overflow-y-auto relative z-10">
                  <div className="flex items-center justify-between mb-10">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Filters</h3>
                    <button onClick={() => setShowFilters(false)} className="p-2.5 bg-slate-50 rounded-full text-slate-500"><X size={20} /></button>
                  </div>

                  <div className="space-y-10 flex-1">
                    <div>
                      <p className="text-[12px] font-black uppercase tracking-widest text-slate-900 mb-6">Match Score (Min)</p>
                      <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-center bg-slate-50 rounded-full px-5 py-3 border border-slate-100">
                          <span className="text-sm font-bold text-[#2a85ff]">{scoreMin}%</span>
                          <span className="text-sm font-bold text-slate-300">100%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={scoreMin}
                          onChange={(e) => setScoreMin(parseInt(e.target.value))}
                          className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-[#2a85ff]"
                        />
                      </div>
                    </div>

                    <div>
                      <p className="text-[12px] font-black uppercase tracking-widest text-slate-900 mb-6">Recommendation</p>
                      <div className="space-y-6">
                        {(['hire', 'consider', 'pass'] as const).map((r) => (
                          <label
                            key={r}
                            className="flex items-center justify-between cursor-pointer"
                            onClick={() => toggleFilter(recFilters, r, setRecFilters)}
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-5 h-5 flex items-center justify-center">
                                {recFilters.has(r) ? <CheckCircle size={20} className="text-[#2a85ff]" strokeWidth={3} /> : <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />}
                              </div>
                              <span className={`text-[15px] font-bold ${recFilters.has(r) ? 'text-slate-900' : 'text-slate-400'}`}>
                                {r.charAt(0).toUpperCase() + r.slice(1)}
                              </span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-[12px] font-black uppercase tracking-widest text-slate-900 mb-6">Experience Level</p>
                      <div className="space-y-6">
                        {(['Entry Level', 'Intermediate', 'Expert']).map(e => (
                          <label
                            key={e}
                            className="flex items-center justify-between cursor-pointer"
                            onClick={() => toggleFilter(expFilters, e, setExpFilters)}
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-5 h-5 flex items-center justify-center">
                                {expFilters.has(e) ? <CheckCircle size={20} className="text-[#2a85ff]" strokeWidth={3} /> : <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />}
                              </div>
                              <span className={`text-[15px] font-bold ${expFilters.has(e) ? 'text-slate-900' : 'text-slate-400'}`}>{e}</span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button onClick={() => setShowFilters(false)} className="mt-8 w-full py-5 bg-[#2a85ff] text-white rounded-2xl font-black text-[15px] shadow-xl shadow-[#2a85ff]/30">
                    Apply Filters
                  </button>
                </div>
                <div className="flex-1 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowFilters(false)} />
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </main>

      {error && <p className="max-w-7xl mx-auto px-6 pb-8 text-sm font-bold text-[#dc2626]">{error}</p>}
    </div>
  )
}
