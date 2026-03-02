import { useEffect, useState, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { getCurrentWindow } from '@tauri-apps/api/window';
import ActivationBar from './components/ActivationBar';
import SelectionOverlay from './components/SelectionOverlay';

type AppMode = 'idle' | 'toolbar' | 'selecting' | 'overlay';

function App() {
  const [mode, setMode] = useState<AppMode>('idle');
  const [capturedImage, setCapturedImage] = useState<string>('');
  const [isCapturing, setIsCapturing] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
  console.log("Current mode:", mode);
}, [mode]);

  // Enforce resize lock at runtime
  useEffect(() => {
    const appWindow = getCurrentWindow();
    appWindow.setResizable(false).catch(err => console.error('Failed to set resizable:', err));
    appWindow.setMaximizable(false).catch(err => console.error('Failed to set maximizable:', err));
    appWindow.setMinimizable(false).catch(err => console.error('Failed to set minimizable:', err));
    console.log('Window resize lock enforced');
  }, []);

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
        setMode(prev => {
          // Alt+Space behavior based on current mode
          if (prev === 'toolbar') {
            console.log('Alt+Space: toolbar → idle');
            return 'idle';
          } else if (prev === 'idle') {
            console.log('Alt+Space: idle → toolbar');
            return 'toolbar';
          } else if (prev === 'overlay') {
            console.log('Alt+Space: overlay → idle');
            return 'idle';
          } else {
            // selecting → idle (cancel selection)
            console.log('Alt+Space: selecting → idle');
            return 'idle';
          }
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

  // CRITICAL: Single click-through synchronization
  useEffect(() => {
    const interactive = (mode === 'toolbar' || mode === 'selecting' || mode === 'overlay');
    const ignore = !interactive;
    
    invoke('set_window_clickthrough', { ignore })
      .then(() => {
        console.log(`Mode: ${mode}, Interactive: ${interactive}, Click-through: ${ignore}`);
      })
      .catch(err => {
        console.error('Failed to set click-through:', err);
      });
  }, [mode]);

  const handleExtractText = () => {
    console.log('Extract Text clicked - entering selection mode');
    setMode('selecting');
  };

  const handleCaptureScreen = () => {
    console.log('Capture Screen clicked - entering selection mode');
    setMode('selecting');
  };

  const handleOpenHub = () => {
    console.log('Open Hub clicked');
    // Phase 5: Open knowledge hub
  };

  const handleExit = async () => {
    console.log('Exit clicked - closing application');
    try {
      await invoke('exit_app');
    } catch (error) {
      console.error('Failed to exit application:', error);
    }
  };

  // Phase 2: Handle selection complete - capture screen region
  const handleSelectionComplete = async (rect: { x: number; y: number; width: number; height: number }) => {
    console.log('Selection complete (CSS pixels):', rect);
    
    // Convert CSS pixels to physical pixels for DPI scaling
    const dpr = window.devicePixelRatio || 1;
    const physicalRect = {
      x: Math.round(rect.x * dpr),
      y: Math.round(rect.y * dpr),
      width: Math.round(rect.width * dpr),
      height: Math.round(rect.height * dpr),
    };
    
    console.log(`DPR: ${dpr}, Physical pixels:`, physicalRect);
    
    setIsCapturing(true);
    
    try {
      const base64Image = await invoke<string>('capture_region', {
        x: physicalRect.x,
        y: physicalRect.y,
        width: physicalRect.width,
        height: physicalRect.height,
      });
      
      console.log('Screenshot captured successfully (base64 length):', base64Image.length);
      setCapturedImage(base64Image);
      setMode('overlay');
      
    } catch (error) {
      console.error('Failed to capture region:', error);
      setMode('idle');
    } finally {
      setIsCapturing(false);
    }
  };

  // Phase 2: Handle selection cancel
  const handleSelectionCancel = () => {
    console.log('Selection canceled');
    setMode('idle');
  };

  // Handle overlay close
  const handleOverlayClose = () => {
    console.log('Overlay closed');
    setCapturedImage('');
    setMode('idle');
  };

  // Empty-space click dismisses toolbar only (not chat/bubbles)
  const handleBackdropClick = () => {
    if (mode === 'toolbar') {
      setMode('idle');
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
      {mode === 'toolbar' && (
        <div className="toolbar-backdrop" onClick={handleBackdropClick} />
      )}

      {/* Phase 2: Selection Overlay - Modal screen selection */}
      {mode === 'selecting' && (
        <SelectionOverlay
          onComplete={handleSelectionComplete}
          onCancel={handleSelectionCancel}
          isCapturing={isCapturing}
        />
      )}

      {/* Phase 2: Image Overlay - Display captured image */}
      {mode === 'overlay' && capturedImage && (
        <div className="image-overlay">
          <div className="image-overlay-content">
            <div className="image-overlay-header">
              <span className="extraction-badge">Extraction Method: Screen Capture</span>
              <button className="close-button" onClick={handleOverlayClose}>
                ✕
              </button>
            </div>
            <div className="image-container">
              <img 
                src={`data:image/png;base64,${capturedImage}`} 
                alt="Captured screen region"
                className="captured-image"
              />
            </div>
          </div>
        </div>
      )}

      {/* Toolbar (Activation Bar) - Modal command bar */}
      <div 
        ref={barRef}
        className={`toolbar-container ${mode === 'toolbar' ? 'visible' : 'hidden'}`}
        onClick={handleToolbarClick}
      >
        <ActivationBar
          onExtractText={handleExtractText}
          onCaptureScreen={handleCaptureScreen}
          onOpenHub={handleOpenHub}
          onExit={handleExit}
        />
      </div>

      {/* Future: AI Chat Window - Layer 2 (non-modal, floating, draggable) */}
      {/* Future: Sticky Bubbles - Layer 3 (persistent, non-blocking) */}
    </div>
  );
}

export default App;
