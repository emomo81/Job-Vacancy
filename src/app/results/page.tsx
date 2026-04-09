"use client";
import Link from "next/link";
import { useState } from "react";
import { Download, ArrowLeft, ExternalLink, Plus, Check, ChevronDown } from "lucide-react";
import RecruiterNav from "@/components/RecruiterNav";

type Tab = "all" | "rankr" | "external";

const candidates = [
  {
    id: 1,
    name: "Amara Osei",
    role: "Senior Backend Engineer",
    score: 94,
    tags: ["Always", "TypeScript", "GraphQL"],
    recommendation: "Hire",
    source: "rankr",
    shortlisted: true,
    summary: "Deep Node.js & GraphQL expertise — 7 years. Architected high-traffic systems, fast learner, excellent cultural fit.",
    color: "bg-amber-500",
  },
  {
    id: 2,
    name: "Lena Müller",
    role: "Backend Engineer",
    score: 88,
    tags: ["Node.js", "AWS", "PostgreSQL"],
    recommendation: "Hire",
    source: "rankr",
    shortlisted: false,
    summary: "Strong cloud infrastructure background with 5 years AWS. Led migrations, excellent team player.",
    color: "bg-blue-500",
  },
  {
    id: 3,
    name: "James Park",
    role: "Backend Lead",
    score: 85,
    tags: ["Python", "Django", "Redis"],
    recommendation: "Consider",
    source: "external",
    shortlisted: false,
    summary: "Strong Django + system design background with prior team lead experience. Slightly outside stack.",
    color: "bg-green-500",
  },
  {
    id: 4,
    name: "Sara Kimani",
    role: "Full Stack Engineer",
    score: 82,
    tags: ["React", "Node.js", "GraphQL"],
    recommendation: "Consider",
    source: "rankr",
    shortlisted: false,
    summary: "Today&apos;s ranking focuses on Node.js with your project needs. Sara brings strong full-stack balance.",
    color: "bg-purple-500",
  },
  {
    id: 5,
    name: "David Rousseau",
    role: "Backend Engineer",
    score: 79,
    tags: ["Go", "Kubernetes"],
    recommendation: "Consider",
    source: "external",
    shortlisted: false,
    summary: "Golang specialist in Kubernetes. Today's focus needs Node — strong transfer potential.",
    color: "bg-orange-500",
  },
  {
    id: 6,
    name: "Yuki Tanaka",
    role: "Senior Backend Engineer",
    score: 78,
    tags: ["Java", "Spring", "MySQL"],
    recommendation: "Consider",
    source: "rankr",
    shortlisted: false,
    summary: "Strong Java/Spring expertise. Direct Node.js experience limited, but rapid learner profile.",
    color: "bg-teal-500",
  },
  {
    id: 7,
    name: "Fatima Al-Hassan",
    role: "Backend Engineer",
    score: 73,
    tags: ["Python", "Django", "SQL"],
    recommendation: "Pass",
    source: "external",
    shortlisted: false,
    summary: "Solid Python skills, but limited Node.js and system-scale experience for this role.",
    color: "bg-pink-500",
  },
  {
    id: 8,
    name: "Carlos Mendes",
    role: "Full Stack Developer",
    score: 68,
    tags: ["PHP", "Laravel", "Vue"],
    recommendation: "Pass",
    source: "external",
    shortlisted: false,
    summary: "Strong PHP foundations, but tech stack misalignment with Node.js/GraphQL requirements.",
    color: "bg-indigo-500",
  },
  {
    id: 9,
    name: "Priya Sharma",
    role: "Backend Engineer",
    score: 65,
    tags: ["Ruby", "TypeScript"],
    recommendation: "Pass",
    source: "rankr",
    shortlisted: false,
    summary: "Capable developer but experience level below the seniority threshold for this role.",
    color: "bg-rose-500",
  },
];

const recColors: Record<string, string> = {
  Hire: "bg-green-100 text-green-700",
  Consider: "bg-yellow-100 text-yellow-700",
  Pass: "bg-red-100 text-red-700",
};

