/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { MediaItem, JellyfinUser } from './types/jellyfin';
import { MOCK_LIBRARIES, MOCK_MEDIA_ITEMS } from './data/mockJellyfin';
import { PS3SystemStatus, createDefaultPs3Status } from './utils/ps3Profile';
import { useDualShock3, DS3Button } from './hooks/useDualShock3';
import { fetchUserLibraries, fetchMediaItems } from './utils/jellyfinApi';

import { TopBar } from './components/TopBar';
import { LoginPage } from './components/LoginPage';
import { HomeDashboard } from './components/HomeDashboard';
import { MediaDetailModal } from './components/MediaDetailModal';
import { VideoPlayerView } from './components/VideoPlayerView';
import { GitHubReleasesModal } from './components/GitHubReleasesModal';
import { UserProfileModal } from './components/UserProfileModal';
import { SubtitlesAudioHub } from './components/SubtitlesAudioHub';
import { DualShockPromptBar } from './components/DualShockPromptBar';

export default function App() {
  const searchParams = new URLSearchParams(window.location.search);
  const autostart = searchParams.get('autostart') === '1';

  // Load saved session or initialize
  const [user, setUser] = useState<JellyfinUser | null>(() => {
    const savedServer = localStorage.getItem('jellyfin_ps3_server');
    const savedUser = localStorage.getItem('jellyfin_ps3_user');
    const savedToken = localStorage.getItem('jellyfin_ps3_token');

    if (savedServer && savedUser && savedToken) {
      return {
        id: 'u-saved',
        name: savedUser,
        serverUrl: savedServer,
        token: savedToken,
        avatarLetter: savedUser.charAt(0).toUpperCase()
      };
    }
    if (autostart) {
      return {
        id: 'u-ps3-01',
        name: 'PS3 Media User',
        serverUrl: 'http://192.168.1.100:8096',
        token: 'jellyfin-token-ps3',
        avatarLetter: 'P'
      };
    }
    return null;
  });

  const [currentTab, setCurrentTab] = useState<string>('home');
  const [ps3Status, setPs3Status] = useState<PS3SystemStatus>(createDefaultPs3Status('4.93'));
  const [libraries, setLibraries] = useState(MOCK_LIBRARIES);
  const [mediaItems, setMediaItems] = useState(MOCK_MEDIA_ITEMS);

  // Modals
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [playingItem, setPlayingItem] = useState<{
    item: MediaItem;
    audioIdx: number;
    subIdx: number;
  } | null>(null);

  const [showReleasesModal, setShowReleasesModal] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // Controller navigation item index
  const [focusedItemIdx, setFocusedItemIdx] = useState(0);

  // Fetch libraries and media on authenticated session
  useEffect(() => {
    if (!user) return;
    let isMounted = true;

    async function loadData() {
      try {
        const libs = await fetchUserLibraries(user!);
        const items = await fetchMediaItems(user!);
        if (isMounted) {
          if (libs && libs.length > 0) setLibraries(libs);
          if (items && items.length > 0) setMediaItems(items);
        }
      } catch {
        // Keeps seeded media items
      }
    }

    loadData();
    return () => { isMounted = false; };
  }, [user]);

  // DualShock 3 button controller handler
  const handleDualShockButton = (button: DS3Button) => {
    if (playingItem) return;

    if (button === 'CIRCLE') {
      if (selectedItem) {
        setSelectedItem(null);
      } else if (showReleasesModal) {
        setShowReleasesModal(false);
      } else if (showProfile) {
        setShowProfile(false);
      }
      return;
    }

    if (button === 'TRIANGLE') {
      setShowReleasesModal(prev => !prev);
      return;
    }

    if (button === 'SQUARE') {
      setCurrentTab('subtitles');
      return;
    }

    if (button === 'L1') {
      const tabs = ['home', 'movies', 'tv', 'subtitles'];
      const curIdx = tabs.indexOf(currentTab);
      const nextIdx = (curIdx - 1 + tabs.length) % tabs.length;
      setCurrentTab(tabs[nextIdx]);
      return;
    }

    if (button === 'R1') {
      const tabs = ['home', 'movies', 'tv', 'subtitles'];
      const curIdx = tabs.indexOf(currentTab);
      const nextIdx = (curIdx + 1) % tabs.length;
      setCurrentTab(tabs[nextIdx]);
      return;
    }

    if (button === 'LEFT') {
      setFocusedItemIdx(prev => Math.max(0, prev - 1));
    } else if (button === 'RIGHT') {
      setFocusedItemIdx(prev => Math.min(mediaItems.length - 1, prev + 1));
    } else if (button === 'CROSS') {
      if (!selectedItem && !showReleasesModal && !showProfile) {
        const item = mediaItems[focusedItemIdx];
        if (item) {
          setSelectedItem(item);
        }
      }
    }
  };

  const { isConnected, controllerName, activeButton, triggerButton } = useDualShock3({
    onButtonPress: handleDualShockButton,
    enabled: true
  });

  const handleLoginSuccess = (authenticatedUser: JellyfinUser) => {
    setUser(authenticatedUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('jellyfin_ps3_server');
    localStorage.removeItem('jellyfin_ps3_user');
    localStorage.removeItem('jellyfin_ps3_token');
    setUser(null);
    setShowProfile(false);
    setSelectedItem(null);
    setPlayingItem(null);
  };

  const handlePlayDirect = (item: MediaItem, audioIdx?: number, subIdx?: number) => {
    const aIdx = audioIdx !== undefined ? audioIdx : (item.audioStreams[0]?.index ?? 0);
    const sIdx = subIdx !== undefined ? subIdx : (item.subtitleStreams[0]?.index ?? -1);
    setPlayingItem({ item, audioIdx: aIdx, subIdx: sIdx });
    setSelectedItem(null);
  };

  // If user is not authenticated, render production login screen
  if (!user) {
    return (
      <main className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col justify-between">
        <LoginPage
          onSuccess={handleLoginSuccess}
          onOpenReleases={() => setShowReleasesModal(true)}
        />
        <DualShockPromptBar
          activeButton={activeButton}
          onButtonSimulate={triggerButton}
          isGamepadConnected={isConnected}
          controllerName={controllerName}
        />
        {showReleasesModal && (
          <GitHubReleasesModal onClose={() => setShowReleasesModal(false)} />
        )}
      </main>
    );
  }

  // Filter items for Movies or TV tabs
  const displayedItems =
    currentTab === 'movies'
      ? mediaItems.filter(i => i.type === 'Movie')
      : currentTab === 'tv'
      ? mediaItems.filter(i => i.type === 'Series')
      : mediaItems;

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col justify-between selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Bar Navigation conforming to 3-zone contract */}
      <TopBar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        status={ps3Status}
        userName={user.name}
        onOpenProfile={() => setShowProfile(true)}
        onOpenReleases={() => setShowReleasesModal(true)}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6 pb-20">
        {currentTab === 'subtitles' ? (
          <SubtitlesAudioHub
            items={mediaItems}
            onPlayItem={(item, audioIdx, subIdx) => handlePlayDirect(item, audioIdx, subIdx)}
          />
        ) : (
          <HomeDashboard
            libraries={libraries}
            items={displayedItems}
            onSelectItem={(item) => setSelectedItem(item)}
            onPlayItem={(item) => handlePlayDirect(item)}
            selectedItemId={mediaItems[focusedItemIdx]?.id || null}
          />
        )}
      </main>

      {/* Controller Prompt Bar */}
      <DualShockPromptBar
        activeButton={activeButton}
        onButtonSimulate={triggerButton}
        isGamepadConnected={isConnected}
        controllerName={controllerName}
      />

      {/* Media Detail Modal */}
      {selectedItem && (
        <MediaDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onPlay={(item, audioIdx, subIdx) => handlePlayDirect(item, audioIdx, subIdx)}
        />
      )}

      {/* Fullscreen 1080p Video Player View */}
      {playingItem && (
        <VideoPlayerView
          item={playingItem.item}
          initialAudioIdx={playingItem.audioIdx}
          initialSubIdx={playingItem.subIdx}
          status={ps3Status}
          onClose={() => setPlayingItem(null)}
          activeButton={activeButton}
        />
      )}

      {/* GitHub Releases & PKG Installer Modal */}
      {showReleasesModal && (
        <GitHubReleasesModal onClose={() => setShowReleasesModal(false)} />
      )}

      {/* User Profile / Server Modal */}
      {showProfile && (
        <UserProfileModal
          user={user}
          status={ps3Status}
          onLogout={handleLogout}
          onClose={() => setShowProfile(false)}
        />
      )}
    </div>
  );
}
