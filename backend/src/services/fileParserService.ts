import { parse as parseCsvSync } from 'csv-parse/sync';
import * as XLSX from 'xlsx';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

import config from '../config';

const { geminiApiKey, geminiModel } = config;

export interface ParsedCandidate {
  source: 'rankr' | 'external';
  fullName: string;
  professionalTitle: string;
  location: string;
  yearsExperience: number;
  skills: string[];
  education: string;
  summary: string;
  completionPct: number;
  cv?: {
    fileName: string;
    storageUrl: string;
    uploadedAt: Date | null;
    extractedText: string;
  };
}

const HEADER_ALIASES: Record<string, string[]> = {
  fullName: ['full name', 'fullname', 'name', 'candidate name', 'applicant name'],
  email: ['email', 'e-mail', 'email address'],
  professionalTitle: ['title', 'job title', 'professional title', 'role', 'current role', 'position'],
  location: ['location', 'city', 'country', 'address', 'based in'],
  yearsExperience: ['years of experience', 'experience', 'years experience', 'yoe', 'total experience'],
  skills: ['skills', 'skillset', 'technical skills', 'tech stack', 'technologies'],
  education: ['education', 'degree', 'qualification', 'highest education'],
  summary: ['summary', 'bio', 'about', 'profile summary', 'description'],
};

function normalizeHeader(header: string): string {
  return String(header || '').trim().toLowerCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ');
}

function mapRowToCandidate(row: Record<string, any>): ParsedCandidate | null {
  const normalizedRow: Record<string, any> = {};
  for (const key of Object.keys(row)) {
    normalizedRow[normalizeHeader(key)] = row[key];
  }

  const getField = (field: keyof typeof HEADER_ALIASES): string => {
    for (const alias of HEADER_ALIASES[field]) {
      const value = normalizedRow[alias];
      if (value !== undefined && value !== null && String(value).trim().length > 0) {
        return String(value).trim();
      }
    }
    return '';
  };

  const fullName = getField('fullName');
  if (!fullName) return null;

  const skillsRaw = getField('skills');
  const skills = skillsRaw
    ? skillsRaw
        .split(/[,;|/]/)
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const yoeRaw = getField('yearsExperience');
  const yoeMatch = yoeRaw.match(/\d+(\.\d+)?/);
  const yearsExperience = yoeMatch ? Math.min(50, Math.round(Number(yoeMatch[0]))) : 0;

  const completionPct = calculateCompletion({ fullName, professionalTitle: getField('professionalTitle'), skills, yearsExperience, education: getField('education'), summary: getField('summary') });

  return {
    source: 'external',
    fullName,
    professionalTitle: getField('professionalTitle') || 'External Applicant',
    location: getField('location') || 'Remote',
    yearsExperience,
    skills: skills.length ? skills : [],
    education: getField('education') || '',
    summary: getField('summary') || '',
    completionPct,
  };
}

function calculateCompletion(candidate: { fullName: string; professionalTitle: string; skills: string[]; yearsExperience: number; education: string; summary: string }): number {
  let score = 0;
  if (candidate.fullName) score += 20;
  if (candidate.professionalTitle) score += 15;
  if (candidate.skills.length >= 3) score += 25;
  else if (candidate.skills.length > 0) score += 15;
  if (candidate.yearsExperience > 0) score += 15;
  if (candidate.education) score += 10;
  if (candidate.summary && candidate.summary.length > 30) score += 15;
  return Math.min(100, score);
}

export function parseCsvBuffer(buffer: Buffer): ParsedCandidate[] {
  const records = parseCsvSync(buffer, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_quotes: true,
    relax_column_count: true,
  }) as Record<string, any>[];

  const candidates: ParsedCandidate[] = [];
  for (const row of records) {
    const candidate = mapRowToCandidate(row);
    if (candidate) candidates.push(candidate);
  }
  return candidates;
}

export function parseExcelBuffer(buffer: Buffer): ParsedCandidate[] {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const candidates: ParsedCandidate[] = [];

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: '' });
    for (const row of rows) {
      const candidate = mapRowToCandidate(row);
      if (candidate) candidates.push(candidate);
    }
  }
  return candidates;
}

