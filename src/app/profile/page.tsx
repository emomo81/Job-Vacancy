"use client";
import Link from "next/link";
import { useState } from "react";
import { Bell, ChevronDown, Pencil, Plus, Upload, Check, ExternalLink, Trash2 } from "lucide-react";

const skills = ["Node.js", "TypeScript", "MongoDB", "React", "GraphQL", "Docker"];

const workExperience = [
  {
    company: "TechCorp",
    role: "Senior Backend Engineer",
    period: "Jun 2022 – Present",
    desc: "Led backend serving a SaaS platform serving 500k+ users. Designed and maintained REST APIs built with Node.js using Fastify and TypeORM.",
  },
];

function CandidateNav() {
  return (
    <nav className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">R</span>
          </div>
          <span className="text-gray-900 font-bold text-lg tracking-tight">Rankr</span>
        </Link>
        <div className="flex items-center gap-1">
          {[
            { label: "Browse Jobs", href: "/results" },
            { label: "My Profile", href: "/profile" },
            { label: "My Applications", href: "#" },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                l.href === "/profile" ? "bg-gray-100 text-gray-900" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-blue-600 rounded-full" />
        </button>
        <button className="flex items-center gap-2 pl-3 pr-2 py-2 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-semibold">J</span>
          </div>
          <span className="text-sm font-medium text-gray-700">Jordan Reeves</span>
          <ChevronDown size={14} className="text-gray-400" />
        </button>
      </div>
    </nav>
  );
}

export default function ProfilePage() {
  const [editingBasic, setEditingBasic] = useState(false);
  const [name, setName] = useState("Jordan Reeves");
  const [title, setTitle] = useState("Senior Backend Engineer");
  const [location, setLocation] = useState("San Francisco, CA");
  const [years, setYears] = useState("7 yrs");
  const [linkedin, setLinkedin] = useState("linkedin.com/in/jordanreeves");
  const [cvUploaded, setCvUploaded] = useState(true);
  const completion = 75;

  return (
    <div className="min-h-screen bg-[#F0F4F8]">
      <CandidateNav />

      {/* Dark hero banner */}
      <div className="bg-[#0A0A0F] px-6 py-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Your Profile <span className="text-2xl">🔥</span>
            </h1>
            <p className="text-gray-400 text-sm">Help recruiters find the right version of you.</p>
          </div>
          {/* Completion ring */}
          <div className="hidden lg:flex items-center gap-3">
            <svg width="72" height="72" viewBox="0 0 72 72">
              <circle cx="36" cy="36" r="30" fill="none" stroke="#ffffff10" strokeWidth="6" />
              <circle
                cx="36" cy="36" r="30"
                fill="none" stroke="#2563EB" strokeWidth="6"
                strokeDasharray={`${2 * Math.PI * 30 * completion / 100} ${2 * Math.PI * 30}`}
                strokeLinecap="round"
                transform="rotate(-90 36 36)"
              />
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
        {/* ── Left sidebar ─────────────────────────────── */}
        <aside className="hidden lg:block w-56 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
            {/* Avatar */}
            <div className="flex flex-col items-center text-center mb-4">
              <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold mb-3">JR</div>
              <p className="font-semibold text-gray-900 text-sm">{name}</p>
              <p className="text-xs text-gray-400 mt-0.5">{title}</p>
            </div>

            {/* Profile completion bar */}
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
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Availability</p>
            <div className="flex gap-2 mb-4">
              <button className="flex-1 bg-blue-600 text-white text-xs font-medium py-1.5 rounded-lg">Open to Work</button>
              <button className="flex-1 border border-gray-200 text-gray-500 text-xs font-medium py-1.5 rounded-lg hover:border-gray-300">Not Available</button>
            </div>
            <p className="text-xs text-gray-400 mb-1">Profile 75% complete — add work experience in 2015</p>
            <div className="flex gap-1.5">
              <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md">Remote</span>
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md">Full-time</span>
            </div>
          </div>
        </aside>

        {/* ── Main content ─────────────────────────────── */}
        <div className="flex-1 space-y-5">
          {/* Basic Information */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-gray-900">Basic Information</h2>
              <button
                onClick={() => setEditingBasic(!editingBasic)}
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
                  {editingBasic ? (
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => set(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  ) : (
                    <p className="text-sm text-gray-700 border border-transparent px-3 py-2.5">{value}</p>
                  )}
                </div>
              ))}
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1">LinkedIn URL</label>
                {editingBasic ? (
                  <input
                    type="text"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                ) : (
                  <a href="#" className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline px-3 py-2.5">
                    <ExternalLink size={12} /> {linkedin}
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">Skills</h2>
              <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 hover:border-gray-300 px-3 py-1.5 rounded-lg transition-colors">
                <Pencil size={12} /> Edit
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.map((s) => (
                <span key={s} className="bg-blue-50 text-blue-700 text-sm font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  {s}
                  <button className="text-blue-400 hover:text-blue-600 leading-none">×</button>
                </span>
              ))}
              <button className="flex items-center gap-1.5 border border-dashed border-gray-300 text-gray-400 hover:border-gray-400 hover:text-gray-500 text-sm px-3 py-1.5 rounded-full transition-colors">
                <Plus size={13} /> Add skill
              </button>
            </div>
          </div>

          {/* Upload CV */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
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
                  <span className="text-xs text-green-600 font-medium bg-green-100 px-2.5 py-1 rounded-full">Uploaded</span>
                  <button onClick={() => setCvUploaded(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => setCvUploaded(true)}
                className="border-2 border-dashed border-gray-200 hover:border-blue-300 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors"
              >
                <Upload size={24} className="text-gray-400 mb-3" />
                <p className="text-sm font-medium text-gray-600 mb-1">Upload your CV</p>
                <p className="text-xs text-gray-400">PDF up to 10MB</p>
              </div>
            )}
          </div>

          {/* Work Experience */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-gray-900">Work Experience</h2>
              <button className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium">
                <Plus size={13} /> Add Experience
              </button>
            </div>
            {workExperience.map((exp, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-gray-500 font-bold text-xs">TC</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{exp.role}</p>
                      <p className="text-xs text-gray-500">{exp.company} · {exp.period}</p>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                      <Pencil size={13} />
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed mt-2">{exp.desc}</p>
                </div>
              </div>
            ))}
            <button className="mt-4 flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors">
              <Plus size={14} /> Add another experience
            </button>
          </div>

          {/* Education */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-gray-900">Education</h2>
              <button className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium">
                <Plus size={13} /> Add Education
              </button>
            </div>
            <div className="flex gap-4">
              <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-gray-500 font-bold text-xs">UC</span>
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Bachelor&apos;s in Computer Science</p>
                    <p className="text-xs text-gray-500">UC Berkeley · 2014 – 2018</p>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
                    <Pencil size={13} />
                  </button>
                </div>
              </div>
            </div>
            <button className="mt-4 flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors">
              <Plus size={14} /> Add another education entry
            </button>
          </div>

          {/* Save buttons */}
          <div className="flex items-center justify-end gap-3 pb-8">
            <button className="border border-gray-200 text-gray-600 hover:border-gray-300 font-medium px-5 py-2.5 rounded-full text-sm transition-colors">
              Save Draft
            </button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-full text-sm transition-colors">
              Save Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
