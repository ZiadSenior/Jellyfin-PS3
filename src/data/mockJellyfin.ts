import { MediaItem, MediaLibrary } from '../types/jellyfin';
import { parseAssFile, parseSrt } from '../utils/subtitles';

const ASS_SAMPLE_CYBER = `
[Script Info]
Title: Cyber Odyssey Fansub
ScriptType: v4.00+

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
Dialogue: 0,0:00:01.20,0:00:04.50,Default,,0,0,0,,{\\pos(400,600)\\c&H00FFFF&\\fad(150,150)}Sector 7 atmospheric scrubbers are offline.
Dialogue: 0,0:00:05.10,0:00:08.80,Default,,0,0,0,,{\\k15}System {\\k20}reboot {\\k10}initiated...\\N{\\i1}Caution: Neuro-link bandwidth exceeded.{\\i0}
Dialogue: 0,0:00:09.50,0:00:13.20,Default,,0,0,0,,{\\an8\\c&H0080FF&}SYNAPSE CORE ONLINE [1080p AVC VERIFIED]
Dialogue: 0,0:00:14.00,0:00:18.00,Default,,0,0,0,,{\\pos(400,620)}Do you see that hologram in the rain above the skyline?
Dialogue: 0,0:00:19.00,0:00:23.50,Default,,0,0,0,,{\\c&HFF8000&}That's no projection. It's the AI consciousness we locked away.
Dialogue: 0,0:00:25.00,0:00:30.00,Default,,0,0,0,,{\\fad(200,200)}Cell Broadband Engine decoding 1080p stream at 18.5 Mbps.
Dialogue: 0,0:00:31.00,0:00:36.00,Default,,0,0,0,,Prepare the extraction drive before the HEN payload triggers.
`;

const SRT_SAMPLE_CYBER = `
1
00:00:01,200 --> 00:00:04,500
Sector 7 atmospheric scrubbers are offline.

2
00:00:05,100 --> 00:00:08,800
System reboot initiated...
<i>Caution: Neuro-link bandwidth exceeded.</i>

3
00:00:09,500 --> 00:00:13,200
SYNAPSE CORE ONLINE [1080p AVC VERIFIED]

4
00:00:14,000 --> 00:00:18,000
Do you see that hologram in the rain above the skyline?

5
00:00:19,000 --> 00:00:23,500
That's no projection. It's the AI consciousness we locked away.

6
00:00:25,000 --> 00:00:30,000
Cell Broadband Engine decoding 1080p stream at 18.5 Mbps.

7
00:00:31,000 --> 00:00:36,000
Prepare the extraction drive before the HEN payload triggers.
`;

const PGS_GRAPHIC_CUES = [
  {
    id: 'pgs-1',
    startTime: 1.2,
    endTime: 4.5,
    text: '[PGS BITMAP] Sector 7 atmospheric scrubbers are offline.',
    isGraphic: true,
    graphicSvg: `<svg viewBox="0 0 400 60" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="60" rx="8" fill="rgba(10,15,30,0.85)" stroke="#00a4dc" stroke-width="1.5" />
      <text x="20" y="38" font-family="monospace" font-size="16" fill="#ffffff" font-weight="bold">PGS: Sector 7 scrubbers offline</text>
    </svg>`
  },
  {
    id: 'pgs-2',
    startTime: 5.1,
    endTime: 8.8,
    text: '[PGS BITMAP] System reboot initiated [Neuro-link]',
    isGraphic: true,
    graphicSvg: `<svg viewBox="0 0 450 60" xmlns="http://www.w3.org/2000/svg">
      <rect width="450" height="60" rx="8" fill="rgba(10,15,30,0.85)" stroke="#aa5cc3" stroke-width="1.5" />
      <text x="20" y="38" font-family="monospace" font-size="16" fill="#38bdf8" font-weight="bold">PGS: System reboot initiated</text>
    </svg>`
  },
  {
    id: 'pgs-3',
    startTime: 14.0,
    endTime: 18.0,
    text: '[PGS BITMAP] Do you see that hologram in the rain?',
    isGraphic: true,
    graphicSvg: `<svg viewBox="0 0 460 60" xmlns="http://www.w3.org/2000/svg">
      <rect width="460" height="60" rx="8" fill="rgba(10,15,30,0.85)" stroke="#38bdf8" stroke-width="1.5" />
      <text x="20" y="38" font-family="monospace" font-size="16" fill="#f8fafc" font-weight="bold">PGS: Hologram in the rain detected</text>
    </svg>`
  }
];

