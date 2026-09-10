import React, { useState } from 'react';
import { Mic, Volume2, Sparkles, Play, Check, ShieldCheck } from 'lucide-react';
import { AudioDubMode } from '../types';
import { playDubbedSpeech } from '../utils/audioSynthesis';

interface DubbingControlsProps {
  audioDubMode: AudioDubMode;
  onAudioDubModeChange: (mode: AudioDubMode) => void;
  targetLanguageCode: string;
  targetLanguageName: string;
}

export const DubbingControls: React.FC<DubbingControlsProps> = ({
  audioDubMode,
  onAudioDubModeChange,
  targetLanguageCode,
  targetLanguageName,
}) => {
  const [selectedVoice, setSelectedVoice] = useState<'Kore' | 'Puck' | 'Fenrir' | 'Zephyr' | 'Charon'>('Kore');
  const [isTestingVoice, setIsTestingVoice] = useState(false);

  const testVoiceSample = async () => {
    setIsTestingVoice(true);
    const samplePhrases: Record<string, string> = {
      es: 'Hola, esta es una demostración de doblaje profesional con inteligencia artificial.',
      fr: 'Bonjour, ceci est une démonstration de doublage professionnel par intelligence artificielle.',
      de: 'Hallo, dies ist eine Demonstration professioneller KI-Synchronisation.',
      ja: 'こんにちは、これは人工知能によるプロフェッショナルな吹き替えのデモです。',
      zh: '您好，这是人工智能专业配音演示。',
      it: 'Ciao, questa è una dimostrazione di doppiaggio professionale con intelligenza artificiale.',
      en: 'Hello, this is a live demonstration of professional AI video dubbing.',
    };

    const phrase = samplePhrases[targetLanguageCode] || `Hello, testing AI voice dubbing for ${targetLanguageName}.`;
    await playDubbedSpeech(phrase, targetLanguageCode, {
      onEnd: () => setIsTestingVoice(false),
    });
    setIsTestingVoice(false);
  };

  return (
    <div
      id="dubbing-controls-card"
      className="bg-slate-900/80 rounded-2xl border border-slate-800/80 p-4 shadow-xl space-y-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-950 border border-indigo-500/30 text-indigo-400">
            <Mic className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100">AI Video Dubbing & Voiceover</h3>
            <p className="text-xs text-slate-400">Synchronized speech synthesis in {targetLanguageName}</p>
          </div>
        </div>

        <button
          id="test-voice-btn"
          onClick={testVoiceSample}
          disabled={isTestingVoice}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-indigo-300 border border-slate-700 transition-colors"
        >
          <Play className={`w-3 h-3 ${isTestingVoice ? 'animate-pulse' : ''}`} />
          <span>{isTestingVoice ? 'Speaking...' : 'Test Voice'}</span>
        </button>
      </div>

      {/* Mode selection cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
        {/* Original */}
        <div
          onClick={() => onAudioDubModeChange('original')}
          className={`p-3 rounded-xl border cursor-pointer transition-all ${
            audioDubMode === 'original'
              ? 'bg-indigo-950/50 border-indigo-500 text-indigo-200 ring-1 ring-indigo-500/30'
              : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
          }`}
        >
          <div className="font-semibold flex items-center justify-between">
            <span>Original Audio</span>
            {audioDubMode === 'original' && <Check className="w-3.5 h-3.5 text-indigo-400" />}
          </div>
          <p className="text-[11px] text-slate-400 mt-1 leading-snug">
            Original video soundtrack with translated visual subtitles.
          </p>
        </div>

        {/* Ducked Voiceover */}
        <div
          onClick={() => onAudioDubModeChange('ducked')}
          className={`p-3 rounded-xl border cursor-pointer transition-all ${
            audioDubMode === 'ducked'
              ? 'bg-emerald-950/50 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500/30'
              : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
          }`}
        >
          <div className="font-semibold flex items-center justify-between">
            <span className="flex items-center gap-1">
              <span>Ducked Voiceover</span>
              <span className="text-[9px] bg-emerald-900/80 text-emerald-300 px-1.5 py-0.2 rounded">PRO</span>
            </span>
            {audioDubMode === 'ducked' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
          </div>
          <p className="text-[11px] text-slate-400 mt-1 leading-snug">
            Lowers original video sound to 18% while speaking translated voiceover.
          </p>
        </div>

        {/* Dubbed Only */}
        <div
          onClick={() => onAudioDubModeChange('dubbed')}
          className={`p-3 rounded-xl border cursor-pointer transition-all ${
            audioDubMode === 'dubbed'
              ? 'bg-purple-950/50 border-purple-500 text-purple-200 ring-1 ring-purple-500/30'
              : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
          }`}
        >
          <div className="font-semibold flex items-center justify-between">
            <span>Full AI Dub</span>
            {audioDubMode === 'dubbed' && <Check className="w-3.5 h-3.5 text-purple-400" />}
          </div>
          <p className="text-[11px] text-slate-400 mt-1 leading-snug">
            Completely replaces original audio with localized AI voiceover speech.
          </p>
        </div>
      </div>
    </div>
  );
};
