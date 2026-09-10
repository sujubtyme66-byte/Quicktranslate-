export interface SubtitleSegment {
  id: string;
  startTime: number; // in seconds
  endTime: number; // in seconds
  speaker: string;
  originalText: string;
  translatedText: string;
  notes?: string;
}

export type TranslationTone =
  | 'professional'
  | 'conversational'
  | 'cinematic'
  | 'technical'
  | 'enthusiastic';

export interface VocabularyItem {
  term: string;
  translation: string;
  definition: string;
}

export interface TranslationProject {
  id: string;
  videoTitle: string;
  videoUrl: string;
  sourceLanguage: string;
  targetLanguage: string;
  tone: TranslationTone;
  segments: SubtitleSegment[];
  summary?: string;
  culturalNotes?: string[];
  vocabularyGlossary?: VocabularyItem[];
  detectedOriginalLanguage?: string;
  createdAt: string;
}

export interface SupportedLanguage {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  geminiVoice?: 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr';
}

export type AudioDubMode = 'original' | 'dubbed' | 'ducked' | 'dual';

export interface SampleVideoItem {
  id: string;
  title: string;
  category: string;
  sourceLanguage: string;
  targetLanguageDefault: string;
  videoUrl: string;
  duration: number;
  description: string;
  segments: SubtitleSegment[];
  summary: string;
  culturalNotes: string[];
}
