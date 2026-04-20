import config from '../config';

const { geminiApiKey, geminiModel } = config;

function clampScore(value: number): number {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return 0;
  if (parsed < 0) return 0;
  if (parsed > 100) return 100;
  return Math.round(parsed);
}

function recommendationFromScore(score: number): string {
  if (score >= 85) return 'hire';
  if (score >= 70) return 'consider';
  return 'pass';
}

function ruleScore(job: any, candidate: any): { score: number; matched: string[] } {
  const reqSkills = (job.requiredSkills || []).map((s: string) => String(s).toLowerCase());
  const candSkills = (candidate.skills || []).map((s: string) => String(s).toLowerCase());

  const matched: string[] = [];
  for (const skill of (job.requiredSkills || [])) {
    if (candSkills.includes(String(skill).toLowerCase())) matched.push(skill);
  }

  const skillRatio = reqSkills.length > 0 ? matched.length / reqSkills.length : 0.5;
  const expRatio = Math.min(1, (candidate.yearsExperience || 0) / Math.max(1, job.minYearsExperience || 1));
  const raw = skillRatio * 70 + expRatio * 30;
  return { score: clampScore(raw), matched };
}

function parseGeminiJson(text: string): any {
  try {
    const cleaned = text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (error) {
    const match = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (match) {
      try { return JSON.parse(match[0]); } catch { return null; }
    }
    return null;
  }
}

async function callGeminiSingle(job: any, candidate: any): Promise<any> {
  if (!geminiApiKey) return null;

  const prompt = {
    role: 'user',
    parts: [
      {
        text: [
          'You are an expert recruiter evaluating candidate fit for a job opening.',
          'Return ONLY strict JSON. No markdown, no commentary.',
          'Schema: {"score": number (0-100), "recommendation": "hire"|"consider"|"pass", "matchedSkills": string[], "strengths": string[] (2-4 bullets), "gaps": string[] (1-3 bullets), "reasoning": string (2-3 sentences)}',
          `Job Requirements:\n${JSON.stringify({ title: job.title, requiredSkills: job.requiredSkills, minYearsExperience: job.minYearsExperience, education: job.education, description: job.description, niceToHave: job.niceToHave })}`,
          `Candidate Profile:\n${JSON.stringify({ fullName: candidate.fullName, professionalTitle: candidate.professionalTitle, skills: candidate.skills, yearsExperience: candidate.yearsExperience, education: candidate.education, summary: candidate.summary })}`,
          candidate.cv?.extractedText ? `CV Text (first 3000 chars):\n${String(candidate.cv.extractedText).slice(0, 3000)}` : '',
        ].filter(Boolean).join('\n\n'),
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
          generationConfig: { temperature: 0.2, topP: 0.9, responseMimeType: 'application/json' },
        }),
      }
    );

    if (!response.ok) return null;
    const body = await response.json();
    const text = body?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    if (!text) return null;
    return parseGeminiJson(text);
  } catch {
    return null;
  }
}

