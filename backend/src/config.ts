import 'dotenv/config';

interface Config {
  port: number;
  mongodbUri: string;
  jwtAccessSecret: string;
  jwtRefreshSecret: string;
  jwtAccessExpires: string;
  jwtRefreshExpires: string;
  geminiApiKey: string;
  geminiModel: string;
  clientUrl: string;
  twilioAccountSid: string;
  twilioAuthToken: string;
  twilioFromPhone: string;
  twilioWhatsAppFrom: string;
  gmailUser: string;
  gmailAppPassword: string;
  emailFromName: string;
  atApiKey: string;
  atUsername: string;
  atSenderId: string;
}

const config: Config = {
  port: Number(process.env.PORT || 4000),
  mongodbUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/rankr',
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || 'dev_access_secret',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret',
  jwtAccessExpires: process.env.JWT_ACCESS_EXPIRES || '15m',
  jwtRefreshExpires: process.env.JWT_REFRESH_EXPIRES || '7d',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  twilioAccountSid: process.env.TWILIO_ACCOUNT_SID || '',
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN || '',
  twilioFromPhone: process.env.TWILIO_FROM_PHONE || '',
  twilioWhatsAppFrom: process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886',
  gmailUser: process.env.GMAIL_USER || '',
  gmailAppPassword: process.env.GMAIL_APP_PASSWORD || '',
  emailFromName: process.env.EMAIL_FROM_NAME || 'Rankr Hiring Team',
  atApiKey: process.env.AT_API_KEY || '',
  atUsername: process.env.AT_USERNAME || 'sandbox',
  atSenderId: process.env.AT_SENDER_ID ?? '',
};

export default config;
