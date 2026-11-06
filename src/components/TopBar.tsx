import React from 'react';
import { PS3SystemStatus } from '../utils/ps3Profile';

interface TopBarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  status: PS3SystemStatus;
  userName: string;
  onOpenProfile: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentTab,
  onSelectTab,
  status,
  userName,
  onOpenProfile
}) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-[#080c14]/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
        {/* Zone 1: Brand title wordmark, single text element */}
        <button
          onClick={() => onSelectTab('home')}
          className="text-lg sm:text-xl font-bold tracking-tight text-white hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-2"
        >
          <span className="w-2.5 h-2.5 rounded-sm bg-gradient-to-tr from-cyan-500 to-indigo-500" />
          <span>Jellyfin PS3</span>
        </button>

        {/* Zone 2: 4-5 clean single-line nav links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            onClick={() => onSelectTab('home')}
            className={`whitespace-nowrap shrink-0 transition-colors ${
              currentTab === 'home' ? 'text-cyan-400 font-semibold' : 'hover:text-white'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => onSelectTab('movies')}
            className={`whitespace-nowrap shrink-0 transition-colors ${
              currentTab === 'movies' ? 'text-cyan-400 font-semibold' : 'hover:text-white'
            }`}
          >
            Movies
          </button>
          <button
            onClick={() => onSelectTab('tv')}
            className={`whitespace-nowrap shrink-0 transition-colors ${
              currentTab === 'tv' ? 'text-cyan-400 font-semibold' : 'hover:text-white'
            }`}
          >
            TV Shows
          </button>
          <button
            onClick={() => onSelectTab('anime')}
            className={`whitespace-nowrap shrink-0 transition-colors ${
              currentTab === 'anime' ? 'text-cyan-400 font-semibold' : 'hover:text-white'
            }`}
          >
            Anime
          </button>
          <button
            onClick={() => onSelectTab('subtitles')}
            className={`whitespace-nowrap shrink-0 transition-colors ${
              currentTab === 'subtitles' ? 'text-cyan-400 font-semibold' : 'hover:text-white'
            }`}
          >
            Subtitles &amp; Audio
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenProfile}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700/80 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-2"
            title="User Profile & Server Settings"
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="max-w-[120px] truncate">{userName}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
