'use client'

import React, { useState, useRef, useEffect } from 'react'
import {
  MapPin, Upload, FileText,
  Plus, X, Briefcase, Check,
  ExternalLink, Minus, Sparkles, Phone, MessageCircle, Mail, Award, Camera
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { apiFetch } from '../../../utils/api-client'
import { useToast } from '../../components/ui/Toast'

interface Experience {
  id: string;
  role: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string;
  technologies: string[];
  isCurrent: boolean;
}

interface Language {
  id: string;
  name: string;
  proficiency: 'Basic' | 'Conversational' | 'Fluent' | 'Native';
}

interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  imageUrl: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  role: string;
  link: string;
  startDate: string;
  endDate: string;
}

const PROFICIENCY_LEVELS = ['Basic', 'Conversational', 'Fluent', 'Native'] as const
const PROFICIENCY_COLORS: Record<string, string> = {
  Basic: 'bg-[#fef3c7] text-[#92400e]',
  Conversational: 'bg-[#e0f2fe] text-[#0369a1]',
  Fluent: 'bg-[#dcfce7] text-[#166534]',
  Native: 'bg-[#ede9fe] text-[#6b21a8]',
}

const COMMON_LANGUAGES = [
  'English', 'French', 'Spanish', 'Arabic', 'Portuguese', 'German',
  'Chinese (Mandarin)', 'Chinese (Cantonese)', 'Japanese', 'Korean',
  'Italian', 'Russian', 'Dutch', 'Swedish', 'Norwegian', 'Danish',
  'Finnish', 'Polish', 'Turkish', 'Hindi', 'Bengali', 'Urdu',
  'Swahili', 'Kinyarwanda', 'Amharic', 'Hausa', 'Igbo', 'Yoruba',
  'Zulu', 'Afrikaans', 'Somali', 'Luganda', 'Shona',
  'Vietnamese', 'Thai', 'Indonesian', 'Malay', 'Tagalog', 'Persian',
]

