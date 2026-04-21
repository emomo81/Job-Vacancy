import twilio from 'twilio';
import sgMail from '@sendgrid/mail';
import AfricasTalking from 'africastalking';
import config from '../config';

// ── Africa's Talking client ───────────────────────────────────────────────────

let atSmsClient: any = null;

function getAtClient() {
  if (!config.atApiKey) return null;
  if (!atSmsClient) {
    const at = (AfricasTalking as any)({ apiKey: config.atApiKey, username: config.atUsername });
    atSmsClient = at.SMS;
  }
  return atSmsClient;
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
  const digits = phone.replace(/\D/g, '');
  return digits.startsWith('+') ? phone.trim() : `+${digits}`;
}

// ── Gemini: generate personalised shortlist message (plain-text for SMS/WA) ──

export async function generateShortlistMessage(params: {
  candidateName: string;
  jobTitle: string;
  companyName: string;
  skills: string[];
  score: number;
}): Promise<string> {
  const { candidateName, jobTitle, companyName, skills, score } = params;
  const firstName = candidateName.split(' ')[0];
  const topSkills = skills.slice(0, 3).join(', ') || 'your skills';

  const fallback =
    `Congratulations ${firstName}! Your application for the ${jobTitle} role at ${companyName} ` +
    `has been shortlisted with a ${score}% match score. Your expertise in ${topSkills} stood out. ` +
    `Our team will contact you soon with next steps. - ${companyName} Hiring Team`;

  if (!config.geminiApiKey) return fallback;

  const prompt =
    `Write a single SMS shortlist notification. It MUST include ALL of the following:\n` +
    `1. Address the candidate by first name: ${firstName}\n` +
    `2. Congratulate them on being shortlisted\n` +
    `3. Mention the exact job title: ${jobTitle}\n` +
    `4. Mention the company: ${companyName}\n` +
    `5. Include their AI match score: ${score}%\n` +
    `6. Mention 1-2 of their top skills: ${topSkills}\n` +
    `7. Say the team will be in touch soon\n` +
    `Rules: plain text only, no emojis, no markdown, no quotes, under 320 characters, one paragraph.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${config.geminiModel}:generateContent?key=${config.geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 512,
            thinkingConfig: { thinkingBudget: 0 },
          },
        }),
      }
    );

    if (!response.ok) throw new Error('Gemini request failed');
    const body = await response.json();

    // gemini-2.5-flash returns thinking chunks first (thought: true) —
    // skip those and find the actual output part
    const parts: any[] = body?.candidates?.[0]?.content?.parts || [];
    const outputPart = parts.find((p: any) => !p.thought) ?? parts[parts.length - 1];
    const text = String(outputPart?.text || '').trim();

    if (!text || !text.includes(firstName) || text.length < 80) {
      console.warn('[Gemini SMS] unusable response, using fallback. Got:', text.slice(0, 60));
      return fallback;
    }
    return text;
  } catch (err) {
    console.error('[Gemini SMS] error:', err);
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
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${config.geminiModel}:generateContent?key=${config.geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
            thinkingConfig: { thinkingBudget: 0 },
          },
        }),
      }
    );

    if (!response.ok) throw new Error('Gemini request failed');
    const body = await response.json();
    const parts: any[] = body?.candidates?.[0]?.content?.parts || [];
    const outputPart = parts.find((p: any) => !p.thought) ?? parts[parts.length - 1];
    const text = String(outputPart?.text || '').trim();
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
                <a href="https://rankr.app/candidate/applications" style="display:inline-block;background:#2a85ff;color:#ffffff;font-size:15px;font-weight:800;border-radius:12px;padding:16px 40px;text-decoration:none;letter-spacing:-0.2px;">
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

// ── SendGrid email ────────────────────────────────────────────────────────────

export async function sendEmail(params: {
  to: string;
  candidateName: string;
  jobTitle: string;
  companyName: string;
  score: number;
  skills: string[];
}): Promise<{ success: boolean; error?: string }> {
  if (!config.sendgridApiKey) return { success: false, error: 'SENDGRID_API_KEY not configured' };
  if (!config.sendgridFromEmail) return { success: false, error: 'SENDGRID_FROM_EMAIL not configured' };

  sgMail.setApiKey(config.sendgridApiKey);

  const bodyText = await generateEmailBody(params);
  const html = buildEmailHtml({ ...params, bodyText });

  try {
    await sgMail.send({
      to: params.to,
      from: { email: config.sendgridFromEmail, name: config.sendgridFromName },
      subject: `🎉 You've been shortlisted for ${params.jobTitle} at ${params.companyName}!`,
      text: bodyText,
      html,
    });
    return { success: true };
  } catch (err: any) {
    const message = err?.response?.body?.errors?.[0]?.message || err?.message || 'Email send failed';
    return { success: false, error: message };
  }
}

// ── SMS (Africa's Talking → Twilio fallback) ──────────────────────────────────

export async function sendSms(to: string, body: string): Promise<{ success: boolean; sid?: string; error?: string }> {
  const atClient = getAtClient();

  // Africa's Talking — preferred
  if (atClient) {
    try {
      const payload: any = {
        to: [normalizePhone(to)],
        message: body,
      };
      if (config.atUsername !== 'sandbox' && config.atSenderId) payload.from = config.atSenderId;

      console.log('[AT SMS] sending to', normalizePhone(to), '| username:', config.atUsername);
      const result = await atClient.send(payload);
      console.log('[AT SMS] response:', JSON.stringify(result, null, 2));

      const recipient = result?.SMSMessageData?.Recipients?.[0];
      const code = recipient?.statusCode;
      // 101 = Sent, 100 = Processed, 102 = Queued — all are success
      if (code === 101 || code === 100 || code === 102 || recipient?.status === 'Success') {
        return { success: true, sid: recipient.messageId };
      }
      throw new Error(`code ${code}: ${recipient?.status || 'unknown'}`);
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

  // SMS and email have different text — generate the short one for SMS/WA first
  const message = await generateShortlistMessage(msgParams);

  const [smsResult, waResult, emailResult] = await Promise.all([
    phone ? sendSms(phone, message) : Promise.resolve(null),
    whatsappNumber ? sendWhatsApp(whatsappNumber, message) : Promise.resolve(null),
    email
      ? sendEmail({ to: email, ...msgParams })
      : Promise.resolve(null),
  ]);

  return {
    message,
    email: emailResult ? { sent: emailResult.success, error: emailResult.error } : null,
    sms: smsResult ? { sent: smsResult.success, sid: smsResult.sid, error: smsResult.error } : null,
    whatsapp: waResult ? { sent: waResult.success, sid: waResult.sid, error: waResult.error } : null,
  };
}
