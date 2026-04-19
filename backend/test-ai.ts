import dotenv from 'dotenv';
dotenv.config();

const geminiApiKey = process.env.GEMINI_API_KEY;
const geminiModel = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

console.log('Using Model:', geminiModel);
console.log('API Key First 10 Chars:', geminiApiKey ? geminiApiKey.substring(0, 10) : 'MISSING');

async function callGemini() {
  const prompt = {
    role: 'user',
    parts: [
      {
        text: [
          'Evaluate candidate fit for this job and return strict JSON only.',
          'Schema: {"score": number, "recommendation": "hire|consider|pass", "matchedSkills": string[], "strengths": string[], "gaps": string[], "reasoning": string}',
          `Job: {"title": "Software Engineer", "requiredSkills": ["React", "Node"]}`,
          `Candidate: {"skills": ["React", "Java"], "yearsExperience": 3}`,
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
          generationConfig: {
            temperature: 0.2,
            topP: 0.9,
          },
        }),
      }
    );

    console.log('Response Status:', response.status);

    if (!response.ok) {
      const errText = await response.text();
      console.error('Error Response:', errText);
      return;
    }

    const body = await response.json();
    console.log('Full JSON Body:', JSON.stringify(body, null, 2));

    const text = body?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    console.log('Raw Text Output:', text);

    const cleaned = text.replace(/```json|```/g, '').trim();
    console.log('Cleaned Text for JSON:', cleaned);

    const parsed = JSON.parse(cleaned);
    console.log('Successfully Parsed:', parsed);
  } catch (err) {
    console.error('Exception caught:', err);
  }
}

callGemini();
