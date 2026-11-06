import { SubtitleCue } from '../utils/subtitles';

export interface MediaAudioStream {
  index: number;
  title: string;
  language: string;
  codec: 'aac' | 'ac3' | 'dts' | 'flac' | 'mp3' | 'eac3';
  channels: number; // 2, 6 (5.1), 8 (7.1)
  channelLayout: 'stereo' | '5.1' | '7.1' | 'mono';
  bitrate: number; // bps
  isDefault?: boolean;
}

export interface MediaSubtitleStream {
  index: number;
  title: string;
  language: string;
  format: 'srt' | 'ass' | 'ssa' | 'pgssub' | 'vtt';
  isDefault?: boolean;
  isForced?: boolean;
  cues: SubtitleCue[];
  rawSample?: string; // For ASS demo viewer
}

export interface MediaItem {
  id: string;
  name: string;
  originalTitle?: string;
  type: 'Movie' | 'Series' | 'Episode' | 'MusicVideo';
  year: number;
  overview: string;
  runtimeMinutes: number;
  communityRating: number;
  officialRating: string; // PG-13, TV-MA, R, etc.
  genres: string[];
  backdropUrl: string;
  posterUrl: string;
  resolution: '1080p' | '720p' | '4K';
  videoCodec: 'h264' | 'hevc' | 'av1';
  container: 'mkv' | 'mp4';
  bitrateMbps: number;
  audioStreams: MediaAudioStream[];
  subtitleStreams: MediaSubtitleStream[];
  playbackPositionSeconds?: number;
  videoUrl: string; // HTML5 playable video url or test pattern generator
  tagline?: string;
  studios?: string[];
  director?: string;
  actors?: { name: string; role: string; avatarUrl?: string }[];
}

export interface MediaLibrary {
  id: string;
  name: string;
  type: 'movies' | 'tvshows' | 'anime' | 'music' | 'collections';
  itemCount: number;
}

export interface JellyfinUser {
  id: string;
  name: string;
  serverUrl: string;
  token: string;
  avatarLetter: string;
}
