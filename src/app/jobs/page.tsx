"use client";
import { useState, useCallback } from "react";
import { Search, MapPin, Briefcase, Clock, Star, Check, SlidersHorizontal, X } from "lucide-react";
import CandidateNav from "@/components/CandidateNav";
import Toast from "@/components/Toast";

type JobType = "Full-Time" | "Part-Time" | "Contract" | "Remote";

const jobs = [
  {
    id: 1,
    title: "Senior Backend Engineer",
    company: "Nexus Technologies",
    initials: "NT",
    color: "bg-blue-600",
    location: "Remote",
    type: "Full-Time" as JobType,
    salary: "$120k – $160k",
    posted: "2 days ago",
    match: 94,
    tags: ["Node.js", "GraphQL", "TypeScript"],
    desc: "We are looking for a Senior Backend Engineer to lead our API platform team. You'll architect scalable microservices and mentor junior engineers.",
    department: "Engineering",
  },
  {
    id: 2,
    title: "Full Stack Engineer",
    company: "Orbit Labs",
    initials: "OL",
    color: "bg-purple-600",
    location: "London, UK",
    type: "Full-Time" as JobType,
    salary: "£90k – £120k",
    posted: "3 days ago",
    match: 87,
    tags: ["React", "Node.js", "AWS"],
    desc: "Join Orbit Labs to build next-generation fintech products. You'll work across the full stack with modern tooling and a collaborative team.",
    department: "Engineering",
  },
  {
    id: 3,
    title: "Product Manager",
    company: "CloudStack",
    initials: "CS",
    color: "bg-green-600",
    location: "Berlin, Germany",
    type: "Full-Time" as JobType,
    salary: "€80k – €100k",
    posted: "5 days ago",
    match: 72,
    tags: ["Product Strategy", "Agile", "Analytics"],
    desc: "CloudStack is hiring a Product Manager to own our developer tools roadmap. You'll work closely with engineering and design to ship impactful features.",
    department: "Product",
  },
  {
    id: 4,
    title: "Frontend Developer",
    company: "Pulse Inc.",
    initials: "PI",
    color: "bg-amber-500",
    location: "Remote",
    type: "Remote" as JobType,
    salary: "$80k – $110k",
    posted: "1 week ago",
    match: 81,
    tags: ["React", "TailwindCSS", "TypeScript"],
    desc: "Pulse Inc. is looking for a creative Frontend Developer to build beautiful, performant interfaces for our health-tech platform.",
    department: "Engineering",
  },
  {
    id: 5,
    title: "DevOps Engineer",
    company: "Dataform",
    initials: "DF",
    color: "bg-rose-600",
    location: "New York, USA",
    type: "Full-Time" as JobType,
    salary: "$110k – $145k",
    posted: "1 week ago",
    match: 68,
    tags: ["Kubernetes", "AWS", "Terraform"],
    desc: "Dataform is hiring a DevOps engineer to scale our cloud infrastructure. You'll own CI/CD pipelines and reliability across multiple regions.",
    department: "Infrastructure",
  },
  {
    id: 6,
    title: "Backend Engineer (Contract)",
    company: "Stratum",
    initials: "ST",
    color: "bg-emerald-600",
    location: "Remote",
    type: "Contract" as JobType,
    salary: "$600 – $800/day",
    posted: "3 days ago",
    match: 91,
    tags: ["Python", "FastAPI", "PostgreSQL"],
    desc: "6-month contract role to help Stratum build its new data pipeline infrastructure. Strong Python and API design skills required.",
    department: "Engineering",
  },
];

const types: JobType[] = ["Full-Time", "Part-Time", "Contract", "Remote"];

const matchColor = (m: number) =>
  m >= 90 ? "text-green-600" : m >= 80 ? "text-blue-600" : m >= 70 ? "text-yellow-600" : "text-gray-500";
const matchBarColor = (m: number) =>
  m >= 90 ? "bg-green-500" : m >= 80 ? "bg-blue-500" : m >= 70 ? "bg-yellow-400" : "bg-gray-300";

