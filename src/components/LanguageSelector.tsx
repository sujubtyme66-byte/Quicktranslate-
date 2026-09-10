import React, { useState } from 'react';
import { ArrowRightLeft, Sparkles, Globe, Sliders, ChevronDown, Check } from 'lucide-react';
import { SUPPORTED_LANGUAGES, TONE_OPTIONS } from '../data/languages';
import { TranslationTone } from '../types';

interface LanguageSelectorProps {
  sourceLanguage: string;
  targetLanguage: string;
  tone: TranslationTone;
  onSourceChange: (lang: string) => void;
  onTargetChange: (lang: string) => void;
  onToneChange: (tone: TranslationTone) => void;
  onTranslateClick: () => void;
  isTranslating: boolean;
  hasSegments: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  sourceLanguage,
  targetLanguage,
  tone,
  onSourceChange,
  onTargetChange,
  onToneChange,
  onTranslateClick,
  isTranslating,
  hasSegments,
}) => {
  const [showToneDropdown, setShowToneDropdown] = useState(false);

  const swapLanguages = () => {
    const temp = sourceLanguage;
    onSourceChange(targetLanguage);
    onTargetChange(temp);
  };

  const currentToneObj = TONE_OPTIONS.find((t) => t.id === tone) || TONE_OPTIONS[0];

  return (
    <div
      id="language-selector-bar"
      className="bg-slate-900/90 rounded-2xl border border-slate-800/80 p-3.5 shadow-xl flex flex-wrap items-center justify-between gap-3"
    >
      {/* Language pair selects */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 border border-slate-700/80 rounded-xl">
          <Globe className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-400 font-medium">Source:</span>
          <select
            id="source-language-select"
            value={sourceLanguage}
            onChange={(e) => onSourceChange(e.target.value)}
            className="bg-transparent text-xs font-semibold text-slate-100 focus:outline-none cursor-pointer"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code} className="bg-slate-900 text-slate-200">
                {lang.flag} {lang.name} ({lang.nativeName})
              </option>
            ))}
          </select>
        </div>

        {/* Swap Button */}
        <button
          id="swap-languages-btn"
          onClick={swapLanguages}
          title="Swap source and target languages"
          className="p-2 rounded-xl bg-slate-800 hover:bg-indigo-600/30 text-slate-400 hover:text-indigo-300 border border-slate-700/60 transition-colors"
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
        </button>

        {/* Target language */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-950/40 border border-indigo-500/40 rounded-xl">
          <Globe className="w-4 h-4 text-indigo-400" />
          <span className="text-xs text-indigo-300 font-medium">Target:</span>
          <select
            id="target-language-select"
            value={targetLanguage}
            onChange={(e) => onTargetChange(e.target.value)}
            className="bg-transparent text-xs font-semibold text-indigo-200 focus:outline-none cursor-pointer"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code} className="bg-slate-900 text-slate-200">
                {lang.flag} {lang.name} ({lang.nativeName})
              </option>
            ))}
          </select>
        </div>

        {/* Tone Selector Dropdown */}
        <div className="relative">
          <button
            id="tone-select-dropdown-btn"
            onClick={() => setShowToneDropdown(!showToneDropdown)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 rounded-xl text-xs text-slate-200 transition-colors"
          >
            <Sliders className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-slate-400">Register:</span>
            <span className="font-medium text-slate-100">{currentToneObj.label.split('&')[0]}</span>
            <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
          </button>

          {showToneDropdown && (
            <div className="absolute top-full mt-2 left-0 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 space-y-1">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-2 py-1">
                Subtitling Tone & Register
              </div>
              {TONE_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    onToneChange(opt.id);
                    setShowToneDropdown(false);
                  }}
                  className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-colors flex items-start justify-between gap-2 ${
                    tone === opt.id ? 'bg-indigo-600/30 text-indigo-200' : 'hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <div>
                    <div className="font-medium flex items-center gap-1.5">
                      {opt.label}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                      {opt.description}
                    </div>
                  </div>
                  {tone === opt.id && <Check className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Re-translate with Gemini AI Button */}
      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
        <button
          id="trigger-ai-translation-btn"
          onClick={onTranslateClick}
          disabled={isTranslating || !hasSegments}
          className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-lg ${
            isTranslating
              ? 'bg-indigo-800 text-indigo-200 cursor-not-allowed'
              : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-indigo-600/30 hover:shadow-indigo-600/50'
          }`}
        >
          <Sparkles className={`w-4 h-4 ${isTranslating ? 'animate-spin' : ''}`} />
          <span>{isTranslating ? 'Translating with Gemini...' : 'Translate Video Subtitles'}</span>
        </button>
      </div>
    </div>
  );
};
