/**
 * Subtitle processing utilities for Jellyfin PS3 Client.
 * Supports SRT, WebVTT, ASS/SSA with on-the-fly plain text conversion,
 * and PGS bitmap subtitle overlay simulation.
 */

export interface SubtitleCue {
  id: string;
  startTime: number; // in seconds
  endTime: number;   // in seconds
  text: string;
  isGraphic?: boolean;
  graphicSvg?: string;
  style?: string;
}

/**
 * Strips all ASS/SSA dialogue override tags, karaoke timings, and style markers,
 * converting rich styled .ASS subtitles into clean plain-text readable subtitles on-the-fly.
 */
export function stripAssTags(rawText: string): string {
  if (!rawText) return '';

  let cleaned = rawText;

  // Replace ASS hard spaces \h with normal space
  cleaned = cleaned.replace(/\\h/g, ' ');

  // Replace ASS newlines \N and \n with standard newline
  cleaned = cleaned.replace(/\\[Nn]/g, '\n');

  // Strip all bracketed override tags: {\k10}, {\pos(120,450)}, {\c&H00FFFF&}, {\an8}, etc.
  cleaned = cleaned.replace(/\{[^{}]*\}/g, '');

  // Strip any remaining stray ASS escape backslashes like \b1, \b0, \i1, \i0
  cleaned = cleaned.replace(/\\[a-zA-Z0-9]+(?:\([^)]*\))?/g, '');

  // Normalize excessive whitespace while preserving intended newlines
  const lines = cleaned.split('\n').map(line => line.trim()).filter(line => line.length > 0);

  return lines.join('\n').trim();
}

/**
 * Parse time string "H:MM:SS.cc" or "HH:MM:SS.mmm" into seconds
 */
export function parseAssTimestamp(timeStr: string): number {
  if (!timeStr) return 0;
  const parts = timeStr.trim().split(':');
  if (parts.length < 3) return 0;

  const hours = parseFloat(parts[0]) || 0;
  const minutes = parseFloat(parts[1]) || 0;
  const seconds = parseFloat(parts[2]) || 0;

  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * Parses an entire .ASS/.SSA file content and returns clean plain-text SubtitleCue items.
 */
export function parseAssFile(assContent: string): SubtitleCue[] {
  if (!assContent) return [];

  const lines = assContent.split(/\r?\n/);
  const cues: SubtitleCue[] = [];
  let inEventsSection = false;
  let formatHeaders: string[] = [];
  let textIndex = 9; // Default format is Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
  let startIndex = 1;
  let endIndex = 2;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith('[Events]')) {
      inEventsSection = true;
      continue;
    }

    if (line.startsWith('[') && inEventsSection) {
      // Switched to another section
      break;
    }

    if (!inEventsSection) continue;

    if (line.startsWith('Format:')) {
      const headerStr = line.substring(7).trim();
      formatHeaders = headerStr.split(',').map(h => h.trim().toLowerCase());
      startIndex = formatHeaders.indexOf('start');
      endIndex = formatHeaders.indexOf('end');
      textIndex = formatHeaders.indexOf('text');
      if (startIndex === -1) startIndex = 1;
      if (endIndex === -1) endIndex = 2;
      if (textIndex === -1) textIndex = formatHeaders.length - 1;
      continue;
    }

    if (line.startsWith('Dialogue:')) {
      const dialogueStr = line.substring(9).trim();
      // Split by comma up to textIndex
      const parts: string[] = [];
      let currentPart = '';
      let commaCount = 0;

      for (let c = 0; c < dialogueStr.length; c++) {
        const char = dialogueStr[c];
        if (char === ',' && commaCount < textIndex) {
          parts.push(currentPart.trim());
          currentPart = '';
          commaCount++;
        } else {
          currentPart += char;
        }
      }
      parts.push(currentPart.trim());

      const startRaw = parts[startIndex] || '';
      const endRaw = parts[endIndex] || '';
      const rawDialogue = parts[textIndex] || '';

      const startTime = parseAssTimestamp(startRaw);
      const endTime = parseAssTimestamp(endRaw);
      const plainText = stripAssTags(rawDialogue);

      if (plainText && endTime > startTime) {
        cues.push({
          id: `ass-${cues.length}`,
          startTime,
          endTime,
          text: plainText,
          style: parts[3] || 'Default'
        });
      }
    }
  }

  return cues;
}

/**
 * Parses time string "HH:MM:SS,mmm" or "HH:MM:SS.mmm" (SRT format)
 */
export function parseSrtTimestamp(timeStr: string): number {
  if (!timeStr) return 0;
  const normalized = timeStr.trim().replace(',', '.');
  const parts = normalized.split(':');
  if (parts.length < 3) return 0;

  const hours = parseFloat(parts[0]) || 0;
  const minutes = parseFloat(parts[1]) || 0;
  const seconds = parseFloat(parts[2]) || 0;

  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * Parses SRT (SubRip) subtitle format into SubtitleCue items.
 */
export function parseSrt(srtContent: string): SubtitleCue[] {
  if (!srtContent) return [];

  const normalized = srtContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const blocks = normalized.split(/\n\s*\n/);
  const cues: SubtitleCue[] = [];

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i].trim();
    if (!block) continue;

    const lines = block.split('\n');
    let timeLineIdx = -1;

    for (let l = 0; l < lines.length; l++) {
      if (lines[l].includes('-->')) {
        timeLineIdx = l;
        break;
      }
    }

    if (timeLineIdx === -1) continue;

    const timeLine = lines[timeLineIdx];
    const [startRaw, endRaw] = timeLine.split('-->').map(s => s.trim());
    const startTime = parseSrtTimestamp(startRaw);
    const endTime = parseSrtTimestamp(endRaw);

    const textLines = lines.slice(timeLineIdx + 1);
    // Strip simple HTML tags like <i>, <b>, <font>
    const cleanText = textLines
      .join('\n')
      .replace(/<[^>]*>/g, '')
      .trim();

    if (cleanText && endTime > startTime) {
      cues.push({
        id: `srt-${cues.length}`,
        startTime,
        endTime,
        text: cleanText
      });
    }
  }

  return cues;
}

/**
 * Returns currently active subtitle cue given video currentTime and offset in seconds.
 */
export function getActiveCue(
  cues: SubtitleCue[],
  currentTime: number,
  offsetSeconds: number = 0
): SubtitleCue | null {
  if (!cues || cues.length === 0) return null;
  const adjustedTime = currentTime + offsetSeconds;

  for (let i = 0; i < cues.length; i++) {
    const cue = cues[i];
    if (adjustedTime >= cue.startTime && adjustedTime <= cue.endTime) {
      return cue;
    }
  }
  return null;
}
