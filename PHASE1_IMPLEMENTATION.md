# Phase 1: Activation Bar Foundation

## Overview
Phase 1 establishes the minimal MVP foundation for Scryer - a small floating Activation Bar window.

## What's Implemented

### 1. Tauri Window Configuration
- Small centered floating window (450x70px)
- Always-on-top behavior
- No decorations
- Fully interactive (no click-through)
- Solid background (not transparent)

### 2. Activation Bar UI
- Clean modern bar with solid readable background
- Three action buttons:
  - Extract Text (placeholder for Phase 2)
  - Capture Screen (placeholder for Phase 2)
  - Open Hub (placeholder for Phase 5)
- Gradient background (slate-800 to slate-900)
- Rounded corners with shadow

### 3. Global Shortcut
- Alt+Space toggles window visibility
- Singleton behavior (only one window)
- Reliable show/hide toggle
- No duplicate windows

### 4. Window Behavior
- Opens centered on screen
- Remains above other applications
- Fully clickable everywhere
- Can be dragged (via window manager)

## What's NOT Implemented (Future Phases)
- ❌ Fullscreen overlay
- ❌ Click-through behavior
- ❌ Proximity/hover reveal
- ❌ Edge anchoring
- ❌ Glass blur effects
- ❌ AI integration
- ❌ Screen capture logic
- ❌ Text extraction
- ❌ Context menus
- ❌ Overlay interface

## Running the Application

```bash
# Development mode
npm run tauri dev

# Build for production
npm run tauri build
```

## Testing Phase 1

1. Launch the application
2. Verify the Activation Bar appears centered
3. Press Alt+Space to hide the window
4. Press Alt+Space again to show the window
5. Click the buttons to verify they're responsive
6. Verify the window stays on top of other applications

## Success Criteria
✅ Small centered floating window  
✅ Solid readable UI  
✅ Fully clickable  
✅ Alt+Space toggles cleanly  
✅ Only one window exists (singleton)  
✅ Always-on-top works  
✅ No fullscreen behavior  
✅ No click-through logic present

## Next Steps
Phase 2 will add screen capture functionality and basic extraction workflow.
