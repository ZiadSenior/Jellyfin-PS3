import React, { useState } from 'react';
import { PS3FirmwareVersion, PS3SystemStatus, generatePs3PkgManifest } from '../utils/ps3Profile';

interface Ps3HenToolsModalProps {
  status: PS3SystemStatus;
  onUpdateStatus: (newStatus: Partial<PS3SystemStatus>) => void;
  onClose: () => void;
}

export const Ps3HenToolsModal: React.FC<Ps3HenToolsModalProps> = ({
  status,
  onUpdateStatus,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'firmware' | 'webman' | 'pkg'>('firmware');
  const [fanTarget, setFanTarget] = useState(status.fanSpeed);
  const [webmanIp, setWebmanIp] = useState(status.ipAddress);
  const [copiedPkg, setCopiedPkg] = useState(false);

  const manifest = generatePs3PkgManifest(window.location.origin, status.firmware);

  const handleCopyManifest = () => {
    navigator.clipboard.writeText(JSON.stringify(manifest, null, 2));
    setCopiedPkg(true);
    setTimeout(() => setCopiedPkg(false), 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="hen-tools-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
    >
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              <h2 id="hen-tools-title" className="text-lg font-bold text-white font-display">
                PS3 Custom Firmware &amp; HEN Tools
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Configuration engine for PS3 firmwares 4.89, 4.90, 4.91, 4.92 &amp; 4.93
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center border border-slate-800"
          >
            ✕
          </button>
        </div>

        {/* Tab Strip */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 px-6 gap-2 pt-2">
          <button
            onClick={() => setActiveTab('firmware')}
            className={`pb-3 text-xs font-semibold border-b-2 transition-colors px-3 ${
              activeTab === 'firmware'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Firmware Matrix (4.89 - 4.93)
          </button>
          <button
            onClick={() => setActiveTab('webman')}
            className={`pb-3 text-xs font-semibold border-b-2 transition-colors px-3 ${
              activeTab === 'webman'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            webMAN MOD &amp; Temps
          </button>
          <button
            onClick={() => setActiveTab('pkg')}
            className={`pb-3 text-xs font-semibold border-b-2 transition-colors px-3 ${
              activeTab === 'pkg'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            PKG &amp; XMB Installer
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto max-h-[65vh] space-y-6 text-sm">
          {activeTab === 'firmware' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-white uppercase tracking-wider mb-2">
                  Select Active Console Firmware
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {(['4.89', '4.90', '4.91', '4.92', '4.93'] as PS3FirmwareVersion[]).map((fw) => {
                    const isSelected = status.firmware === fw;
                    return (
                      <button
                        key={fw}
                        type="button"
                        onClick={() => onUpdateStatus({ firmware: fw })}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          isSelected
                            ? 'bg-cyan-500/10 border-cyan-500 text-cyan-300 shadow-md'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                        }`}
                      >
                        <div className="font-mono font-bold text-sm">FW {fw}</div>
                        <div className="text-[10px] mt-1 text-slate-400">
                          {fw === '4.93' ? 'Latest (2026)' : 'HFW / CFW'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Status card */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5 text-xs">
                <div className="text-white font-semibold">Active Firmware Profile Details:</div>
                <div className="grid grid-cols-2 gap-3 text-slate-300">
                  <div>
                    <span className="text-slate-500 block">HEN Payload Status:</span>
                    <span className="text-emerald-400 font-mono font-bold">Enabled &amp; Verified</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Hardware AVC Decoder:</span>
                    <span className="text-cyan-400 font-mono font-bold">H.264 High@L4.2 1080p</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Audio Passthrough:</span>
                    <span className="text-white font-mono">AC3 5.1 / DTS-HD / AAC</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Browser Engine:</span>
                    <span className="text-white font-mono">NetFront / WebKit Canvas</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'webman' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-semibold">PS3 Hardware Telemetry (webMAN MOD)</span>
                  <span className="text-cyan-400 font-mono">Port 80</span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="text-xs text-slate-400">Cell Broadband Engine</div>
                    <div className="text-xl font-bold font-mono text-cyan-400 mt-1">{status.cellTemp}°C</div>
                    <div className="text-[10px] text-emerald-400">Normal operating</div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="text-xs text-slate-400">RSX Reality Synthesizer</div>
                    <div className="text-xl font-bold font-mono text-cyan-400 mt-1">{status.rsxTemp}°C</div>
                    <div className="text-[10px] text-emerald-400">Optimal</div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="text-xs text-slate-400">Syscon Fan Speed</div>
                    <div className="text-xl font-bold font-mono text-amber-400 mt-1">{status.fanSpeed}%</div>
                    <div className="text-[10px] text-slate-400">Dynamic Control</div>
                  </div>
                </div>

                {/* Adjust Fan Speed */}
                <div className="pt-2">
                  <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                    <span>Manual Fan Speed Limit:</span>
                    <span className="font-mono text-cyan-400 font-bold">{fanTarget}%</span>
                  </div>
                  <input
                    type="range"
                    min={25}
                    max={80}
                    value={fanTarget}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setFanTarget(val);
                      onUpdateStatus({ fanSpeed: val });
                    }}
                    className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer accent-cyan-400"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pkg' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
                  PS3 XMB Install Instructions (HEN 4.89 - 4.93)
                </h4>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2 text-slate-300">
                  {manifest.instructions.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-cyan-400 font-mono font-bold">•</span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Package Manifest (PARAM.SFO)
                  </span>
                  <button
                    onClick={handleCopyManifest}
                    className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
                  >
                    {copiedPkg ? 'Copied!' : 'Copy Manifest JSON'}
                  </button>
                </div>
                <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-400 overflow-x-auto">
                  {JSON.stringify(manifest, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
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
