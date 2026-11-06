import React, { useState } from 'react';
import { stripAssTags } from '../utils/subtitles';
import { MediaItem } from '../types/jellyfin';

interface SubtitlesAudioHubProps {
  items: MediaItem[];
  onPlayItem: (item: MediaItem, audioIdx: number, subIdx: number) => void;
}

export const SubtitlesAudioHub: React.FC<SubtitlesAudioHubProps> = ({
  items,
  onPlayItem
}) => {
  const [testAssInput, setTestAssInput] = useState(
    '{\\pos(400,600)\\c&H00FFFF&\\fad(150,150)}Sector 7 atmospheric scrubbers are offline.\\N{\\i1}Caution: Neuro-link bandwidth exceeded.{\\i0}'
  );

  const convertedText = stripAssTags(testAssInput);
  const sampleItem = items[0] || null;

  return (
    <div className="space-y-10 pb-16">
      {/* Title & Introduction */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
          Subtitles &amp; Multi-Audio Engine
        </h2>
        <p className="mt-2 text-sm text-slate-300 max-w-3xl leading-relaxed">
          Engineered specifically for the PS3 hardware architecture (Cell BE / RSX). Handles SubRip (SRT), Presentation Graphic Stream (PGS bitmaps), on-the-fly Advanced SubStation Alpha (.ASS) plain-text stripping, and dynamic multi-track audio switching.
        </p>
      </div>

      {/* 3 Columns Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: ASS Converter */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-purple-800/40 space-y-4">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center font-mono font-bold text-sm">
            .ASS
          </div>
          <h3 className="text-base font-bold text-white">
            On-The-Fly ASS Stripper
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Eliminates complex libass CPU bottlenecks on the PS3 Cell processor. Dialogue tags, karaoke timings, colors, and positioning are stripped instantly into clean, readable subtitles without dropping video frames.
          </p>
          <div className="text-[11px] text-purple-300 font-mono">
            Direct AVC 1080p @ 60fps
          </div>
        </div>

        {/* Card 2: PGS Subtitles */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-cyan-800/40 space-y-4">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center font-mono font-bold text-sm">
            PGS
          </div>
          <h3 className="text-base font-bold text-white">
            Presentation Graphic Stream
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Full support for bitmap/graphical subtitles extracted from Blu-ray and Matroska (.mkv) sources. Rendered via RSX hardware overlay layers synchronized to video timecodes.
          </p>
          <div className="text-[11px] text-cyan-300 font-mono">
            Bitmap Graphic Sync
          </div>
        </div>

        {/* Card 3: Multi-Audio Tracks */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-emerald-800/40 space-y-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-mono font-bold text-sm">
            5.1 AC3
          </div>
          <h3 className="text-base font-bold text-white">
            Multi-Track External Audio
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Select between original Japanese master audio, English 5.1 AC3 passthrough, commentaries, or alternate dubs. Switches streams dynamically via Jellyfin API query parameters.
          </p>
          <div className="text-[11px] text-emerald-300 font-mono">
            AC3 Passthrough &amp; AAC Stereo
          </div>
        </div>
      </div>

      {/* Real-time ASS Sanitizer Inspector */}
      <section className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-lg font-bold text-white font-display">
            Advanced SubStation Alpha (.ASS) Real-Time Sanitizer
          </h3>
          <span className="text-xs text-slate-400 font-mono">Real-time RegEx Pipeline</span>
        </div>

        <p className="text-xs text-slate-300">
          The PS3 WebKit and Movian environments utilize this instant filter to strip styling and positional tags from .ASS streams:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1.5">
              Input Raw .ASS String (with tags):
            </label>
            <textarea
              rows={4}
              value={testAssInput}
              onChange={(e) => setTestAssInput(e.target.value)}
              className="w-full p-3 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-red-300 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1.5">
              Output Clean Plain-Text (Rendered on PS3 Screen):
            </label>
            <div className="w-full min-h-[96px] p-3 bg-slate-950 border border-emerald-700/50 rounded-lg text-xs font-sans text-emerald-300 whitespace-pre-line flex flex-col justify-between">
              <div>{convertedText || <span className="text-slate-600 italic">Empty output</span>}</div>
              <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-900 font-mono">
                Status: Sanitized for PS3 high-contrast TV overlay
              </div>
            </div>
          </div>
        </div>

        {sampleItem && (
          <div className="pt-2 flex justify-end">
            <button
              onClick={() => onPlayItem(sampleItem, sampleItem.audioStreams[0].index, 11)}
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-purple-600/20"
            >
              <span>Play Stream with Converted .ASS Subtitles</span>
              <span>→</span>
            </button>
          </div>
        )}
      </section>

      {/* Available Media Stream Matrix */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold text-white font-display">
          Indexed Media Stream Matrix
        </h3>

        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={`stream-matrix-${item.id}`}
              className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm font-bold text-white">{item.name}</h4>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {item.year} · {item.resolution} · AVC High@L4.2 · {item.bitrateMbps} Mbps
                  </div>
                </div>

                <button
                  onClick={() => onPlayItem(item, item.audioStreams[0].index, item.subtitleStreams[0]?.index ?? -1)}
                  className="px-3.5 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 hover:text-cyan-300 border border-cyan-500/40 text-xs font-semibold rounded-lg transition-colors"
                >
                  Play Stream
                </button>
              </div>

              {/* Streams details table */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Audio */}
                <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80">
                  <div className="font-semibold text-slate-300 mb-2">
                    Audio Streams ({item.audioStreams.length})
                  </div>
                  <ul className="space-y-1.5 text-slate-400">
                    {item.audioStreams.map((a) => (
                      <li key={a.index} className="flex justify-between">
                        <span className="text-slate-300">{a.title}</span>
                        <span className="font-mono text-cyan-400 font-bold">{a.codec.toUpperCase()}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Subtitles */}
                <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80">
                  <div className="font-semibold text-slate-300 mb-2">
                    Subtitle Streams ({item.subtitleStreams.length})
                  </div>
                  <ul className="space-y-1.5 text-slate-400">
                    {item.subtitleStreams.map((s) => (
                      <li key={s.index} className="flex justify-between">
                        <span className="text-slate-300">{s.title}</span>
                        <span className="font-mono text-purple-400 font-bold">{s.format.toUpperCase()}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
