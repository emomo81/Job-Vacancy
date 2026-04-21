import twilio from 'twilio';
import nodemailer from 'nodemailer';
import config from '../config';

// ── Africa's Talking — direct REST API (SDK doesn't expose bulkSMSMode) ──────

async function atSmsSend(to: string, message: string): Promise<{ SMSMessageData: { Message: string; Recipients: any[] } }> {
  // bulkSMSMode=0 → standard/premium route (not the shared AFRICASTKNG bulk shortcode)
  const params: Record<string, string> = {
    username: config.atUsername,
    to: normalizePhone(to),
    message,
    bulkSMSMode: '0',
  };
  if (config.atUsername !== 'sandbox' && config.atSenderId) {
    params.from = config.atSenderId;
  }

  const res = await fetch('https://api.africastalking.com/version1/messaging', {
    method: 'POST',
    headers: {
      apiKey: config.atApiKey,
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: new URLSearchParams(params).toString(),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`AT HTTP ${res.status}: ${text}`);
  }
  return res.json();
}

// ── Twilio client (fallback) ──────────────────────────────────────────────────

let twilioClient: ReturnType<typeof twilio> | null = null;

function getTwilioClient() {
  if (!config.twilioAccountSid || !config.twilioAuthToken) return null;
  if (!twilioClient) {
    twilioClient = twilio(config.twilioAccountSid, config.twilioAuthToken);
  }
  return twilioClient;
}

function normalizePhone(phone: string): string {
  const trimmed = phone.trim();
  const digits = trimmed.replace(/\D/g, '');
  return trimmed.startsWith('+') ? trimmed : `+${digits}`;
}

// ── Shared Gemini helper ──────────────────────────────────────────────────────

async function callGemini(prompt: string, maxTokens = 512): Promise<string> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${config.geminiModel}:generateContent?key=${config.geminiApiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: maxTokens,
          thinkingConfig: { thinkingBudget: 0 },
        },
      }),
    }
  );
  if (!response.ok) throw new Error('Gemini request failed');
  const body = await response.json();
  // gemini-2.5-flash may prepend thinking chunks (thought: true) — skip them
  const parts: any[] = body?.candidates?.[0]?.content?.parts || [];
  const outputPart = parts.find((p: any) => !p.thought) ?? parts[parts.length - 1];
  return String(outputPart?.text || '').trim();
}

// ── Gemini: short SMS notification (≤100 chars, plain text) ──────────────────

export async function generateShortlistMessage(params: {
  candidateName: string;
  jobTitle: string;
  companyName: string;
  skills: string[];
  score: number;
}): Promise<string> {
  const { candidateName, jobTitle, companyName, skills, score } = params;
  const firstName = candidateName.split(' ')[0];

  // Keep under 80 chars — Rwanda operators reject "shortlisted" keyword AND longer messages
  // NEVER use the word "shortlisted" — it triggers carrier content filters on AT bulk shortcode
  // "Hi Emmanuel, Rankr selected your Data Science application. We'll be in touch." = 78 chars ✓
  const fallback =
    `Hi ${firstName}, ${companyName} selected your ${jobTitle} application. We'll be in touch.`;

  if (!config.geminiApiKey) return fallback;

  const prompt =
    `Write a job application success SMS. HARD RULES:\n` +
    `- UNDER 80 characters total (count every character including spaces)\n` +
    `- Start with: Congratulations ${firstName}!\n` +
    `- Mention: ${jobTitle} role at ${companyName}\n` +
    `- NEVER use the word "shortlisted" — use "selected" or "chosen" instead\n` +
    `- End with: Our team will contact you soon.\n` +
    `- Plain text only — no emojis, no asterisks, no newlines\n` +
    `Output ONLY the message text, nothing else.`;

  try {
    const text = await callGemini(prompt, 256);
    const lower = text.toLowerCase();
    if (!text || !text.includes(firstName) || text.length < 30) {
      console.warn('[Gemini SMS] unusable, using fallback. Got:', text.slice(0, 60));
      return fallback;
    }
    if (text.length > 80) {
      console.warn('[Gemini SMS] too long (' + text.length + ' chars), using fallback');
      return fallback;
    }
    if (lower.includes('shortlist')) {
      console.warn('[Gemini SMS] contains banned word "shortlist", using fallback');
      return fallback;
    }
    console.log('[Gemini SMS] generated (' + text.length + ' chars):', text);
    return text;
  } catch (err) {
    console.error('[Gemini SMS] error:', err);
    return fallback;
  }
}

