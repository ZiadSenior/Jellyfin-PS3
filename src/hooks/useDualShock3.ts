import { useEffect, useState, useCallback, useRef } from 'react';

export type DS3Button =
  | 'CROSS'     // X (Button 0) - Confirm / Select / Play
  | 'CIRCLE'    // O (Button 1) - Back / Cancel
  | 'SQUARE'    // [] (Button 2) - Subtitles / Menu
  | 'TRIANGLE'  // /\ (Button 3) - Options / Search
  | 'L1'        // Button 4 - Tab Left / Rewind 10s
  | 'R1'        // Button 5 - Tab Right / Skip 30s
  | 'L2'        // Button 6 - Rewind
  | 'R2'        // Button 7 - Fast Forward
  | 'SELECT'    // Button 8 - Stats for nerds / HUD
  | 'START'     // Button 9 - Play/Pause
  | 'UP'        // Button 12 or D-pad Up
  | 'DOWN'      // Button 13 or D-pad Down
  | 'LEFT'      // Button 14 or D-pad Left
  | 'RIGHT';    // Button 15 or D-pad Right

export interface UseDualShock3Options {
  onButtonPress?: (button: DS3Button) => void;
  enabled?: boolean;
}

export function useDualShock3(options: UseDualShock3Options = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [controllerName, setControllerName] = useState<string>('DualShock 3 (Simulated / Keyboard Active)');
  const [activeButton, setActiveButton] = useState<DS3Button | null>(null);

  const prevButtonsRef = useRef<Record<string, boolean>>({});
  const lastPressTimeRef = useRef<number>(0);
  const callbackRef = useRef(options.onButtonPress);
  callbackRef.current = options.onButtonPress;

  const triggerButton = useCallback((button: DS3Button) => {
    setActiveButton(button);
    if (callbackRef.current) {
      callbackRef.current(button);
    }
    setTimeout(() => {
      setActiveButton(prev => (prev === button ? null : prev));
    }, 180);
  }, []);

  // Keyboard mapping fallback for DualShock 3
  useEffect(() => {
    if (options.enabled === false) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when user is typing in standard text inputs unless Enter/Esc
      const target = e.target as HTMLElement;
      const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA');

      if (isInput) {
        if (e.key === 'Enter') {
          // let normal input submit or trigger cross
        } else if (e.key === 'Escape') {
          triggerButton('CIRCLE');
          target.blur();
        }
        return;
      }

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          triggerButton('UP');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          triggerButton('DOWN');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          triggerButton('LEFT');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          triggerButton('RIGHT');
          break;
        case 'Enter':
          e.preventDefault();
          triggerButton('CROSS');
          break;
        case 'Escape':
        case 'Backspace':
          e.preventDefault();
          triggerButton('CIRCLE');
          break;
        case 'x':
        case 'X':
          e.preventDefault();
          triggerButton('SQUARE');
          break;
        case 'y':
        case 'Y':
        case 't':
        case 'T':
          e.preventDefault();
          triggerButton('TRIANGLE');
          break;
        case ' ':
          e.preventDefault();
          triggerButton('START');
          break;
        case 'Tab':
        case 'i':
        case 'I':
          e.preventDefault();
          triggerButton('SELECT');
          break;
        case 'q':
        case 'Q':
        case '[':
          e.preventDefault();
          triggerButton('L1');
          break;
        case 'e':
        case 'E':
        case ']':
          e.preventDefault();
          triggerButton('R1');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [triggerButton, options.enabled]);

  // Real Gamepad API polling loop
  useEffect(() => {
    let animId: number;

    const checkGamepad = () => {
      const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
      let foundActive = false;

      for (let i = 0; i < gamepads.length; i++) {
        const gp = gamepads[i];
        if (!gp) continue;
        foundActive = true;
        setIsConnected(true);
        if (gp.id) setControllerName(gp.id);

        const now = Date.now();
        const debounceMs = 160;

        const checkBtn = (btnIndex: number, name: DS3Button) => {
          const pressed = gp.buttons[btnIndex]?.pressed || gp.buttons[btnIndex]?.value > 0.5;
          const wasPressed = prevButtonsRef.current[name] || false;

          if (pressed && !wasPressed && now - lastPressTimeRef.current > debounceMs) {
            lastPressTimeRef.current = now;
            triggerButton(name);
          }
          prevButtonsRef.current[name] = pressed;
        };

        // Standard W3C Gamepad Mapping for PS3 / PS4 / Generic controllers:
        checkBtn(0, 'CROSS');    // X / A
        checkBtn(1, 'CIRCLE');   // O / B
        checkBtn(2, 'SQUARE');   // Square / X
        checkBtn(3, 'TRIANGLE'); // Triangle / Y
        checkBtn(4, 'L1');
        checkBtn(5, 'R1');
        checkBtn(6, 'L2');
        checkBtn(7, 'R2');
        checkBtn(8, 'SELECT');   // Share / Select
        checkBtn(9, 'START');    // Options / Start
        checkBtn(12, 'UP');      // D-Pad Up
        checkBtn(13, 'DOWN');    // D-Pad Down
        checkBtn(14, 'LEFT');    // D-Pad Left
        checkBtn(15, 'RIGHT');   // D-Pad Right

        // Also check left analog stick deadzone > 0.55
        const axisX = gp.axes[0] || 0;
        const axisY = gp.axes[1] || 0;
        if (axisX > 0.55 && now - lastPressTimeRef.current > debounceMs) {
          lastPressTimeRef.current = now;
          triggerButton('RIGHT');
        } else if (axisX < -0.55 && now - lastPressTimeRef.current > debounceMs) {
          lastPressTimeRef.current = now;
          triggerButton('LEFT');
        } else if (axisY > 0.55 && now - lastPressTimeRef.current > debounceMs) {
          lastPressTimeRef.current = now;
          triggerButton('DOWN');
        } else if (axisY < -0.55 && now - lastPressTimeRef.current > debounceMs) {
          lastPressTimeRef.current = now;
          triggerButton('UP');
        }
      }

      if (!foundActive) {
        setIsConnected(false);
      }

      animId = requestAnimationFrame(checkGamepad);
    };

    animId = requestAnimationFrame(checkGamepad);
    return () => cancelAnimationFrame(animId);
  }, [triggerButton]);

  return {
    isConnected,
    controllerName,
    activeButton,
    triggerButton
  };
}
