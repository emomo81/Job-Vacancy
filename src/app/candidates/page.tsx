"use client";
import Link from "next/link";
import { useState, useRef } from "react";
import { Upload, ArrowRight, ArrowLeft, Plus, X, FileText } from "lucide-react";
import RecruiterNav from "@/components/RecruiterNav";
import Stepper from "@/components/Stepper";

const STEPS = [
  { label: "Create Job" },
  { label: "Add Candidates" },
  { label: "AI Screening" },
];

const rankrProfiles = [
  { name: "Amanda Bell", role: "Senior UX Designer", tags: ["Design", "Research"], color: "bg-purple-500" },
  { name: "Leon Miller", role: "Backend Engineer", tags: ["Node.js", "AWS"], color: "bg-blue-500" },
  { name: "James Park", role: "Product Manager", tags: ["Analytics", "Strategy"], color: "bg-green-500" },
];

export default function CandidatesPage() {
  const [imported, setImported] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>(["applicants_batch_1.zip"]);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function toggleImport(name: string) {
    setImported((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files).map((f) => f.name);
    setUploadedFiles((prev) => [...prev, ...files]);
  }

  const totalCandidates = imported.length + uploadedFiles.length * 5; // mock count

  return (
    <div className="min-h-screen bg-[#F0F4F8] dark:bg-[#0f1117]">
      <RecruiterNav />

      {/* Dark hero banner */}
      <div className="bg-[#0A0A0F] px-6 py-10">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-1">Add Candidates</h1>
          <p className="text-gray-400 text-sm">Import from Rankr's talent pool or upload CV files directly</p>
        </div>
      </div>

      {/* Stepper */}
      <div className="bg-white dark:bg-[#0f1117] border-b border-gray-100 dark:border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Stepper steps={STEPS} current={1} />
          <div className="hidden md:flex items-center gap-1.5 text-xs text-gray-500">
            <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
              <span className="text-gray-400 text-xs">?</span>
            </div>
            AI Screening
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <h2 className="text-lg font-bold text-gray-900 mb-6">Candidate Sources</h2>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Import Talent Profiles */}
          <div className="bg-white dark:bg-[#1a1d27] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Import Talent Profiles</h3>
                <p className="text-xs text-gray-400 mt-0.5">Choose candidates from Rankr&apos;s talent pool</p>
              </div>
              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">Rankr Database</span>
            </div>

            <p className="text-xs text-gray-400 uppercase tracking-widest font-medium mb-3">RANKED PROFILES</p>

            <div className="space-y-3">
              {rankrProfiles.map((p) => {
                const isSelected = imported.includes(p.name);
                return (
                  <div
                    key={p.name}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected ? "border-blue-200 bg-blue-50" : "border-gray-100 hover:border-gray-200 bg-gray-50"
                    }`}
                    onClick={() => toggleImport(p.name)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full ${p.color} flex items-center justify-center text-white text-sm font-semibold flex-shrink-0`}>
                        {p.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{p.name}</p>
                        <p className="text-xs text-gray-500">{p.role}</p>
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      {p.tags.map((t) => (
                        <span key={t} className="text-xs bg-white border border-gray-200 text-gray-500 px-2 py-0.5 rounded-md">{t}</span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="mt-4 text-xs text-gray-400">{imported.length} of 12 profiles selected</p>
          </div>

          {/* Upload Applicants */}
          <div className="bg-white dark:bg-[#1a1d27] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Upload Applicants</h3>
                <p className="text-xs text-gray-400 mt-0.5">Drag and drop or upload PDF resumes from external job boards</p>
              </div>
              <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">External Upload</span>
            </div>

            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors mb-4 ${
                dragging ? "border-blue-400 bg-blue-50" : "border-gray-200 hover:border-gray-300 bg-gray-50"
              }`}
            >
              <Upload size={24} className="text-gray-400 mb-3" />
              <p className="text-sm font-medium text-gray-600 mb-1">Drop PDF resumes here</p>
              <p className="text-xs text-gray-400">or click to browse files</p>
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.zip"
                multiple
                className="hidden"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []).map((f) => f.name);
                  setUploadedFiles((prev) => [...prev, ...files]);
                }}
              />
            </div>

            <p className="text-xs text-gray-400 uppercase tracking-widest font-medium mb-3">UPLOADED FILES</p>

            <div className="space-y-2">
              {uploadedFiles.map((f, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-2">
                    <FileText size={15} className="text-gray-400" />
                    <span className="text-sm text-gray-700">{f}</span>
                  </div>
                  <button
                    onClick={() => setUploadedFiles((prev) => prev.filter((_, j) => j !== i))}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>

            <p className="mt-4 text-xs text-gray-400">{uploadedFiles.length} file{uploadedFiles.length !== 1 ? "s" : ""} uploaded</p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="bg-white dark:bg-[#1a1d27] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">Total candidates for this role:</span>
            <span className="text-2xl font-bold text-gray-900">{totalCandidates}</span>
            <div className="flex gap-2">
              <span className="text-xs bg-blue-50 text-blue-600 font-medium px-2.5 py-1 rounded-full">
                {imported.length} Rankr
              </span>
              <span className="text-xs bg-gray-100 text-gray-600 font-medium px-2.5 py-1 rounded-full">
                {uploadedFiles.length * 5} External
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 border border-gray-200 text-gray-600 hover:border-gray-300 font-medium px-5 py-2.5 rounded-full text-sm transition-colors"
            >
              <ArrowLeft size={14} />
              Back
            </Link>
            <Link
              href="/screening"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-full text-sm transition-colors"
            >
              Screen Candidates
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