export const MOCK_LIBRARIES: MediaLibrary[] = [
  { id: 'lib-movies', name: 'Movies', type: 'movies', itemCount: 128 },
  { id: 'lib-tv', name: 'TV Shows', type: 'tvshows', itemCount: 42 },
  { id: 'lib-anime', name: 'Anime', type: 'anime', itemCount: 64 },
  { id: 'lib-music', name: 'Concerts & Music', type: 'music', itemCount: 19 },
  { id: 'lib-collections', name: 'PS3 1080p Direct', type: 'collections', itemCount: 35 }
];

export const MOCK_MEDIA_ITEMS: MediaItem[] = [
  {
    id: 'movie-cyber-odyssey',
    name: 'Cyber Odyssey',
    originalTitle: 'Cyber Odyssey: Neon Protocol',
    type: 'Movie',
    year: 2025,
    tagline: 'A new dimension begins in the rain-soaked shadows of Sector 7.',
    overview: 'In a dystopian mega-city controlled by algorithmic syndicates, a rogue cyber-technician discovers a dormant neural nexus buried beneath the old transit grid. As private enforcers converge, they must decipher the signal before reality collapses.',
    runtimeMinutes: 134,
    communityRating: 8.6,
    officialRating: 'PG-13',
    genres: ['Sci-Fi', 'Action', 'Cyberpunk', 'Thriller'],
    backdropUrl: '/src/assets/images/ps3_cyber_odyssey_1794006979570.jpg',
    posterUrl: '/src/assets/images/ps3_cyber_odyssey_1794006979570.jpg',
    resolution: '1080p',
    videoCodec: 'h264',
    container: 'mkv',
    bitrateMbps: 18.5,
    playbackPositionSeconds: 420,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    director: 'Elena Vance',
    studios: ['Neo-Tokyo Pictures', 'Cell Studio Productions'],
    actors: [
      { name: 'Kaelen Voss', role: 'Devin Cross' },
      { name: 'Maya Lin', role: 'Nyx / Protocol Zero' },
      { name: 'Marcus Sterling', role: 'Cmdr. Reyes' }
    ],
    audioStreams: [
      {
        index: 1,
        title: 'English (DTS-HD MA 5.1 -> PS3 AC3 Passthrough)',
        language: 'English',
        codec: 'ac3',
        channels: 6,
        channelLayout: '5.1',
        bitrate: 640000,
        isDefault: true
      },
      {
        index: 2,
        title: 'Japanese (Master Stereo AAC)',
        language: 'Japanese',
        codec: 'aac',
        channels: 2,
        channelLayout: 'stereo',
        bitrate: 320000
      },
      {
        index: 3,
        title: "Director's Audio Commentary (Elena Vance & Sound Lead)",
        language: 'English',
        codec: 'aac',
        channels: 2,
        channelLayout: 'stereo',
        bitrate: 192000
      },
      {
        index: 4,
        title: 'Spanish Latin America (Dolby Digital 5.1)',
        language: 'Spanish',
        codec: 'ac3',
        channels: 6,
        channelLayout: '5.1',
        bitrate: 448000
      }
    ],
    subtitleStreams: [
      {
        index: 10,
        title: 'English [SRT] (Standard Dialogue)',
        language: 'English',
        format: 'srt',
        isDefault: true,
        cues: parseSrt(SRT_SAMPLE_CYBER)
      },
      {
        index: 11,
        title: 'Stylized Fansub [.ASS -> Plain Text on-the-fly]',
        language: 'English (ASS)',
        format: 'ass',
        cues: parseAssFile(ASS_SAMPLE_CYBER),
        rawSample: ASS_SAMPLE_CYBER
      },
      {
        index: 12,
        title: 'English SDH [PGS] (Presentation Graphic Stream)',
        language: 'English (PGS)',
        format: 'pgssub',
        cues: PGS_GRAPHIC_CUES
      },
      {
        index: 13,
        title: 'Spanish Latin America [SRT]',
        language: 'Spanish',
        format: 'srt',
        cues: [
          { id: 'es-1', startTime: 1.2, endTime: 4.5, text: 'Los depuradores atmosféricos del Sector 7 están desconectados.' },
          { id: 'es-2', startTime: 5.1, endTime: 8.8, text: 'Reinicio del sistema iniciado... Precaución: Ancho de banda excedido.' },
          { id: 'es-3', startTime: 14.0, endTime: 18.0, text: '¿Ves ese holograma en la lluvia sobre los rascacielos?' }
        ]
      }
    ]
  },
  {
    id: 'movie-solaris-drift',
    name: 'Solaris Drift',
    originalTitle: 'Solaris Drift: Deep Ring Expedition',
    type: 'Movie',
    year: 2024,
    tagline: 'Beyond the orbit of Saturn lies an anomaly that bends light and time.',
    overview: 'The crew of the reconnaissance vessel Aethelgard is deployed to chart a newly emerged gravitational rift along the rings of Saturn. When communication with Earth terminates, the ship AI reveals the mission true objective.',
    runtimeMinutes: 148,
    communityRating: 8.9,
    officialRating: 'PG-13',
    genres: ['Sci-Fi', 'Adventure', 'Drama'],
    backdropUrl: '/src/assets/images/ps3_solaris_drift_1794006979799.jpg',
    posterUrl: '/src/assets/images/ps3_solaris_drift_1794006979799.jpg',
    resolution: '1080p',
    videoCodec: 'h264',
    container: 'mp4',
    bitrateMbps: 22.0,
    playbackPositionSeconds: 1840,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    director: 'Aron Thorne',
    studios: ['Astraea Cinema', 'Orbital Media'],
    actors: [
      { name: 'Dr. Sarah Connor', role: 'Chief Astrophysicist' },
      { name: 'Logan Vance', role: 'Pilot Aethelgard' }
    ],
    audioStreams: [
      {
        index: 1,
        title: 'English (Dolby Digital Plus 5.1 / AC3 Passthrough)',
        language: 'English',
        codec: 'ac3',
        channels: 6,
        channelLayout: '5.1',
        bitrate: 640000,
        isDefault: true
      },
      {
        index: 2,
        title: 'Isolated Orchestral Score (Lossless FLAC -> AAC)',
        language: 'Score',
        codec: 'aac',
        channels: 2,
        channelLayout: 'stereo',
        bitrate: 320000
      },
      {
        index: 3,
        title: 'French Dub (Stereo AAC)',
        language: 'French',
        codec: 'aac',
        channels: 2,
        channelLayout: 'stereo',
        bitrate: 256000
      }
    ],
    subtitleStreams: [
      {
        index: 20,
        title: 'English [SRT] (Full SubRip)',
        language: 'English',
        format: 'srt',
        isDefault: true,
        cues: [
          { id: 'sd-1', startTime: 2.0, endTime: 6.0, text: 'Telemetry confirmed. We have crossed into the shadow of the rings.' },
          { id: 'sd-2', startTime: 7.0, endTime: 11.5, text: 'Radiation shields holding at ninety-two percent efficiency.' },
          { id: 'sd-3', startTime: 13.0, endTime: 17.5, text: 'Look at the light distortion along the horizon. It is bending space.' }
        ]
      },
      {
        index: 21,
        title: 'Alien Glyph & Science HUD [.ASS -> Plain Text]',
        language: 'Technical (ASS)',
        format: 'ass',
        cues: parseAssFile(`
[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
Dialogue: 0,0:00:02.00,0:00:06.00,Default,,0,0,0,,{\\pos(500,200)\\c&H00FFFF&}[GRAVITATIONAL ANOMALY DETECTED]
Dialogue: 0,0:00:07.00,0:00:11.50,Default,,0,0,0,,{\\k20}Warning: \\N{\\i1}Cell BE RSX temperature nominal at 58C.{\\i0}
Dialogue: 0,0:00:13.00,0:00:17.50,Default,,0,0,0,,{\\an7\\c&HFF00FF&}Transcode: Direct 1080p Level 4.2 Stream Active
`),
        rawSample: '{\\pos(500,200)\\c&H00FFFF&}[GRAVITATIONAL ANOMALY DETECTED]'
      },
      {
        index: 22,
        title: 'Presentation Graphic Stream [PGS]',
        language: 'English (PGS)',
        format: 'pgssub',
        cues: PGS_GRAPHIC_CUES
      }
    ]
  },
  {
    id: 'series-ronin-neon',
    name: 'Ronin: Neon Horizon',
    originalTitle: '浪人: ネオン・ホライズン',
    type: 'Series',
    year: 2024,
    tagline: 'A cyber-blade tempered in the fires of an eternal metropolis.',
    overview: 'In Neo-Kyoto 2099, an augmented samurai without a clan takes contracts protecting refugees against biometric bounty hunters. Episode 1 follows his fateful duel at the Shinto Overlook under holographic sakura petals.',
    runtimeMinutes: 28,
    communityRating: 9.1,
    officialRating: 'TV-MA',
    genres: ['Anime', 'Action', 'Cyberpunk', 'Animation'],
    backdropUrl: '/src/assets/images/ps3_anime_ronin_1794006980276.jpg',
    posterUrl: '/src/assets/images/ps3_anime_ronin_1794006980276.jpg',
    resolution: '1080p',
    videoCodec: 'h264',
    container: 'mkv',
    bitrateMbps: 14.8,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    director: 'Kenji Takahashi',
    studios: ['Sunrise Neo', 'Cell Arts'],
    actors: [
      { name: 'Jin Tanaka', role: 'The Ronin (Voice)' },
      { name: 'Sayaka Aoi', role: 'Kiri (Voice)' }
    ],
    audioStreams: [
      {
        index: 1,
        title: 'Japanese (Master Audio 2.0 AAC - Original)',
        language: 'Japanese',
        codec: 'aac',
        channels: 2,
        channelLayout: 'stereo',
        bitrate: 320000,
        isDefault: true
      },
      {
        index: 2,
        title: 'English Dub (5.1 Dolby Digital AC3)',
        language: 'English',
        codec: 'ac3',
        channels: 6,
        channelLayout: '5.1',
        bitrate: 448000
      }
    ],
    subtitleStreams: [
      {
        index: 30,
        title: 'Fansub Stylized Songs & Signs [.ASS -> Converted to Plain Text]',
        language: 'English (ASS)',
        format: 'ass',
        isDefault: true,
        cues: parseAssFile(`
[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
Dialogue: 0,0:00:01.00,0:00:05.00,Default,,0,0,0,,{\\pos(400,650)\\c&H0000FF&}The sakura blossoms fall at five centimeters per second.
Dialogue: 0,0:00:06.00,0:00:10.00,Default,,0,0,0,,{\\an8\\fad(300,300)}Sign: [NEO-KYOTO SECTOR 04 - RESTRICTED MILITARY AREA]
Dialogue: 0,0:00:11.00,0:00:16.00,Default,,0,0,0,,{\\k10}Even with {\\k20}titanium bones, {\\k15}the cold seeps into your soul.
`),
        rawSample: '{\\pos(400,650)\\c&H0000FF&}The sakura blossoms fall at five centimeters per second.'
      },
      {
        index: 31,
        title: 'English [SRT] (Official Translation)',
        language: 'English',
        format: 'srt',
        cues: [
          { id: 'rn-1', startTime: 1.0, endTime: 5.0, text: 'The sakura blossoms fall at five centimeters per second.' },
          { id: 'rn-2', startTime: 6.0, endTime: 10.0, text: '[Sign: Neo-Kyoto Sector 04 - Restricted Area]' },
          { id: 'rn-3', startTime: 11.0, endTime: 16.0, text: 'Even with titanium bones, the cold seeps into your soul.' }
        ]
      },
      {
        index: 32,
        title: 'Japanese Kanji Signs [PGS Bitmap]',
        language: 'Japanese (PGS)',
        format: 'pgssub',
        cues: PGS_GRAPHIC_CUES
      }
    ]
  }
];
