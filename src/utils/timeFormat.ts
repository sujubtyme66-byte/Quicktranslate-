export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 10);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms}`;
}

export function formatClock(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function formatSrtTime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
}

export function formatVttTime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
}

export function generateSrt(segments: { startTime: number; endTime: number; translatedText: string }[]): string {
  return segments
    .map((seg, idx) => {
      return `${idx + 1}\n${formatSrtTime(seg.startTime)} --> ${formatSrtTime(seg.endTime)}\n${seg.translatedText}\n`;
    })
    .join('\n');
}

export function generateVtt(segments: { startTime: number; endTime: number; translatedText: string }[]): string {
  const body = segments
    .map((seg, idx) => {
      return `${idx + 1}\n${formatVttTime(seg.startTime)} --> ${formatVttTime(seg.endTime)}\n${seg.translatedText}\n`;
    })
    .join('\n');
  return `WEBVTT - Translated with QuickTranslate\n\n${body}`;
}