// ── Gemini: longer WhatsApp notification (with *bold* markdown) ───────────────

export async function generateWhatsAppMessage(params: {
  candidateName: string;
  jobTitle: string;
  companyName: string;
  skills: string[];
  score: number;
}): Promise<string> {
  const { candidateName, jobTitle, companyName, skills, score } = params;
  const firstName = candidateName.split(' ')[0];
  const topSkills = skills.slice(0, 3).join(', ') || 'your skills';

  // Template that matches the user's desired format
  const fallback =
    `Congratulations ${firstName}! Your application for the *${jobTitle}* role at *${companyName}* ` +
    `has been shortlisted with a *${score}% match score*. ` +
    `Your expertise in *${topSkills}* stood out. ` +
    `Our team will contact you soon with next steps. - ${companyName} Hiring Team`;

  if (!config.geminiApiKey) return fallback;

  const prompt =
    `Write a WhatsApp shortlist notification message. RULES:\n` +
    `- 2-3 sentences, warm and professional\n` +
    `- Use *word* for bold (WhatsApp markdown)\n` +
    `- Start with: Congratulations ${firstName}!\n` +
    `- Mention: *${jobTitle}* role at *${companyName}*, *${score}% match score*, skills: ${topSkills}\n` +
    `- End with: Our team will contact you soon with next steps. - ${companyName} Hiring Team\n` +
    `- No emojis, no newlines within the message\n` +
    `Output ONLY the message text, nothing else.`;

  try {
    const text = await callGemini(prompt, 512);
    if (!text || !text.includes(firstName) || text.length < 80) {
      console.warn('[Gemini WA] unusable, using fallback. Got:', text.slice(0, 80));
      return fallback;
    }
    console.log('[Gemini WA] generated (' + text.length + ' chars):', text);
    return text;
  } catch (err) {
    console.error('[Gemini WA] error:', err);
    return fallback;
  }
}

// ── Gemini: generate a longer personalised email body ────────────────────────

async function generateEmailBody(params: {
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
      `We are thrilled to let you know that your application for the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong> has been shortlisted!\n\n` +
      `Your profile achieved an AI match score of <strong>${score}%</strong>, with standout skills in ${skills.slice(0, 3).join(', ')}.\n\n` +
      `Our hiring team will be in touch shortly to discuss the next steps in the process.\n\n` +
      `Best regards,\n${companyName} Hiring Team`
    );
  }

  const prompt = [
    'Write a professional, warm, and encouraging shortlist notification email body for a job applicant.',
    'Tone: friendly but professional. Length: 3 short paragraphs. No subject line. No markdown. Plain text only.',
    'Paragraph 1: congratulate them on being shortlisted for the role.',
    'Paragraph 2: mention their match score and 2-3 of their top skills that stood out.',
    'Paragraph 3: say the team will be in touch soon with next steps.',
    `Candidate Name: ${candidateName}`,
    `Job Title: ${jobTitle}`,
    `Company: ${companyName}`,
    `Match Score: ${score}%`,
    `Top Skills: ${skills.slice(0, 4).join(', ')}`,
  ].join('\n');

  try {
    const text = await callGemini(prompt, 1024);
    if (!text) throw new Error('Empty response');
    return text;
  } catch {
    return (
      `Dear ${candidateName},\n\n` +
      `We are excited to inform you that your application for the ${jobTitle} position at ${companyName} has been shortlisted! ` +
      `Your profile stood out with an impressive ${score}% match score.\n\n` +
      `Your expertise in ${skills.slice(0, 3).join(', ')} particularly caught our attention.\n\n` +
      `Our team will be in touch shortly to discuss the next steps. We look forward to speaking with you!`
    );
  }
}

// ── Build HTML email template ─────────────────────────────────────────────────

