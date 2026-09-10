// Audio synthesis and dubbing engine for QuickTranslate

let activeUtterance: SpeechSynthesisUtterance | null = null;
let activeAudioElement: HTMLAudioElement | null = null;

export function stopDubbingAudio() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    activeUtterance = null;
  }
  if (activeAudioElement) {
    activeAudioElement.pause();
    activeAudioElement = null;
  }
}

export function playDubbedSpeech(
  text: string,
  langCode: string,
  options?: {
    rate?: number;
    volume?: number;
    onEnd?: () => void;
  }
): Promise<void> {
  return new Promise((resolve) => {
    stopDubbingAudio();

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      resolve();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langCode;
    utterance.rate = options?.rate || 1.0;
    utterance.volume = options?.volume !== undefined ? options?.volume : 1.0;

    // Try to find a matching voice for the target language
    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find((v) => v.lang.startsWith(langCode) || v.lang.replace('_', '-').startsWith(langCode));
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onend = () => {
      activeUtterance = null;
      options?.onEnd?.();
      resolve();
    };

    utterance.onerror = () => {
      activeUtterance = null;
      resolve();
    };

    activeUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  });
}

export function playBase64Audio(
  base64: string,
  mimeType: string = 'audio/mp3',
  volume: number = 1.0
): Promise<void> {
  return new Promise((resolve, reject) => {
    stopDubbingAudio();
    try {
      const audio = new Audio(`data:${mimeType};base64,${base64}`);
      audio.volume = Math.max(0, Math.min(1, volume));
      activeAudioElement = audio;

      audio.onended = () => {
        activeAudioElement = null;
        resolve();
      };
      audio.onerror = (e) => {
        activeAudioElement = null;
        reject(e);
      };

      audio.play().catch(reject);
    } catch (err) {
      reject(err);
    }
  });
}
