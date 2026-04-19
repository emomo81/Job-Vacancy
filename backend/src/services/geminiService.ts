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

function ruleScore(job: any, candidate: any): number {
  const reqSkills = (job.requiredSkills || []).map((s: string) => s.toLowerCase());
  const candSkills = (candidate.skills || []).map((s: string) => s.toLowerCase());

  let matchedCount = 0;
  for (const skill of reqSkills) {
    if (candSkills.includes(skill)) matchedCount += 1;
  }

  const skillRatio = reqSkills.length > 0 ? matchedCount / reqSkills.length : 0.5;
  const expRatio = Math.min(1, (candidate.yearsExperience || 0) / Math.max(1, job.minYearsExperience || 1));
  const raw = skillRatio * 75 + expRatio * 25;
  return clampScore(raw);
}

function parseGeminiJson(text: string): any {
  try {
    const cleaned = text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (error) {
    return null;
  }
}

async function callGemini(job: any, candidate: any): Promise<any> {
  if (!geminiApiKey) return null;

  const prompt = {
    role: 'user',
    parts: [
      {
        text: [
          'Evaluate candidate fit for this job and return strict JSON only.',
          'Schema: {"score": number, "recommendation": "hire|consider|pass", "matchedSkills": string[], "strengths": string[], "gaps": string[], "reasoning": string}',
          `Job: ${JSON.stringify(job)}`,
          `Candidate Profile Data: ${JSON.stringify(candidate)}`,
          candidate.cv?.extractedText ? `Candidate CV Text:\n${candidate.cv.extractedText}` : 'No CV Uploaded',
        ].join('\n'),
      },
    ],
  };

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiApiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [prompt],
        generationConfig: {
          temperature: 0.2,
          topP: 0.9,
        },
      }),
    }
  );

  if (!response.ok) {
    return null;
  }

  const body = await response.json();
  const text = body?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  if (!text) return null;
  return parseGeminiJson(text);
}

async function scoreCandidate(job: any, candidate: any): Promise<any> {
  const baseRuleScore = ruleScore(job, candidate);
  const aiOutput = await callGemini(job, candidate);

  const geminiScore = clampScore(aiOutput?.score ?? baseRuleScore);
  const finalScore = clampScore(0.6 * baseRuleScore + 0.4 * geminiScore);
  const recommendation = aiOutput?.recommendation || recommendationFromScore(finalScore);

  const reqSkills = job.requiredSkills || [];
  const candSkills = candidate.skills || [];
  const matchedSkills = aiOutput?.matchedSkills?.length
    ? aiOutput.matchedSkills
    : reqSkills.filter((skill: string) => candSkills.map((s: string) => s.toLowerCase()).includes(skill.toLowerCase()));

  return {
    score: finalScore,
    recommendation,
    matchedSkills,
    strengths: aiOutput?.strengths?.length ? aiOutput.strengths : [
      `${candidate.fullName} has ${candidate.yearsExperience || 0} years of experience`,
      `Strong relevance to ${job.title}`,
    ],
    gaps: aiOutput?.gaps?.length ? aiOutput.gaps : ['No major blockers detected from available data'],
    reasoning: aiOutput?.reasoning || `${candidate.fullName} is evaluated against required skills and experience for ${job.title}.`,
  };
}

export {
  scoreCandidate,
  recommendationFromScore,
};