async function extractStructuredFromText(text: string, hintFileName?: string): Promise<ParsedCandidate | null> {
  if (!geminiApiKey) return fallbackFromText(text, hintFileName);

  const prompt = {
    role: 'user',
    parts: [
      {
        text: [
          'Extract candidate profile information from the following resume text.',
          'Return ONLY a valid JSON object with this exact schema (no markdown, no commentary):',
          '{',
          '  "fullName": string,',
          '  "professionalTitle": string,',
          '  "location": string,',
          '  "yearsExperience": number,',
          '  "skills": string[],',
          '  "education": string,',
          '  "summary": string (2-3 sentence professional summary)',
          '}',
          'If a field is not present, use an empty string or 0 or [] as appropriate.',
          'Resume text:',
          text.slice(0, 12000),
        ].join('\n'),
      },
    ],
  };

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [prompt],
          generationConfig: { temperature: 0.1, topP: 0.8, responseMimeType: 'application/json' },
        }),
      }
    );

    if (!response.ok) return fallbackFromText(text, hintFileName);

    const body = await response.json();
    const rawText = body?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const cleaned = rawText.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    const skills = Array.isArray(parsed.skills) ? parsed.skills.filter((s: any) => typeof s === 'string' && s.trim()) : [];
    const fullName = String(parsed.fullName || '').trim();
    if (!fullName) return fallbackFromText(text, hintFileName);

    const yearsExperience = Math.min(50, Math.max(0, Math.round(Number(parsed.yearsExperience) || 0)));

    return {
      source: 'external',
      fullName,
      professionalTitle: String(parsed.professionalTitle || '').trim() || 'External Applicant',
      location: String(parsed.location || '').trim() || 'Remote',
      yearsExperience,
      skills,
      education: String(parsed.education || '').trim(),
      summary: String(parsed.summary || '').trim(),
      completionPct: calculateCompletion({
        fullName,
        professionalTitle: String(parsed.professionalTitle || ''),
        skills,
        yearsExperience,
        education: String(parsed.education || ''),
        summary: String(parsed.summary || ''),
      }),
      cv: {
        fileName: hintFileName || 'resume.pdf',
        storageUrl: '',
        uploadedAt: new Date(),
        extractedText: text.slice(0, 20000),
      },
    };
  } catch (err) {
    return fallbackFromText(text, hintFileName);
  }
}

function fallbackFromText(text: string, hintFileName?: string): ParsedCandidate | null {
  const nameMatch = text.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z'-]+){1,3})/m);
  const fullName = nameMatch ? nameMatch[1].trim() : '';
  if (!fullName) return null;

  const yoeMatch = text.match(/(\d{1,2})\+?\s*(?:years?|yrs)/i);
  const yearsExperience = yoeMatch ? Math.min(50, Number(yoeMatch[1])) : 0;

  const skillKeywords = ['javascript', 'typescript', 'python', 'java', 'react', 'node.js', 'nodejs', 'angular', 'vue', 'django', 'flask', 'express', 'mongodb', 'postgresql', 'mysql', 'aws', 'docker', 'kubernetes', 'git', 'html', 'css', 'tailwind', 'next.js', 'redux', 'graphql', 'rest', 'c++', 'c#', 'go', 'rust', 'ruby', 'php', 'swift', 'kotlin'];
  const lowerText = text.toLowerCase();
  const skills = skillKeywords.filter((kw) => lowerText.includes(kw)).map((kw) => kw.charAt(0).toUpperCase() + kw.slice(1));

  return {
    source: 'external',
    fullName,
    professionalTitle: 'External Applicant',
    location: 'Remote',
    yearsExperience,
    skills,
    education: '',
    summary: text.slice(0, 300).replace(/\s+/g, ' ').trim(),
    completionPct: calculateCompletion({ fullName, professionalTitle: '', skills, yearsExperience, education: '', summary: text.slice(0, 300) }),
    cv: {
      fileName: hintFileName || 'resume.pdf',
      storageUrl: '',
      uploadedAt: new Date(),
      extractedText: text.slice(0, 20000),
    },
  };
}

export async function parsePdfBuffer(buffer: Buffer, fileName?: string): Promise<ParsedCandidate | null> {
  const parsed = await (pdfParse as any)(buffer);
  const text = String(parsed.text || '').trim();
  if (!text) return null;
  return extractStructuredFromText(text, fileName);
}

export async function parseDocxBuffer(buffer: Buffer, fileName?: string): Promise<ParsedCandidate | null> {
  const result = await mammoth.extractRawText({ buffer });
  const text = String(result.value || '').trim();
  if (!text) return null;
  return extractStructuredFromText(text, fileName);
}

export async function parseRankrJsonBuffer(buffer: Buffer): Promise<ParsedCandidate[]> {
  const text = buffer.toString('utf8');
  const data = JSON.parse(text);
  const rows: any[] = Array.isArray(data) ? data : Array.isArray(data?.candidates) ? data.candidates : [];

  const candidates: ParsedCandidate[] = [];
  for (const row of rows) {
    const fullName = String(row.fullName || row.name || '').trim();
    if (!fullName) continue;

    const skills = Array.isArray(row.skills)
      ? row.skills.filter((s: any) => typeof s === 'string')
      : typeof row.skills === 'string'
      ? row.skills.split(/[,;|]/).map((s: string) => s.trim()).filter(Boolean)
      : [];

    const yearsExperience = Math.min(50, Math.max(0, Math.round(Number(row.yearsExperience ?? row.experience ?? 0) || 0)));

    candidates.push({
      source: 'rankr',
      fullName,
      professionalTitle: String(row.professionalTitle || row.title || 'Rankr Talent').trim(),
      location: String(row.location || 'Remote').trim(),
      yearsExperience,
      skills,
      education: String(row.education || '').trim(),
      summary: String(row.summary || row.bio || '').trim(),
      completionPct: calculateCompletion({
        fullName,
        professionalTitle: String(row.professionalTitle || row.title || ''),
        skills,
        yearsExperience,
        education: String(row.education || ''),
        summary: String(row.summary || ''),
      }),
    });
  }
  return candidates;
}
