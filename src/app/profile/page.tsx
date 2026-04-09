"use client";
import { useState, useRef, useCallback } from "react";
import { Pencil, Plus, Upload, Check, ExternalLink, Trash2, X } from "lucide-react";
import CandidateNav from "@/components/CandidateNav";
import Toast from "@/components/Toast";

/* ── Initial data ──────────────────────────────────────────── */
const initialSkills = ["Node.js", "TypeScript", "MongoDB", "React", "GraphQL", "Docker"];

const initialExp = [
  {
    id: 1,
    company: "TechCorp",
    initials: "TC",
    role: "Senior Backend Engineer",
    period: "Jun 2022 – Present",
    desc: "Led backend serving a SaaS platform serving 500k+ users. Designed and maintained REST APIs built with Node.js using Fastify and TypeORM.",
  },
];

const initialEdu = [
  {
    id: 1,
    institution: "UC Berkeley",
    initials: "UC",
    degree: "Bachelor's in Computer Science",
    period: "2014 – 2018",
  },
];

const blankExp = { id: 0, company: "", initials: "", role: "", period: "", desc: "" };
const blankEdu = { id: 0, institution: "", initials: "", degree: "", period: "" };

export default function ProfilePage() {
  /* Basic info */
  const [editingBasic, setEditingBasic] = useState(false);
  const [name, setName]         = useState("Jordan Reeves");
  const [title, setTitle]       = useState("Senior Backend Engineer");
  const [location, setLocation] = useState("San Francisco, CA");
  const [years, setYears]       = useState("7 yrs");
  const [linkedin, setLinkedin] = useState("linkedin.com/in/jordanreeves");

  /* Skills */
  const [skills, setSkills]         = useState(initialSkills);
  const [editingSkills, setEditingSkills] = useState(false);
  const [newSkill, setNewSkill]     = useState("");

  /* CV */
  const [cvUploaded, setCvUploaded] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);

  /* Work experience */
  const [exp, setExp]           = useState(initialExp);
  const [editingExp, setEditingExp] = useState<number | null>(null);   // id being edited, or -1 = new
  const [expDraft, setExpDraft] = useState({ ...blankExp });

  /* Education */
  const [edu, setEdu]           = useState(initialEdu);
  const [editingEdu, setEditingEdu] = useState<number | null>(null);
  const [eduDraft, setEduDraft] = useState({ ...blankEdu });

  /* Availability */
  const [availability, setAvailability] = useState<"open" | "closed">("open");

  /* Toast */
  const [toast, setToast] = useState("");
  const showToast = useCallback((msg: string) => { setToast(""); setTimeout(() => setToast(msg), 10); }, []);

  const completion = 75;

  /* ── Skill helpers ── */
  function removeSkill(s: string) { setSkills((prev) => prev.filter((x) => x !== s)); }
  function addSkill() {
    const trimmed = newSkill.trim();
    if (trimmed && !skills.includes(trimmed)) setSkills((prev) => [...prev, trimmed]);
    setNewSkill("");
  }

  /* ── Experience helpers ── */
  function startAddExp() { setExpDraft({ ...blankExp, id: Date.now() }); setEditingExp(-1); }
  function startEditExp(e: typeof initialExp[0]) { setExpDraft({ ...e }); setEditingExp(e.id); }
  function saveExp() {
    if (!expDraft.role || !expDraft.company) return;
    if (editingExp === -1) {
      setExp((prev) => [...prev, { ...expDraft, initials: expDraft.company.slice(0, 2).toUpperCase() }]);
    } else {
      setExp((prev) => prev.map((x) => x.id === editingExp ? { ...expDraft, initials: expDraft.company.slice(0, 2).toUpperCase() } : x));
    }
    setEditingExp(null);
  }
  function deleteExp(id: number) { setExp((prev) => prev.filter((x) => x.id !== id)); }

  /* ── Education helpers ── */
  function startAddEdu() { setEduDraft({ ...blankEdu, id: Date.now() }); setEditingEdu(-1); }
  function startEditEdu(e: typeof initialEdu[0]) { setEduDraft({ ...e }); setEditingEdu(e.id); }
  function saveEdu() {
    if (!eduDraft.degree || !eduDraft.institution) return;
    if (editingEdu === -1) {
      setEdu((prev) => [...prev, { ...eduDraft, initials: eduDraft.institution.slice(0, 2).toUpperCase() }]);
    } else {
      setEdu((prev) => prev.map((x) => x.id === editingEdu ? { ...eduDraft, initials: eduDraft.institution.slice(0, 2).toUpperCase() } : x));
    }
    setEditingEdu(null);
  }
  function deleteEdu(id: number) { setEdu((prev) => prev.filter((x) => x.id !== id)); }

  const inputCls = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition";

  return (
    <div className="min-h-screen bg-[#F0F4F8] dark:bg-[#0f1117]">
      <CandidateNav />
      <Toast message={toast} onDone={() => setToast("")} />

      {/* Hero */}
      <div className="bg-[#0A0A0F] px-6 py-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Your Profile</h1>
            <p className="text-gray-400 text-sm">Help recruiters find the right version of you</p>
          </div>
          <div className="hidden lg:flex items-center gap-3">
            <svg width="72" height="72" viewBox="0 0 72 72">
              <circle cx="36" cy="36" r="30" fill="none" stroke="#ffffff10" strokeWidth="6" />
              <circle cx="36" cy="36" r="30" fill="none" stroke="#2563EB" strokeWidth="6"
                strokeDasharray={`${2 * Math.PI * 30 * completion / 100} ${2 * Math.PI * 30}`}
                strokeLinecap="round" transform="rotate(-90 36 36)" />
              <text x="36" y="41" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">{completion}%</text>
            </svg>
            <div>
              <p className="text-white font-semibold text-sm">Profile {completion}%</p>
              <p className="text-gray-400 text-xs">Complete</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 flex gap-6">
        {/* ── Sidebar ── */}
        <aside className="hidden lg:block w-56 flex-shrink-0">
          <div className="bg-white dark:bg-[#1a1d27] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm p-5 mb-4">
            <div className="flex flex-col items-center text-center mb-4">
              <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold mb-3">JR</div>
              <p className="font-semibold text-gray-900 text-sm">{name}</p>
              <p className="text-xs text-gray-400 mt-0.5">{title}</p>
            </div>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500">Profile Completion</span>
                <span className="text-xs font-semibold text-blue-600">{completion}%</span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: `${completion}%` }} />
              </div>
            </div>
            <div className="space-y-1.5">
              {["Basic Information", "Skills", "Work Experience", "Upload CV", "Education"].map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Check size={9} className="text-green-600" />
                  </div>
                  <span className="text-xs text-gray-600">{s}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Availability */}
          <div className="bg-white dark:bg-[#1a1d27] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm p-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Availability</p>
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setAvailability("open")}
                className={`flex-1 text-xs font-medium py-1.5 rounded-lg transition-colors ${availability === "open" ? "bg-blue-600 text-white" : "border border-gray-200 text-gray-500 hover:border-gray-300"}`}
              >Open to Work</button>
              <button
                onClick={() => setAvailability("closed")}
                className={`flex-1 text-xs font-medium py-1.5 rounded-lg transition-colors ${availability === "closed" ? "bg-gray-800 text-white" : "border border-gray-200 text-gray-500 hover:border-gray-300"}`}
              >Not Available</button>
            </div>
            <p className="text-xs text-gray-400 mb-1">
              {availability === "open" ? "Visible to recruiters" : "Hidden from recruiters"}
            </p>
            <div className="flex gap-1.5">
              <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md">Remote</span>
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md">Full-time</span>
            </div>
          </div>
        </aside>

        {/* ── Main ── */}
        <div className="flex-1 space-y-5">

          {/* Basic Information */}
          <div className="bg-white dark:bg-[#1a1d27] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-gray-900">Basic Information</h2>
              <button
                onClick={() => { if (editingBasic) showToast("Basic info saved"); setEditingBasic(!editingBasic); }}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 hover:border-gray-300 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Pencil size={12} /> {editingBasic ? "Save" : "Edit"}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-5">
              {[
                { label: "Full Name", value: name, set: setName },
                { label: "Professional Title", value: title, set: setTitle },
                { label: "Location", value: location, set: setLocation },
                { label: "Years of Experience", value: years, set: setYears },
              ].map(({ label, value, set }) => (
                <div key={label}>
                  <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
                  {editingBasic
                    ? <input type="text" value={value} onChange={(e) => set(e.target.value)} className={inputCls} />
                    : <p className="text-sm text-gray-700 border border-transparent px-3 py-2.5">{value}</p>}
                </div>
              ))}
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1">LinkedIn URL</label>
                {editingBasic
                  ? <input type="text" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} className={inputCls} />
                  : <a href={`https://${linkedin}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline px-3 py-2.5">
                      <ExternalLink size={12} /> {linkedin}
                    </a>}
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="bg-white dark:bg-[#1a1d27] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">Skills</h2>
              <button
                onClick={() => setEditingSkills(!editingSkills)}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 hover:border-gray-300 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Pencil size={12} /> {editingSkills ? "Done" : "Edit"}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.map((s) => (
                <span key={s} className="bg-blue-50 text-blue-700 text-sm font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  {s}
                  {editingSkills && (
                    <button onClick={() => removeSkill(s)} className="text-blue-400 hover:text-red-500 leading-none transition-colors">×</button>
                  )}
                </span>
              ))}
              {editingSkills && (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addSkill()}
                    placeholder="New skill…"
                    className="border border-dashed border-gray-300 rounded-full px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:border-blue-400 w-32"
                  />
                  <button onClick={addSkill} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium border border-blue-200 px-3 py-1.5 rounded-full transition-colors">
                    <Plus size={12} /> Add
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Upload CV */}
          <div className="bg-white dark:bg-[#1a1d27] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-4">Upload Your CV</h2>
            {cvUploaded ? (
              <div className="flex items-center justify-between p-4 bg-green-50 border border-green-100 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center">
                    <Check size={16} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Jordan_Reeves_CV.pdf</p>
                    <p className="text-xs text-gray-400">Uploaded</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium border border-blue-200 px-2.5 py-1 rounded-full transition-colors"
                  >Replace</button>
                  <button onClick={() => setCvUploaded(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-gray-200 hover:border-blue-300 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors"
              >
                <Upload size={24} className="text-gray-400 mb-3" />
                <p className="text-sm font-medium text-gray-600 mb-1">Upload your CV</p>
                <p className="text-xs text-gray-400">PDF up to 10MB</p>
              </div>
            )}
            <input
              ref={fileRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => { if (e.target.files?.length) setCvUploaded(true); }}
            />
          </div>

          {/* Work Experience */}
          <div className="bg-white dark:bg-[#1a1d27] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-gray-900">Work Experience</h2>
              <button onClick={startAddExp} className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium">
                <Plus size={13} /> Add Experience
              </button>
            </div>

            <div className="space-y-5">
              {exp.map((e) => (
                <div key={e.id}>
                  {editingExp === e.id ? (
                    /* Inline edit form */
                    <div className="border border-blue-200 rounded-xl p-4 space-y-3 bg-blue-50/50 dark:bg-blue-500/5">
                      <div className="grid grid-cols-2 gap-3">
                        <div><label className="text-xs text-gray-500 mb-1 block">Role</label>
                          <input className={inputCls} value={expDraft.role} onChange={(ev) => setExpDraft(d => ({ ...d, role: ev.target.value }))} placeholder="Job title" /></div>
                        <div><label className="text-xs text-gray-500 mb-1 block">Company</label>
                          <input className={inputCls} value={expDraft.company} onChange={(ev) => setExpDraft(d => ({ ...d, company: ev.target.value }))} placeholder="Company name" /></div>
                        <div className="col-span-2"><label className="text-xs text-gray-500 mb-1 block">Period</label>
                          <input className={inputCls} value={expDraft.period} onChange={(ev) => setExpDraft(d => ({ ...d, period: ev.target.value }))} placeholder="e.g. Jan 2022 – Present" /></div>
                        <div className="col-span-2"><label className="text-xs text-gray-500 mb-1 block">Description</label>
                          <textarea rows={3} className={inputCls + " resize-none"} value={expDraft.desc} onChange={(ev) => setExpDraft(d => ({ ...d, desc: ev.target.value }))} placeholder="What did you do?" /></div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={saveExp} className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"><Check size={12} /> Save</button>
                        <button onClick={() => setEditingExp(null)} className="flex items-center gap-1.5 border border-gray-200 text-gray-600 text-xs font-medium px-4 py-2 rounded-lg transition-colors"><X size={12} /> Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-4">
                      <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-gray-500 font-bold text-xs">{e.initials}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{e.role}</p>
                            <p className="text-xs text-gray-500">{e.company} · {e.period}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <button onClick={() => startEditExp(e)} className="text-gray-400 hover:text-gray-600 p-1 transition-colors"><Pencil size={13} /></button>
                            <button onClick={() => deleteExp(e.id)} className="text-gray-400 hover:text-red-500 p-1 transition-colors"><Trash2 size={13} /></button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 leading-relaxed mt-2">{e.desc}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* New experience form */}
              {editingExp === -1 && (
                <div className="border border-blue-200 rounded-xl p-4 space-y-3 bg-blue-50/50 dark:bg-blue-500/5">
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-xs text-gray-500 mb-1 block">Role</label>
                      <input className={inputCls} value={expDraft.role} onChange={(e) => setExpDraft(d => ({ ...d, role: e.target.value }))} placeholder="Job title" /></div>
                    <div><label className="text-xs text-gray-500 mb-1 block">Company</label>
                      <input className={inputCls} value={expDraft.company} onChange={(e) => setExpDraft(d => ({ ...d, company: e.target.value }))} placeholder="Company name" /></div>
                    <div className="col-span-2"><label className="text-xs text-gray-500 mb-1 block">Period</label>
                      <input className={inputCls} value={expDraft.period} onChange={(e) => setExpDraft(d => ({ ...d, period: e.target.value }))} placeholder="e.g. Jan 2022 – Present" /></div>
                    <div className="col-span-2"><label className="text-xs text-gray-500 mb-1 block">Description</label>
                      <textarea rows={3} className={inputCls + " resize-none"} value={expDraft.desc} onChange={(e) => setExpDraft(d => ({ ...d, desc: e.target.value }))} placeholder="What did you do?" /></div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={saveExp} className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"><Check size={12} /> Save</button>
                    <button onClick={() => setEditingExp(null)} className="flex items-center gap-1.5 border border-gray-200 text-gray-600 text-xs font-medium px-4 py-2 rounded-lg transition-colors"><X size={12} /> Cancel</button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Education */}
          <div className="bg-white dark:bg-[#1a1d27] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-gray-900">Education</h2>
              <button onClick={startAddEdu} className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium">
                <Plus size={13} /> Add Education
              </button>
            </div>

            <div className="space-y-5">
              {edu.map((e) => (
                <div key={e.id}>
                  {editingEdu === e.id ? (
                    <div className="border border-blue-200 rounded-xl p-4 space-y-3 bg-blue-50/50 dark:bg-blue-500/5">
                      <div className="grid grid-cols-2 gap-3">
                        <div><label className="text-xs text-gray-500 mb-1 block">Degree</label>
                          <input className={inputCls} value={eduDraft.degree} onChange={(ev) => setEduDraft(d => ({ ...d, degree: ev.target.value }))} placeholder="e.g. BSc Computer Science" /></div>
                        <div><label className="text-xs text-gray-500 mb-1 block">Institution</label>
                          <input className={inputCls} value={eduDraft.institution} onChange={(ev) => setEduDraft(d => ({ ...d, institution: ev.target.value }))} placeholder="University name" /></div>
                        <div className="col-span-2"><label className="text-xs text-gray-500 mb-1 block">Period</label>
                          <input className={inputCls} value={eduDraft.period} onChange={(ev) => setEduDraft(d => ({ ...d, period: ev.target.value }))} placeholder="e.g. 2014 – 2018" /></div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={saveEdu} className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"><Check size={12} /> Save</button>
                        <button onClick={() => setEditingEdu(null)} className="flex items-center gap-1.5 border border-gray-200 text-gray-600 text-xs font-medium px-4 py-2 rounded-lg transition-colors"><X size={12} /> Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-4">
                      <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-gray-500 font-bold text-xs">{e.initials}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{e.degree}</p>
                            <p className="text-xs text-gray-500">{e.institution} · {e.period}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <button onClick={() => startEditEdu(e)} className="text-gray-400 hover:text-gray-600 p-1 transition-colors"><Pencil size={13} /></button>
                            <button onClick={() => deleteEdu(e.id)} className="text-gray-400 hover:text-red-500 p-1 transition-colors"><Trash2 size={13} /></button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {editingEdu === -1 && (
                <div className="border border-blue-200 rounded-xl p-4 space-y-3 bg-blue-50/50 dark:bg-blue-500/5">
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-xs text-gray-500 mb-1 block">Degree</label>
                      <input className={inputCls} value={eduDraft.degree} onChange={(e) => setEduDraft(d => ({ ...d, degree: e.target.value }))} placeholder="e.g. BSc Computer Science" /></div>
                    <div><label className="text-xs text-gray-500 mb-1 block">Institution</label>
                      <input className={inputCls} value={eduDraft.institution} onChange={(e) => setEduDraft(d => ({ ...d, institution: e.target.value }))} placeholder="University name" /></div>
                    <div className="col-span-2"><label className="text-xs text-gray-500 mb-1 block">Period</label>
                      <input className={inputCls} value={eduDraft.period} onChange={(e) => setEduDraft(d => ({ ...d, period: e.target.value }))} placeholder="e.g. 2014 – 2018" /></div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={saveEdu} className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"><Check size={12} /> Save</button>
                    <button onClick={() => setEditingEdu(null)} className="flex items-center gap-1.5 border border-gray-200 text-gray-600 text-xs font-medium px-4 py-2 rounded-lg transition-colors"><X size={12} /> Cancel</button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Save buttons */}
          <div className="flex items-center justify-end gap-3 pb-8">
            <button
              onClick={() => showToast("Draft saved")}
              className="border border-gray-200 text-gray-600 hover:border-gray-300 font-medium px-5 py-2.5 rounded-full text-sm transition-colors"
            >Save Draft</button>
            <button
              onClick={() => showToast("Profile saved successfully")}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-full text-sm transition-colors"
            >Save Profile</button>
          </div>
        </div>
      </div>
    </div>
  );
}
