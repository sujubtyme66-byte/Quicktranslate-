import React, { useRef, useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Subtitles,
  Mic,
  Sliders,
  Settings2,
  AlertCircle,
  RefreshCw,
  Film,
} from 'lucide-react';
import { SubtitleSegment, AudioDubMode } from '../types';
import { formatClock } from '../utils/timeFormat';
import { playDubbedSpeech, stopDubbingAudio } from '../utils/audioSynthesis';

interface VideoPlayerProps {
  videoUrl: string;
  segments: SubtitleSegment[];
  activeSegmentId: string | null;
  onTimeUpdate: (currentTime: number) => void;
  onSegmentChange: (segmentId: string | null) => void;
  targetLanguageCode: string;
  seekTime: number | null;
  onSeekHandled: () => void;
  audioDubMode: AudioDubMode;
  onAudioDubModeChange: (mode: AudioDubMode) => void;
  onResetToDefaultVideo?: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  segments,
  activeSegmentId,
  onTimeUpdate,
  onSegmentChange,
  targetLanguageCode,
  seekTime,
  onSeekHandled,
  audioDubMode,
  onAudioDubModeChange,
  onResetToDefaultVideo,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);

  // Subtitle display mode: 'translated' | 'original' | 'dual' | 'none'
  const [subtitleMode, setSubtitleMode] = useState<'translated' | 'original' | 'dual' | 'none'>('translated');
  const [subtitleSize, setSubtitleSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [showSettings, setShowSettings] = useState(false);

  // Derive duration fallback from segments if video metadata is loading
  useEffect(() => {
    setVideoError(null);
    setIsPlaying(false);
    setCurrentTime(0);
    const maxSegmentEnd = segments.reduce((max, s) => Math.max(max, s.endTime || 0), 0);
    if (maxSegmentEnd > 0) {
      setDuration(maxSegmentEnd);
    }
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      try {
        videoRef.current.load();
      } catch (e) {
        // ignore
      }
    }
  }, [videoUrl, segments]);

  const currentSegment = segments.find(
    (s) => currentTime >= s.startTime && currentTime <= s.endTime
  );

  // Handle external seek request from clicking a transcript segment
  useEffect(() => {
    if (seekTime !== null && videoRef.current) {
      videoRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
      onSeekHandled();
    }
  }, [seekTime, onSeekHandled]);

  // Handle video audio volume according to Dubbing Mode
  useEffect(() => {
    if (!videoRef.current) return;

    if (isMuted) {
      videoRef.current.volume = 0;
      return;
    }

    if (audioDubMode === 'dubbed') {
      videoRef.current.volume = 0; // Mute video audio to hear only translated voiceover
    } else if (audioDubMode === 'ducked') {
      // If current segment is active, duck video audio to 15% of user volume
      videoRef.current.volume = currentSegment ? volume * 0.18 : volume;
    } else {
      videoRef.current.volume = volume;
    }
  }, [audioDubMode, isMuted, volume, currentSegment]);

  // Trigger dubbing voiceover when a new segment is encountered
  const lastSpokenSegmentId = useRef<string | null>(null);

  useEffect(() => {
    if (!isPlaying) {
      stopDubbingAudio();
      return;
    }

    if (audioDubMode === 'original') {
      stopDubbingAudio();
      return;
    }

    if (currentSegment && currentSegment.id !== lastSpokenSegmentId.current) {
      lastSpokenSegmentId.current = currentSegment.id;

      if (audioDubMode === 'dubbed' || audioDubMode === 'ducked' || audioDubMode === 'dual') {
        const dubVolume = isMuted ? 0 : 1.0;
        playDubbedSpeech(currentSegment.translatedText, targetLanguageCode, {
          rate: playbackRate,
          volume: dubVolume,
        });
      }
    } else if (!currentSegment) {
      lastSpokenSegmentId.current = null;
    }
  }, [currentSegment, isPlaying, audioDubMode, targetLanguageCode, playbackRate, isMuted]);

  // Fallback timer if video element has an error or cannot play directly
  useEffect(() => {
    let timer: any;
    if (isPlaying && videoError) {
      timer = setInterval(() => {
        setCurrentTime((prev) => {
          const next = prev + 0.1 * playbackRate;
          if (next >= (duration || 15)) {
            setIsPlaying(false);
            stopDubbingAudio();
            return 0;
          }
          onTimeUpdate(next);
          const match = segments.find((s) => next >= s.startTime && next <= s.endTime);
          onSegmentChange(match ? match.id : null);
          return next;
        });
      }, 100);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, videoError, duration, playbackRate, segments, onTimeUpdate, onSegmentChange]);

  // Play / Pause toggle
  const togglePlay = () => {
    if (videoError) {
      setIsPlaying((prev) => {
        const nextState = !prev;
        if (!nextState) {
          stopDubbingAudio();
        }
        return nextState;
      });
      return;
    }

    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => {
          console.warn('Video play error:', err);
          setVideoError('Playback was prevented or video source stream failed.');
          setIsPlaying(true);
        });
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
      stopDubbingAudio();
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const time = videoRef.current.currentTime;
    setCurrentTime(time);
    onTimeUpdate(time);

    const match = segments.find((s) => time >= s.startTime && time <= s.endTime);
    onSegmentChange(match ? match.id : null);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      stopDubbingAudio();
      lastSpokenSegmentId.current = null;
    }
  };

  const skipSeconds = (seconds: number) => {
    if (!videoRef.current) return;
    const newTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds));
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    stopDubbingAudio();
    lastSpokenSegmentId.current = null;
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const changeRate = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      id="quicktranslate-player-container"
      aria-label="Video Player and Subtitle Preview"
      className="relative flex flex-col bg-slate-900/90 rounded-2xl border border-slate-800/80 shadow-2xl overflow-hidden group"
    >
      {/* Video Canvas & Subtitle Overlay Area */}
      <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
        <video
          ref={videoRef}
          key={videoUrl}
          id="main-video-player"
          src={videoUrl}
          playsInline
          className={`w-full h-full object-contain cursor-pointer ${videoError ? 'opacity-25 pointer-events-none' : ''}`}
          onClick={togglePlay}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={() => {
            if (videoRef.current) {
              setDuration(videoRef.current.duration || duration);
            }
          }}
          onLoadedData={() => setVideoError(null)}
          onCanPlay={() => setVideoError(null)}
          onError={(e) => {
            console.warn('Video playback notice for URL:', videoUrl, e);
            const mediaError = (e.target as HTMLVideoElement)?.error;
            let msg = 'The video stream could not be loaded or format is unsupported.';
            if (mediaError?.code === 4) {
              msg = 'Video source could not be loaded or was blocked by origin/CORS restrictions.';
            }
            setVideoError(msg);
          }}
          onPlay={() => setIsPlaying(true)}
          onPause={() => {
            setIsPlaying(false);
            stopDubbingAudio();
          }}
          onEnded={() => {
            setIsPlaying(false);
            stopDubbingAudio();
          }}
        >
          <source src={videoUrl} type="video/mp4" />
        </video>

        {/* Video Error / Fallback Notification */}
        {videoError && (
          <div
            id="video-error-overlay"
            className="absolute inset-0 z-30 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center space-y-3"
          >
            <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-1">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h4 className="text-white font-semibold text-base">Video Stream Notice</h4>
            <p className="text-xs text-slate-300 max-w-md leading-relaxed">
              {videoError}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              {onResetToDefaultVideo && (
                <button
                  id="error-switch-sample-btn"
                  onClick={() => {
                    setVideoError(null);
                    onResetToDefaultVideo();
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-md shadow-indigo-600/30 transition-colors"
                >
                  <Film className="w-3.5 h-3.5" />
                  <span>Load Sample Keynote Video</span>
                </button>
              )}
              <button
                id="error-continue-virtual-btn"
                onClick={() => togglePlay()}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
                <span>{isPlaying ? 'Pause Dubbing Timeline' : 'Play Audio & Subtitles Only'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Big play button pulse when paused (hidden if error is shown) */}
        {!isPlaying && !videoError && (
          <button
            id="center-play-button"
            onClick={togglePlay}
            aria-label="Play video"
            className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-indigo-600/90 hover:bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-600/40 transition-transform transform hover:scale-110"
          >
            <Play className="w-8 h-8 fill-current translate-x-0.5" />
          </button>
        )}

        {/* Subtitle Overlay */}
        {subtitleMode !== 'none' && currentSegment && (
          <div
            id="subtitles-overlay-container"
            className="absolute bottom-12 left-4 right-4 pointer-events-none flex flex-col items-center justify-center text-center z-20"
          >
            <div
              className={`max-w-3xl px-4 py-2 rounded-xl backdrop-blur-md transition-all ${
                subtitleSize === 'sm' ? 'text-sm' : subtitleSize === 'lg' ? 'text-xl' : 'text-base'
              } bg-black/80 text-white border border-white/10 shadow-xl`}
            >
              {/* If Dual or Original: show original text */}
              {(subtitleMode === 'original' || subtitleMode === 'dual') && (
                <p className={`font-normal text-slate-300 ${subtitleMode === 'dual' ? 'text-xs mb-1 opacity-80' : ''}`}>
                  {currentSegment.originalText}
                </p>
              )}

              {/* If Dual or Translated: show translated text */}
              {(subtitleMode === 'translated' || subtitleMode === 'dual') && (
                <p className="font-semibold text-yellow-300 tracking-wide drop-shadow">
                  {currentSegment.translatedText}
                </p>
              )}

              {/* Subtle speaker tag indicator */}
              <span className="inline-block mt-1 text-[10px] font-medium uppercase tracking-wider text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full">
                {currentSegment.speaker}
              </span>
            </div>
          </div>
        )}

        {/* Dubbing Audio Active Badge */}
        {isPlaying && (audioDubMode === 'dubbed' || audioDubMode === 'ducked') && currentSegment && (
          <div
            id="dubbing-indicator-badge"
            className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-950/80 border border-indigo-500/30 text-indigo-200 text-xs font-medium backdrop-blur-md shadow-lg"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <Mic className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI Voice Dubbing Active</span>
          </div>
        )}
      </div>

      {/* Video Control Bar */}
      <div className="p-3 bg-slate-900/95 border-t border-slate-800 flex flex-col gap-2">
        {/* Timeline Scrubber & Cue Markers */}
        <div className="relative w-full flex items-center group/timeline">
          {/* Subtitle Cue Markers on Timeline */}
          {duration > 0 &&
            segments.map((seg) => {
              const leftPercent = (seg.startTime / duration) * 100;
              const widthPercent = ((seg.endTime - seg.startTime) / duration) * 100;
              const isActive = activeSegmentId === seg.id;
              return (
                <div
                  key={seg.id}
                  title={`${seg.speaker}: ${seg.translatedText}`}
                  style={{ left: `${leftPercent}%`, width: `${Math.max(widthPercent, 0.8)}%` }}
                  className={`absolute top-1/2 -translate-y-1/2 h-1.5 rounded-full pointer-events-none transition-colors ${
                    isActive ? 'bg-yellow-400 z-10' : 'bg-indigo-400/40'
                  }`}
                />
              );
            })}

          <input
            id="video-timeline-scrubber"
            aria-label="Seek video timeline"
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 relative z-20 hover:h-2.5 transition-all"
          />
        </div>

        {/* Lower Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-slate-300 text-sm">
          {/* Left Controls: Play, Skips, Timestamp */}
          <div className="flex items-center gap-2">
            <button
              id="player-play-pause-btn"
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              className="p-2 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-white transition-colors"
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
            </button>

            <button
              id="player-rewind-5s-btn"
              onClick={() => skipSeconds(-5)}
              title="Rewind 5 seconds"
              aria-label="Rewind 5 seconds"
              className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              id="player-forward-5s-btn"
              onClick={() => skipSeconds(5)}
              title="Forward 5 seconds"
              aria-label="Forward 5 seconds"
              className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            {/* Time readout */}
            <div className="text-xs font-mono text-slate-400 ml-1">
              <span className="text-slate-200">{formatClock(currentTime)}</span> / {formatClock(duration)}
            </div>

            {/* Volume control */}
            <div className="flex items-center gap-1 ml-2">
              <button
                id="player-mute-toggle-btn"
                onClick={toggleMute}
                aria-label={isMuted ? 'Unmute' : 'Mute'}
                className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                id="player-volume-slider"
                aria-label="Video volume"
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setVolume(val);
                  if (val > 0) setIsMuted(false);
                }}
                className="w-16 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>
          </div>

          {/* Right Controls: Subtitle Mode, Dubbing Mode, Rate, Fullscreen */}
          <div className="flex items-center gap-2">
            {/* Subtitle Display Toggle */}
            <div className="relative">
              <button
                id="player-subtitle-mode-btn"
                onClick={() => {
                  const next: Record<string, 'translated' | 'original' | 'dual' | 'none'> = {
                    translated: 'dual',
                    dual: 'original',
                    original: 'none',
                    none: 'translated',
                  };
                  setSubtitleMode(next[subtitleMode]);
                }}
                title={`Subtitles: ${subtitleMode.toUpperCase()}`}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                  subtitleMode !== 'none'
                    ? 'bg-indigo-950/60 border-indigo-500/40 text-indigo-300'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400'
                }`}
              >
                <Subtitles className="w-3.5 h-3.5" />
                <span className="capitalize">{subtitleMode}</span>
              </button>
            </div>

            {/* Audio Dubbing Mode Toggle */}
            <div className="flex items-center bg-slate-800/80 p-0.5 rounded-lg border border-slate-700/60 text-xs">
              <button
                id="audio-mode-original"
                onClick={() => onAudioDubModeChange('original')}
                title="Play original video audio"
                className={`px-2 py-1 rounded-md font-medium transition-all ${
                  audioDubMode === 'original'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Original Audio
              </button>
              <button
                id="audio-mode-ducked"
                onClick={() => onAudioDubModeChange('ducked')}
                title="Professional Ducking: Lowers background video sound and dubs translated AI voiceover on top"
                className={`px-2 py-1 rounded-md font-medium flex items-center gap-1 transition-all ${
                  audioDubMode === 'ducked'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Mic className="w-3 h-3" />
                Ducked Voiceover
              </button>
              <button
                id="audio-mode-dubbed"
                onClick={() => onAudioDubModeChange('dubbed')}
                title="Mute video audio and play translated AI speech only"
                className={`px-2 py-1 rounded-md font-medium transition-all ${
                  audioDubMode === 'dubbed'
                    ? 'bg-purple-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Dubbed Only
              </button>
            </div>

            {/* Playback speed selector */}
            <button
              id="player-speed-btn"
              onClick={() => {
                const speeds = [0.75, 1, 1.25, 1.5];
                const nextIdx = (speeds.indexOf(playbackRate) + 1) % speeds.length;
                changeRate(speeds[nextIdx]);
              }}
              title="Playback speed"
              className="px-2 py-1 rounded-lg bg-slate-800 text-xs font-mono text-slate-300 hover:bg-slate-700"
            >
              {playbackRate}x
            </button>

            {/* Subtitle font size toggle */}
            <button
              id="subtitle-size-toggle-btn"
              onClick={() => {
                const sizes: Array<'sm' | 'md' | 'lg'> = ['sm', 'md', 'lg'];
                const next = sizes[(sizes.indexOf(subtitleSize) + 1) % sizes.length];
                setSubtitleSize(next);
              }}
              title={`Subtitle Font: ${subtitleSize.toUpperCase()}`}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200"
            >
              <Sliders className="w-4 h-4" />
            </button>

            {/* Fullscreen */}
            <button
              id="player-fullscreen-btn"
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
