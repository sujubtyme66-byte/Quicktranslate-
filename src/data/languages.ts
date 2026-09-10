import { SupportedLanguage } from '../types';

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', geminiVoice: 'Kore' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', geminiVoice: 'Puck' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', geminiVoice: 'Fenrir' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', geminiVoice: 'Zephyr' },
  { code: 'zh', name: 'Chinese (Mandarin)', nativeName: '中文 (简体)', flag: '🇨🇳', geminiVoice: 'Kore' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', geminiVoice: 'Charon' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷', geminiVoice: 'Puck' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', geminiVoice: 'Zephyr' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', geminiVoice: 'Kore' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', geminiVoice: 'Charon' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', geminiVoice: 'Fenrir' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷', geminiVoice: 'Puck' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱', geminiVoice: 'Zephyr' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱', geminiVoice: 'Charon' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪', geminiVoice: 'Kore' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', geminiVoice: 'Zephyr' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩', geminiVoice: 'Kore' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳', geminiVoice: 'Zephyr' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭', geminiVoice: 'Puck' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', flag: '🇺🇦', geminiVoice: 'Charon' },
];

export const TONE_OPTIONS = [
  {
    id: 'professional',
    label: 'Professional & Diplomatic',
    description: 'Accurate, formal, context-preserving terminology for business, keynotes & documentaries',
  },
  {
    id: 'conversational',
    label: 'Natural & Conversational',
    description: 'Idiomatic, authentic everyday cadence for vlogs, interviews & creator content',
  },
  {
    id: 'cinematic',
    label: 'Cinematic Subtitle Standard',
    description: 'Concise timing, balanced reading speed, matching visual cues and emotional beats',
  },
  {
    id: 'technical',
    label: 'Technical & Academic',
    description: 'Precise domain terminology for tutorials, STEM lectures, coding & engineering',
  },
  {
    id: 'enthusiastic',
    label: 'Dynamic & Marketing',
    description: 'High-energy, persuasive phrasing for ads, promos, and product launches',
  },
] as const;
