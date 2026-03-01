import { useEffect, useState, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import ActivationBar from './components/ActivationBar';

function App() {
  const [isToolbarVisible, setIsToolbarVisible] = useState(false); // Start hidden
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Setup fullscreen overlay on mount
    const setupOverlay = async () => {
      try {
        await invoke('setup_fullscreen_overlay');
        console.log('Fullscreen overlay setup complete');
      } catch (error) {
        console.error('Failed to setup overlay:', error);
      }
    };

    // Listen for Alt+Space toggle event from backend
    const setupListener = async () => {
      const unlisten = await listen('toggle-toolbar', () => {
        setIsToolbarVisible(prev => {
          const newState = !prev;
          console.log(`Alt+Space: Toolbar ${newState ? 'shown' : 'hidden'}`);
          return newState;
        });
      });

      return unlisten;
    };

    setupOverlay();
    const unlistenPromise = setupListener();

    return () => {
      unlistenPromise.then(unlisten => unlisten());
    };
  }, []);

  // Sync click-through with toolbar visibility (SINGLE SOURCE OF TRUTH)
  useEffect(() => {
    const ignore = !isToolbarVisible;
    invoke('set_window_clickthrough', { ignore })
      .then(() => {
        console.log(
          `Toolbar: ${isToolbarVisible}, Click-through: ${ignore}`
        );
      })
      .catch(err => {
        console.error('Failed to set click-through:', err);
      });
  }, [isToolbarVisible]);

  const handleExtractText = () => {
    console.log('Extract Text clicked - entering selection mode');
    // Phase 2: Enter selection mode for OCR
    // Toolbar may minimize/hide to allow screen selection
  };

  const handleCaptureScreen = () => {
    console.log('Capture Screen clicked - entering selection mode');
    // Phase 2: Enter selection mode for screenshot
    // Toolbar may minimize/hide to allow screen selection
  };

  const handleOpenHub = () => {
    console.log('Open Hub clicked');
    // Phase 5: Open knowledge hub
  };

  // Empty-space click dismisses toolbar only (not chat/bubbles)
  const handleBackdropClick = () => {
    if (isToolbarVisible) {
      setIsToolbarVisible(false);
      console.log('Empty space clicked - toolbar hidden');
    }
  };

  // Prevent clicks on toolbar from dismissing it
  const handleToolbarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="app-container">
      {/* Backdrop - only visible when toolbar is shown, dismisses toolbar on click */}
      {isToolbarVisible && (
        <div className="toolbar-backdrop" onClick={handleBackdropClick} />
      )}

      {/* Toolbar (Activation Bar) - Modal command bar */}
      <div 
        ref={barRef}
        className={`toolbar-container ${isToolbarVisible ? 'visible' : 'hidden'}`}
        onClick={handleToolbarClick}
      >
        <ActivationBar
          onExtractText={handleExtractText}
          onCaptureScreen={handleCaptureScreen}
          onOpenHub={handleOpenHub}
        />
      </div>

      {/* Future: AI Chat Window - Layer 2 (non-modal, floating, draggable) */}
      {/* Future: Sticky Bubbles - Layer 3 (persistent, non-blocking) */}
    </div>
  );
}

export default App;
