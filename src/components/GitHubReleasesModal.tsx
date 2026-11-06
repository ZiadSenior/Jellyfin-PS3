import React, { useState } from 'react';
import { CURRENT_RELEASE_METADATA, triggerPkgDownload } from '../utils/pkgGenerator';

interface GitHubReleasesModalProps {
  onClose: () => void;
}

export const GitHubReleasesModal: React.FC<GitHubReleasesModalProps> = ({ onClose }) => {
  const [copiedSha, setCopiedSha] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = () => {
    setIsDownloading(true);
    triggerPkgDownload(window.location.origin, `Jellyfin-PS3-v${CURRENT_RELEASE_METADATA.version}.pkg`);
    setTimeout(() => setIsDownloading(false), 1500);
  };

  const handleCopySha = () => {
    navigator.clipboard.writeText(CURRENT_RELEASE_METADATA.sha256);
    setCopiedSha(true);
    setTimeout(() => setCopiedSha(false), 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="releases-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto"
    >
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-white">
              {/* GitHub Octocat Icon */}
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="releases-title" className="text-lg font-bold text-white font-display">
                  GitHub Releases &amp; PS3 Package (.PKG)
                </h2>
                <span className="text-xs font-mono text-cyan-400 font-bold">
                  v{CURRENT_RELEASE_METADATA.version}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Official release artifact ready for deployment on CFW &amp; PS3HEN 4.89–4.93
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center border border-slate-800"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm flex-1 text-slate-300">
          {/* Download Hero Box */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950/40 border border-cyan-500/30 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-white font-bold text-base flex items-center gap-2">
                <span>Jellyfin-PS3-v{CURRENT_RELEASE_METADATA.version}.pkg</span>
                <span className="text-[11px] text-emerald-400 font-mono">Retail/HEN Unsigned</span>
              </div>
              <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-2">
                <span>Size: {CURRENT_RELEASE_METADATA.fileSizeMb} MB</span>
                <span aria-hidden="true">·</span>
                <span>TitleID: {CURRENT_RELEASE_METADATA.titleId}</span>
                <span aria-hidden="true">·</span>
                <span>Firmware: 4.89 – 4.93 HEN</span>
              </div>
            </div>

            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs sm:text-sm rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-95"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>{isDownloading ? 'Generating PKG...' : 'Download .PKG File'}</span>
            </button>
          </div>

          {/* SHA-256 Checksum */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs flex items-center justify-between gap-2">
            <div className="min-w-0">
              <span className="text-slate-500 block text-[10px] uppercase font-mono">SHA-256 Checksum:</span>
              <span className="font-mono text-slate-300 truncate block text-[11px]">
                {CURRENT_RELEASE_METADATA.sha256}
              </span>
            </div>
            <button
              onClick={handleCopySha}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded text-xs shrink-0 font-medium transition-colors"
            >
              {copiedSha ? 'Copied' : 'Copy Hash'}
            </button>
          </div>

          {/* Changelog & Feature Matrix */}
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2.5">
              Release v{CURRENT_RELEASE_METADATA.version} Highlights
            </h3>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">✓</span>
                <span><strong>1080p AVC Direct Play:</strong> Native H.264 High Profile Level 4.2 decoding powered by the PS3 Cell Broadband Engine &amp; RSX reality synthesizer.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">✓</span>
                <span><strong>On-The-Fly ASS Subtitle Stripper:</strong> Sanitizes complex Advanced SubStation Alpha dialogue tags in real time into clean text, eliminating CPU libass bottlenecks.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">✓</span>
                <span><strong>SRT &amp; PGS Subtitles:</strong> Native SubRip text cues and Blu-ray/MKV Presentation Graphic Stream bitmap overlays.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">✓</span>
                <span><strong>Multi-Track Audio Switching:</strong> Real-time selection of Dolby Digital 5.1 AC3 passthrough, stereo AAC, and audio commentaries.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">✓</span>
                <span><strong>DualShock 3 Navigation:</strong> Full controller mapping via standard Gamepad API with XMB On-Screen Display.</span>
              </li>
            </ul>
          </div>

          {/* Installation Instructions */}
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2.5">
              PS3 Installation Guide (HEN 4.89 – 4.93)
            </h3>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs text-slate-300 font-sans">
              <p>1. Download <code>Jellyfin-PS3-v{CURRENT_RELEASE_METADATA.version}.pkg</code> using the button above.</p>
              <p>2. Copy the <code>.pkg</code> file to the root of a FAT32-formatted USB flash drive.</p>
              <p>3. Insert the USB drive into your PS3 (right-most port closest to the Blu-ray drive).</p>
              <p>4. Enable PS3HEN from the XMB (or boot into CFW Evilnat 4.89–4.93).</p>
              <p>5. Navigate to <strong>Game → Package Manager → Install Package Files → Standard</strong>.</p>
              <p>6. Press <strong className="text-cyan-300">✕ (Cross)</strong> on <code>Jellyfin-PS3-v{CURRENT_RELEASE_METADATA.version}.pkg</code> to install.</p>
              <p>7. The client will appear in your <strong>TV/Video Services</strong> or <strong>Game</strong> column on the XMB!</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-400">
            Open Source under Apache 2.0 License
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
