import React, { useState } from 'react';
import { MediaItem } from '../types/jellyfin';
import { stripAssTags } from '../utils/subtitles';

interface MediaDetailModalProps {
  item: MediaItem;
  onClose: () => void;
  onPlay: (item: MediaItem, audioIdx: number, subIdx: number) => void;
}

export const MediaDetailModal: React.FC<MediaDetailModalProps> = ({
  item,
  onClose,
  onPlay
}) => {
  const [selectedAudioIdx, setSelectedAudioIdx] = useState<number>(
    item.audioStreams.find(a => a.isDefault)?.index ?? item.audioStreams[0]?.index ?? 0
  );
  const [selectedSubIdx, setSelectedSubIdx] = useState<number>(
    item.subtitleStreams.find(s => s.isDefault)?.index ?? -1
  );
  const [showAssInspector, setShowAssInspector] = useState(false);

  const selectedSub = item.subtitleStreams.find(s => s.index === selectedSubIdx);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto"
    >
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Backdrop Header */}
        <div className="relative aspect-[21/9] sm:aspect-[2.6/1] w-full shrink-0 overflow-hidden bg-slate-950">
          <img
            src={item.backdropUrl}
            alt={item.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-950/80 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center border border-slate-700/80 transition-colors"
          >
            <span className="text-lg">✕</span>
          </button>

          {/* Title and metadata on backdrop */}
          <div className="absolute bottom-4 left-6 right-6">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300 font-medium mb-1">
              <span className="text-cyan-400 font-bold">{item.resolution} AVC</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span>{item.year}</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span>{item.runtimeMinutes} min</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-amber-400">★ {item.communityRating}</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span>{item.officialRating}</span>
            </div>
            <h2 id="modal-title" className="text-2xl sm:text-3xl font-extrabold text-white font-display">
              {item.name}
            </h2>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-300 text-sm">
          {/* Tagline & Overview */}
          <div>
            {item.tagline && (
              <p className="text-sm italic text-cyan-300 mb-2 font-medium">
                "{item.tagline}"
              </p>
            )}
            <p className="text-slate-300 leading-relaxed text-xs sm:text-sm">
              {item.overview}
            </p>
          </div>

          {/* PS3 1080p Hardware Decoder Profile Details */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block">Stream Method</span>
              <span className="text-cyan-400 font-bold font-mono">1080p Direct Play</span>
            </div>
            <div>
              <span className="text-slate-400 block">Codec Profile</span>
              <span className="text-white font-bold font-mono">H.264 High@L4.2</span>
            </div>
            <div>
              <span className="text-slate-400 block">Bitrate Budget</span>
              <span className="text-amber-400 font-bold font-mono">{item.bitrateMbps} Mbps</span>
            </div>
            <div>
              <span className="text-slate-400 block">Container</span>
              <span className="text-white font-bold font-mono">.{item.container.toUpperCase()}</span>
            </div>
          </div>

          {/* Audio Tracks Selection */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-bold text-white uppercase tracking-wider">
                Audio Tracks ({item.audioStreams.length} Available)
              </label>
              <span className="text-[11px] text-slate-400">Multi-audio switcher</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {item.audioStreams.map((audio) => (
                <button
                  key={`audio-${audio.index}`}
                  type="button"
                  onClick={() => setSelectedAudioIdx(audio.index)}
                  className={`p-3 rounded-lg text-left transition-all border flex items-center justify-between ${
                    selectedAudioIdx === audio.index
                      ? 'bg-cyan-500/10 border-cyan-500 text-white shadow-sm'
                      : 'bg-slate-950/50 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="text-xs font-semibold truncate text-white">
                      {audio.title}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {audio.language} · {audio.codec.toUpperCase()} · {audio.channelLayout}
                    </div>
                  </div>
                  <div className="shrink-0">
                    <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border text-[9px] ${
                      selectedAudioIdx === audio.index
                        ? 'border-cyan-400 bg-cyan-400 text-slate-950 font-bold'
                        : 'border-slate-600'
                    }`}>
                      {selectedAudioIdx === audio.index && '✓'}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Subtitles Selection */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-bold text-white uppercase tracking-wider">
                Subtitles (SRT · PGS · ASS on-the-fly)
              </label>
              <button
                type="button"
                onClick={() => setShowAssInspector(!showAssInspector)}
                className="text-[11px] text-purple-400 hover:text-purple-300 underline font-medium"
              >
                {showAssInspector ? 'Hide ASS Tag Inspector' : 'Inspect .ASS Plain-Text Conversion'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Off Option */}
              <button
                type="button"
                onClick={() => setSelectedSubIdx(-1)}
                className={`p-3 rounded-lg text-left transition-all border flex items-center justify-between ${
                  selectedSubIdx === -1
                    ? 'bg-cyan-500/10 border-cyan-500 text-white'
                    : 'bg-slate-950/50 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="text-xs font-semibold text-white">None / Off</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">No subtitles displayed</div>
                </div>
                <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border text-[9px] ${
                  selectedSubIdx === -1 ? 'border-cyan-400 bg-cyan-400 text-slate-950 font-bold' : 'border-slate-600'
                }`}>
                  {selectedSubIdx === -1 && '✓'}
                </span>
              </button>

              {/* Subtitle tracks */}
              {item.subtitleStreams.map((sub) => (
                <button
                  key={`sub-${sub.index}`}
                  type="button"
                  onClick={() => setSelectedSubIdx(sub.index)}
                  className={`p-3 rounded-lg text-left transition-all border flex items-center justify-between ${
                    selectedSubIdx === sub.index
                      ? 'bg-cyan-500/10 border-cyan-500 text-white'
                      : 'bg-slate-950/50 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="text-xs font-semibold truncate text-white">
                      {sub.title}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {sub.language} · Format: <span className="text-purple-300 font-mono font-bold">{sub.format.toUpperCase()}</span>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border text-[9px] ${
                      selectedSubIdx === sub.index
                        ? 'border-cyan-400 bg-cyan-400 text-slate-950 font-bold'
                        : 'border-slate-600'
                    }`}>
                      {selectedSubIdx === sub.index && '✓'}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* ASS Tag Stripper Inspector Drawer */}
            {showAssInspector && (
              <div className="mt-4 p-4 rounded-xl bg-purple-950/20 border border-purple-800/40 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-purple-300">
                  <span>Advanced SubStation Alpha (.ASS) On-the-Fly Converter</span>
                  <span className="font-mono text-[10px] text-purple-400">PS3 Cell/RSX Engine</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  The PS3 WebKit and Movian engines lack native libass vector rendering. Our client parses the .ASS file stream, strips complex dialogue override tags (like {'{\\k...}'}, {'{\\pos...}'}, {'{\\fad...}'}, {'{\\c&H...&}'}), and converts them into high-contrast clean plain-text subtitles on-the-fly.
                </p>

                <div className="p-3 bg-slate-950 rounded-lg font-mono text-xs space-y-2 border border-slate-800">
                  <div className="text-slate-400 text-[11px]">Original RAW ASS line:</div>
                  <div className="text-red-400 text-[11px] break-all">
                    {`{\\pos(400,600)\\c&H00FFFF&\\fad(150,150)}Sector 7 atmospheric scrubbers are offline.`}
                  </div>
                  <div className="text-slate-400 text-[11px] pt-1">Converted Clean Plain Text:</div>
                  <div className="text-emerald-400 text-[11px] font-bold">
                    {stripAssTags(`{\\pos(400,600)\\c&H00FFFF&\\fad(150,150)}Sector 7 atmospheric scrubbers are offline.`)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="p-4 sm:p-6 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between gap-4 shrink-0">
          <div className="text-xs text-slate-400 hidden sm:block">
            <span>Audio: </span>
            <span className="text-white font-medium">
              {item.audioStreams.find(a => a.index === selectedAudioIdx)?.title}
            </span>
            <span className="mx-2">·</span>
            <span>Subs: </span>
            <span className="text-cyan-400 font-medium">
              {selectedSub ? selectedSub.title : 'None'}
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold rounded-lg transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => onPlay(item, selectedAudioIdx, selectedSubIdx)}
              className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs sm:text-sm rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-95"
            >
              <span className="w-4 h-4 rounded-full bg-slate-950 text-cyan-400 text-[10px] flex items-center justify-center font-bold">
                ✕
              </span>
              <span>Start 1080p Playback</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