const scoreColor = (s: number) =>
  s >= 85 ? "text-green-600" : s >= 75 ? "text-blue-600" : s >= 65 ? "text-yellow-600" : "text-red-500";

const scoreBarColor = (s: number) =>
  s >= 85 ? "bg-green-500" : s >= 75 ? "bg-blue-500" : s >= 65 ? "bg-yellow-400" : "bg-red-400";

export default function ResultsPage() {
  const [tab, setTab] = useState<Tab>("all");
  const [shortlisted, setShortlisted] = useState<number[]>([1]);
  const [recFilter, setRecFilter] = useState<string[]>(["Hire", "Consider", "Pass"]);
  const [scoreRange, setScoreRange] = useState(50);
  const [selected, setSelected] = useState<number | null>(1);

  function toggleShortlist(id: number) {
    setShortlisted((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  }

  const filtered = candidates.filter((c) => {
    if (tab === "rankr" && c.source !== "rankr") return false;
    if (tab === "external" && c.source !== "external") return false;
    if (!recFilter.includes(c.recommendation)) return false;
    if (c.score < scoreRange) return false;
    return true;
  });

  const selectedCandidate = candidates.find((c) => c.id === selected);
  const shortlistedCandidates = candidates.filter((c) => shortlisted.includes(c.id));

  return (
    <div className="min-h-screen bg-[#F0F4F8]">
      <RecruiterNav />

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <h1 className="text-3xl font-bold text-gray-900">Screening Results</h1>
            </div>
            <p className="text-gray-400 text-sm">9 candidates ranked from 34 applicants</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 border border-gray-200 text-gray-600 hover:border-gray-300 font-medium px-4 py-2 rounded-full text-sm transition-colors">
              <Plus size={13} /> 34 Screened
            </button>
            <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-full text-sm transition-colors">
              <Check size={13} /> {shortlisted.length} Shortlisted
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 flex gap-6">
        {/* ── Sidebar filters ──────────────────────────── */}
        <aside className="hidden xl:block w-48 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">Match Score</h3>
            <div className="mb-1">
              <input
                type="range"
                min={0}
                max={100}
                value={scoreRange}
                onChange={(e) => setScoreRange(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>{scoreRange}</span>
                <span>100</span>
              </div>
            </div>

            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mt-5 mb-3">Recommendation</h3>
            {["Hire", "Consider", "Pass"].map((r) => (
              <label key={r} className="flex items-center gap-2 mb-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={recFilter.includes(r)}
                  onChange={() => setRecFilter((prev) => prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r])}
                  className="accent-blue-600 w-3.5 h-3.5"
                />
                <span className="text-xs text-gray-600">{r}</span>
              </label>
            ))}

            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mt-5 mb-3">Source</h3>
            {["Rankr Platform", "External Upload"].map((s) => (
              <label key={s} className="flex items-center gap-2 mb-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="accent-blue-600 w-3.5 h-3.5" />
                <span className="text-xs text-gray-600">{s}</span>
              </label>
            ))}

            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mt-5 mb-3">Experience Level</h3>
            {["Entry Level", "Intermediate", "Expert"].map((e) => (
              <label key={e} className="flex items-center gap-2 mb-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="accent-blue-600 w-3.5 h-3.5" />
                <span className="text-xs text-gray-600">{e}</span>
              </label>
            ))}
          </div>
        </aside>

        {/* ── Candidate grid ───────────────────────────── */}
        <div className="flex-1">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-1">
              <h2 className="text-base font-bold text-gray-900 mr-4">Shortlisted Candidates</h2>
              <div className="flex bg-gray-100 rounded-lg p-0.5 gap-0.5">
                {(["all", "rankr", "external"] as Tab[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors capitalize ${
                      tab === t ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {t === "all" ? `All (${candidates.length})` : t === "rankr" ? `Rankr (${candidates.filter(c => c.source === "rankr").length})` : `External (${candidates.filter(c => c.source === "external").length})`}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg transition-colors">
                <Download size={12} /> Export PDF
              </button>
              <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg transition-colors">
                Most Recent <ChevronDown size={12} />
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {filtered.map((c, i) => (
              <div
                key={c.id}
                onClick={() => setSelected(c.id)}
                className={`bg-white rounded-2xl border p-5 cursor-pointer transition-all ${
                  selected === c.id ? "border-blue-300 shadow-md" : "border-gray-100 shadow-sm hover:border-gray-200"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full ${c.color} flex items-center justify-center text-white font-semibold text-sm flex-shrink-0`}>
                      {c.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">#{i + 1}</span>
                        <p className="text-sm font-semibold text-gray-900">{c.name}</p>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${recColors[c.recommendation]}`}>
                          {c.recommendation}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{c.role}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`text-2xl font-bold ${scoreColor(c.score)}`}>{c.score}</p>
                    <p className="text-xs text-gray-400">score</p>
                  </div>
                </div>

                {/* Score bar */}
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-3">
                  <div className={`h-full rounded-full ${scoreBarColor(c.score)}`} style={{ width: `${c.score}%` }} />
                </div>

                <div className="flex gap-1.5 mb-3 flex-wrap">
                  {c.tags.map((t) => (
                    <span key={t} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md">{t}</span>
                  ))}
                </div>

                <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-4">{c.summary}</p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleShortlist(c.id); }}
                    className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                      shortlisted.includes(c.id)
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "border border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {shortlisted.includes(c.id) ? <Check size={11} /> : <Plus size={11} />}
                    {shortlisted.includes(c.id) ? "Shortlisted" : "Shortlist"}
                  </button>
                  <button className="flex items-center gap-1.5 text-xs font-medium border border-gray-200 text-gray-600 hover:border-gray-300 px-3 py-1.5 rounded-full transition-colors">
                    <ExternalLink size={11} /> View Details
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="mt-6 flex items-center justify-between">
            <Link href="/screening" className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm transition-colors">
              <ArrowLeft size={14} /> Back to Screening
            </Link>
            <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-full text-sm transition-colors">
              <Download size={14} />
              Export Shortlist Report
            </button>
          </div>
        </div>

        {/* ── Detail panel ─────────────────────────────── */}
        {selectedCandidate && (
          <aside className="hidden 2xl:block w-72 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-full ${selectedCandidate.color} flex items-center justify-center text-white font-semibold`}>
                  {selectedCandidate.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{selectedCandidate.name}</p>
                  <p className="text-xs text-gray-400">{selectedCandidate.role}</p>
                </div>
              </div>

              <div className="mb-4">
                <p className={`text-4xl font-bold mb-1 ${scoreColor(selectedCandidate.score)}`}>{selectedCandidate.score}</p>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${scoreBarColor(selectedCandidate.score)}`} style={{ width: `${selectedCandidate.score}%` }} />
                </div>
                <p className="text-xs text-gray-400 mt-1">AI Reasoning</p>
              </div>

              <div className="space-y-3 mb-5">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">Strengths</p>
                  <p className="text-xs text-gray-600 leading-relaxed">{selectedCandidate.summary}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">Gaps & Risks</p>
                  <p className="text-xs text-gray-400 leading-relaxed">No significant blockers identified through 5 senior-level experiences.</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">Final Recommendation</p>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${recColors[selectedCandidate.recommendation]}`}>
                    {selectedCandidate.recommendation === "Hire" ? "✓ Strongly recommend for interview" : selectedCandidate.recommendation}
                  </span>
                </div>
              </div>

              <div className="mb-5">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Skills Matched</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCandidate.tags.map((t) => (
                    <span key={t} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md">{t}</span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => toggleShortlist(selectedCandidate.id)}
                className={`w-full flex items-center justify-center gap-2 font-semibold py-2.5 rounded-full text-sm transition-colors ${
                  shortlisted.includes(selectedCandidate.id)
                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {shortlisted.includes(selectedCandidate.id) ? <><Check size={14} /> Shortlisted</> : <><Plus size={14} /> Shortlist</>}
              </button>
              <p className="text-center text-xs text-gray-400 mt-2">Screened from list</p>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
