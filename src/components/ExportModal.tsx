import React, { useState } from 'react';
import { X, Download, Copy, Check, FileText, Code2, FileCode } from 'lucide-react';
import { SubtitleSegment } from '../types';
import { generateSrt, generateVtt } from '../utils/timeFormat';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  segments: SubtitleSegment[];
  videoTitle: string;
  targetLanguageCode: string;
  targetLanguageName: string;
  summary?: string;
  culturalNotes?: string[];
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  segments,
  videoTitle,
  targetLanguageCode,
  targetLanguageName,
  summary,
  culturalNotes,
}) => {
  const [format, setFormat] = useState<'srt' | 'vtt' | 'json' | 'txt'>('srt');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const getContent = (): string => {
    switch (format) {
      case 'srt':
        return generateSrt(segments);
      case 'vtt':
        return generateVtt(segments);
      case 'json':
        return JSON.stringify(
          {
            title: videoTitle,
            targetLanguage: targetLanguageCode,
            summary,
            culturalNotes,
            segments,
          },
          null,
          2
        );
      case 'txt':
        return segments
          .map((s) => `[${s.speaker}]: ${s.translatedText}`)
          .join('\n\n');
      default:
        return '';
    }
  };

  const content = getContent();

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const sanitizedTitle = videoTitle.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
    link.download = `${sanitizedTitle}_${targetLanguageCode}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      id="export-modal-backdrop"
      className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <div
        id="export-modal-content"
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-white">Export Translated Subtitles</h3>
            <p className="text-xs text-slate-400">
              Download broadcast-ready subtitle tracks or localized transcript
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close export dialog"
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Format Selector Tabs */}
        <div className="px-4 pt-3 flex items-center gap-2 border-b border-slate-800/80 bg-slate-950/40">
          <button
            onClick={() => setFormat('srt')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${
              format === 'srt'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>SubRip (.SRT)</span>
          </button>
          <button
            onClick={() => setFormat('vtt')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${
              format === 'vtt'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>WebVTT (.VTT)</span>
          </button>
          <button
            onClick={() => setFormat('json')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${
              format === 'json'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>JSON Project</span>
          </button>
          <button
            onClick={() => setFormat('txt')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${
              format === 'txt'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Plain Text</span>
          </button>
        </div>

        {/* Code Preview */}
        <div className="flex-1 p-4 overflow-hidden flex flex-col">
          <div className="relative flex-1 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
            <textarea
              readOnly
              value={content}
              className="w-full h-full p-3 font-mono text-xs text-slate-300 bg-transparent resize-none focus:outline-none overflow-y-auto"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            {segments.length} cues • Language: {targetLanguageName}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download .{format.toUpperCase()}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
