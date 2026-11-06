import React from 'react';
import { MediaItem, MediaLibrary } from '../types/jellyfin';

interface HomeDashboardProps {
  libraries: MediaLibrary[];
  items: MediaItem[];
  onSelectItem: (item: MediaItem) => void;
  onPlayItem: (item: MediaItem) => void;
  selectedItemId: string | null;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  libraries,
  items,
  onSelectItem,
  onPlayItem,
  selectedItemId
}) => {
  const heroItem = items[0] || null;
  const continueWatching = items.filter(i => (i.playbackPositionSeconds || 0) > 0);
  const animeItems = items.filter(i => i.genres.includes('Anime') || i.genres.includes('Cyberpunk'));

  return (
    <div className="space-y-10 pb-16">
      {/* Hero Spotlight Banner */}
      {heroItem && (
        <div className="relative w-full rounded-2xl overflow-hidden border border-slate-800/80 bg-slate-950 shadow-2xl">
          {/* Backdrop Image */}
          <div className="relative aspect-[21/9] sm:aspect-[2.4/1] w-full min-h-[360px]">
            <img
              src={heroItem.backdropUrl}
              alt={heroItem.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center"
            />
            {/* Scrim Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#080c14] via-[#080c14]/70 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#080c14] via-[#080c14]/80 to-transparent w-full sm:w-2/3" />
          </div>

          {/* Hero Content Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 z-10 max-w-3xl">
            {/* Clean unboxed metadata with dot separators */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300 font-medium mb-2.5">
              <span className="text-cyan-400 font-bold">{heroItem.resolution} AVC Direct</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span>{heroItem.year}</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span>{Math.floor(heroItem.runtimeMinutes / 60)}h {heroItem.runtimeMinutes % 60}m</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-amber-400">★ {heroItem.communityRating}</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span>{heroItem.audioStreams.length} Audio Tracks</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span>ASS/SRT/PGS Subs</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-display mb-2 text-balance">
              {heroItem.name}
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 sm:line-clamp-3 mb-6 max-w-2xl leading-relaxed">
              {heroItem.overview}
            </p>

            <div className="flex items-center gap-3">
              <button
                onClick={() => onPlayItem(heroItem)}
                className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs sm:text-sm rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-95"
              >
                <span className="w-4 h-4 rounded-full bg-slate-950 text-cyan-400 text-[10px] flex items-center justify-center font-bold">
                  ✕
                </span>
                <span>Play 1080p Stream</span>
              </button>

              <button
                onClick={() => onSelectItem(heroItem)}
                className="px-4 py-2.5 bg-slate-800/80 hover:bg-slate-700/80 text-white font-medium text-xs sm:text-sm rounded-lg border border-slate-700/80 transition-colors flex items-center gap-2"
              >
                <span>Details &amp; Tracks</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Libraries Strip */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base sm:text-lg font-bold text-white font-display">
            My Libraries
          </h3>
          <span className="text-xs text-slate-400">
            {libraries.reduce((acc, curr) => acc + curr.itemCount, 0)} Items Indexed
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {libraries.map((lib) => (
            <div
              key={lib.id}
              className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-cyan-500/50 hover:bg-slate-900/90 transition-all cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center text-sm font-bold mb-3 group-hover:scale-105 transition-transform">
                {lib.type === 'movies' && '🎬'}
                {lib.type === 'tvshows' && '📺'}
                {lib.type === 'anime' && '⛩️'}
                {lib.type === 'music' && '🎵'}
                {lib.type === 'collections' && '📦'}
              </div>
              <h4 className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors">
                {lib.name}
              </h4>
              <div className="text-xs text-slate-400 mt-0.5">
                {lib.itemCount} titles
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Continue Watching Row */}
      {continueWatching.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-bold text-white font-display">
              Continue Watching
            </h3>
            <span className="text-xs text-cyan-400 font-mono">Resume Sync Enabled</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {continueWatching.map((item) => {
              const posSec = item.playbackPositionSeconds || 0;
              const totalSec = item.runtimeMinutes * 60;
              const percent = Math.min(100, Math.round((posSec / totalSec) * 100));

              return (
                <div
                  key={`continue-${item.id}`}
                  onClick={() => onSelectItem(item)}
                  className={`group relative rounded-xl overflow-hidden bg-slate-900/80 border transition-all cursor-pointer ${
                    selectedItemId === item.id
                      ? 'border-cyan-400 ring-2 ring-cyan-400/30'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="relative aspect-video w-full bg-slate-950 overflow-hidden">
                    <img
                      src={item.backdropUrl}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                    {/* Play button overlay */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onPlayItem(item);
                      }}
                      className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-cyan-500/90 text-slate-950 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      title="Resume"
                    >
                      <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </button>

                    {/* Progress Bar */}
                    <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-800">
                      <div
                        className="h-full bg-cyan-400"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                      <span>{item.year}</span>
                      <span className="font-mono">{Math.floor(posSec / 60)}m / {item.runtimeMinutes}m</span>
                    </div>
                    <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {item.name}
                    </h4>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Recently Added Movies Row */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base sm:text-lg font-bold text-white font-display">
            Recently Added Movies (1080p Direct Play)
          </h3>
          <span className="text-xs text-slate-400">H.264 High Profile Level 4.2</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectItem(item)}
              className={`group relative rounded-xl overflow-hidden bg-slate-900/70 border transition-all cursor-pointer ${
                selectedItemId === item.id
                  ? 'border-cyan-400 ring-2 ring-cyan-400/30'
                  : 'border-slate-800/80 hover:border-cyan-500/40 hover:bg-slate-900/90'
              }`}
            >
              <div className="relative aspect-[16/9] w-full bg-slate-950 overflow-hidden">
                <img
                  src={item.backdropUrl}
                  alt={item.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                {/* Badges without pills */}
                <div className="absolute top-2 left-2 text-[10px] font-mono text-cyan-300 font-bold bg-slate-950/80 px-2 py-0.5 rounded">
                  {item.resolution}
                </div>
                <div className="absolute top-2 right-2 text-[10px] font-mono text-amber-300 font-bold bg-slate-950/80 px-2 py-0.5 rounded">
                  ★ {item.communityRating}
                </div>
              </div>

              <div className="p-3.5">
                <h4 className="text-sm font-bold text-white truncate group-hover:text-cyan-300 transition-colors">
                  {item.name}
                </h4>

                <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                  <span>{item.year}</span>
                  <span aria-hidden="true">·</span>
                  <span>{item.runtimeMinutes}m</span>
                  <span aria-hidden="true">·</span>
                  <span className="truncate">{item.audioStreams.length} audio</span>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="text-slate-400">AVC High@L4.2</span>
                  <span className="text-cyan-400 font-mono">{item.bitrateMbps} Mbps</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Subtitle & Audio Showcase Row */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white font-display">
              Anime &amp; Multi-Track Releases (ASS / PGS Tested)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Files with multiple external audio languages and on-the-fly .ASS plain text converter
            </p>
          </div>
          <span className="text-xs text-purple-400 font-mono">On-the-fly ASS</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {animeItems.map((item) => (
            <div
              key={`anime-${item.id}`}
              onClick={() => onSelectItem(item)}
              className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-purple-500/50 hover:bg-slate-900/90 transition-all cursor-pointer group"
            >
              <div className="flex items-start gap-4">
                <img
                  src={item.backdropUrl}
                  alt={item.name}
                  referrerPolicy="no-referrer"
                  className="w-24 h-24 rounded-lg object-cover bg-slate-950 shrink-0 border border-slate-800 group-hover:border-purple-500/30"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-white truncate group-hover:text-purple-300 transition-colors">
                    {item.name}
                  </h4>
                  <div className="text-xs text-slate-400 mt-0.5 truncate">
                    {item.originalTitle || item.genres.join(', ')}
                  </div>

                  <div className="mt-2 text-[11px] space-y-1 text-slate-400">
                    <div>
                      <span className="text-slate-300 font-medium">Audio:</span> {item.audioStreams.map(a => a.language).join(', ')}
                    </div>
                    <div>
                      <span className="text-purple-400 font-medium">Subs:</span> {item.subtitleStreams.map(s => s.format.toUpperCase()).join(' · ')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
