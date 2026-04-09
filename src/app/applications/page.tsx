"use client";
import { useState, useCallback } from "react";
import { Building2, MapPin, Clock, ExternalLink, X, ChevronRight, Search } from "lucide-react";
import CandidateNav from "@/components/CandidateNav";
import Toast from "@/components/Toast";

type Status = "Applied" | "Under Review" | "Shortlisted" | "Interview" | "Offer" | "Rejected";
type FilterTab = "All" | "Active" | "Shortlisted" | "Closed";

const statusStyles: Record<Status, string> = {
  "Applied":       "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
  "Under Review":  "bg-yellow-50 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400",
  "Shortlisted":   "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400",
  "Interview":     "bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400",
  "Offer":         "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  "Rejected":      "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
};

const activeStatuses: Status[] = ["Applied", "Under Review", "Interview"];
const closedStatuses: Status[] = ["Offer", "Rejected"];

const applications = [
  {
    id: 1,
    role: "Senior Backend Engineer",
    company: "Nexus Technologies",
    location: "Remote",
    type: "Full-Time",
    appliedDate: "Mar 28, 2026",
    status: "Shortlisted" as Status,
    matchScore: 94,
    color: "bg-blue-600",
    initials: "NT",
    feedback: "Your Node.js and GraphQL experience is a strong match. Team has reviewed your profile.",
  },
  {
    id: 2,
    role: "Full Stack Engineer",
    company: "Orbit Labs",
    location: "London, UK",
    type: "Hybrid",
    appliedDate: "Mar 25, 2026",
    status: "Under Review" as Status,
    matchScore: 87,
    color: "bg-purple-600",
    initials: "OL",
    feedback: "Your application is being reviewed by the hiring team.",
  },
  {
    id: 3,
    role: "Backend Lead",
    company: "CloudStack",
    location: "Berlin, Germany",
    type: "On-site",
    appliedDate: "Mar 20, 2026",
    status: "Interview" as Status,
    matchScore: 91,
    color: "bg-green-600",
    initials: "CS",
    feedback: "Interview scheduled for Apr 10, 2026 at 2:00 PM GMT. Check your email for the link.",
  },
  {
    id: 4,
    role: "Node.js Developer",
    company: "Pulse Inc.",
    location: "Remote",
    type: "Contract",
    appliedDate: "Mar 15, 2026",
    status: "Applied" as Status,
    matchScore: 82,
    color: "bg-amber-600",
    initials: "PI",
    feedback: null,
  },
  {
    id: 5,
    role: "Platform Engineer",
    company: "Dataform",
    location: "New York, USA",
    type: "Full-Time",
    appliedDate: "Mar 10, 2026",
    status: "Rejected" as Status,
    matchScore: 74,
    color: "bg-gray-500",
    initials: "DF",
    feedback: "The team decided to move forward with candidates who had more experience with Rust and low-latency systems.",
  },
  {
    id: 6,
    role: "API Engineer",
    company: "Stratum",
    location: "Remote",
    type: "Full-Time",
    appliedDate: "Feb 28, 2026",
    status: "Offer" as Status,
    matchScore: 96,
    color: "bg-emerald-600",
    initials: "ST",
    feedback: "Congratulations! Stratum has extended an offer. Please respond by Apr 15, 2026.",
  },
];

const tabFilters: Record<FilterTab, (a: typeof applications[0]) => boolean> = {
  All:        () => true,
  Active:     (a) => activeStatuses.includes(a.status),
  Shortlisted:(a) => a.status === "Shortlisted",
  Closed:     (a) => closedStatuses.includes(a.status),
};

