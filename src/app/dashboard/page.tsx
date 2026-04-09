"use client";
import Link from "next/link";
import { useState } from "react";
import { Minus, Plus, ArrowRight, Save } from "lucide-react";
import RecruiterNav from "@/components/RecruiterNav";
import Stepper from "@/components/Stepper";

const STEPS = [
  { label: "Create Job" },
  { label: "Add Candidates" },
  { label: "AI Screening" },
];

const departments = ["Engineering", "Design", "Product", "Marketing", "Sales", "Operations", "Finance", "HR"];
const educationOptions = ["Any", "High School", "Bachelor's Degree", "Master's Degree", "PhD"];
const skillOptions = ["React", "TypeScript", "Node.js", "Python", "AWS", "GraphQL", "PostgreSQL", "Docker", "Figma", "TailwindCSS"];

type Tag = string;

export default function DashboardPage() {
  const [expLevel, setExpLevel] = useState<string>("Intermediate");
  const [empType, setEmpType] = useState<string>("Full-Time");
  const [skills, setSkills] = useState<Tag[]>(["React", "TypeScript"]);
  const [skillInput, setSkillInput] = useState("");
  const [showSkillDrop, setShowSkillDrop] = useState(false);
  const [yearsMin, setYearsMin] = useState(3);
  const [yearsMax, setYearsMax] = useState(7);

  function addSkill(s: string) {
    if (s && !skills.includes(s)) setSkills([...skills, s]);
    setSkillInput("");
    setShowSkillDrop(false);
  }

  function removeSkill(s: string) {
    setSkills(skills.filter((x) => x !== s));
  }

  const filtered = skillOptions.filter(
    (s) => s.toLowerCase().includes(skillInput.toLowerCase()) && !skills.includes(s)
  );

  return (
    <div className="min-h-screen bg-[#F0F4F8]">
      <RecruiterNav />

      {/* Dark hero banner */}
      <div className="bg-[#0A0A0F] px-6 py-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Post a New Job</h1>
            <p className="text-gray-400 text-sm">Define requirements and let AI find the best candidates</p>
          </div>
        </div>
      </div>

      {/* Stepper */}
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <Stepper steps={STEPS} current={0} />
        </div>
      </div>

      {/* Form */}
      <div className="max-w-3xl mx-auto px-6 py-10">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Job Details</h2>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-7">
          {/* Job Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Job Title</label>
            <input
              type="text"
              placeholder="e.g. Senior Frontend Engineer"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          {/* Department */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Department</label>
            <select className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition appearance-none bg-white">
              <option value="">Select department</option>
              {departments.map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>

          {/* Experience Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Experience Level</label>
            <div className="flex gap-2">
              {["Entry Level", "Intermediate", "Expert"].map((l) => (
                <button
                  key={l}
                  onClick={() => setExpLevel(l)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                    expLevel === l
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "border-gray-200 text-gray-600 hover:border-gray-300 bg-white"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Employment Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Employment Type</label>
            <div className="flex gap-2 flex-wrap">
              {["Full-Time", "Part-Time", "Contract", "Remote"].map((t) => (
                <button
                  key={t}
                  onClick={() => setEmpType(t)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                    empType === t
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "border-gray-200 text-gray-600 hover:border-gray-300 bg-white"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Required Skills */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Required Skills</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {skills.map((s) => (
                <span
                  key={s}
                  className="flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full"
                >
                  {s}
                  <button onClick={() => removeSkill(s)} className="text-blue-400 hover:text-blue-600 leading-none">×</button>
                </span>
              ))}
            </div>
            <div className="relative">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => { setSkillInput(e.target.value); setShowSkillDrop(true); }}
                onFocus={() => setShowSkillDrop(true)}
                onBlur={() => setTimeout(() => setShowSkillDrop(false), 150)}
                onKeyDown={(e) => { if (e.key === "Enter") addSkill(skillInput); }}
                placeholder="Add a skill..."
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
              {showSkillDrop && filtered.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-gray-200 shadow-lg z-10 overflow-hidden">
                  {filtered.slice(0, 6).map((s) => (
                    <button
                      key={s}
                      onMouseDown={() => addSkill(s)}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Years of Experience + Education */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setYearsMin(Math.max(0, yearsMin - 1))}
                  className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <Minus size={13} />
                </button>
                <span className="text-lg font-bold text-gray-900 min-w-[1.5rem] text-center">{yearsMin}</span>
                <span className="text-gray-400 text-sm">to</span>
                <span className="text-lg font-bold text-gray-900 min-w-[1.5rem] text-center">{yearsMax}</span>
                <button
                  onClick={() => setYearsMax(yearsMax + 1)}
                  className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <Plus size={13} />
                </button>
                <span className="text-gray-400 text-xs ml-1">years</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Education Requirement</label>
              <select className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition appearance-none bg-white">
                {educationOptions.map((e) => <option key={e}>{e}</option>)}
              </select>
            </div>
          </div>

          {/* Job Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Job Description</label>
            <textarea
              rows={4}
              placeholder="Describe the role, responsibilities, and team environment..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
            />
          </div>

          {/* Nice to Have */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Nice to Have <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              rows={2}
              placeholder="Bonus skills, certifications or experiences..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <button className="flex items-center gap-2 border border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-700 font-medium px-5 py-2.5 rounded-full text-sm transition-colors">
              <Save size={14} />
              Save Draft
            </button>
            <Link
              href="/candidates"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-full text-sm transition-colors"
            >
              Next: Add Candidates
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
