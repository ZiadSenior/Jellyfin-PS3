import React from 'react';
import { JellyfinUser } from '../types/jellyfin';
import { PS3SystemStatus } from '../utils/ps3Profile';

interface UserProfileModalProps {
  user: JellyfinUser;
  status: PS3SystemStatus;
  onLogout: () => void;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  user,
  status,
  onLogout,
  onClose
}) => {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="user-profile-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
    >
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-cyan-500/20 text-cyan-300 font-bold flex items-center justify-center border border-cyan-500/40 text-base">
              {user.avatarLetter}
            </div>
            <div>
              <h2 id="user-profile-title" className="text-base font-bold text-white">
                {user.name}
              </h2>
              <div className="text-xs text-slate-400 font-mono">
                {user.serverUrl}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {/* Console & Session Info */}
        <div className="space-y-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Target Firmware:</span>
              <span className="text-cyan-400 font-mono font-bold">PS3 HEN {status.firmware}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Stream Capability:</span>
              <span className="text-white font-mono">1080p AVC High@L4.2</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Audio Decoder:</span>
              <span className="text-white font-mono">AC3 5.1 / AAC Passthrough</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Subtitle Engines:</span>
              <span className="text-purple-400 font-mono">SRT · PGS · ASS on-the-fly</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            onClick={onLogout}
            className="px-4 py-2 bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-800/80 text-xs font-semibold rounded-lg transition-colors"
          >
            Disconnect Server
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
