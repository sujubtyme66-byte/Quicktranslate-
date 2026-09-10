import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Volume2,
  Edit2,
  Check,
  X,
  Plus,
  Trash2,
  Sparkles,
  Info,
  Clock,
  User,
} from 'lucide-react';
import { SubtitleSegment } from '../types';
import { formatTime } from '../utils/timeFormat';
import { playDubbedSpeech } from '../utils/audioSynthesis';

interface TranscriptEditorProps {
  segments: SubtitleSegment[];
  activeSegmentId: string | null;
  currentTime: number;
  onSeekTo: (seconds: number) => void;
  onUpdateSegment: (updated: SubtitleSegment) => void;
  onDeleteSegment: (id: string) => void;
  onAddSegment: () => void;
  targetLanguageCode: string;
  sourceLanguageName: string;
  targetLanguageName: string;
}

export const TranscriptEditor: React.FC<TranscriptEditorProps> = ({
  segments,
  activeSegmentId,
  currentTime,
  onSeekTo,
  onUpdateSegment,
  onDeleteSegment,
  onAddSegment,
  targetLanguageCode,
  sourceLanguageName,
  targetLanguageName,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTranslatedText, setEditTranslatedText] = useState('');
  const [editOriginalText, setEditOriginalText] = useState('');
  const [editSpeaker, setEditSpeaker] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);

  const listContainerRef = useRef<HTMLDivElement>(null);
  const activeItemRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to active playing segment
  useEffect(() => {
    if (autoScroll && activeItemRef.current && listContainerRef.current) {
      activeItemRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [activeSegmentId, autoScroll]);

  const startEditing = (seg: SubtitleSegment) => {
    setEditingId(seg.id);
    setEditTranslatedText(seg.translatedText);
    setEditOriginalText(seg.originalText);
    setEditSpeaker(seg.speaker);
  };

  const saveEditing = (seg: SubtitleSegment) => {
    onUpdateSegment({
      ...seg,
      translatedText: editTranslatedText,
      originalText: editOriginalText,
      speaker: editSpeaker,
    });
    setEditingId(null);
  };

  const cancelEditing = () => {
    setEditingId(null);
  };

  const handlePreviewSpeech = (text: string) => {
    playDubbedSpeech(text, targetLanguageCode, { volume: 1.0 });
  };

  const filteredSegments = segments.filter((seg) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      seg.originalText.toLowerCase().includes(q) ||
      seg.translatedText.toLowerCase().includes(q) ||
      seg.speaker.toLowerCase().includes(q)
    );
  });

  return (
    <div
      id="transcript-editor-panel"
      className="flex flex-col h-full bg-slate-900/90 rounded-2xl border border-slate-800/80 shadow-2xl overflow-hidden"
    >
      {/* Header with Search and Stats */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/95 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <span>Synchronized Subtitle & Translation Workbench</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-950 border border-indigo-500/30 text-indigo-300 font-normal">
              {segments.length} cues
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Original ({sourceLanguageName}) ➔ Translated ({targetLanguageName})
          </p>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-48">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              id="transcript-search-input"
              type="text"
              placeholder="Search transcript..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-800/80 border border-slate-700/80 rounded-lg text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            id="add-segment-btn"
            onClick={onAddSegment}
            title="Add new subtitle cue at current video time"
            className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-colors shadow"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Cue</span>
          </button>
        </div>
      </div>

      {/* Segments List */}
      <div
        ref={listContainerRef}
        id="transcript-segments-list"
        className="flex-1 overflow-y-auto divide-y divide-slate-800/60 p-2 space-y-2"
      >
        {filteredSegments.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            No subtitle cues found matching "{searchQuery}".
          </div>
        ) : (
          filteredSegments.map((seg, index) => {
            const isActive = activeSegmentId === seg.id;
            const isEditing = editingId === seg.id;

            return (
              <div
                key={seg.id}
                ref={isActive ? activeItemRef : null}
                id={`subtitle-cue-${seg.id}`}
                className={`p-3.5 rounded-xl border transition-all duration-150 ${
                  isActive
                    ? 'bg-indigo-950/40 border-indigo-500/50 shadow-md shadow-indigo-950/50 ring-1 ring-indigo-500/30'
                    : 'bg-slate-900/40 border-slate-800/50 hover:bg-slate-800/40 hover:border-slate-700/60'
                }`}
              >
                {/* Cue Top Meta: Speaker, Timestamps, Actions */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {/* Timestamp button (click to seek) */}
                    <button
                      onClick={() => onSeekTo(seg.startTime)}
                      title="Seek video to timestamp"
                      className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 text-indigo-300 hover:bg-indigo-900/60 hover:text-indigo-200 text-xs font-mono transition-colors"
                    >
                      <Clock className="w-3 h-3 text-indigo-400" />
                      <span>
                        {formatTime(seg.startTime)} – {formatTime(seg.endTime)}
                      </span>
                    </button>

                    {/* Speaker badge */}
                    {isEditing ? (
                      <input
                        type="text"
                        value={editSpeaker}
                        onChange={(e) => setEditSpeaker(e.target.value)}
                        placeholder="Speaker"
                        className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-xs text-slate-200 w-24"
                      />
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full">
                        <User className="w-2.5 h-2.5" />
                        {seg.speaker}
                      </span>
                    )}

                    {isActive && (
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full animate-pulse">
                        ● Playing Now
                      </span>
                    )}
                  </div>

                  {/* Right segment action buttons */}
                  <div className="flex items-center gap-1">
                    {/* Listen to dubbing audio */}
                    <button
                      onClick={() => handlePreviewSpeech(seg.translatedText)}
                      title="Preview AI voice dubbing for this line"
                      aria-label="Preview translated speech"
                      className="p-1 rounded-md hover:bg-slate-800 text-slate-400 hover:text-indigo-300 transition-colors"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>

                    {isEditing ? (
                      <>
                        <button
                          onClick={() => saveEditing(seg)}
                          title="Save changes"
                          className="p-1 rounded-md bg-emerald-600/80 text-white hover:bg-emerald-500"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={cancelEditing}
                          title="Cancel"
                          className="p-1 rounded-md bg-slate-700 text-slate-300 hover:bg-slate-600"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEditing(seg)}
                          title="Edit subtitle translation"
                          className="p-1 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteSegment(seg.id)}
                          title="Delete cue"
                          className="p-1 rounded-md hover:bg-slate-800 text-slate-400 hover:text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Content Comparison: Source Original vs Target Translation */}
                <div className="space-y-1.5 text-xs">
                  {/* Original Source Text */}
                  <div className="text-slate-400 font-normal pl-2 border-l-2 border-slate-700/70 py-0.5">
                    {isEditing ? (
                      <textarea
                        value={editOriginalText}
                        onChange={(e) => setEditOriginalText(e.target.value)}
                        rows={2}
                        className="w-full bg-slate-800 border border-slate-700 rounded p-1 text-slate-200"
                      />
                    ) : (
                      seg.originalText
                    )}
                  </div>

                  {/* Target Translated Text */}
                  <div className="text-slate-100 font-medium pl-2 border-l-2 border-indigo-500 py-0.5">
                    {isEditing ? (
                      <textarea
                        value={editTranslatedText}
                        onChange={(e) => setEditTranslatedText(e.target.value)}
                        rows={2}
                        className="w-full bg-slate-800 border border-indigo-500/80 rounded p-1.5 text-slate-100 text-sm focus:outline-none"
                      />
                    ) : (
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-yellow-200 font-medium tracking-wide">
                          {seg.translatedText}
                        </span>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap font-mono">
                          {seg.translatedText.length} chars
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Subtitler Nuance Note */}
                  {seg.notes && !isEditing && (
                    <div className="mt-1 flex items-center gap-1 text-[11px] text-indigo-300/80 italic pl-2">
                      <Sparkles className="w-3 h-3 text-indigo-400 shrink-0" />
                      <span>{seg.notes}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer bar with Auto-Scroll toggle */}
      <div className="px-4 py-2 bg-slate-900 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={autoScroll}
            onChange={(e) => setAutoScroll(e.target.checked)}
            className="rounded bg-slate-800 border-slate-700 text-indigo-500 focus:ring-0 cursor-pointer"
          />
          <span>Auto-scroll to active video timestamp</span>
        </label>

        <span className="text-slate-400 text-[11px]">
          Click any timestamp to jump video playback
        </span>
      </div>
    </div>
  );
};