export default function JobsPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<JobType[]>([]);
  const [selected, setSelected] = useState<number | null>(1);
  const [applied, setApplied] = useState<number[]>([]);
  const [saved, setSaved] = useState<number[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [toast, setToast] = useState("");
  const showToast = useCallback((msg: string) => { setToast(""); setTimeout(() => setToast(msg), 10); }, []);

  function applyJob(id: number, title: string) {
    setApplied((prev) => [...prev, id]);
    showToast(`Applied to ${title}`);
  }
  function toggleSave(id: number) {
    setSaved((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  }

  const filtered = jobs.filter((j) => {
    const q = search.toLowerCase();
    const matchSearch = !q || j.title.toLowerCase().includes(q) || j.company.toLowerCase().includes(q) || j.tags.some((t) => t.toLowerCase().includes(q));
    const matchType = typeFilter.length === 0 || typeFilter.includes(j.type);
    return matchSearch && matchType;
  });

  const selectedJob = jobs.find((j) => j.id === selected);

  return (
    <div className="min-h-screen bg-[#F0F4F8] dark:bg-[#0f1117]">
      <CandidateNav />
      <Toast message={toast} onDone={() => setToast("")} />

      {/* Hero */}
      <div className="bg-[#0A0A0F] px-6 py-10">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-1">Browse Jobs</h1>
          <p className="text-gray-400 text-sm mb-6">Roles matched to your profile — scored by AI</p>

          {/* Search bar */}
          <div className="flex gap-3 max-w-2xl">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Role, company, or skill…"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                  <X size={14} />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters((v) => !v)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${showFilters ? "bg-blue-600 border-blue-600 text-white" : "border-white/10 text-gray-300 hover:border-white/20"}`}
            >
              <SlidersHorizontal size={14} /> Filters {typeFilter.length > 0 && `(${typeFilter.length})`}
            </button>
          </div>

          {/* Type filters */}
          {showFilters && (
            <div className="flex flex-wrap gap-2 mt-4">
              {types.map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t])}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors ${typeFilter.includes(t) ? "bg-blue-600 border-blue-600 text-white" : "border-white/15 text-gray-400 hover:border-white/25"}`}
                >
                  {t}
                </button>
              ))}
              {typeFilter.length > 0 && (
                <button onClick={() => setTypeFilter([])} className="px-4 py-1.5 rounded-full text-xs font-medium border border-white/10 text-gray-500 hover:text-gray-300">
                  Clear
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 flex gap-6">
        {/* -- Job list -- */}
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500 mb-4">{filtered.length} role{filtered.length !== 1 ? "s" : ""} found</p>

          {filtered.length === 0 && (
            <div className="bg-white dark:bg-[#1a1d27] border border-gray-100 dark:border-white/5 rounded-2xl p-12 text-center shadow-sm">
              <p className="text-gray-400 text-sm">No jobs match your search.</p>
            </div>
          )}

          <div className="space-y-3">
            {filtered.map((job) => (
              <div
                key={job.id}
                onClick={() => setSelected(job.id)}
                className={`bg-white dark:bg-[#1a1d27] rounded-2xl border p-5 cursor-pointer transition-all ${
                  selected === job.id
                    ? "border-blue-300 dark:border-blue-500 shadow-md"
                    : "border-gray-100 dark:border-white/5 shadow-sm hover:border-gray-200 dark:hover:border-white/10"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-11 h-11 rounded-xl ${job.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                    {job.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{job.title}</p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-xs text-gray-500">{job.company}</span>
                          <span className="text-gray-300 dark:text-white/20">·</span>
                          <span className="flex items-center gap-1 text-xs text-gray-500"><MapPin size={10} />{job.location}</span>
                          <span className="text-gray-300 dark:text-white/20">·</span>
                          <span className="text-xs text-gray-500">{job.type}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleSave(job.id); }}
                          className={`p-1.5 rounded-lg transition-colors ${saved.includes(job.id) ? "text-yellow-500" : "text-gray-300 hover:text-yellow-400"}`}
                        >
                          <Star size={15} fill={saved.includes(job.id) ? "currentColor" : "none"} />
                        </button>
                        <span className={`text-sm font-bold ${matchColor(job.match)}`}>{job.match}% match</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mt-3 mb-3">
                      {job.tags.map((t) => (
                        <span key={t} className="text-xs bg-gray-100 dark:bg-white/5 text-gray-500 px-2 py-0.5 rounded-md">{t}</span>
                      ))}
                    </div>

                    <div className="w-full h-1 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${matchBarColor(job.match)}`} style={{ width: `${job.match}%` }} />
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-gray-700">{job.salary}</span>
                        <span className="flex items-center gap-1 text-xs text-gray-400"><Clock size={10} />{job.posted}</span>
                      </div>
                      {applied.includes(job.id)
                        ? <span className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 dark:bg-green-500/10 px-3 py-1 rounded-full"><Check size={11} /> Applied</span>
                        : <button
                            onClick={(e) => { e.stopPropagation(); applyJob(job.id, job.title); }}
                            className="text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-full transition-colors"
                          >Apply</button>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* -- Detail panel -- */}
        {selectedJob && (
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <div className="bg-white dark:bg-[#1a1d27] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm p-6 sticky top-6">
              <div className="flex items-start gap-3 mb-5">
                <div className={`w-12 h-12 rounded-xl ${selectedJob.color} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                  {selectedJob.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-sm leading-snug">{selectedJob.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{selectedJob.company}</p>
                </div>
                <button onClick={() => toggleSave(selectedJob.id)} className={`p-1.5 rounded-lg transition-colors ${saved.includes(selectedJob.id) ? "text-yellow-500" : "text-gray-300 hover:text-yellow-400"}`}>
                  <Star size={16} fill={saved.includes(selectedJob.id) ? "currentColor" : "none"} />
                </button>
              </div>

              {/* Match */}
              <div className="mb-5">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Your AI Match</p>
                <p className={`text-4xl font-bold mb-1 ${matchColor(selectedJob.match)}`}>{selectedJob.match}%</p>
                <div className="w-full h-2 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${matchBarColor(selectedJob.match)}`} style={{ width: `${selectedJob.match}%` }} />
                </div>
              </div>

              {/* Details */}
              <div className="space-y-2 mb-5 text-sm">
                {[
                  { icon: <MapPin size={12} />, label: selectedJob.location },
                  { icon: <Briefcase size={12} />, label: selectedJob.type },
                  { icon: <Clock size={12} />, label: selectedJob.posted },
                ].map(({ icon, label }) => (
                  <div key={label} className="flex items-center gap-2 text-gray-500">
                    <span className="text-gray-400">{icon}</span> {label}
                  </div>
                ))}
                <div className="flex items-center gap-2 text-gray-700 font-semibold text-sm pt-1">
                  💰 {selectedJob.salary}
                </div>
              </div>

              {/* Description */}
              <div className="mb-5">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">About the Role</p>
                <p className="text-xs text-gray-600 leading-relaxed">{selectedJob.desc}</p>
              </div>

              {/* Skills */}
              <div className="mb-6">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Required Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedJob.tags.map((t) => (
                    <span key={t} className="text-xs bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-full">{t}</span>
                  ))}
                </div>
              </div>

              {/* Apply */}
              {applied.includes(selectedJob.id) ? (
                <div className="w-full flex items-center justify-center gap-2 bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 font-semibold py-3 rounded-full text-sm">
                  <Check size={14} /> Applied
                </div>
              ) : (
                <button
                  onClick={() => applyJob(selectedJob.id, selectedJob.title)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-full text-sm transition-colors"
                >
                  Apply Now
                </button>
              )}
              <p className="text-center text-xs text-gray-400 mt-2">Your CV will be submitted automatically</p>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
