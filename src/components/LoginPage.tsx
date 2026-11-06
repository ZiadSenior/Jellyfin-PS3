import React, { useState } from 'react';
import { authenticateJellyfin } from '../utils/jellyfinApi';
import { JellyfinUser } from '../types/jellyfin';
import { triggerPkgDownload, CURRENT_RELEASE_METADATA } from '../utils/pkgGenerator';

interface LoginPageProps {
  onSuccess: (user: JellyfinUser) => void;
  onOpenReleases: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onSuccess,
  onOpenReleases
}) => {
  const [serverUrl, setServerUrl] = useState(() => {
    return localStorage.getItem('jellyfin_ps3_server') || 'http://192.168.1.100:8096';
  });
  const [username, setUsername] = useState(() => {
    return localStorage.getItem('jellyfin_ps3_user') || 'ps3user';
  });
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serverUrl) {
      setErrorMsg('Please specify your Jellyfin server address');
      return;
    }
    if (!username) {
      setErrorMsg('Please enter your username');
      return;
    }

    setErrorMsg('');
    setIsAuthenticating(true);

    try {
      const result = await authenticateJellyfin(serverUrl, username, password);
      setIsAuthenticating(false);

      if (result.success && result.user) {
        if (rememberMe) {
          localStorage.setItem('jellyfin_ps3_server', serverUrl);
          localStorage.setItem('jellyfin_ps3_user', username);
          localStorage.setItem('jellyfin_ps3_token', result.user.token);
        }
        onSuccess(result.user);
      } else {
        setErrorMsg(result.error || 'Failed to authenticate with server');
      }
    } catch (err: unknown) {
      setIsAuthenticating(false);
      setErrorMsg((err as Error).message || 'Connection failed');
    }
  };

  const handleDownloadPkg = () => {
    triggerPkgDownload(window.location.origin, `Jellyfin-PS3-v${CURRENT_RELEASE_METADATA.version}.pkg`);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden bg-[#080c14]">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 -left-40 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Card */}
      <div className="w-full max-w-lg bg-slate-900/80 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-xl p-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 mb-4 shadow-lg shadow-cyan-500/20">
            <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">
            Jellyfin for PlayStation 3
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Hardware 1080p AVC Streaming · Multi-Audio · SRT/PGS/ASS Subtitles
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3 rounded-lg bg-red-950/60 border border-red-800/80 text-xs text-red-200">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Server Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Server Address
            </label>
            <input
              type="text"
              value={serverUrl}
              onChange={(e) => setServerUrl(e.target.value)}
              placeholder="http://192.168.1.100:8096"
              className="w-full px-4 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-mono"
            />
          </div>

          {/* Credentials */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="User"
                className="w-full px-4 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-4 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-cyan-500 focus:ring-0"
              />
              <span>Remember credentials</span>
            </label>
            <span className="text-slate-500 font-mono">Port 8096</span>
          </div>

          {/* Primary Action Button */}
          <div className="pt-2 space-y-3">
            <button
              type="submit"
              disabled={isAuthenticating}
              className="w-full py-3 px-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-[0.99]"
            >
              {isAuthenticating ? (
                <span>Connecting to Jellyfin...</span>
              ) : (
                <>
                  <span className="w-4 h-4 rounded-full bg-slate-950 text-cyan-400 text-[10px] flex items-center justify-center font-bold">
                    ✕
                  </span>
                  <span>Sign In to Server</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* GitHub Releases & PKG download row */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 flex items-center justify-between gap-3 text-xs">
          <button
            type="button"
            onClick={onOpenReleases}
            className="text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1.5 transition-colors"
          >
            <span>GitHub Releases &amp; .PKG</span>
            <span className="font-mono text-[10px] text-slate-400">v{CURRENT_RELEASE_METADATA.version}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPkg}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-700 font-medium text-[11px] transition-colors flex items-center gap-1.5"
            title="Download PS3 .PKG installer directly"
          >
            <svg className="w-3.5 h-3.5 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>Download .PKG</span>
          </button>
        </div>

        {/* Feature footnote without pills */}
        <div className="mt-4 pt-3 border-t border-slate-800/40 text-[11px] text-slate-400 flex flex-wrap justify-between gap-y-1">
          <div>
            <span className="text-slate-300 font-semibold">Video:</span> H.264 High@L4.2 (1080p AVC)
          </div>
          <div>
            <span className="text-slate-300 font-semibold">Audio:</span> Multi-Track AC3 / AAC
          </div>
          <div>
            <span className="text-slate-300 font-semibold">Subs:</span> SRT · PGS · ASS on-the-fly
          </div>
        </div>
      </div>
    </div>
  );
};
