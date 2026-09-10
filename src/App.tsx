import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Upload,
  Download,
  Video,
  Languages,
  RotateCcw,
  CheckCircle2,
  Sliders,
  ChevronDown,
} from 'lucide-react';
import { SAMPLE_VIDEOS } from './data/sampleVideos';
import { SUPPORTED_LANGUAGES } from './data/languages';
import { SubtitleSegment, TranslationTone, AudioDubMode, VocabularyItem } from './types';
import { VideoPlayer } from './components/VideoPlayer';
import { TranscriptEditor } from './components/TranscriptEditor';
import { LanguageSelector } from './components/LanguageSelector';
import { DubbingControls } from './components/DubbingControls';
import { CulturalNotesDrawer } from './components/CulturalNotesDrawer';
import { ExportModal } from './components/ExportModal';
import { UploadModal } from './components/UploadModal';

export const App: React.FC = () => {
  // Active video project state (defaults to the first rich demo)
  const [selectedDemoId, setSelectedDemoId] = useState<string>(SAMPLE_VIDEOS[0].id);
  const [videoTitle, setVideoTitle] = useState<string>(SAMPLE_VIDEOS[0].title);
  const [videoUrl, setVideoUrl] = useState<string>(SAMPLE_VIDEOS[0].videoUrl);
  const [sourceLanguage, setSourceLanguage] = useState<string>(SAMPLE_VIDEOS[0].sourceLanguage);
  const [targetLanguage, setTargetLanguage] = useState<string>(SAMPLE_VIDEOS[0].targetLanguageDefault);
  const [tone, setTone] = useState<TranslationTone>('professional');
  const [segments, setSegments] = useState<SubtitleSegment[]>(SAMPLE_VIDEOS[0].segments);
  const [summary, setSummary] = useState<string>(SAMPLE_VIDEOS[0].summary);
  const [culturalNotes, setCulturalNotes] = useState<string[]>(SAMPLE_VIDEOS[0].culturalNotes);
  const [vocabularyGlossary, setVocabularyGlossary] = useState<VocabularyItem[]>([]);

  // Video playback & sync state
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [activeSegmentId, setActiveSegmentId] = useState<string | null>(null);
  const [seekTime, setSeekTime] = useState<number | null>(null);
  const [audioDubMode, setAudioDubMode] = useState<AudioDubMode>('ducked');

  // UI modal states
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Notify user with brief toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load a demo video
  const handleSelectDemo = (demoId: string) => {
    const demo = SAMPLE_VIDEOS.find((d) => d.id === demoId);
    if (!demo) return;
    setSelectedDemoId(demo.id);
    setVideoTitle(demo.title);
    setVideoUrl(demo.videoUrl);
    setSourceLanguage(demo.sourceLanguage);
    setTargetLanguage(demo.targetLanguageDefault);
    setSegments(demo.segments);
    setSummary(demo.summary);
    setCulturalNotes(demo.culturalNotes);
    setVocabularyGlossary([]);
    setActiveSegmentId(null);
    setSeekTime(0);
    showToast(`Loaded "${demo.title}"`);
  };

  // Trigger Gemini Subtitle Translation for all segments
  const handleTranslateSubtitles = async () => {
    setIsTranslating(true);
    try {
      const response = await fetch('/api/translate-subtitles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          segments,
          sourceLanguage,
          targetLanguage,
          tone,
          context: videoTitle,
        }),
      });

      if (!response.ok) {
        throw new Error('Translation request failed');
      }

      const data = await response.json();
      if (data.segments) {
        setSegments(data.segments);
      }
      if (data.summary) {
        setSummary(data.summary);
      }
      if (data.culturalNotes) {
        setCulturalNotes(data.culturalNotes);
      }
      if (data.vocabularyGlossary) {
        setVocabularyGlossary(data.vocabularyGlossary);
      }

      const targetLangName = SUPPORTED_LANGUAGES.find((l) => l.code === targetLanguage)?.name || targetLanguage;
      showToast(`Successfully translated subtitles to ${targetLangName} (${tone})!`);
    } catch (err: any) {
      console.error(err);
      showToast('Error during translation. Please try again.');
    } finally {
      setIsTranslating(false);
    }
  };

  // Update a single segment
  const handleUpdateSegment = (updated: SubtitleSegment) => {
    setSegments((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    showToast('Subtitle cue updated');
  };

  // Delete a segment
  const handleDeleteSegment = (id: string) => {
    setSegments((prev) => prev.filter((s) => s.id !== id));
    showToast('Cue removed');
  };

  // Add a new segment at current video time
  const handleAddSegment = () => {
    const start = Math.max(0, Math.floor(currentTime * 10) / 10);
    const end = Math.min(start + 3.5, start + 4.0);
    const newSeg: SubtitleSegment = {
      id: `custom-seg-${Date.now()}`,
      startTime: start,
      endTime: end,
      speaker: 'Speaker',
      originalText: 'New subtitle cue text here...',
      translatedText: 'Nueva línea de subtítulo traducida...',
      notes: 'Custom cue inserted at current timestamp',
    };
    setSegments((prev) => [...prev, newSeg].sort((a, b) => a.startTime - b.startTime));
    showToast(`Added new subtitle cue at ${start.toFixed(1)}s`);
  };

  // Handle custom video loaded from UploadModal
  const handleLoadCustomVideo = (data: {
    videoUrl: string;
    videoTitle: string;
    sourceLanguage: string;
    targetLanguage: string;
    tone: TranslationTone;
    segments: SubtitleSegment[];
    summary: string;
    culturalNotes: string[];
  }) => {
    setSelectedDemoId('custom');
    setVideoTitle(data.videoTitle);
    setVideoUrl(data.videoUrl);
    setSourceLanguage(data.sourceLanguage);
    setTargetLanguage(data.targetLanguage);
    setTone(data.tone);
    setSegments(data.segments);
    setSummary(data.summary);
    setCulturalNotes(data.culturalNotes);
    setVocabularyGlossary([]);
    setActiveSegmentId(null);
    setSeekTime(0);
    showToast(`Imported and localized "${data.videoTitle}"`);
  };

  const currentTargetLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === targetLanguage) || SUPPORTED_LANGUAGES[0];
  const currentSourceLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === sourceLanguage) || SUPPORTED_LANGUAGES[15];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Toast notification */}
      {toastMessage && (
        <div
          id="toast-notification-banner"
          className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white shadow-2xl shadow-indigo-600/50 text-xs font-medium border border-indigo-400/30 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Top Header */}
      <header
        id="app-header"
        className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-4 lg:px-8 py-3"
      >
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          {/* Logo & Subtitle */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <Languages className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-white font-display">
                  QuickTranslate
                </h1>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-indigo-950 border border-indigo-500/40 text-indigo-300 tracking-wider">
                  AI Video Dub & Sub
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Professional audiovisual localization with Gemini 3.8 Flash
              </p>
            </div>
          </div>

          {/* Right Header: Demo Selector & Action Buttons */}
          <div className="flex items-center flex-wrap gap-2">
            {/* Demo Video Dropdown */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs">
              <Video className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-slate-400">Demo:</span>
              <select
                id="demo-video-picker-select"
                value={selectedDemoId}
                onChange={(e) => handleSelectDemo(e.target.value)}
                className="bg-transparent font-medium text-slate-200 focus:outline-none cursor-pointer"
              >
                {SAMPLE_VIDEOS.map((demo) => (
                  <option key={demo.id} value={demo.id} className="bg-slate-900 text-slate-200">
                    {demo.title}
                  </option>
                ))}
                {selectedDemoId === 'custom' && (
                  <option value="custom" className="bg-slate-900 text-slate-200">
                    ★ Custom Imported Video
                  </option>
                )}
              </select>
            </div>

            {/* Upload / Import Video Button */}
            <button
              id="header-import-video-btn"
              onClick={() => setIsUploadOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors shadow"
            >
              <Upload className="w-3.5 h-3.5 text-indigo-400" />
              <span>Import Video</span>
            </button>

            {/* Export Subtitles Button */}
            <button
              id="header-export-subtitles-btn"
              onClick={() => setIsExportOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Subtitles</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 space-y-5">
        {/* Language Selection Bar */}
        <LanguageSelector
          sourceLanguage={sourceLanguage}
          targetLanguage={targetLanguage}
          tone={tone}
          onSourceChange={setSourceLanguage}
          onTargetChange={setTargetLanguage}
          onToneChange={setTone}
          onTranslateClick={handleTranslateSubtitles}
          isTranslating={isTranslating}
          hasSegments={segments.length > 0}
        />

        {/* Video & Workbench Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column: Video Player & Dubbing Controls & Cultural Notes (7 Cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* HTML5 Synchronized Player with Dual Subtitles */}
            <VideoPlayer
              videoUrl={videoUrl}
              segments={segments}
              activeSegmentId={activeSegmentId}
              onTimeUpdate={setCurrentTime}
              onSegmentChange={setActiveSegmentId}
              targetLanguageCode={targetLanguage}
              seekTime={seekTime}
              onSeekHandled={() => setSeekTime(null)}
              audioDubMode={audioDubMode}
              onAudioDubModeChange={setAudioDubMode}
              onResetToDefaultVideo={() => handleSelectDemo(SAMPLE_VIDEOS[0].id)}
            />

            {/* Audio Dubbing & Voiceover Settings */}
            <DubbingControls
              audioDubMode={audioDubMode}
              onAudioDubModeChange={setAudioDubMode}
              targetLanguageCode={targetLanguage}
              targetLanguageName={currentTargetLangObj.name}
            />

            {/* Cultural Nuance Notes & Glossary Drawer */}
            <CulturalNotesDrawer
              summary={summary}
              culturalNotes={culturalNotes}
              vocabularyGlossary={vocabularyGlossary}
              targetLanguageName={currentTargetLangObj.name}
            />
          </div>

          {/* Right Column: Interactive Subtitle & Transcript Workbench (5 Cols) */}
          <div className="lg:col-span-5 h-[680px]">
            <TranscriptEditor
              segments={segments}
              activeSegmentId={activeSegmentId}
              currentTime={currentTime}
              onSeekTo={(time) => setSeekTime(time)}
              onUpdateSegment={handleUpdateSegment}
              onDeleteSegment={handleDeleteSegment}
              onAddSegment={handleAddSegment}
              targetLanguageCode={targetLanguage}
              sourceLanguageName={currentSourceLangObj.name}
              targetLanguageName={currentTargetLangObj.name}
            />
          </div>
        </div>
      </main>

      {/* Export Dialog */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        segments={segments}
        videoTitle={videoTitle}
        targetLanguageCode={targetLanguage}
        targetLanguageName={currentTargetLangObj.name}
        summary={summary}
        culturalNotes={culturalNotes}
      />

      {/* Upload / Import Video Dialog */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onLoadCustomVideo={handleLoadCustomVideo}
      />
    </div>
  );
};

export default App;