export default function CandidateProfilePage() {
  const { showToast } = useToast()

  // Basic info
  const [fullName, setFullName] = useState('New Candidate')
  const [proTitle, setProTitle] = useState('Product Engineer')
  const [location, setLocation] = useState('Kigali, Rwanda')
  const [yearsExp, setYearsExp] = useState(2)
  const [summary, setSummary] = useState('')
  const [linkedin, setLinkedin] = useState('')
  const [githubUrl, setGithubUrl] = useState('')
  const [portfolioUrl, setPortfolioUrl] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [skills, setSkills] = useState<string[]>(['TypeScript', 'React'])
  const [education, setEducation] = useState('')
  const [completionPct, setCompletionPct] = useState(0)
  const [avatarUrl, setAvatarUrl] = useState('')

  // Availability
  const [availability, setAvailability] = useState<'open' | 'closed'>('open')
  const [visible] = useState(true)
  const [remote, setRemote] = useState(true)
  const [fulltime, setFulltime] = useState(true)
  const [availabilityStatus, setAvailabilityStatus] = useState<'Available' | 'Open to Opportunities' | 'Not Available'>('Available')
  const [availabilityType, setAvailabilityType] = useState<'Full-time' | 'Part-time' | 'Contract'>('Full-time')

  // Work experience
  const [workHistory, setWorkHistory] = useState<Experience[]>([])
  const [isExpModalOpen, setIsExpModalOpen] = useState(false)
  const [editingExp, setEditingExp] = useState<Experience | null>(null)
  const [expTechs, setExpTechs] = useState<string[]>([])
  const [expTechInput, setExpTechInput] = useState('')
  const [expIsCurrent, setExpIsCurrent] = useState(false)

  // Languages
  const [languages, setLanguages] = useState<Language[]>([])
  const [isLangModalOpen, setIsLangModalOpen] = useState(false)
  const [editingLang, setEditingLang] = useState<Language | null>(null)
  const [langSearch, setLangSearch] = useState('')
  const [langProficiency, setLangProficiency] = useState<'Basic' | 'Conversational' | 'Fluent' | 'Native'>('Fluent')
  const [langDropdownOpen, setLangDropdownOpen] = useState(false)
  const langDropdownRef = useRef<HTMLDivElement>(null)

  // Certifications
  const [certifications, setCertifications] = useState<Certification[]>([])
  const [isCertModalOpen, setIsCertModalOpen] = useState(false)
  const [editingCert, setEditingCert] = useState<Certification | null>(null)
  const [certImageUrl, setCertImageUrl] = useState('')
  const certImageInputRef = useRef<HTMLInputElement>(null)

  // Projects
  const [projects, setProjects] = useState<Project[]>([])
  const [isProjModalOpen, setIsProjModalOpen] = useState(false)
  const [editingProj, setEditingProj] = useState<Project | null>(null)
  const [projTechs, setProjTechs] = useState<string[]>([])
  const [projTechInput, setProjTechInput] = useState('')

  const [skillInput, setSkillInput] = useState('')
  const [cvUploaded, setCvUploaded] = useState(false)
  const [cvParsing, setCvParsing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [langError, setLangError] = useState('')
  const [langSaving, setLangSaving] = useState(false)

  const cvRef = useRef<HTMLInputElement>(null)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  // Tracks last saved state for Discard
  const savedProfile = useRef({
    fullName: 'New Candidate', proTitle: 'Product Engineer', location: 'Kigali, Rwanda',
    yearsExp: 2, summary: '', linkedin: '', githubUrl: '', portfolioUrl: '',
    contactEmail: '', phone: '', whatsappNumber: '', skills: ['TypeScript', 'React'],
    education: '', avatarUrl: '', availability: 'open' as 'open' | 'closed',
    remote: true, fulltime: true,
    availabilityStatus: 'Available' as typeof availabilityStatus,
    availabilityType: 'Full-time' as typeof availabilityType,
  })

  // Close language dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target as Node)) {
        setLangDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Ensure language modal fields are populated when it opens
  useEffect(() => {
    if (!isLangModalOpen) return
    setLangSearch(editingLang?.name ?? '')
    setLangProficiency(editingLang?.proficiency ?? 'Fluent')
    setLangDropdownOpen(false)
    setLangError('')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLangModalOpen])

  useEffect(() => {
    void (async () => {
      try {
        const result = await apiFetch('/candidate/profile')
        const p = result.data
        setFullName(p.fullName || 'New Candidate')
        setProTitle(p.professionalTitle || 'Product Engineer')
        setLocation(p.location || 'Kigali, Rwanda')
        setYearsExp(Number(p.yearsExperience || 0))
        setSummary(p.summary || '')
        setLinkedin(p.linkedinUrl || '')
        setGithubUrl(p.githubUrl || '')
        setPortfolioUrl(p.portfolioUrl || '')
        setSkills(Array.isArray(p.skills) ? p.skills : [])
        setEducation(p.education || '')
        setContactEmail(p.email || '')
        setPhone(p.phone || '')
        setWhatsappNumber(p.whatsappNumber || '')
        setCompletionPct(Number(p.completionPct || 0))
        setCvUploaded(Boolean(p.cv?.uploadedAt))
        setAvatarUrl(p.avatarUrl || '')

        const loadedAvailability = p.visibility?.openToWork === false ? 'closed' : 'open'
        const loadedRemote = p.visibility?.remote ?? true
        const loadedFulltime = p.visibility?.fulltime ?? true
        const loadedStatus = p.availabilityStatus || 'Available'
        const loadedType = p.availabilityType || 'Full-time'
        setAvailability(loadedAvailability)
        setRemote(loadedRemote)
        setFulltime(loadedFulltime)
        setAvailabilityStatus(loadedStatus)
        setAvailabilityType(loadedType)

        // Snapshot for Discard
        savedProfile.current = {
          fullName: p.fullName || 'New Candidate',
          proTitle: p.professionalTitle || 'Product Engineer',
          location: p.location || 'Kigali, Rwanda',
          yearsExp: Number(p.yearsExperience || 0),
          summary: p.summary || '',
          linkedin: p.linkedinUrl || '',
          githubUrl: p.githubUrl || '',
          portfolioUrl: p.portfolioUrl || '',
          contactEmail: p.email || '',
          phone: p.phone || '',
          whatsappNumber: p.whatsappNumber || '',
          skills: Array.isArray(p.skills) ? p.skills : [],
          education: p.education || '',
          avatarUrl: p.avatarUrl || '',
          availability: loadedAvailability,
          remote: loadedRemote,
          fulltime: loadedFulltime,
          availabilityStatus: loadedStatus,
          availabilityType: loadedType,
        }

        setWorkHistory(
          (p.experiences || []).map((exp: any, idx: number) => ({
            id: String(exp._id || `exp-${idx}-${Date.now()}`),
            role: exp.role || '',
            company: exp.company || '',
            startDate: exp.startDate || '',
            endDate: exp.endDate || '',
            description: exp.description || '',
            technologies: Array.isArray(exp.technologies) ? exp.technologies : [],
            isCurrent: Boolean(exp.isCurrent),
          }))
        )
        setLanguages(
          (p.languages || []).map((l: any) => ({
            id: String(l._id),
            name: l.name || '',
            proficiency: l.proficiency || 'Fluent',
          }))
        )
        setCertifications(
          (p.certifications || []).map((c: any) => ({
            id: String(c._id),
            name: c.name || '',
            issuer: c.issuer || '',
            issueDate: c.issueDate || '',
            imageUrl: c.imageUrl || '',
          }))
        )
        setProjects(
          (p.projects || []).map((proj: any) => ({
            id: String(proj._id),
            name: proj.name || '',
            description: proj.description || '',
            technologies: Array.isArray(proj.technologies) ? proj.technologies : [],
            role: proj.role || '',
            link: proj.link || '',
            startDate: proj.startDate || '',
            endDate: proj.endDate || '',
          }))
        )
      } catch {
        const savedName = localStorage.getItem('rankr_user_name')
        if (savedName) setFullName(savedName)
      }
    })()
  }, [])

  useEffect(() => {
    let score = 0
    if (fullName.trim() && proTitle.trim() && location.trim()) score += 20
    if (skills.length >= 2) score += 20
    if (workHistory.length >= 1) score += 20
    if (education.trim()) score += 20
    if (cvUploaded) score += 20
    setCompletionPct(score)
    localStorage.setItem('rankr_profile_completion', String(score))
    window.dispatchEvent(new CustomEvent('rankr:completion-updated', { detail: { completion: score } }))
  }, [fullName, proTitle, location, skills, workHistory, education, cvUploaded])

  const handleSave = async () => {
    try {
      setSaving(true)
      setError('')
      await apiFetch('/candidate/profile', {
        method: 'PATCH',
        body: {
          fullName,
          professionalTitle: proTitle,
          location,
          yearsExperience: yearsExp,
          summary,
          linkedinUrl: linkedin,
          githubUrl,
          portfolioUrl,
          email: contactEmail,
          phone,
          whatsappNumber,
          skills,
          education,
          completionPct,
          availabilityStatus,
          availabilityType,
          avatarUrl,
          visibility: {
            openToWork: availability === 'open',
            visibleToRecruiters: visible,
            remote,
            fulltime,
          },
        },
      })
      localStorage.setItem('rankr_user_name', fullName)
      localStorage.setItem('rankr_profile_completion', completionPct.toString())
      savedProfile.current = {
        fullName, proTitle, location, yearsExp, summary, linkedin, githubUrl,
        portfolioUrl, contactEmail, phone, whatsappNumber, skills, education,
        avatarUrl, availability, remote, fulltime, availabilityStatus, availabilityType,
      }
      showToast('Profile saved successfully!', 'success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  const handleDiscard = () => {
    const s = savedProfile.current
    setFullName(s.fullName)
    setProTitle(s.proTitle)
    setLocation(s.location)
    setYearsExp(s.yearsExp)
    setSummary(s.summary)
    setLinkedin(s.linkedin)
    setGithubUrl(s.githubUrl)
    setPortfolioUrl(s.portfolioUrl)
    setContactEmail(s.contactEmail)
    setPhone(s.phone)
    setWhatsappNumber(s.whatsappNumber)
    setSkills(s.skills)
    setEducation(s.education)
    setAvatarUrl(s.avatarUrl)
    setAvailability(s.availability)
    setRemote(s.remote)
    setFulltime(s.fulltime)
    setAvailabilityStatus(s.availabilityStatus)
    setAvailabilityType(s.availabilityType)
    setError('')
    showToast('Changes discarded', 'success')
  }

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      showToast('Photo must be under 2MB', 'error')
      return
    }
    const reader = new FileReader()
    reader.onload = () => setAvatarUrl(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const formData = new FormData()
    formData.append('cv', file)
    try {
      setCvParsing(true)
      setError('')
      const result = await apiFetch('/candidate/profile/cv', {
        method: 'POST',
        isFormData: true,
        body: formData,
      })
      setCvUploaded(true)
      const parsed = result.data?.parsed
      if (parsed) {
        if (parsed.fullName) setFullName(parsed.fullName)
        if (parsed.professionalTitle) setProTitle(parsed.professionalTitle)
        if (parsed.location) setLocation(parsed.location)
        if (typeof parsed.yearsExperience === 'number') setYearsExp(parsed.yearsExperience)
        if (Array.isArray(parsed.skills) && parsed.skills.length) setSkills(parsed.skills)
        if (parsed.education) setEducation(parsed.education)
        if (parsed.summary) setSummary(parsed.summary)
        if (parsed.email) setContactEmail(parsed.email)
        if (parsed.phone) setPhone(parsed.phone)
        if (parsed.linkedinUrl) setLinkedin(parsed.linkedinUrl)
        if (parsed.githubUrl) setGithubUrl(parsed.githubUrl)
        if (Array.isArray(parsed.experiences) && parsed.experiences.length) {
          setWorkHistory(parsed.experiences.map((exp: any, idx: number) => ({
            id: String(exp._id || `parsed-${idx}-${Date.now()}`),
            role: exp.role || '',
            company: exp.company || '',
            startDate: exp.startDate || '',
            endDate: exp.endDate || '',
            description: exp.description || '',
            technologies: Array.isArray(exp.technologies) ? exp.technologies : [],
            isCurrent: exp.isCurrent || false,
          })))
        }
        showToast('CV scanned — profile auto-filled. Review and save your changes.', 'success')
      } else {
        showToast('CV uploaded. No extractable data found — fill in manually.', 'success')
      }
    } catch {
      setError('Failed to upload CV. Max 5MB · PDF, DOCX, or image.')
    } finally {
      setCvParsing(false)
    }
  }

  // ── EXPERIENCE ──
  const openExpModal = (exp: Experience | null) => {
    setEditingExp(exp)
    setExpTechs(exp?.technologies || [])
    setExpTechInput('')
    setExpIsCurrent(exp?.isCurrent || false)
    setIsExpModalOpen(true)
  }

  const handleExpSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const payload = {
      role: formData.get('role') as string,
      company: formData.get('company') as string,
      startDate: formData.get('startDate') as string,
      endDate: expIsCurrent ? 'Present' : formData.get('endDate') as string,
      description: formData.get('description') as string,
      technologies: expTechs,
      isCurrent: expIsCurrent,
    }
    void (async () => {
      try {
        if (editingExp) {
          const updated = await apiFetch(`/candidate/profile/experience/${editingExp.id}`, { method: 'PATCH', body: payload })
          setWorkHistory(prev => prev.map(exp => exp.id === editingExp.id ? {
            id: String(updated.data._id || editingExp.id),
            role: updated.data.role, company: updated.data.company,
            startDate: updated.data.startDate, endDate: updated.data.endDate,
            description: updated.data.description,
            technologies: updated.data.technologies || [],
            isCurrent: updated.data.isCurrent || false,
          } : exp))
        } else {
          const created = await apiFetch('/candidate/profile/experience', { method: 'POST', body: payload })
          setWorkHistory(prev => [{
            id: String(created.data._id),
            role: created.data.role, company: created.data.company,
            startDate: created.data.startDate, endDate: created.data.endDate,
            description: created.data.description,
            technologies: created.data.technologies || [],
            isCurrent: created.data.isCurrent || false,
          }, ...prev])
        }
        setIsExpModalOpen(false)
        setEditingExp(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save experience')
      }
    })()
  }

  const handleDeleteExp = (id: string) => {
    if (confirm('Delete this experience?')) {
      void (async () => {
        try {
          await apiFetch(`/candidate/profile/experience/${id}`, { method: 'DELETE' })
          setWorkHistory(prev => prev.filter(exp => exp.id !== id))
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to delete experience')
        }
      })()
    }
  }

  // ── LANGUAGES ──
  const openLangModal = (lang: Language | null) => {
    setEditingLang(lang)
    setLangSearch(lang?.name || '')
    setLangProficiency(lang?.proficiency || 'Fluent')
    setLangDropdownOpen(false)
    setIsLangModalOpen(true)
  }

  const filteredLangs = COMMON_LANGUAGES.filter(l =>
    l.toLowerCase().includes(langSearch.toLowerCase())
  )
  const showAddLangOption = langSearch.trim().length > 0 &&
    !COMMON_LANGUAGES.some(l => l.toLowerCase() === langSearch.trim().toLowerCase())

  const handleLangSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!langSearch.trim()) return
    const payload = { name: langSearch.trim(), proficiency: langProficiency }
    void (async () => {
      try {
        if (editingLang) {
          const updated = await apiFetch(`/candidate/profile/language/${editingLang.id}`, { method: 'PATCH', body: payload })
          setLanguages(prev => prev.map(l => l.id === editingLang.id ? { id: String(updated.data._id || editingLang.id), name: updated.data.name, proficiency: updated.data.proficiency } : l))
        } else {
          const created = await apiFetch('/candidate/profile/language', { method: 'POST', body: payload })
          setLanguages(prev => [...prev, { id: String(created.data._id), name: created.data.name, proficiency: created.data.proficiency }])
        }
        setIsLangModalOpen(false)
        setEditingLang(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save language')
      }
    })()
  }

  const handleDeleteLang = (id: string) => {
    void (async () => {
      try {
        await apiFetch(`/candidate/profile/language/${id}`, { method: 'DELETE' })
        setLanguages(prev => prev.filter(l => l.id !== id))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete language')
      }
    })()
  }

  // ── CERTIFICATIONS ──
  const openCertModal = (cert: Certification | null) => {
    setEditingCert(cert)
    setCertImageUrl(cert?.imageUrl || '')
    setIsCertModalOpen(true)
  }

  const handleCertImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 3 * 1024 * 1024) {
      showToast('Certificate image must be under 3MB', 'error')
      return
    }
    const reader = new FileReader()
    reader.onload = () => setCertImageUrl(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleCertSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const payload = {
      name: formData.get('name') as string,
      issuer: formData.get('issuer') as string,
      issueDate: formData.get('issueDate') as string,
      imageUrl: certImageUrl,
    }
    void (async () => {
      try {
        if (editingCert) {
          const updated = await apiFetch(`/candidate/profile/certification/${editingCert.id}`, { method: 'PATCH', body: payload })
          setCertifications(prev => prev.map(c => c.id === editingCert.id ? { id: String(updated.data._id || editingCert.id), name: updated.data.name, issuer: updated.data.issuer, issueDate: updated.data.issueDate, imageUrl: updated.data.imageUrl || '' } : c))
        } else {
          const created = await apiFetch('/candidate/profile/certification', { method: 'POST', body: payload })
          setCertifications(prev => [...prev, { id: String(created.data._id), name: created.data.name, issuer: created.data.issuer, issueDate: created.data.issueDate, imageUrl: created.data.imageUrl || '' }])
        }
        setIsCertModalOpen(false)
        setEditingCert(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save certification')
      }
    })()
  }

  const handleDeleteCert = (id: string) => {
    void (async () => {
      try {
        await apiFetch(`/candidate/profile/certification/${id}`, { method: 'DELETE' })
        setCertifications(prev => prev.filter(c => c.id !== id))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete certification')
      }
    })()
  }

  // ── PROJECTS ──
  const openProjModal = (proj: Project | null) => {
    setEditingProj(proj)
    setProjTechs(proj?.technologies || [])
    setProjTechInput('')
    setIsProjModalOpen(true)
  }

  const handleProjSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const payload = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      technologies: projTechs,
      role: formData.get('role') as string,
      link: formData.get('link') as string,
      startDate: formData.get('startDate') as string,
      endDate: formData.get('endDate') as string,
    }
    void (async () => {
      try {
        if (editingProj) {
          const updated = await apiFetch(`/candidate/profile/project/${editingProj.id}`, { method: 'PATCH', body: payload })
          setProjects(prev => prev.map(p => p.id === editingProj.id ? {
            id: String(updated.data._id || editingProj.id),
            name: updated.data.name, description: updated.data.description,
            technologies: updated.data.technologies || [], role: updated.data.role,
            link: updated.data.link, startDate: updated.data.startDate, endDate: updated.data.endDate,
          } : p))
        } else {
          const created = await apiFetch('/candidate/profile/project', { method: 'POST', body: payload })
          setProjects(prev => [...prev, {
            id: String(created.data._id),
            name: created.data.name, description: created.data.description,
            technologies: created.data.technologies || [], role: created.data.role,
            link: created.data.link, startDate: created.data.startDate, endDate: created.data.endDate,
          }])
        }
        setIsProjModalOpen(false)
        setEditingProj(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save project')
      }
    })()
  }

  const handleDeleteProj = (id: string) => {
    void (async () => {
      try {
        await apiFetch(`/candidate/profile/project/${id}`, { method: 'DELETE' })
        setProjects(prev => prev.filter(p => p.id !== id))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete project')
      }
    })()
  }

  const handleSkillKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault()
      if (!skills.includes(skillInput.trim())) setSkills([...skills, skillInput.trim()])
      setSkillInput('')
    }
  }

  return (
    <div className="flex flex-col gap-8 pb-32">

      {/* Hidden file inputs */}
      <input ref={avatarInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleAvatarUpload} />

      {/* ── EXPERIENCE MODAL ── */}
      <AnimatePresence>
        {isExpModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsExpModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-xl bg-white rounded-5xl p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#2a85ff]/5 blur-3xl" />
              <h3 className="text-2xl font-black text-[#070707] mb-6">{editingExp ? 'Edit Experience' : 'Add Experience'}</h3>
              <form onSubmit={handleExpSave} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#8a9ab0] uppercase tracking-wider px-1">Role / Title</label>
                    <input name="role" defaultValue={editingExp?.role} required className="w-full bg-[#f8fbff] border border-[#e2eaf2] rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-[#2a85ff]" placeholder="e.g. Senior Backend Engineer" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#8a9ab0] uppercase tracking-wider px-1">Company</label>
                    <input name="company" defaultValue={editingExp?.company} required className="w-full bg-[#f8fbff] border border-[#e2eaf2] rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-[#2a85ff]" placeholder="e.g. Google" />
                  </div>
                </div>
                <div className="flex items-center gap-3 px-1">
                  <button type="button" onClick={() => setExpIsCurrent(!expIsCurrent)} className={`w-10 h-5 rounded-full p-0.5 transition-all ${expIsCurrent ? 'bg-[#2a85ff]' : 'bg-[#d0dce8]'} cursor-pointer`}>
                    <motion.div className="w-4 h-4 rounded-full bg-white shadow-sm" animate={{ x: expIsCurrent ? 20 : 0 }} />
                  </button>
                  <span className="text-sm font-semibold text-[#5a6a7a]">I currently work here</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#8a9ab0] uppercase tracking-wider px-1">Start Date</label>
                    <input name="startDate" defaultValue={editingExp?.startDate} required className="w-full bg-[#f8fbff] border border-[#e2eaf2] rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-[#2a85ff]" placeholder="e.g. Jan 2021" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#8a9ab0] uppercase tracking-wider px-1">End Date</label>
                    <input name="endDate" defaultValue={expIsCurrent ? 'Present' : editingExp?.endDate} disabled={expIsCurrent} className={`w-full border rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-[#2a85ff] ${expIsCurrent ? 'bg-[#f0f5fa] text-[#8a9ab0] border-[#e2eaf2]' : 'bg-[#f8fbff] border-[#e2eaf2]'}`} placeholder="e.g. Dec 2023" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#8a9ab0] uppercase tracking-wider px-1">Description / Achievements</label>
                  <textarea name="description" defaultValue={editingExp?.description} required rows={4} className="w-full bg-[#f8fbff] border border-[#e2eaf2] rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-[#2a85ff] resize-none" placeholder="Describe your key impact..." />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#8a9ab0] uppercase tracking-wider px-1">Technologies Used</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {expTechs.map(t => (
                      <span key={t} className="flex items-center gap-1.5 bg-[#e8f1ff] text-[#2a85ff] text-xs font-bold px-3 py-1 rounded-full">
                        {t}<button type="button" onClick={() => setExpTechs(prev => prev.filter(x => x !== t))} className="hover:text-[#dc2626] cursor-pointer"><X size={10} /></button>
                      </span>
                    ))}
                  </div>
                  <input value={expTechInput} onChange={e => setExpTechInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && expTechInput.trim()) { e.preventDefault(); if (!expTechs.includes(expTechInput.trim())) setExpTechs(prev => [...prev, expTechInput.trim()]); setExpTechInput('') } }} className="w-full bg-[#f8fbff] border border-dashed border-[#e2eaf2] rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-[#2a85ff]" placeholder="Type a technology and press Enter..." />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setIsExpModalOpen(false)} className="flex-1 py-3.5 rounded-xl text-sm font-bold text-[#5a6a7a] bg-[#f0f5fa] hover:bg-[#e2eaf2] transition-all">Cancel</button>
                  <button type="submit" className="flex-2 py-3.5 rounded-xl text-sm font-bold text-white bg-[#2a85ff] hover:bg-[#1a75ef] shadow-lg shadow-[#2a85ff]/20">Save Experience</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── LANGUAGE MODAL ── */}
      <AnimatePresence>
        {isLangModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsLangModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-md bg-white rounded-5xl p-8 shadow-2xl">
              <h3 className="text-2xl font-black text-[#070707] mb-6">{editingLang ? 'Edit Language' : 'Add Language'}</h3>
              <form onSubmit={handleLangSave} className="space-y-5">
                {/* Language combobox */}
                <div className="space-y-1.5" ref={langDropdownRef}>
                  <label className="text-[10px] font-bold text-[#8a9ab0] uppercase tracking-wider px-1">Language</label>
                  <div className="relative">
                    <input
                      value={langSearch}
                      onChange={e => { setLangSearch(e.target.value); setLangDropdownOpen(true) }}
                      onFocus={() => setLangDropdownOpen(true)}
                      required
                      className="w-full bg-[#f8fbff] border border-[#e2eaf2] rounded-xl px-4 py-3 text-sm font-semibold text-[#070707] focus:outline-none focus:border-[#2a85ff]"
                      placeholder="Search or type a language..."
                      autoComplete="off"
                    />
                    <AnimatePresence>
                      {langDropdownOpen && (filteredLangs.length > 0 || showAddLangOption) && (
                        <motion.ul
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className="absolute z-10 top-full left-0 right-0 mt-1 bg-white border border-[#e2eaf2] rounded-xl shadow-lg max-h-48 overflow-y-auto"
                        >
                          {filteredLangs.slice(0, 8).map(l => (
                            <li key={l}>
                              <button
                                type="button"
                                onMouseDown={() => { setLangSearch(l); setLangDropdownOpen(false) }}
                                className={`w-full text-left px-4 py-2.5 text-sm font-semibold hover:bg-[#f0f5fa] transition-colors ${langSearch === l ? 'text-[#2a85ff] bg-[#f0f8ff]' : 'text-[#070707]'}`}
                              >
                                {l}
                              </button>
                            </li>
                          ))}
                          {showAddLangOption && (
                            <li>
                              <button
                                type="button"
                                onMouseDown={() => setLangDropdownOpen(false)}
                                className="w-full text-left px-4 py-2.5 text-sm font-bold text-[#2a85ff] hover:bg-[#f0f8ff] transition-colors border-t border-[#e2eaf2] flex items-center gap-2"
                              >
                                <Plus size={14} /> Add &ldquo;{langSearch.trim()}&rdquo;
                              </button>
                            </li>
                          )}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                {/* Proficiency */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#8a9ab0] uppercase tracking-wider px-1">Proficiency Level</label>
                  <div className="grid grid-cols-2 gap-2">
                    {PROFICIENCY_LEVELS.map(l => (
                      <button key={l} type="button" onClick={() => setLangProficiency(l)} className={`py-2.5 rounded-xl border text-sm font-semibold transition-all ${langProficiency === l ? 'bg-[#e8f1ff] border-[#2a85ff]/40 text-[#2a85ff]' : 'bg-[#f8fbff] border-[#e2eaf2] text-[#5a6a7a] hover:border-[#2a85ff]/20'}`}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setIsLangModalOpen(false)} className="flex-1 py-3.5 rounded-xl text-sm font-bold text-[#5a6a7a] bg-[#f0f5fa] hover:bg-[#e2eaf2] transition-all">Cancel</button>
                  <button type="submit" className="flex-2 py-3.5 rounded-xl text-sm font-bold text-white bg-[#2a85ff] hover:bg-[#1a75ef]">Save Language</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── CERTIFICATION MODAL ── */}
      <AnimatePresence>
        {isCertModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCertModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-md bg-white rounded-5xl p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
              <h3 className="text-2xl font-black text-[#070707] mb-6">{editingCert ? 'Edit Certification' : 'Add Certification'}</h3>
              <form onSubmit={handleCertSave} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#8a9ab0] uppercase tracking-wider px-1">Certification Name</label>
                  <input name="name" defaultValue={editingCert?.name} required className="w-full bg-[#f8fbff] border border-[#e2eaf2] rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-[#2a85ff]" placeholder="e.g. AWS Solutions Architect" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#8a9ab0] uppercase tracking-wider px-1">Issuing Organization</label>
                  <input name="issuer" defaultValue={editingCert?.issuer} className="w-full bg-[#f8fbff] border border-[#e2eaf2] rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-[#2a85ff]" placeholder="e.g. Amazon Web Services" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#8a9ab0] uppercase tracking-wider px-1">Issue Date (YYYY-MM)</label>
                  <input name="issueDate" defaultValue={editingCert?.issueDate} className="w-full bg-[#f8fbff] border border-[#e2eaf2] rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-[#2a85ff]" placeholder="e.g. 2023-06" />
                </div>
                {/* Certificate image upload */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#8a9ab0] uppercase tracking-wider px-1">Certificate Image (optional)</label>
                  <input ref={certImageInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/jpg" className="hidden" onChange={handleCertImageUpload} />
                  {certImageUrl ? (
                    <div className="relative rounded-2xl overflow-hidden border border-[#e2eaf2] bg-[#f8fbff]">
                      <img src={certImageUrl} alt="Certificate preview" className="w-full h-40 object-cover" />
                      <button type="button" onClick={() => setCertImageUrl('')} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 border border-[#e2eaf2] flex items-center justify-center text-[#ef4444] hover:bg-[#fff0f0] transition-all cursor-pointer shadow-sm">
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => certImageInputRef.current?.click()}
                      className="w-full border-2 border-dashed border-[#d0dce8] rounded-2xl p-6 flex flex-col items-center gap-2 hover:border-[#2a85ff]/50 hover:bg-[#f8fbff] transition-all cursor-pointer text-center"
                    >
                      <div className="w-10 h-10 rounded-xl bg-[#f0f5fa] flex items-center justify-center text-[#b0bac6]">
                        <Award size={18} />
                      </div>
                      <p className="text-sm font-bold text-[#5a6a7a]">Upload certificate photo</p>
                      <p className="text-[10px] text-[#b0bac6]">JPG, PNG, or WebP · Max 3MB</p>
                    </button>
                  )}
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setIsCertModalOpen(false)} className="flex-1 py-3.5 rounded-xl text-sm font-bold text-[#5a6a7a] bg-[#f0f5fa] hover:bg-[#e2eaf2] transition-all">Cancel</button>
                  <button type="submit" className="flex-2 py-3.5 rounded-xl text-sm font-bold text-white bg-[#2a85ff] hover:bg-[#1a75ef]">Save Certification</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── PROJECT MODAL ── */}
      <AnimatePresence>
        {isProjModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsProjModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-xl bg-white rounded-5xl p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
              <h3 className="text-2xl font-black text-[#070707] mb-6">{editingProj ? 'Edit Project' : 'Add Project'}</h3>
              <form onSubmit={handleProjSave} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#8a9ab0] uppercase tracking-wider px-1">Project Name</label>
                    <input name="name" defaultValue={editingProj?.name} required className="w-full bg-[#f8fbff] border border-[#e2eaf2] rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-[#2a85ff]" placeholder="e.g. E-commerce Platform" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#8a9ab0] uppercase tracking-wider px-1">Your Role</label>
                    <input name="role" defaultValue={editingProj?.role} className="w-full bg-[#f8fbff] border border-[#e2eaf2] rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-[#2a85ff]" placeholder="e.g. Lead Developer" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#8a9ab0] uppercase tracking-wider px-1">Description</label>
                  <textarea name="description" defaultValue={editingProj?.description} rows={3} className="w-full bg-[#f8fbff] border border-[#e2eaf2] rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-[#2a85ff] resize-none" placeholder="What did this project do? What was your impact?" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#8a9ab0] uppercase tracking-wider px-1">Technologies</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {projTechs.map(t => (
                      <span key={t} className="flex items-center gap-1.5 bg-[#e8f1ff] text-[#2a85ff] text-xs font-bold px-3 py-1 rounded-full">
                        {t}<button type="button" onClick={() => setProjTechs(prev => prev.filter(x => x !== t))} className="hover:text-[#dc2626] cursor-pointer"><X size={10} /></button>
                      </span>
                    ))}
                  </div>
                  <input value={projTechInput} onChange={e => setProjTechInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && projTechInput.trim()) { e.preventDefault(); if (!projTechs.includes(projTechInput.trim())) setProjTechs(prev => [...prev, projTechInput.trim()]); setProjTechInput('') } }} className="w-full bg-[#f8fbff] border border-dashed border-[#e2eaf2] rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-[#2a85ff]" placeholder="Type a technology and press Enter..." />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#8a9ab0] uppercase tracking-wider px-1">Project Link</label>
                  <input name="link" defaultValue={editingProj?.link} className="w-full bg-[#f8fbff] border border-[#e2eaf2] rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-[#2a85ff]" placeholder="https://github.com/..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#8a9ab0] uppercase tracking-wider px-1">Start Date</label>
                    <input name="startDate" defaultValue={editingProj?.startDate} className="w-full bg-[#f8fbff] border border-[#e2eaf2] rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-[#2a85ff]" placeholder="e.g. 2023-01" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#8a9ab0] uppercase tracking-wider px-1">End Date</label>
                    <input name="endDate" defaultValue={editingProj?.endDate} className="w-full bg-[#f8fbff] border border-[#e2eaf2] rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-[#2a85ff]" placeholder="e.g. 2023-06" />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setIsProjModalOpen(false)} className="flex-1 py-3.5 rounded-xl text-sm font-bold text-[#5a6a7a] bg-[#f0f5fa] hover:bg-[#e2eaf2] transition-all">Cancel</button>
                  <button type="submit" className="flex-2 py-3.5 rounded-xl text-sm font-bold text-white bg-[#2a85ff] hover:bg-[#1a75ef]">Save Project</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── TOP SECTION ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Profile Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl sm:rounded-5xl shadow-[0_8px_40px_rgba(0,0,0,0.04)] p-5 sm:p-8 lg:p-10 flex flex-col sm:flex-row items-center gap-6 sm:gap-10">
          <div className="relative group shrink-0">
            <div
              onClick={() => avatarInputRef.current?.click()}
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden ring-8 sm:ring-12 ring-[#2a85ff]/10 cursor-pointer"
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-linear-to-br from-[#2a85ff] to-[#6eb3ff] flex items-center justify-center">
                  <span className="text-white text-2xl sm:text-4xl font-extrabold tracking-tight">
                    {fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={() => avatarInputRef.current?.click()}
              aria-label="Upload photo"
              className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-white shadow-lg border border-[#e2eaf2] flex items-center justify-center text-[#2a85ff] hover:scale-110 transition-transform cursor-pointer"
            >
              <Camera size={16} strokeWidth={2.5} />
            </button>
          </div>
          <div className="flex-1 min-w-0 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-2">
              <h1 className="text-[#070707] text-2xl sm:text-4xl font-extrabold tracking-tight">{fullName}</h1>
              <div className="inline-flex items-center gap-1.5 bg-[#e6f9f0] text-[#16a34a] text-xs font-bold px-3 py-1 rounded-full border border-[#16a34a]/20">
                <Check size={12} strokeWidth={3} /> Verified
              </div>
            </div>
            <p className="text-[#5a6a7a] text-lg font-medium">{proTitle}</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-4 text-[#8a9ab0] text-sm">
              <div className="flex items-center gap-1.5"><MapPin size={16} strokeWidth={2} />{location}</div>
              <div className="w-1 h-1 rounded-full bg-[#d0dce8] hidden sm:block" />
              <div className="flex items-center gap-1.5"><Briefcase size={16} strokeWidth={2} />{yearsExp} yrs experience</div>
            </div>
            {avatarUrl && (
              <button onClick={() => setAvatarUrl('')} className="mt-3 text-[10px] font-bold text-[#8a9ab0] hover:text-[#ef4444] transition-colors">
                Remove photo
              </button>
            )}
          </div>
        </div>

        {/* Completion Card */}
        <div className="bg-[#070707] rounded-2xl sm:rounded-5xl p-5 sm:p-8 lg:p-10 flex flex-col justify-between relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.2)]">
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#2a85ff]/10 blur-[60px] pointer-events-none" />
          <div className="flex items-center justify-between mb-5 sm:mb-8">
            <h3 className="text-white text-xl font-bold">Profile Completion</h3>
            <span className="text-[#2a85ff] text-2xl font-black">{completionPct}%</span>
          </div>
          <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden mb-5 sm:mb-8">
            <motion.div className="h-full bg-[#2a85ff] shadow-[0_0_20px_rgba(42,133,255,0.5)]" initial={{ width: 0 }} animate={{ width: `${completionPct}%` }} transition={{ duration: 1.5, ease: 'easeOut' }} />
          </div>
          <div className="grid grid-cols-2 gap-y-3">
            {[
              { label: 'Basic Information', done: !!(fullName && location && proTitle) },
              { label: 'Skills', done: skills.length >= 2 },
              { label: 'Work Experience', done: workHistory.length >= 1 },
              { label: 'Education', done: !!education },
              { label: 'Upload CV', done: cvUploaded },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${item.done ? 'bg-[#2a85ff]' : 'bg-white/10'}`}>
                  {item.done && <Check size={10} color="white" strokeWidth={4} />}
                </div>
                <span className={`text-[11px] font-bold tracking-tight uppercase ${item.done ? 'text-white/80' : 'text-white/30'}`}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── MAIN GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column */}
        <div className="space-y-8">

          {/* Availability */}
          <div className="bg-white rounded-2xl sm:rounded-4xl p-5 sm:p-8 shadow-[0_4px_32px_rgba(0,0,0,0.03)] border border-[#e2eaf2]/60">
            <div className="flex items-center justify-between mb-5 sm:mb-8">
              <h3 className="text-[#070707] font-bold text-lg">Availability</h3>
              <Sparkles size={18} className="text-[#2a85ff]" />
            </div>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#070707] text-sm font-bold">Open to Work</p>
                  <p className="text-[#8a9ab0] text-[11px] mt-0.5">Let companies know you&apos;re looking</p>
                </div>
                <button onClick={() => setAvailability(availability === 'open' ? 'closed' : 'open')} aria-label="Toggle availability" className={`w-12 h-6 rounded-full p-1 transition-all ${availability === 'open' ? 'bg-[#2a85ff]' : 'bg-[#d0dce8]'} cursor-pointer`}>
                  <motion.div className="w-4 h-4 rounded-full bg-white shadow-sm" animate={{ x: availability === 'open' ? 24 : 0 }} />
                </button>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#8a9ab0] uppercase tracking-wider">Status</label>
                <div className="grid grid-cols-1 gap-2">
                  {(['Available', 'Open to Opportunities', 'Not Available'] as const).map(s => (
                    <button key={s} onClick={() => setAvailabilityStatus(s)} className={`w-full text-left px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${availabilityStatus === s ? 'bg-[#e8f1ff] border-[#2a85ff]/40 text-[#2a85ff]' : 'bg-[#f8fbff] border-[#e2eaf2] text-[#5a6a7a] hover:border-[#2a85ff]/20'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#8a9ab0] uppercase tracking-wider">Work Type</label>
                <div className="grid grid-cols-1 gap-2">
                  {(['Full-time', 'Part-time', 'Contract'] as const).map(t => (
                    <button key={t} onClick={() => setAvailabilityType(t)} className={`w-full text-left px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${availabilityType === t ? 'bg-[#e8f1ff] border-[#2a85ff]/40 text-[#2a85ff]' : 'bg-[#f8fbff] border-[#e2eaf2] text-[#5a6a7a] hover:border-[#2a85ff]/20'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="h-px bg-[#e2eaf2]" />
              <div className="space-y-3">
                <button onClick={() => setRemote(!remote)} className={`w-full flex items-center justify-between px-5 py-3 rounded-xl border transition-all cursor-pointer ${remote ? 'bg-[#e8f1ff] border-[#2a85ff]/30 text-[#2a85ff]' : 'bg-[#f0f5fa] border-transparent text-[#8a9ab0]'}`}>
                  <span className="text-sm font-bold">Remote Opportunity</span>
                  {remote && <Check size={14} strokeWidth={3} />}
                </button>
                <button onClick={() => setFulltime(!fulltime)} className={`w-full flex items-center justify-between px-5 py-3 rounded-xl border transition-all cursor-pointer ${fulltime ? 'bg-[#e8f1ff] border-[#2a85ff]/30 text-[#2a85ff]' : 'bg-[#f0f5fa] border-transparent text-[#8a9ab0]'}`}>
                  <span className="text-sm font-bold">Full-time Roles</span>
                  {fulltime && <Check size={14} strokeWidth={3} />}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-[#5a6a7a] text-sm font-semibold">Visible to recruiters</p>
                <div className={`w-2 h-2 rounded-full ${visible ? 'bg-[#16a34a]' : 'bg-[#8a9ab0]'} animate-pulse`} />
              </div>
            </div>
          </div>

          {/* CV Section */}
          <div className="bg-white rounded-2xl sm:rounded-4xl p-5 sm:p-8 shadow-[0_4px_32px_rgba(0,0,0,0.03)] border border-[#e2eaf2]/60">
            <h3 className="text-[#070707] font-bold text-lg mb-6">Upload Current CV</h3>
            {!cvUploaded ? (
              <div onClick={() => !cvParsing && cvRef.current?.click()} className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center gap-3 transition-all text-center ${cvParsing ? 'border-[#2a85ff]/40 bg-[#f0f8ff] cursor-wait' : 'border-[#d0dce8] hover:border-[#2a85ff]/50 hover:bg-[#f8fbff] cursor-pointer'}`}>
                <div className="w-12 h-12 rounded-xl bg-[#f0f5fa] flex items-center justify-center text-[#b0bac6]">
                  {cvParsing ? <Sparkles size={20} className="text-[#2a85ff] animate-pulse" /> : <Upload size={20} />}
                </div>
                <p className="text-[#070707] text-sm font-bold">{cvParsing ? 'Scanning CV with AI...' : 'Drop CV here'}</p>
                <p className="text-[#b0bac6] text-[10px]">PDF, DOCX, or image (Max 5MB)</p>
                <input ref={cvRef} type="file" accept=".pdf,.doc,.docx,image/jpeg,image/png,image/jpg,image/webp" className="hidden" aria-label="Upload CV file" onChange={handleFileUpload} />
              </div>
            ) : (
              <div className="bg-[#f0f5fa] rounded-2xl p-4 flex items-center gap-3 border border-[#2a85ff]/10">
                <div className="w-10 h-10 rounded-lg bg-[#2a85ff] flex items-center justify-center text-white">
                  <FileText size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[#070707] text-xs font-bold truncate">My_Professional_CV.pdf</p>
                  <p className="text-[#16a34a] text-[10px] font-bold mt-0.5 uppercase tracking-wider">Uploaded</p>
                </div>
                <button onClick={() => setCvUploaded(false)} aria-label="Remove CV" className="text-[#b0bac6] hover:text-[#5a6a7a] transition-colors cursor-pointer p-1"><X size={14} /></button>
              </div>
            )}
            <button onClick={() => cvRef.current?.click()} className="w-full mt-4 py-3 rounded-xl text-sm font-bold text-[#2a85ff] bg-[#e8f1ff] hover:bg-[#d0e4ff] transition-all cursor-pointer">
              {cvUploaded ? 'Update CV' : 'Select File'}
            </button>
          </div>
        </div>

        {/* Center & Right column */}
        <div className="lg:col-span-2 space-y-8">

          {/* Basic Information */}
          <div className="bg-white rounded-2xl sm:rounded-4xl p-5 sm:p-8 lg:p-10 shadow-[0_4px_32px_rgba(0,0,0,0.03)] border border-[#e2eaf2]/60">
            <div className="flex items-center justify-between mb-5 sm:mb-8">
              <h2 className="text-[#070707] font-extrabold text-xl sm:text-2xl tracking-tight">Basic Information</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#8a9ab0] uppercase tracking-wider px-1">Full Name</label>
                <input value={fullName} onChange={e => setFullName(e.target.value)} aria-label="Full Name" className="w-full bg-[#f8fbff] border border-[#e2eaf2] rounded-2xl px-5 py-3.5 text-sm font-semibold text-[#070707] focus:outline-none focus:border-[#2a85ff]/50 focus:ring-4 focus:ring-[#2a85ff]/5 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#8a9ab0] uppercase tracking-wider px-1">Professional Title</label>
                <input value={proTitle} onChange={e => setProTitle(e.target.value)} aria-label="Professional Title" className="w-full bg-[#f8fbff] border border-[#e2eaf2] rounded-2xl px-5 py-3.5 text-sm font-semibold text-[#070707] focus:outline-none focus:border-[#2a85ff]/50 focus:ring-4 focus:ring-[#2a85ff]/5 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#8a9ab0] uppercase tracking-wider px-1">Location</label>
                <div className="relative">
                  <input value={location} onChange={e => setLocation(e.target.value)} aria-label="Location" className="w-full bg-[#f8fbff] border border-[#e2eaf2] rounded-2xl px-5 py-3.5 pl-12 text-sm font-semibold text-[#070707] focus:outline-none focus:border-[#2a85ff]/50 focus:ring-4 focus:ring-[#2a85ff]/5 transition-all" />
                  <MapPin size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#b0bac6]" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#8a9ab0] uppercase tracking-wider px-1">Years of Experience</label>
                <div className="flex items-center gap-2">
                  <button aria-label="Decrease" onClick={() => setYearsExp(v => Math.max(0, v - 1))} className="w-12 h-12 rounded-2xl border border-[#e2eaf2] flex items-center justify-center text-[#5a6a7a] hover:bg-[#f0f5fa] transition-all cursor-pointer"><Minus size={16} /></button>
                  <div className="flex-1 h-12 bg-[#f8fbff] border border-[#e2eaf2] rounded-2xl flex items-center justify-center text-sm font-bold text-[#070707]">{yearsExp} yrs</div>
                  <button aria-label="Increase" onClick={() => setYearsExp(v => v + 1)} className="w-12 h-12 rounded-2xl border border-[#e2eaf2] flex items-center justify-center text-[#5a6a7a] hover:bg-[#f0f5fa] transition-all cursor-pointer"><Plus size={16} /></button>
                </div>
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[11px] font-bold text-[#8a9ab0] uppercase tracking-wider px-1">Professional Summary / Bio</label>
                <textarea value={summary} onChange={e => setSummary(e.target.value)} rows={4} placeholder="Write a short bio that highlights your experience, strengths, and what you're looking for..." className="w-full bg-[#f8fbff] border border-[#e2eaf2] rounded-2xl px-5 py-3.5 text-sm font-semibold text-[#070707] focus:outline-none focus:border-[#2a85ff]/50 focus:ring-4 focus:ring-[#2a85ff]/5 transition-all resize-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#8a9ab0] uppercase tracking-wider px-1">LinkedIn URL</label>
                <div className="relative">
                  <input value={linkedin} onChange={e => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/..." className="w-full bg-[#f8fbff] border border-[#e2eaf2] rounded-2xl px-5 py-3.5 pl-12 text-sm font-semibold text-[#070707] focus:outline-none focus:border-[#2a85ff]/50 focus:ring-4 focus:ring-[#2a85ff]/5 transition-all" />
                  <ExternalLink size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#b0bac6]" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#8a9ab0] uppercase tracking-wider px-1">GitHub URL</label>
                <div className="relative">
                  <input value={githubUrl} onChange={e => setGithubUrl(e.target.value)} placeholder="https://github.com/..." className="w-full bg-[#f8fbff] border border-[#e2eaf2] rounded-2xl px-5 py-3.5 pl-12 text-sm font-semibold text-[#070707] focus:outline-none focus:border-[#2a85ff]/50 focus:ring-4 focus:ring-[#2a85ff]/5 transition-all" />
                  <ExternalLink size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#b0bac6]" />
                </div>
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[11px] font-bold text-[#8a9ab0] uppercase tracking-wider px-1">Portfolio / Website</label>
                <div className="relative">
                  <input value={portfolioUrl} onChange={e => setPortfolioUrl(e.target.value)} placeholder="https://yourportfolio.com" className="w-full bg-[#f8fbff] border border-[#e2eaf2] rounded-2xl px-5 py-3.5 pl-12 text-sm font-semibold text-[#070707] focus:outline-none focus:border-[#2a85ff]/50 focus:ring-4 focus:ring-[#2a85ff]/5 transition-all" />
                  <ExternalLink size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#b0bac6]" />
                </div>
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[11px] font-bold text-[#8a9ab0] uppercase tracking-wider px-1">Education Background</label>
                <input value={education} onChange={e => setEducation(e.target.value)} placeholder="e.g. BSc Computer Science, MIT 2018-2022" className="w-full bg-[#f8fbff] border border-[#e2eaf2] rounded-2xl px-5 py-3.5 text-sm font-semibold text-[#070707] focus:outline-none focus:border-[#2a85ff]/50 focus:ring-4 focus:ring-[#2a85ff]/5 transition-all" />
              </div>

              {/* Notification Contacts */}
              <div className="md:col-span-2">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-px flex-1 bg-[#e2eaf2]" />
                  <span className="text-[10px] font-bold text-[#8a9ab0] uppercase tracking-wider px-2">Notification Contacts</span>
                  <div className="h-px flex-1 bg-[#e2eaf2]" />
                </div>
                <p className="text-[11px] text-[#8a9ab0] mb-5 leading-relaxed">
                  Add your contact details so recruiters can notify you via <strong>Email</strong>, <strong>SMS</strong>, and <strong>WhatsApp</strong> when you&apos;re shortlisted.
                </p>
                <div className="space-y-2 mb-6">
                  <label className="text-[11px] font-bold text-[#8a9ab0] uppercase tracking-wider px-1">Email Address</label>
                  <div className="relative">
                    <input value={contactEmail} onChange={e => setContactEmail(e.target.value)} placeholder="you@example.com" type="email" className="w-full bg-[#f8fbff] border border-[#e2eaf2] rounded-2xl px-5 py-3.5 pl-12 text-sm font-semibold text-[#070707] focus:outline-none focus:border-[#2a85ff]/50 focus:ring-4 focus:ring-[#2a85ff]/5 transition-all" />
                    <Mail size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#b0bac6]" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-[#8a9ab0] uppercase tracking-wider px-1">Phone Number (SMS)</label>
                    <div className="relative">
                      <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+250 788 000 000" type="tel" className="w-full bg-[#f8fbff] border border-[#e2eaf2] rounded-2xl px-5 py-3.5 pl-12 text-sm font-semibold text-[#070707] focus:outline-none focus:border-[#2a85ff]/50 focus:ring-4 focus:ring-[#2a85ff]/5 transition-all" />
                      <Phone size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#b0bac6]" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-[#8a9ab0] uppercase tracking-wider px-1">WhatsApp Number</label>
                    <div className="relative">
                      <input value={whatsappNumber} onChange={e => setWhatsappNumber(e.target.value)} placeholder="+250 788 000 000" type="tel" className="w-full bg-[#f8fbff] border border-[#e2eaf2] rounded-2xl px-5 py-3.5 pl-12 text-sm font-semibold text-[#070707] focus:outline-none focus:border-[#2a85ff]/50 focus:ring-4 focus:ring-[#2a85ff]/5 transition-all" />
                      <MessageCircle size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#25D366]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Skills Section */}
          <div className="bg-white rounded-2xl sm:rounded-4xl p-5 sm:p-8 lg:p-10 shadow-[0_4px_32px_rgba(0,0,0,0.03)] border border-[#e2eaf2]/60">
            <div className="flex items-center justify-between mb-5 sm:mb-8">
              <h2 className="text-[#070707] font-extrabold text-xl sm:text-2xl tracking-tight">Skills & Core Competencies</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {skills.map(s => (
                <div key={s} className="bg-[#f0f5fa] border border-[#e2eaf2] rounded-2xl px-5 py-3 flex items-center gap-3 group transition-all hover:border-[#2a85ff]/30">
                  <span className="text-sm font-bold text-[#070707]">{s}</span>
                  <button onClick={() => setSkills(skills.filter(x => x !== s))} aria-label={`Remove ${s}`} className="text-[#b0bac6] hover:text-[#dc2626] transition-colors cursor-pointer"><X size={14} /></button>
                </div>
              ))}
              <div className="relative flex-1 min-w-50">
                <input value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={handleSkillKey} placeholder="Type skill and press Enter..." className="w-full bg-[#f8fbff] border-2 border-dashed border-[#e2eaf2] rounded-2xl px-5 py-3 text-sm font-semibold text-[#070707] focus:outline-none focus:border-[#2a85ff]/40 focus:bg-white transition-all" />
              </div>
            </div>
          </div>

          {/* Languages Section */}
          <div className="bg-white rounded-2xl sm:rounded-4xl p-5 sm:p-8 lg:p-10 shadow-[0_4px_32px_rgba(0,0,0,0.03)] border border-[#e2eaf2]/60">
            <div className="flex items-center justify-between mb-5 sm:mb-8">
              <h2 className="text-[#070707] font-extrabold text-xl sm:text-2xl tracking-tight">Languages</h2>
              <button onClick={() => openLangModal(null)} className="flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold text-white bg-[#070707] hover:bg-[#202020] transition-all cursor-pointer">
                <Plus size={16} strokeWidth={2.5} /> Add
              </button>
            </div>
            {languages.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {languages.map(lang => (
                  <div key={lang.id} className="flex items-center gap-3 bg-[#f8fbff] border border-[#e2eaf2] rounded-2xl px-4 py-3 group hover:border-[#2a85ff]/30 transition-all">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-[#070707]">{lang.name}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 self-start ${PROFICIENCY_COLORS[lang.proficiency]}`}>{lang.proficiency}</span>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                      <button onClick={() => openLangModal(lang)} className="p-1.5 rounded-lg bg-[#f0f5fa] text-[#5a6a7a] hover:bg-[#2a85ff] hover:text-white transition-all cursor-pointer" aria-label="Edit"><FileText size={12} /></button>
                      <button onClick={() => handleDeleteLang(lang.id)} className="p-1.5 rounded-lg bg-[#fff0f0] text-[#ef4444] hover:bg-[#ef4444] hover:text-white transition-all cursor-pointer" aria-label="Delete"><X size={12} /></button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-[#f8fbff] rounded-3xl border border-dashed border-[#e2eaf2]">
                <p className="text-[#8a9ab0] font-bold text-sm">No languages added yet.</p>
                <button onClick={() => openLangModal(null)} className="mt-2 text-[#2a85ff] text-sm font-bold hover:underline">Add your first language</button>
              </div>
            )}
          </div>

          {/* Certifications Section */}
          <div className="bg-white rounded-2xl sm:rounded-4xl p-5 sm:p-8 lg:p-10 shadow-[0_4px_32px_rgba(0,0,0,0.03)] border border-[#e2eaf2]/60">
            <div className="flex items-center justify-between mb-5 sm:mb-8">
              <h2 className="text-[#070707] font-extrabold text-xl sm:text-2xl tracking-tight">Certifications</h2>
              <button onClick={() => openCertModal(null)} className="flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold text-white bg-[#070707] hover:bg-[#202020] transition-all cursor-pointer">
                <Plus size={16} strokeWidth={2.5} /> Add
              </button>
            </div>
            {certifications.length > 0 ? (
              <div className="space-y-4">
                {certifications.map(cert => (
                  <div key={cert.id} className="flex items-start justify-between gap-4 bg-[#f8fbff] border border-[#e2eaf2] rounded-2xl overflow-hidden group hover:border-[#2a85ff]/30 transition-all">
                    {cert.imageUrl && (
                      <div className="w-20 shrink-0">
                        <img src={cert.imageUrl} alt={cert.name} className="w-full h-full object-cover min-h-[80px]" />
                      </div>
                    )}
                    <div className={`flex items-start gap-3 flex-1 px-5 py-4`}>
                      {!cert.imageUrl && (
                        <div className="w-9 h-9 rounded-xl bg-[#fff7ed] border border-[#fed7aa] flex items-center justify-center text-[#ea580c] shrink-0 mt-0.5">
                          <Award size={16} />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-bold text-[#070707]">{cert.name}</p>
                        {cert.issuer && <p className="text-xs text-[#5a6a7a] font-semibold mt-0.5">{cert.issuer}</p>}
                        {cert.issueDate && <p className="text-[10px] text-[#8a9ab0] font-bold mt-1 uppercase tracking-wider">{cert.issueDate}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 pr-4 pt-4">
                      <button onClick={() => openCertModal(cert)} className="p-1.5 rounded-lg bg-[#f0f5fa] text-[#5a6a7a] hover:bg-[#2a85ff] hover:text-white transition-all cursor-pointer" aria-label="Edit"><FileText size={12} /></button>
                      <button onClick={() => handleDeleteCert(cert.id)} className="p-1.5 rounded-lg bg-[#fff0f0] text-[#ef4444] hover:bg-[#ef4444] hover:text-white transition-all cursor-pointer" aria-label="Delete"><X size={12} /></button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-[#f8fbff] rounded-3xl border border-dashed border-[#e2eaf2]">
                <p className="text-[#8a9ab0] font-bold text-sm">No certifications added yet.</p>
                <button onClick={() => openCertModal(null)} className="mt-2 text-[#2a85ff] text-sm font-bold hover:underline">Add your first certification</button>
              </div>
            )}
          </div>

          {/* Work Experience Section */}
          <div className="bg-white rounded-2xl sm:rounded-4xl p-5 sm:p-8 lg:p-10 shadow-[0_4px_32px_rgba(0,0,0,0.03)] border border-[#e2eaf2]/60">
            <div className="flex items-center justify-between mb-6 sm:mb-10 gap-3">
              <h2 className="text-[#070707] font-extrabold text-xl sm:text-2xl tracking-tight">Work History</h2>
              <button onClick={() => openExpModal(null)} className="flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold text-white bg-[#070707] hover:bg-[#202020] transition-all cursor-pointer shrink-0">
                <Plus size={16} strokeWidth={2.5} />
                <span className="hidden sm:inline">Add Experience</span>
                <span className="sm:hidden">Add</span>
              </button>
            </div>
            <div className="space-y-12">
              {workHistory.length > 0 ? (
                workHistory.map((exp, idx) => (
                  <div key={exp.id} className="relative pl-10 group">
                    <div className={`absolute left-0 top-2 bottom-0 w-px ${idx === workHistory.length - 1 ? 'h-0' : 'bg-linear-to-b from-[#2a85ff] to-[#e2eaf2]'}`} />
                    <div className="absolute -left-1.25 top-2 w-2.75 h-2.75 rounded-full bg-[#2a85ff] ring-4 ring-[#e8f1ff]" />
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex-1 min-w-50">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-[#070707] text-xl font-bold">{exp.role}</h4>
                          {exp.isCurrent && <span className="text-[10px] font-bold bg-[#dcfce7] text-[#166534] px-2 py-0.5 rounded-full uppercase tracking-wider">Current</span>}
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <p className="text-[#2a85ff] font-bold">{exp.company}</p>
                          <span className="w-1 h-1 rounded-full bg-[#d0dce8]" />
                          <span className="text-[#8a9ab0] text-xs font-bold">{exp.startDate} – {exp.endDate}</span>
                        </div>
                        {exp.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {exp.technologies.map(t => <span key={t} className="text-[10px] font-bold bg-[#e8f1ff] text-[#2a85ff] px-2 py-0.5 rounded-full">{t}</span>)}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openExpModal(exp)} className="p-2 rounded-lg bg-[#f0f5fa] text-[#5a6a7a] hover:bg-[#2a85ff] hover:text-white transition-all cursor-pointer" aria-label="Edit"><FileText size={14} /></button>
                        <button onClick={() => handleDeleteExp(exp.id)} className="p-2 rounded-lg bg-[#fff0f0] text-[#ef4444] hover:bg-[#ef4444] hover:text-white transition-all cursor-pointer" aria-label="Delete"><X size={14} /></button>
                      </div>
                    </div>
                    <p className="text-[#5a6a7a] text-sm leading-relaxed mt-5 max-w-2xl bg-[#f8fbff] p-6 rounded-2xl border border-dashed border-[#e2eaf2]">{exp.description}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 bg-[#f8fbff] rounded-3xl border border-dashed border-[#e2eaf2]">
                  <p className="text-[#8a9ab0] font-bold">No work history added yet.</p>
                  <button onClick={() => openExpModal(null)} className="mt-2 text-[#2a85ff] text-sm font-bold hover:underline">Click to add your first role</button>
                </div>
              )}
            </div>
          </div>

          {/* Projects Section */}
          <div className="bg-white rounded-2xl sm:rounded-4xl p-5 sm:p-8 lg:p-10 shadow-[0_4px_32px_rgba(0,0,0,0.03)] border border-[#e2eaf2]/60">
            <div className="flex items-center justify-between mb-6 sm:mb-10 gap-3">
              <h2 className="text-[#070707] font-extrabold text-xl sm:text-2xl tracking-tight">Projects</h2>
              <button onClick={() => openProjModal(null)} className="flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold text-white bg-[#070707] hover:bg-[#202020] transition-all cursor-pointer shrink-0">
                <Plus size={16} strokeWidth={2.5} />
                <span className="hidden sm:inline">Add Project</span>
                <span className="sm:hidden">Add</span>
              </button>
            </div>
            {projects.length > 0 ? (
              <div className="grid grid-cols-1 gap-5">
                {projects.map(proj => (
                  <div key={proj.id} className="bg-[#f8fbff] border border-[#e2eaf2] rounded-2xl p-5 group hover:border-[#2a85ff]/30 transition-all">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-[#070707] font-bold">{proj.name}</h4>
                          {proj.role && <span className="text-[10px] font-bold bg-[#f0f5fa] text-[#5a6a7a] px-2 py-0.5 rounded-full">{proj.role}</span>}
                        </div>
                        {(proj.startDate || proj.endDate) && (
                          <p className="text-[10px] text-[#8a9ab0] font-bold mt-1 uppercase tracking-wider">{proj.startDate}{proj.startDate && proj.endDate ? ' – ' : ''}{proj.endDate}</p>
                        )}
                        {proj.description && <p className="text-[#5a6a7a] text-sm leading-relaxed mt-2">{proj.description}</p>}
                        {proj.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {proj.technologies.map(t => <span key={t} className="text-[10px] font-bold bg-[#e8f1ff] text-[#2a85ff] px-2 py-0.5 rounded-full">{t}</span>)}
                          </div>
                        )}
                        {proj.link && (
                          <a href={proj.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-3 text-[#2a85ff] text-xs font-bold hover:underline">
                            <ExternalLink size={12} /> View Project
                          </a>
                        )}
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button onClick={() => openProjModal(proj)} className="p-2 rounded-lg bg-[#f0f5fa] text-[#5a6a7a] hover:bg-[#2a85ff] hover:text-white transition-all cursor-pointer" aria-label="Edit"><FileText size={14} /></button>
                        <button onClick={() => handleDeleteProj(proj.id)} className="p-2 rounded-lg bg-[#fff0f0] text-[#ef4444] hover:bg-[#ef4444] hover:text-white transition-all cursor-pointer" aria-label="Delete"><X size={14} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-[#f8fbff] rounded-3xl border border-dashed border-[#e2eaf2]">
                <p className="text-[#8a9ab0] font-bold">No projects added yet.</p>
                <button onClick={() => openProjModal(null)} className="mt-2 text-[#2a85ff] text-sm font-bold hover:underline">Showcase your first project</button>
              </div>
            )}
          </div>

          {/* Final Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 sm:gap-4 pt-4">
            <button onClick={handleDiscard} className="px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl text-sm sm:text-base font-bold text-[#5a6a7a] bg-white border border-[#e2eaf2] hover:bg-[#f0f5fa] transition-all cursor-pointer shadow-sm text-center">
              Discard
            </button>
            <button onClick={() => { void handleSave() }} className="px-8 sm:px-10 py-3.5 sm:py-4 rounded-2xl text-sm sm:text-base font-bold text-white bg-[#2a85ff] hover:bg-[#1a75ef] shadow-[0_8px_24px_rgba(42,133,255,0.4)] hover:scale-[1.02] transition-all cursor-pointer text-center">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

          {error ? <p className="text-sm font-bold text-[#dc2626]">{error}</p> : null}

        </div>
      </div>
    </div>
  )
}
