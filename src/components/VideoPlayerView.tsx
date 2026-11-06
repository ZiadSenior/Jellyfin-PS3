import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MediaItem, MediaAudioStream, MediaSubtitleStream } from '../types/jellyfin';
import { getActiveCue, SubtitleCue, stripAssTags } from '../utils/subtitles';
import { PS3SystemStatus } from '../utils/ps3Profile';
import { DS3Button } from '../hooks/useDualShock3';

interface VideoPlayerViewProps {
  item: MediaItem;
  initialAudioIdx: number;
  initialSubIdx: number;
  status: PS3SystemStatus;
  onClose: () => void;
  activeButton: DS3Button | null;
}

export const VideoPlayerView: React.FC<VideoPlayerViewProps> = ({
  item,
  initialAudioIdx,
  initialSubIdx,
  status,
  onClose,
  activeButton
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(item.runtimeMinutes * 60);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  // Active Streams
  const [activeAudioIdx, setActiveAudioIdx] = useState(initialAudioIdx);
  const [activeSubIdx, setActiveSubIdx] = useState(initialSubIdx);

  // Subtitle Configuration
  const [subOffset, setSubOffset] = useState(0); // in seconds, +/- offset
  const [subFontSize, setSubFontSize] = useState<'sm' | 'md' | 'lg' | 'xl'>('lg');
  const [activeCue, setActiveCue] = useState<SubtitleCue | null>(null);

  // UI Overlays
  const [showOsd, setShowOsd] = useState(true);
  const [showTracksDrawer, setShowTracksDrawer] = useState(false);
  const [showStatsForNerds, setShowStatsForNerds] = useState(false);
  const [showAssCompare, setShowAssCompare] = useState(false);

  const osdTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const activeAudio = item.audioStreams.find(a => a.index === activeAudioIdx) || item.audioStreams[0];
  const activeSub = item.subtitleStreams.find(s => s.index === activeSubIdx) || null;

  // Auto-hide OSD after 4 seconds of inactivity
  const bumpOsd = useCallback(() => {
    setShowOsd(true);
    if (osdTimeoutRef.current) clearTimeout(osdTimeoutRef.current);
    osdTimeoutRef.current = setTimeout(() => {
      setShowOsd(false);
    }, 4500);
  }, []);

  useEffect(() => {
    bumpOsd();
    return () => {
      if (osdTimeoutRef.current) clearTimeout(osdTimeoutRef.current);
    };
  }, [bumpOsd]);

  // Video element playback listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const cur = video.currentTime;
      setCurrentTime(cur);

      if (activeSub && activeSub.cues.length > 0) {
        const cue = getActiveCue(activeSub.cues, cur, subOffset);
        setActiveCue(cue);
      } else {
        setActiveCue(null);
      }
    };

    const handleLoadedMetadata = () => {
      if (video.duration && !isNaN(video.duration)) {
        setDuration(video.duration);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setShowOsd(true);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);

    // Initial play
    video.play().catch(() => {
      setIsPlaying(false);
    });

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
    };
  }, [activeSub, subOffset]);

  // Handle DualShock 3 button actions during playback
  useEffect(() => {
    if (!activeButton) return;
    bumpOsd();

    switch (activeButton) {
      case 'CROSS':
      case 'START':
        togglePlayPause();
        break;
      case 'CIRCLE':
        if (showTracksDrawer) {
          setShowTracksDrawer(false);
        } else if (showStatsForNerds) {
          setShowStatsForNerds(false);
        } else {
          onClose();
        }
        break;
      case 'SQUARE':
        setShowTracksDrawer(prev => !prev);
        break;
      case 'TRIANGLE':
      case 'SELECT':
        setShowStatsForNerds(prev => !prev);
        break;
      case 'L1':
        seekRelative(-10);
        break;
      case 'R1':
        seekRelative(30);
        break;
      case 'LEFT':
        seekRelative(-5);
        break;
      case 'RIGHT':
        seekRelative(10);
        break;
    }
  }, [activeButton]);

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play();
      setIsPlaying(true);
    }
    bumpOsd();
  };

  const seekRelative = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(video.currentTime + seconds, duration));
    bumpOsd();
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const target = parseFloat(e.target.value);
    video.currentTime = target;
    setCurrentTime(target);
    bumpOsd();
  };

  const formatTime = (secs: number) => {
    const total = Math.floor(secs);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const fontClass = {
    sm: 'text-sm sm:text-base',
    md: 'text-base sm:text-lg',
    lg: 'text-lg sm:text-2xl',
    xl: 'text-xl sm:text-3xl'
  }[subFontSize];

  return (
    <div
      onMouseMove={bumpOsd}
      onClick={bumpOsd}
      className="fixed inset-0 z-50 bg-black flex flex-col justify-between overflow-hidden select-none cursor-default"
    >
      {/* 1080p Video Surface */}
      <div className="relative w-full h-full flex items-center justify-center bg-black">
        <video
          ref={videoRef}
          src={item.videoUrl}
          poster={item.backdropUrl}
          playsInline
          autoPlay
          className="w-full h-full object-contain"
        />

        {/* Subtitle Rendering Overlay */}
        {activeSub && activeCue && (
          <div className="absolute bottom-20 left-6 right-6 z-20 flex flex-col items-center pointer-events-none text-center">
            {activeCue.isGraphic && activeCue.graphicSvg ? (
              /* PGS Graphic Bitmap Subtitle Rendering */
              <div
                className="max-w-xl mx-auto shadow-2xl animate-fade-in"
                dangerouslySetInnerHTML={{ __html: activeCue.graphicSvg }}
              />
            ) : (
              /* SRT or ASS Converted Plain-Text Subtitle Rendering */
              <div className="max-w-3xl px-4 py-1.5 rounded bg-black/75 backdrop-blur-[2px] shadow-2xl inline-block border border-black/40">
                <span
                  className={`${fontClass} font-semibold text-yellow-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] tracking-wide leading-relaxed whitespace-pre-line`}
                >
                  {activeCue.text}
                </span>

                {/* Subtitle format indicator badge */}
                <span className="block text-[9px] font-mono text-slate-400 mt-0.5">
                  [{activeSub.format.toUpperCase()} · Synced {subOffset !== 0 ? `${subOffset > 0 ? '+' : ''}${subOffset}s` : '0ms'}]
                </span>
              </div>
            )}
          </div>
        )}

        {/* Top PS3 HUD Header */}
        <div
          className={`absolute top-0 left-0 right-0 z-30 p-4 sm:p-6 bg-gradient-to-b from-black/90 via-black/50 to-transparent flex items-center justify-between transition-opacity duration-300 ${
            showOsd ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-700/80 flex items-center gap-1.5"
            >
              <span>✕</span>
              <span>Back to Library</span>
            </button>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-white truncate drop-shadow">
                {item.name}
              </h2>
              <div className="text-xs text-slate-300 drop-shadow flex items-center gap-2">
                <span>1080p Direct Play</span>
                <span aria-hidden="true">·</span>
                <span>{item.year}</span>
                <span aria-hidden="true">·</span>
                <span>{activeAudio?.language} ({activeAudio?.codec.toUpperCase()} {activeAudio?.channelLayout})</span>
              </div>
            </div>
          </div>

          {/* PS3 Hardware Real-time Monitor */}
          <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-slate-900/70 border border-slate-800 text-xs font-mono">
            <span className="text-cyan-400">HEN {status.firmware}</span>
            <span className="text-slate-600">|</span>
            <span className={status.cellTemp > 70 ? 'text-amber-400' : 'text-slate-300'}>
              CELL: {status.cellTemp}°C
            </span>
            <span className="text-slate-600">|</span>
            <span className={status.rsxTemp > 65 ? 'text-amber-400' : 'text-slate-300'}>
              RSX: {status.rsxTemp}°C
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-emerald-400">1080p AVC</span>
          </div>
        </div>

        {/* Stats For Nerds Overlay */}
        {showStatsForNerds && (
          <div className="absolute top-16 right-4 sm:right-6 z-40 w-80 sm:w-96 p-4 rounded-xl bg-slate-950/90 border border-slate-700/80 backdrop-blur-md shadow-2xl text-xs font-mono space-y-2 text-slate-300">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-cyan-400 font-bold">
              <span>PS3 Jellyfin Stream Stats</span>
              <button
                onClick={() => setShowStatsForNerds(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Play Method:</span>
              <span className="text-white">Direct Play (No Transcoding)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Video Decoder:</span>
              <span className="text-white">Cell Broadband Engine AVC</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Resolution:</span>
              <span className="text-white">1920x1080 (1080p @ 23.976fps)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Codec &amp; Profile:</span>
              <span className="text-white">H.264 High Profile Level 4.2</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Bitrate:</span>
              <span className="text-cyan-400">{item.bitrateMbps} Mbps</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Audio Stream:</span>
              <span className="text-white">{activeAudio?.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Audio Codec:</span>
              <span className="text-white">{activeAudio?.codec.toUpperCase()} {activeAudio?.channelLayout}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Subtitle Engine:</span>
              <span className="text-purple-400">
                {activeSub ? `${activeSub.format.toUpperCase()} (Client Parser Active)` : 'Disabled'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Dropped Frames:</span>
              <span className="text-emerald-400">0 / 14,290 (0.00%)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">PS3 System Memory:</span>
              <span className="text-white">{status.freeRamMb}MB Free / {status.totalRamMb}MB</span>
            </div>
          </div>
        )}

        {/* Audio & Subtitles Drawer Modal */}
        {showTracksDrawer && (
          <div className="absolute inset-0 z-40 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 max-h-[85vh] overflow-y-auto space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-lg font-bold text-white font-display">
                    Audio &amp; Subtitle Track Switcher
                  </h3>
                  <p className="text-xs text-slate-400">
                    Switch language, adjust subtitle sync, or toggle .ASS converter
                  </p>
                </div>
                <button
                  onClick={() => setShowTracksDrawer(false)}
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center"
                >
                  ✕
                </button>
              </div>

              {/* Audio Tracks */}
              <div>
                <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">
                  Select Audio Track
                </h4>
                <div className="space-y-2">
                  {item.audioStreams.map((audio) => (
                    <button
                      key={`drawer-audio-${audio.index}`}
                      onClick={() => {
                        setActiveAudioIdx(audio.index);
                        bumpOsd();
                      }}
                      className={`w-full p-3 rounded-lg text-left border flex items-center justify-between transition-colors ${
                        activeAudioIdx === audio.index
                          ? 'bg-cyan-500/10 border-cyan-500 text-white'
                          : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-semibold text-white">{audio.title}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {audio.language} · {audio.codec.toUpperCase()} {audio.channelLayout} · {(audio.bitrate / 1000).toFixed(0)} kbps
                        </div>
                      </div>
                      <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] border ${
                        activeAudioIdx === audio.index ? 'border-cyan-400 bg-cyan-400 text-slate-950 font-bold' : 'border-slate-600'
                      }`}>
                        {activeAudioIdx === audio.index && '✓'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Subtitles Tracks */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                    Select Subtitle Track
                  </h4>
                  <button
                    onClick={() => setShowAssCompare(!showAssCompare)}
                    className="text-xs text-purple-400 hover:text-purple-300 underline"
                  >
                    {showAssCompare ? 'Hide ASS Plain-Text Demo' : 'Show ASS Plain-Text Demo'}
                  </button>
                </div>

                <div className="space-y-2">
                  {/* Off Option */}
                  <button
                    onClick={() => {
                      setActiveSubIdx(-1);
                      bumpOsd();
                    }}
                    className={`w-full p-3 rounded-lg text-left border flex items-center justify-between transition-colors ${
                      activeSubIdx === -1
                        ? 'bg-cyan-500/10 border-cyan-500 text-white'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-semibold text-white">None (Subtitles Off)</div>
                    <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] border ${
                      activeSubIdx === -1 ? 'border-cyan-400 bg-cyan-400 text-slate-950 font-bold' : 'border-slate-600'
                    }`}>
                      {activeSubIdx === -1 && '✓'}
                    </span>
                  </button>

                  {item.subtitleStreams.map((sub) => (
                    <button
                      key={`drawer-sub-${sub.index}`}
                      onClick={() => {
                        setActiveSubIdx(sub.index);
                        bumpOsd();
                      }}
                      className={`w-full p-3 rounded-lg text-left border flex items-center justify-between transition-colors ${
                        activeSubIdx === sub.index
                          ? 'bg-cyan-500/10 border-cyan-500 text-white'
                          : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-semibold text-white">{sub.title}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {sub.language} · Format: <span className="text-purple-300 font-mono font-bold">{sub.format.toUpperCase()}</span>
                          {sub.format === 'ass' && ' (Auto-converted to plain text)'}
                          {sub.format === 'pgssub' && ' (Graphic bitmap overlay)'}
                        </div>
                      </div>
                      <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] border ${
                        activeSubIdx === sub.index ? 'border-cyan-400 bg-cyan-400 text-slate-950 font-bold' : 'border-slate-600'
                      }`}>
                        {activeSubIdx === sub.index && '✓'}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Subtitle Sync Offset Controls */}
                {activeSub && (
                  <div className="mt-4 p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-semibold">Subtitle Sync Offset:</span>
                      <span className="font-mono text-cyan-400 font-bold">
                        {subOffset > 0 ? `+${subOffset.toFixed(1)}s` : `${subOffset.toFixed(1)}s`}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSubOffset(prev => Math.round((prev - 0.5) * 10) / 10)}
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-xs text-white"
                      >
                        -500ms
                      </button>
                      <button
                        onClick={() => setSubOffset(prev => Math.round((prev - 0.1) * 10) / 10)}
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-xs text-white"
                      >
                        -100ms
                      </button>
                      <button
                        onClick={() => setSubOffset(0)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-xs text-slate-300"
                      >
                        Reset (0ms)
                      </button>
                      <button
                        onClick={() => setSubOffset(prev => Math.round((prev + 0.1) * 10) / 10)}
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-xs text-white"
                      >
                        +100ms
                      </button>
                      <button
                        onClick={() => setSubOffset(prev => Math.round((prev + 0.5) * 10) / 10)}
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-xs text-white"
                      >
                        +500ms
                      </button>
                    </div>

                    {/* Subtitle Size */}
                    <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/80">
                      <span className="text-slate-400">Subtitle Size:</span>
                      <div className="flex items-center gap-1.5">
                        {(['sm', 'md', 'lg', 'xl'] as const).map(size => (
                          <button
                            key={size}
                            onClick={() => setSubFontSize(size)}
                            className={`px-2.5 py-1 rounded text-xs uppercase font-mono ${
                              subFontSize === size
                                ? 'bg-cyan-500 text-slate-950 font-bold'
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ASS comparison breakdown */}
                {showAssCompare && (
                  <div className="mt-4 p-4 rounded-xl bg-purple-950/30 border border-purple-800/50 space-y-2 text-xs">
                    <div className="text-purple-300 font-bold">
                      .ASS On-The-Fly Plain-Text Filter Engine
                    </div>
                    <div className="p-3 bg-slate-950 rounded font-mono text-[11px] space-y-2">
                      <div className="text-red-400">
                        Raw: {`{\\pos(400,600)\\c&H00FFFF&\\fad(150,150)}Sector 7 scrubbers offline.`}
                      </div>
                      <div className="text-emerald-400 font-bold">
                        Clean Text: {stripAssTags(`{\\pos(400,600)\\c&H00FFFF&\\fad(150,150)}Sector 7 scrubbers offline.`)}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2 text-right">
                <button
                  onClick={() => setShowTracksDrawer(false)}
                  className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg transition-colors"
                >
                  Apply &amp; Resume Playback
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bottom OSD Control Bar */}
        <div
          className={`absolute bottom-0 left-0 right-0 z-30 p-4 sm:p-6 bg-gradient-to-t from-black/95 via-black/80 to-transparent transition-opacity duration-300 ${
            showOsd ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          {/* Scrub Bar */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-mono text-slate-300 shrink-0">
              {formatTime(currentTime)}
            </span>

            <div className="relative flex-1 flex items-center">
              <input
                type="range"
                min={0}
                max={duration || 100}
                step={0.5}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            <span className="text-xs font-mono text-slate-400 shrink-0">
              {formatTime(duration)}
            </span>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between">
            {/* Left playback controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlayPause}
                className="w-10 h-10 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center justify-center font-bold shadow-lg transition-transform active:scale-90"
                title="Play/Pause"
              >
                {isPlaying ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              <button
                onClick={() => seekRelative(-10)}
                className="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs border border-slate-700/80"
                title="Rewind 10s (L1)"
              >
                -10s
              </button>

              <button
                onClick={() => seekRelative(30)}
                className="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs border border-slate-700/80"
                title="Skip 30s (R1)"
              >
                +30s
              </button>
            </div>

            {/* Right stream & track switches */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowTracksDrawer(true)}
                aria-label="Open Audio and Subtitle Tracks"
                className="px-3.5 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-white text-xs font-semibold border border-slate-700 flex items-center gap-2"
                title="Square ([ ]) - Audio and Subtitle Tracks"
              >
                <span className="w-4 h-4 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/50 flex items-center justify-center text-[10px]">
                  □
                </span>
                <span>Tracks</span>
                {activeSub && (
                  <span className="text-[10px] text-cyan-300 font-mono">
                    [{activeSub.format.toUpperCase()}]
                  </span>
                )}
              </button>

              <button
                onClick={() => setShowStatsForNerds(!showStatsForNerds)}
                className="px-3 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white text-xs border border-slate-700 hidden sm:flex items-center gap-1.5 font-mono"
                title="Select - Stats For Nerds"
              >
                <span>Stats</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
