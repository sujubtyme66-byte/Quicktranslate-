import React from 'react';
import { BookOpen, Sparkles, Languages, Check } from 'lucide-react';
import { VocabularyItem } from '../types';

interface CulturalNotesDrawerProps {
  summary?: string;
  culturalNotes?: string[];
  vocabularyGlossary?: VocabularyItem[];
  targetLanguageName: string;
}

export const CulturalNotesDrawer: React.FC<CulturalNotesDrawerProps> = ({
  summary,
  culturalNotes,
  vocabularyGlossary,
  targetLanguageName,
}) => {
  return (
    <div
      id="cultural-notes-card"
      className="bg-slate-900/80 rounded-2xl border border-slate-800/80 p-4 shadow-xl space-y-3"
    >
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-indigo-950 border border-indigo-500/30 text-indigo-400">
          <BookOpen className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-100">Linguistic & Cultural Context</h3>
          <p className="text-xs text-slate-400">Translator rationale and localized vocabulary for {targetLanguageName}</p>
        </div>
      </div>

      {summary && (
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 text-xs">
          <span className="font-semibold text-indigo-300 block mb-1">Content Overview:</span>
          <p className="text-slate-300 leading-relaxed">{summary}</p>
        </div>
      )}

      {culturalNotes && culturalNotes.length > 0 && (
        <div className="space-y-1.5 text-xs">
          <span className="font-semibold text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            <span>Cultural Adaptation & Subtitling Choices:</span>
          </span>
          <ul className="space-y-1 pl-1">
            {culturalNotes.map((note, idx) => (
              <li key={idx} className="flex items-start gap-2 text-slate-400 leading-normal">
                <span className="text-indigo-400 mt-0.5">•</span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {vocabularyGlossary && vocabularyGlossary.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <span className="font-semibold text-slate-300 text-xs flex items-center gap-1.5">
            <Languages className="w-3.5 h-3.5 text-indigo-400" />
            <span>Key Terminology & Glossary:</span>
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {vocabularyGlossary.map((item, idx) => (
              <div key={idx} className="p-2 rounded-lg bg-slate-950/40 border border-slate-800 text-xs">
                <div className="flex items-baseline justify-between gap-1">
                  <span className="font-medium text-slate-200">{item.term}</span>
                  <span className="text-indigo-300 font-semibold">{item.translation}</span>
                </div>
                {item.definition && (
                  <p className="text-[11px] text-slate-400 mt-0.5">{item.definition}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