function buildEmailHtml(params: {
  candidateName: string;
  jobTitle: string;
  companyName: string;
  score: number;
  skills: string[];
  bodyText: string;
}): string {
  const { candidateName, jobTitle, companyName, score, skills, bodyText } = params;
  const firstName = candidateName.split(' ')[0];
  const topSkills = skills.slice(0, 4);
  const paragraphs = bodyText.split('\n\n').filter(Boolean);

  const skillPills = topSkills
    .map(
      (s) =>
        `<span style="display:inline-block;background:#e8f1ff;color:#2a85ff;font-size:12px;font-weight:700;border-radius:999px;padding:4px 14px;margin:3px 4px 3px 0;">${s}</span>`
    )
    .join('');

  const bodyParagraphs = paragraphs
    .map(
      (p) =>
        `<p style="margin:0 0 16px;color:#3d4f61;font-size:15px;line-height:1.7;">${p
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\n/g, '<br/>')}</p>`
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>You've been shortlisted!</title>
</head>
<body style="margin:0;padding:0;background:#f4f7fb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7fb;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#070707 0%,#1a2a3a 100%);border-radius:20px 20px 0 0;padding:40px 48px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="font-size:22px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">Rankr</span>
                  </td>
                  <td align="right">
                    <span style="background:#2a85ff;color:#fff;font-size:11px;font-weight:800;border-radius:999px;padding:5px 14px;letter-spacing:0.5px;text-transform:uppercase;">Shortlisted</span>
                  </td>
                </tr>
              </table>
              <div style="margin-top:32px;">
                <p style="margin:0 0 8px;color:rgba(255,255,255,0.6);font-size:14px;font-weight:600;">Hello, ${firstName} 👋</p>
                <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:900;line-height:1.25;">You've been shortlisted!</h1>
                <p style="margin:12px 0 0;color:rgba(255,255,255,0.7);font-size:15px;">for <strong style="color:#fff;">${jobTitle}</strong> at <strong style="color:#fff;">${companyName}</strong></p>
              </div>
            </td>
          </tr>

          <!-- Score banner -->
          <tr>
            <td style="background:#2a85ff;padding:20px 48px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <p style="margin:0;color:rgba(255,255,255,0.85);font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">AI Match Score</p>
                    <p style="margin:4px 0 0;color:#ffffff;font-size:32px;font-weight:900;">${score}<span style="font-size:18px;">%</span></p>
                  </td>
                  <td align="right" style="padding-left:24px;">
                    <div>${skillPills}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#ffffff;padding:40px 48px;">
              ${bodyParagraphs}

              <!-- CTA -->
              <div style="margin:32px 0;text-align:center;">
                <a href="${config.clientUrl}/candidate/applications" style="display:inline-block;background:#2a85ff;color:#ffffff;font-size:15px;font-weight:800;border-radius:12px;padding:16px 40px;text-decoration:none;letter-spacing:-0.2px;">
                  View My Applications →
                </a>
              </div>

              <p style="margin:24px 0 0;color:#8a9ab0;font-size:13px;border-top:1px solid #e2eaf2;padding-top:24px;">
                This email was sent because your profile on Rankr was shortlisted by a recruiter.
                If you have any questions, reply to this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f4f7fb;border-radius:0 0 20px 20px;padding:24px 48px;text-align:center;">
              <p style="margin:0;color:#b0bac6;font-size:12px;">© ${new Date().getFullYear()} Rankr · AI-Powered Talent Screening</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ── Email via Gmail (Nodemailer) ──────────────────────────────────────────────

let _transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!config.gmailUser || !config.gmailAppPassword) return null;
  if (!_transporter) {
    _transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: config.gmailUser,
        pass: config.gmailAppPassword,  // 16-char App Password, NOT your Gmail password
      },
    });
  }
  return _transporter;
}

export async function sendEmail(params: {
  to: string;
  candidateName: string;
  jobTitle: string;
  companyName: string;
  score: number;
  skills: string[];
}): Promise<{ success: boolean; error?: string }> {
  const transporter = getTransporter();
  if (!transporter) return { success: false, error: 'GMAIL_USER or GMAIL_APP_PASSWORD not configured' };

  const bodyText = await generateEmailBody(params);
  const html = buildEmailHtml({ ...params, bodyText });

  try {
    await transporter.sendMail({
      to: params.to,
      from: `"${config.emailFromName}" <${config.gmailUser}>`,
      subject: `🎉 You've been shortlisted for ${params.jobTitle} at ${params.companyName}!`,
      text: bodyText,
      html,
    });
    console.log('[Email] sent to', params.to, 'via Gmail');
    return { success: true };
  } catch (err: any) {
    console.error('[Email] error:', err?.message);
    return { success: false, error: err?.message || 'Email send failed' };
  }
}