async function callGeminiBatch(job: any, candidates: any[]): Promise<Map<string, any>> {
  const results = new Map<string, any>();
  if (!geminiApiKey || !candidates.length) return results;

  const compactCandidates = candidates.map((c, idx) => ({
    id: String(c._id || idx),
    fullName: c.fullName,
    professionalTitle: c.professionalTitle,
    skills: c.skills,
    yearsExperience: c.yearsExperience,
    education: c.education,
    summary: (c.summary || '').slice(0, 400),
    cvSnippet: c.cv?.extractedText ? String(c.cv.extractedText).slice(0, 1500) : '',
  }));

  const prompt = {
    role: 'user',
    parts: [
      {
        text: [
          'You are an expert recruiter. Evaluate EACH candidate in the list against the job requirements and return ranked results.',
          'Return ONLY strict JSON. No markdown, no commentary.',
          'Schema: {"evaluations": [{"id": string, "score": number (0-100), "recommendation": "hire"|"consider"|"pass", "matchedSkills": string[], "strengths": string[] (2-4 bullets), "gaps": string[] (1-3 bullets), "reasoning": string (2-3 sentences)}]}',
          'Scoring guide: 85-100=hire (strong fit), 70-84=consider (partial fit), 0-69=pass (weak fit). Be discerning — not every candidate should score high.',
          `Job Requirements:\n${JSON.stringify({ title: job.title, requiredSkills: job.requiredSkills, minYearsExperience: job.minYearsExperience, education: job.education, description: job.description, niceToHave: job.niceToHave })}`,
          `Candidates (${compactCandidates.length}):\n${JSON.stringify(compactCandidates)}`,
          'Return an evaluation for every candidate id. Do not omit any.',
        ].join('\n\n'),
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
          generationConfig: { temperature: 0.2, topP: 0.9, responseMimeType: 'application/json' },
        }),
      }
    );

    if (!response.ok) return results;
    const body = await response.json();
    const text = body?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const parsed = parseGeminiJson(text);
    const evaluations = parsed?.evaluations || parsed || [];
    if (Array.isArray(evaluations)) {
      for (const ev of evaluations) {
        if (ev?.id !== undefined) results.set(String(ev.id), ev);
      }
    }
  } catch {
    /* swallow — caller falls back to rule score */
  }

  return results;
}

function mergeEvaluation(job: any, candidate: any, aiOutput: any): any {
  const { score: baseRuleScore, matched: ruleMatched } = ruleScore(job, candidate);
  const geminiScore = clampScore(aiOutput?.score ?? baseRuleScore);
  const finalScore = clampScore(0.5 * baseRuleScore + 0.5 * geminiScore);
  const recommendation = aiOutput?.recommendation || recommendationFromScore(finalScore);

  const matchedSkills = Array.isArray(aiOutput?.matchedSkills) && aiOutput.matchedSkills.length
    ? aiOutput.matchedSkills
    : ruleMatched;

  return {
    score: finalScore,
    recommendation,
    matchedSkills,
    strengths: Array.isArray(aiOutput?.strengths) && aiOutput.strengths.length
      ? aiOutput.strengths
      : [
          `${candidate.yearsExperience || 0} years of experience`,
          `${matchedSkills.length}/${(job.requiredSkills || []).length} required skills matched`,
        ],
    gaps: Array.isArray(aiOutput?.gaps) && aiOutput.gaps.length
      ? aiOutput.gaps
      : ruleMatched.length < (job.requiredSkills || []).length
      ? [`Missing ${(job.requiredSkills || []).length - ruleMatched.length} required skill(s)`]
      : ['No major blockers detected'],
    reasoning: aiOutput?.reasoning
      || `${candidate.fullName} scored ${finalScore} based on ${matchedSkills.length}/${(job.requiredSkills || []).length} skill matches and ${candidate.yearsExperience || 0}y experience vs ${job.minYearsExperience || 0}y required.`,
  };
}

async function scoreCandidate(job: any, candidate: any): Promise<any> {
  const aiOutput = await callGeminiSingle(job, candidate);
  return mergeEvaluation(job, candidate, aiOutput);
}

async function batchScoreCandidates(job: any, candidates: any[], opts?: { batchSize?: number; onProgress?: (done: number, total: number) => void | Promise<void> }): Promise<Map<string, any>> {
  const batchSize = opts?.batchSize ?? 8;
  const results = new Map<string, any>();
  if (!candidates.length) return results;

  let done = 0;
  for (let i = 0; i < candidates.length; i += batchSize) {
    const batch = candidates.slice(i, i + batchSize);
    const batchResults = await callGeminiBatch(job, batch);

    for (const candidate of batch) {
      const id = String(candidate._id);
      const aiOutput = batchResults.get(id);
      results.set(id, mergeEvaluation(job, candidate, aiOutput));
      done += 1;
    }

    if (opts?.onProgress) await opts.onProgress(done, candidates.length);
  }

  return results;
}

export {
  scoreCandidate,
  batchScoreCandidates,
  recommendationFromScore,
};
