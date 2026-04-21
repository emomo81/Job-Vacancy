import twilio from 'twilio';
import config from '../config';

let twilioClient: ReturnType<typeof twilio> | null = null;

function getClient() {
  if (!config.twilioAccountSid || !config.twilioAuthToken) return null;
  if (!twilioClient) {
    twilioClient = twilio(config.twilioAccountSid, config.twilioAuthToken);
  }
  return twilioClient;
}

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return digits.startsWith('+') ? phone.trim() : `+${digits}`;
}

// ── Gemini: generate personalised shortlist message ───────────────────────────

export async function generateShortlistMessage(params: {
  candidateName: string;
  jobTitle: string;
  companyName: string;
  skills: string[];
  score: number;
}): Promise<string> {
  const { candidateName, jobTitle, companyName, skills, score } = params;

  if (!config.geminiApiKey) {
    return (
      `Dear ${candidateName},\n\n` +
      `Congratulations! We are pleased to inform you that your application for the ${jobTitle} role at ${companyName} ` +
      `has been shortlisted. Your profile stood out with a match score of ${score}%.\n\n` +
      `Our team will be in touch shortly with next steps.\n\nBest regards,\n${companyName} Hiring Team`
    );
  }

  const prompt = [
    'Generate a warm, professional, and concise shortlist notification message for a job applicant.',
    'Keep it under 280 characters (for SMS compatibility). No placeholders. No markdown. Plain text only.',
    `Candidate: ${candidateName}`,
    `Job Title: ${jobTitle}`,
    `Company: ${companyName}`,
    `Match Score: ${score}%`,
    `Top Skills: ${skills.slice(0, 4).join(', ')}`,
    'The message should congratulate them, mention the role, and say the team will be in touch.',
  ].join('\n');

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${config.geminiModel}:generateContent?key=${config.geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 150 },
        }),
      }
    );

    if (!response.ok) throw new Error('Gemini request failed');
    const body = await response.json();
    const text = String(body?.candidates?.[0]?.content?.parts?.[0]?.text || '').trim();
    if (!text) throw new Error('Empty response');
    return text;
  } catch {
    // Fallback if Gemini fails
    return `Hi ${candidateName}! 🎉 Congrats — your application for ${jobTitle} at ${companyName} has been shortlisted (${score}% match). Our team will reach out soon with next steps!`;
  }
}

// ── SMS ───────────────────────────────────────────────────────────────────────

export async function sendSms(to: string, body: string): Promise<{ success: boolean; sid?: string; error?: string }> {
  const client = getClient();
  if (!client) return { success: false, error: 'Twilio not configured' };
  if (!config.twilioFromPhone) return { success: false, error: 'TWILIO_FROM_PHONE not set' };

  try {
    const msg = await client.messages.create({
      body,
      from: config.twilioFromPhone,
      to: normalizePhone(to),
    });
    return { success: true, sid: msg.sid };
  } catch (err: any) {
    return { success: false, error: err?.message || 'SMS send failed' };
  }
}

// ── WhatsApp ──────────────────────────────────────────────────────────────────

export async function sendWhatsApp(to: string, body: string): Promise<{ success: boolean; sid?: string; error?: string }> {
  const client = getClient();
  if (!client) return { success: false, error: 'Twilio not configured' };

  try {
    const msg = await client.messages.create({
      body,
      from: config.twilioWhatsAppFrom,
      to: `whatsapp:${normalizePhone(to)}`,
    });
    return { success: true, sid: msg.sid };
  } catch (err: any) {
    return { success: false, error: err?.message || 'WhatsApp send failed' };
  }
}

// ── Orchestrator ──────────────────────────────────────────────────────────────

export interface NotificationResult {
  sms: { sent: boolean; sid?: string; error?: string } | null;
  whatsapp: { sent: boolean; sid?: string; error?: string } | null;
  message: string;
}

export async function notifyShortlisted(params: {
  candidateName: string;
  phone: string;
  whatsappNumber: string;
  jobTitle: string;
  companyName: string;
  skills: string[];
  score: number;
}): Promise<NotificationResult> {
  const { phone, whatsappNumber, ...msgParams } = params;

  const message = await generateShortlistMessage(msgParams);

  const [smsResult, waResult] = await Promise.all([
    phone ? sendSms(phone, message) : Promise.resolve(null),
    whatsappNumber ? sendWhatsApp(whatsappNumber, message) : Promise.resolve(null),
  ]);

  return {
    message,
    sms: smsResult ? { sent: smsResult.success, sid: smsResult.sid, error: smsResult.error } : null,
    whatsapp: waResult ? { sent: waResult.success, sid: waResult.sid, error: waResult.error } : null,
  };
}
