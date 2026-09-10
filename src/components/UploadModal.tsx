import React, { useState, useRef } from 'react';
import {
  X,
  UploadCloud,
  Film,
  Link,
  Sparkles,
  AlertCircle,
  Video,
  CheckCircle2,
} from 'lucide-react';
import { SUPPORTED_LANGUAGES, TONE_OPTIONS } from '../data/languages';
import { TranslationTone, SubtitleSegment } from '../types';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadCustomVideo: (data: {
    videoUrl: string;
    videoTitle: string;
    sourceLanguage: string;
    targetLanguage: string;
    tone: TranslationTone;
    segments: SubtitleSegment[];
    summary: string;
    culturalNotes: string[];
  }) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onLoadCustomVideo,
}) => {
  const [tab, setTab] = useState<'upload' | 'url'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('es');
  const [tone, setTone] = useState<TranslationTone>('professional');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const selected = e.dataTransfer.files[0];
      if (selected.type.startsWith('video/') || selected.type.startsWith('audio/')) {
        setFile(selected);
        if (!videoTitle) {
          setVideoTitle(selected.name.replace(/\.[^/.]+$/, ''));
        }
        setError(null);
      } else {
        setError('Please select a valid video or audio file.');
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = e.target.files[0];
      setFile(selected);
      if (!videoTitle) {
        setVideoTitle(selected.name.replace(/\.[^/.]+$/, ''));
      }
      setError(null);
    }
  };

  const handleSubmit = async () => {
    setError(null);
    setIsProcessing(true);

    try {
      let finalVideoUrl = '';

      if (tab === 'upload') {
        if (!file) {
          setError('Please select a video file first.');
          setIsProcessing(false);
          return;
        }
        finalVideoUrl = URL.createObjectURL(file);
      } else {
        if (!videoUrlInput.trim()) {
          setError('Please enter a valid video URL.');
          setIsProcessing(false);
          return;
        }
        finalVideoUrl = videoUrlInput.trim();
      }

      // Read file as base64 if available (up to 10MB) for Gemini multimodal audio transcription
      let base64Data: string | null = null;
      let mimeType = 'video/mp4';

      if (file && file.size < 12 * 1024 * 1024) {
        mimeType = file.type || 'video/mp4';
        base64Data = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const res = reader.result as string;
            const commaIdx = res.indexOf(',');
            resolve(commaIdx !== -1 ? res.substring(commaIdx + 1) : res);
          };
          reader.readAsDataURL(file);
        });
      }

      const payload = {
        videoTitle: videoTitle.trim() || 'Uploaded Video',
        sourceLanguage: sourceLang,
        targetLanguage: targetLang,
        tone,
        fileBase64: base64Data,
        mimeType,
      };

      const response = await fetch('/api/transcribe-and-translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze and translate video');
      }

      const result = await response.json();

      onLoadCustomVideo({
        videoUrl: finalVideoUrl,
        videoTitle: videoTitle.trim() || 'Localized Video Project',
        sourceLanguage: result.detectedOriginalLanguage || sourceLang,
        targetLanguage: targetLang,
        tone,
        segments: result.segments || [],
        summary: result.summary || '',
        culturalNotes: result.culturalNotes || [],
      });

      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during video localization.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      id="upload-modal-backdrop"
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <div
        id="upload-modal-content"
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-950 border border-indigo-500/30 text-indigo-400">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Import Video for AI Translation</h3>
              <p className="text-xs text-slate-400">Upload your own video or enter a web stream link</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close upload dialog"
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 text-xs font-semibold">
          <button
            onClick={() => setTab('upload')}
            className={`flex-1 py-2.5 text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
              tab === 'upload'
                ? 'border-indigo-500 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Local File</span>
          </button>
          <button
            onClick={() => setTab('url')}
            className={`flex-1 py-2.5 text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
              tab === 'url'
                ? 'border-indigo-500 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Link className="w-4 h-4" />
            <span>Video URL</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/30 text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {tab === 'upload' ? (
            <div>
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                  file
                    ? 'border-emerald-500/60 bg-emerald-950/20'
                    : 'border-slate-700 hover:border-indigo-500 bg-slate-950/50 hover:bg-slate-950/80'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*,audio/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                />

                {file ? (
                  <div className="space-y-1">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                    <p className="font-semibold text-slate-100 text-sm">{file.name}</p>
                    <p className="text-slate-400 text-[11px]">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB • Ready for AI processing
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <UploadCloud className="w-9 h-9 text-indigo-400 mx-auto" />
                    <p className="font-medium text-slate-200 text-sm">
                      Drag and drop your video file here, or <span className="text-indigo-400 underline">browse</span>
                    </p>
                    <p className="text-slate-400 text-[11px]">Supports MP4, WebM, MOV, MP3, WAV</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div>
              <label className="block font-medium text-slate-300 mb-1">Direct Video URL</label>
              <input
                type="url"
                placeholder="https://example.com/video.mp4"
                value={videoUrlInput}
                onChange={(e) => setVideoUrlInput(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 text-xs"
              />
            </div>
          )}

          {/* Video Title */}
          <div>
            <label className="block font-medium text-slate-300 mb-1">Project / Video Title</label>
            <input
              type="text"
              placeholder="e.g. Masterclass Lecture, Product Showcase"
              value={videoTitle}
              onChange={(e) => setVideoTitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 text-xs"
            />
          </div>

          {/* Languages and Tone config */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <label className="block text-slate-400 mb-1">Original Spoken</label>
              <select
                value={sourceLang}
                onChange={(e) => setSourceLang(e.target.value)}
                className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 text-xs"
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.flag} {l.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Translate To</label>
              <select
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className="w-full p-2 bg-slate-950 border border-indigo-500/60 rounded-xl text-indigo-300 text-xs font-medium"
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.flag} {l.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Translation Tone</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value as TranslationTone)}
                className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 text-xs"
              >
                {TONE_OPTIONS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label.split('&')[0]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            id="start-video-translation-submit-btn"
            onClick={handleSubmit}
            disabled={isProcessing}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-60"
          >
            <Sparkles className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
            <span>{isProcessing ? 'Transcribing & Translating...' : 'Localize Video Now'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
