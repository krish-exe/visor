# Scryer - Quick Reference

## Phase 1 Complete ✅

### What It Does
A fullscreen overlay with a glassmorphic Activation Bar that appears at the top of your screen.

---

## User Interactions

### Show/Hide Overlay
- **Alt+Space** - Toggle overlay visibility
- **Hover top of screen** - Reveal bar when hidden
- **Click empty space** - Hide bar (passive state)

### Use Buttons
- **Extract Text** - OCR functionality (Phase 2)
- **Capture Screen** - Screenshot tools (Phase 3)
- **Open Hub** - Knowledge hub (Phase 5)

---

## Behavior Summary

| Action | Result |
|--------|--------|
| Press Alt+Space | Toggle overlay on/off |
| Hover top 70px | Bar slides down (if hidden) |
| Click empty space | Bar slides up (hides) |
| Click bar/buttons | Action executes, bar stays |
| Move mouse away | Bar stays visible until clicked away |

---

## Visual Design

**Activation Bar:**
- Glassmorphic dark background
- Backdrop blur effect
- Rounded bottom corners
- Three vibrant gradient buttons
- Smooth slide animations

**Colors:**
- Extract Text: Indigo gradient
- Capture Screen: Purple gradient
- Open Hub: Green gradient

---

## Technical Stack

- **Frontend:** React + TypeScript + Vite
- **Backend:** Tauri 2.0 + Rust
- **Styling:** Plain CSS (no frameworks)
- **Window:** Fullscreen transparent overlay

---

## Development Commands

```bash
# Run development server
cd scryer
npm run tauri dev

# Build for production
npm run tauri build

# Frontend only
npm run dev

# Type check
npm run build
```

---

## File Structure

```
scryer/
├── src/
│   ├── App.tsx              # Main app logic
│   ├── components/
│   │   └── ActivationBar.tsx # Bar component
│   ├── styles.css           # All styling
│   └── main.tsx             # Entry point
├── src-tauri/
│   ├── src/
│   │   └── lib.rs           # Rust backend
│   ├── Cargo.toml           # Rust dependencies
│   └── tauri.conf.json      # Window config
└── package.json             # Node dependencies
```

---

## Key Features

✅ Fullscreen overlay  
✅ Hover-to-reveal (70px from top)  
✅ Click-away dismissal  
✅ Alt+Space global shortcut  
✅ Glassmorphic UI  
✅ Smooth animations  
✅ UI islands interaction model  
✅ Always-on-top  
✅ No click-through (fully interactive)  

---

## Next Phases

- **Phase 2:** OCR text extraction
- **Phase 3:** Screenshot capture
- **Phase 4:** AI processing
- **Phase 5:** Knowledge hub

---

## Troubleshooting

**Bar doesn't appear:**
- Check if window is visible (Alt+Space)
- Hover near top of screen
- Check console for errors

**Buttons don't work:**
- Ensure you're clicking the button (not empty space)
- Check browser console for logs

**Alt+Space not working:**
- Restart application
- Check for conflicting shortcuts
- Verify global shortcut registration in console

---

## Performance Notes

- Debounced hover (150ms) prevents flicker
- CSS transforms for smooth animations
- Minimal re-renders with React state
- Efficient event listeners

---

## Browser Compatibility

Built with Tauri 2.0 using WebView2 (Windows), so modern web features are fully supported:
- CSS backdrop-filter
- CSS transforms
- Modern JavaScript
- React 19

---

## License & Credits

Built with Tauri, React, and TypeScript.