// ── SMS (Africa's Talking → Twilio fallback) ──────────────────────────────────

export async function sendSms(to: string, body: string): Promise<{ success: boolean; sid?: string; error?: string }> {
  // Africa's Talking — preferred (direct REST API so we can set bulkSMSMode=0)
  if (config.atApiKey) {
    try {
      console.log(
        '[AT SMS] sending to', normalizePhone(to),
        '| username:', config.atUsername,
        '| chars:', body.length,
        '| msg:', body
      );
      const result = await atSmsSend(to, body);
      console.log('[AT SMS] response:', JSON.stringify(result, null, 2));

      const recipient = result?.SMSMessageData?.Recipients?.[0];
      const code = recipient?.statusCode;
      console.log(
        '[AT SMS] status:', recipient?.status,
        '| code:', code,
        '| network:', recipient?.networkCode,
        '| cost:', recipient?.cost
      );
      // 101 = Sent, 100 = Processed, 102 = Queued — all are success
      if (code === 101 || code === 100 || code === 102 || recipient?.status === 'Success') {
        return { success: true, sid: recipient.messageId };
      }
      throw new Error(`code ${code}: ${recipient?.status || 'unknown'} (network: ${recipient?.networkCode ?? 'n/a'})`);
    } catch (err: any) {
      console.error('[AT SMS] error:', err?.message || err);
      return { success: false, error: `AT: ${err?.message || 'SMS send failed'}` };
    }
  }

  // Twilio fallback
  const twilioClient = getTwilioClient();
  if (!twilioClient) return { success: false, error: 'No SMS provider configured (set AT_API_KEY or Twilio vars)' };
  if (!config.twilioFromPhone) return { success: false, error: 'TWILIO_FROM_PHONE not set' };

  try {
    const msg = await twilioClient.messages.create({
      body,
      from: config.twilioFromPhone,
      to: normalizePhone(to),
    });
    return { success: true, sid: msg.sid };
  } catch (err: any) {
    return { success: false, error: err?.message || 'SMS send failed' };
  }
}

// ── WhatsApp (Twilio) ─────────────────────────────────────────────────────────

export async function sendWhatsApp(to: string, body: string): Promise<{ success: boolean; sid?: string; error?: string }> {
  const client = getTwilioClient();
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
  email: { sent: boolean; error?: string } | null;
  sms: { sent: boolean; sid?: string; error?: string } | null;
  whatsapp: { sent: boolean; sid?: string; error?: string } | null;
  message: string;
}

export async function notifyShortlisted(params: {
  candidateName: string;
  email: string;
  phone: string;
  whatsappNumber: string;
  jobTitle: string;
  companyName: string;
  skills: string[];
  score: number;
}): Promise<NotificationResult> {
  const { email, phone, whatsappNumber, ...msgParams } = params;

  // Generate channel-specific messages in parallel:
  //   SMS       — short plain text (≤100 chars) for operator delivery
  //   WhatsApp  — longer, uses *bold* markdown, includes skills + score detail
  const [smsMessage, waMessage] = await Promise.all([
    phone || whatsappNumber ? generateShortlistMessage(msgParams) : Promise.resolve(''),
    whatsappNumber ? generateWhatsAppMessage(msgParams) : Promise.resolve(''),
  ]);

  const [smsResult, waResult, emailResult] = await Promise.all([
    phone ? sendSms(phone, smsMessage) : Promise.resolve(null),
    whatsappNumber ? sendWhatsApp(whatsappNumber, waMessage) : Promise.resolve(null),
    email ? sendEmail({ to: email, ...msgParams }) : Promise.resolve(null),
  ]);

  return {
    message: smsMessage || waMessage,
    email: emailResult ? { sent: emailResult.success, error: emailResult.error } : null,
    sms: smsResult ? { sent: smsResult.success, sid: smsResult.sid, error: smsResult.error } : null,
    whatsapp: waResult ? { sent: waResult.success, sid: waResult.sid, error: waResult.error } : null,
  };
}