export default function ApplicationsPage() {
  const [tab, setTab] = useState<FilterTab>("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<number | null>(1);
  const [appList, setAppList] = useState(applications);
  const [toast, setToast] = useState("");
  const showToast = useCallback((msg: string) => { setToast(""); setTimeout(() => setToast(msg), 10); }, []);

  function withdraw(id: number) {
    setAppList((prev) => prev.filter((a) => a.id !== id));
    if (selected === id) setSelected(null);
    showToast("Application withdrawn");
  }

  const filtered = appList.filter(
    (a) =>
      tabFilters[tab](a) &&
      (a.role.toLowerCase().includes(search.toLowerCase()) ||
        a.company.toLowerCase().includes(search.toLowerCase()))
  );

  const selectedApp = appList.find((a) => a.id === selected);

  const counts: Record<FilterTab, number> = {
    All:         appList.length,
    Active:      appList.filter(tabFilters.Active).length,
    Shortlisted: appList.filter(tabFilters.Shortlisted).length,
    Closed:      appList.filter(tabFilters.Closed).length,
  };

  return (
    <div className="min-h-screen bg-[#F0F4F8] dark:bg-[#0f1117]">
      <CandidateNav />
      <Toast message={toast} onDone={() => setToast("")} />

      {/* Header */}
      <div className="bg-[#0A0A0F] px-4 sm:px-6 py-8 sm:py-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">My Applications</h1>
            <p className="text-gray-400 text-sm">Track every role you've applied to and its current status</p>
          </div>
          <div className="hidden lg:flex items-center gap-3">
            <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-center">
              <p className="text-2xl font-bold text-white">{applications.length}</p>
              <p className="text-gray-400 text-xs mt-0.5">Total applied</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-center">
              <p className="text-2xl font-bold text-green-400">{counts.Shortlisted + applications.filter(a => a.status === "Interview").length}</p>
              <p className="text-gray-400 text-xs mt-0.5">Progressing</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-center">
              <p className="text-2xl font-bold text-emerald-400">{applications.filter(a => a.status === "Offer").length}</p>
              <p className="text-gray-400 text-xs mt-0.5">Offer received</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex gap-6">
        {/* -- Left: list -- */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
            {/* Tabs */}
            <div className="flex bg-white dark:bg-[#1a1d27] border border-gray-100 dark:border-white/5 rounded-xl p-1 gap-0.5 shadow-sm">
              {(["All", "Active", "Shortlisted", "Closed"] as FilterTab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    tab === t
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {t} <span className="opacity-60">({counts[t]})</span>
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative flex-1 sm:max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search role or company..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl bg-white dark:bg-[#1a1d27] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Application cards */}
          <div className="space-y-3">
            {filtered.length === 0 && (
              <div className="bg-white dark:bg-[#1a1d27] border border-gray-100 dark:border-white/5 rounded-2xl p-12 text-center shadow-sm">
                <p className="text-gray-400 text-sm">No applications match this filter.</p>
              </div>
            )}
            {filtered.map((app) => (
              <div
                key={app.id}
                onClick={() => setSelected(app.id)}
                className={`bg-white dark:bg-[#1a1d27] rounded-2xl border p-5 cursor-pointer transition-all ${
                  selected === app.id
                    ? "border-blue-300 dark:border-blue-500 shadow-md"
                    : "border-gray-100 dark:border-white/5 shadow-sm hover:border-gray-200 dark:hover:border-white/10"
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Company logo */}
                  <div className={`w-11 h-11 rounded-xl ${app.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                    {app.initials}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{app.role}</p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <Building2 size={11} /> {app.company}
                          </span>
                          <span className="text-gray-300 dark:text-white/20">·</span>
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <MapPin size={11} /> {app.location}
                          </span>
                          <span className="text-gray-300 dark:text-white/20">·</span>
                          <span className="text-xs text-gray-500">{app.type}</span>
                        </div>
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${statusStyles[app.status]}`}>
                        {app.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <Clock size={11} /> Applied {app.appliedDate}
                        </span>
                        <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                          {app.matchScore}% match
                        </span>
                      </div>
                      <ChevronRight size={15} className="text-gray-300 dark:text-white/20" />
                    </div>

                    {/* Match bar */}
                    <div className="w-full h-1 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden mt-2">
                      <div
                        className={`h-full rounded-full ${app.matchScore >= 90 ? "bg-green-500" : app.matchScore >= 80 ? "bg-blue-500" : "bg-yellow-400"}`}
                        style={{ width: `${app.matchScore}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* -- Right: detail panel -- */}
        {selectedApp && (
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <div className="bg-white dark:bg-[#1a1d27] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm p-6 sticky top-6">
              {/* Header */}
              <div className="flex items-start gap-3 mb-5">
                <div className={`w-12 h-12 rounded-xl ${selectedApp.color} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                  {selectedApp.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-sm leading-snug">{selectedApp.role}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{selectedApp.company}</p>
                </div>
              </div>

              {/* Status */}
              <div className="mb-5">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Status</p>
                <span className={`text-sm font-semibold px-3 py-1.5 rounded-full ${statusStyles[selectedApp.status]}`}>
                  {selectedApp.status}
                </span>
              </div>

              {/* Match score */}
              <div className="mb-5">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">AI Match Score</p>
                <p className={`text-4xl font-bold mb-1 ${selectedApp.matchScore >= 90 ? "text-green-600" : selectedApp.matchScore >= 80 ? "text-blue-600" : "text-yellow-600"}`}>
                  {selectedApp.matchScore}%
                </p>
                <div className="w-full h-2 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${selectedApp.matchScore >= 90 ? "bg-green-500" : selectedApp.matchScore >= 80 ? "bg-blue-500" : "bg-yellow-400"}`}
                    style={{ width: `${selectedApp.matchScore}%` }}
                  />
                </div>
              </div>

              {/* Details */}
              <div className="space-y-2 mb-5 text-sm">
                {[
                  { label: "Location", value: selectedApp.location },
                  { label: "Type", value: selectedApp.type },
                  { label: "Applied", value: selectedApp.appliedDate },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-gray-500">{label}</span>
                    <span className="text-gray-700 font-medium">{value}</span>
                  </div>
                ))}
              </div>

              {/* Feedback */}
              {selectedApp.feedback && (
                <div className="mb-5 p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">Recruiter Note</p>
                  <p className="text-xs text-gray-600 leading-relaxed">{selectedApp.feedback}</p>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-2">
                <button
                  onClick={() => showToast(`Opening ${selectedApp.company} job posting…`)}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-full text-sm transition-colors"
                >
                  <ExternalLink size={13} /> View Job Posting
                </button>
                {!closedStatuses.includes(selectedApp.status) && (
                  <button
                    onClick={() => withdraw(selectedApp.id)}
                    className="w-full flex items-center justify-center gap-2 border border-gray-200 dark:border-white/10 text-gray-600 hover:border-red-300 hover:text-red-600 font-medium py-2.5 rounded-full text-sm transition-colors"
                  >
                    <X size={13} /> Withdraw Application
                  </button>
                )}
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
