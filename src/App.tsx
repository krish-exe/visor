import { useEffect, useState, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { getCurrentWindow } from '@tauri-apps/api/window';

import ActivationBar from './components/ActivationBar';
import SelectionOverlay from './components/SelectionOverlay';
import ChatWindowStandalone from './components/ChatWindowStandalone';

export default function App() {
  const params = new URLSearchParams(window.location.search);
  const windowType = params.get('type');
  const chatId = params.get('id');

  // ROUTING: If URL has ?type=chat, render only the standalone chat UI
  if (windowType === 'chat' && chatId) {
    const storedImage = localStorage.getItem(`image_${chatId}`);
    return <ChatWindowStandalone chatId={chatId} initialImage={storedImage} />;
  }

  // DEFAULT: Render the Overlay/Toolbar app
  return <OverlayApp />;
}

function OverlayApp() {
  const [mode, setMode] = useState<'idle' | 'toolbar' | 'selecting'>('idle');
  const [isCapturing, setIsCapturing] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const win = getCurrentWindow();
    win.setResizable(false);
    win.setMaximizable(false);
  }, []);

  useEffect(() => {
    const setupListener = async () => {
      const unlisten = await listen('toggle-toolbar', () => {
        setMode(prev => (prev === 'toolbar' ? 'idle' : 'toolbar'));
      });
      return unlisten;
    };
    const promise = setupListener();
    return () => { promise.then(u => u()); };
  }, []);

  useEffect(() => {
    const interactive = mode === 'toolbar' || mode === 'selecting';
    invoke('set_window_clickthrough', { ignore: !interactive });
  }, [mode]);

  const handleSelectionComplete = async (rect: any) => {
    const dpr = window.devicePixelRatio || 1;
    const physicalRect = {
      x: Math.round(rect.x * dpr),
      y: Math.round(rect.y * dpr),
      width: Math.round(rect.width * dpr),
      height: Math.round(rect.height * dpr)
    };

    setIsCapturing(true);

    try {
      // 1. Capture the image
      const base64Image = await invoke<string>('capture_region', physicalRect);
      
      // 2. Generate unique session ID
      const chatId = Date.now().toString();

      // 3. Store image context locally for the new window to pick up
      localStorage.setItem(`image_${chatId}`, base64Image);

      setMode('idle');
      
      // 4. Trigger Rust to open a new window
      await invoke('create_chat_window', { chatId, imageBase64: base64Image });

    } catch (err) {
      console.error("Capture Failed:", err);
      setMode('idle');
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <div className="app-container" style={{ pointerEvents: 'none' }}>
      {mode === 'toolbar' && (
        <div className="toolbar-backdrop" onClick={() => setMode('idle')} style={{ pointerEvents: 'auto' }} />
      )}
      {mode === 'selecting' && (
        <div style={{ pointerEvents: 'auto' }}>
          <SelectionOverlay
            onComplete={handleSelectionComplete}
            onCancel={() => setMode('idle')}
            isCapturing={isCapturing}
          />
        </div>
      )}
      <div
        ref={barRef}
        className={`toolbar-container ${mode === 'toolbar' ? 'visible' : 'hidden'}`}
        style={{ pointerEvents: 'auto' }}
      >
        <ActivationBar
          onExtractText={() => setMode('selecting')}
          onCaptureScreen={() => setMode('selecting')}
          onOpenHub={() => {}}
          onExit={() => invoke('exit_app')}
        />
      </div>
    </div>
  );
}