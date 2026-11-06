import React from 'react';
import { DS3Button } from '../hooks/useDualShock3';

interface DualShockPromptBarProps {
  activeButton: DS3Button | null;
  onButtonSimulate: (btn: DS3Button) => void;
  isGamepadConnected: boolean;
  controllerName: string;
}

export const DualShockPromptBar: React.FC<DualShockPromptBarProps> = ({
  activeButton,
  onButtonSimulate,
  isGamepadConnected,
  controllerName
}) => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 bg-[#090d16]/95 backdrop-blur-md border-t border-slate-800/80 px-4 py-2 text-xs text-slate-300">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Button Prompts */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <button
            onClick={() => onButtonSimulate('CROSS')}
            className={`flex items-center gap-1.5 transition-transform ${
              activeButton === 'CROSS' ? 'scale-110 text-cyan-400 font-bold' : 'hover:text-white'
            }`}
            title="Press Enter or Cross button"
          >
            <span className="w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-500/60 text-cyan-300 font-mono flex items-center justify-center text-[11px] font-bold shadow-[0_0_8px_rgba(0,164,220,0.3)]">
              ✕
            </span>
            <span>Select / Play</span>
          </button>

          <button
            onClick={() => onButtonSimulate('CIRCLE')}
            className={`flex items-center gap-1.5 transition-transform ${
              activeButton === 'CIRCLE' ? 'scale-110 text-red-400 font-bold' : 'hover:text-white'
            }`}
            title="Press Escape or Circle button"
          >
            <span className="w-5 h-5 rounded-full bg-red-500/20 border border-red-500/60 text-red-300 font-mono flex items-center justify-center text-[11px] font-bold">
              ○
            </span>
            <span>Back</span>
          </button>

          <button
            onClick={() => onButtonSimulate('SQUARE')}
            className={`flex items-center gap-1.5 transition-transform ${
              activeButton === 'SQUARE' ? 'scale-110 text-pink-400 font-bold' : 'hover:text-white'
            }`}
            title="Press X key or Square button"
          >
            <span className="w-5 h-5 rounded-full bg-pink-500/20 border border-pink-500/60 text-pink-300 font-mono flex items-center justify-center text-[11px] font-bold">
              □
            </span>
            <span>Audio & Subtitles</span>
          </button>

          <button
            onClick={() => onButtonSimulate('TRIANGLE')}
            className={`flex items-center gap-1.5 transition-transform ${
              activeButton === 'TRIANGLE' ? 'scale-110 text-emerald-400 font-bold' : 'hover:text-white'
            }`}
            title="Press Y/T key or Triangle button"
          >
            <span className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/60 text-emerald-300 font-mono flex items-center justify-center text-[11px] font-bold">
              △
            </span>
            <span>Options / Menu</span>
          </button>

          <button
            onClick={() => onButtonSimulate('START')}
            className={`hidden md:flex items-center gap-1.5 transition-transform ${
              activeButton === 'START' ? 'scale-110 text-amber-400 font-bold' : 'hover:text-white'
            }`}
            title="Press Space or Start"
          >
            <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[10px] text-slate-300">
              START
            </span>
            <span>Play/Pause</span>
          </button>
        </div>

        {/* Right: Controller & PS3 Status */}
        <div className="flex items-center gap-3 text-slate-400 text-[11px]">
          <span className="hidden sm:inline">
            {isGamepadConnected ? (
              <span className="text-cyan-400 font-medium">DualShock 3 Active</span>
            ) : (
              <span>Keyboard & Gamepad Ready</span>
            )}
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">PS3 HEN 4.89-4.93</span>
        </div>
      </div>
    </footer>
  );
};
