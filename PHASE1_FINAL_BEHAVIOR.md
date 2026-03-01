# Phase 1 - Final Behavior Specification

## Implementation Complete ✅

This document describes the final Phase 1 behavior: a fullscreen overlay with UI islands interaction model.

---

## 1. Global Shortcut Toggle

**Alt+Space behavior:**
- If overlay hidden → show overlay (bar visible)
- If overlay visible → hide overlay completely
- Singleton behavior maintained (only one instance)
- Window focus managed automatically

**Implementation:**
- Tauri global shortcut plugin
- Toggle window visibility
- No duplicate windows

---

## 2. Fullscreen Overlay

**Window properties:**
- ✅ Fullscreen (covers entire primary monitor)
- ✅ Always-on-top (above all other windows)
- ✅ No OS window decorations
- ✅ Fully interactive (NOT click-through)
- ✅ Transparent background
- ✅ Captures all clicks

**Key difference from previous implementation:**
- NO click-through behavior at OS level
- Window is always interactive
- Click handling done at React level

---

## 3. UI Islands Interaction Model

### A) UI Islands (Activation Bar)
**Behavior:**
- Fully clickable
- Buttons perform their intended actions
- Clicking UI islands does NOT hide the overlay
- `stopPropagation()` prevents click from reaching overlay

**Current UI islands:**
- Activation Bar (top-center)
- Future: panels, modals, etc.

### B) Empty Overlay Space
**Behavior:**
- Clicking anywhere outside UI islands → hides all UI elements
- Overlay enters "passive state" (bar hidden)
- Window remains alive but UI is hidden
- Ready for hover-to-reveal

**Implementation:**
- `onClick` handler on app container
- UI islands stop propagation
- State management hides bar

---

## 4. Hover-to-Reveal Behavior

**Trigger zone:**
- Top 70px of screen (vertical)
- Full width (horizontal)
- Works on primary monitor

**Behavior:**
- When overlay is in passive state (bar hidden)
- Mouse enters reveal zone → bar slides down
- Smooth animation (0.3s cubic-bezier)
- 150ms debounce to prevent flicker

**Implementation:**
- Mouse position tracking
- Debounced reveal logic
- Only triggers when bar is hidden

---

## 5. Glassmorphic UI

**Visual properties:**
- Backdrop blur (20px) with saturation boost
- Semi-translucent dark background (rgba(20, 20, 30, 0.85))
- Strong enough to prevent background text readability
- Maintains excellent contrast for UI text
- Modern glassmorphic aesthetic

**Design elements:**
- Rounded bottom corners (20px)
- Subtle border (rgba white 0.1)
- Layered shadows for depth
- Inset highlight for premium feel

**Button styling:**
- Vibrant gradients (indigo, purple, green)
- Shine effect on hover (animated gradient)
- Lift animation (2px translateY)
- Enhanced shadows

---

## 6. Preserved Functionality

**All existing features maintained:**
- ✅ Three action buttons (Extract Text, Capture Screen, Open Hub)
- ✅ Alt+Space global shortcut
- ✅ React component structure
- ✅ Phase 1 architecture
- ✅ Singleton window behavior
- ✅ Always-on-top positioning

---

## Behavior Flow Diagrams

### Show Sequence
```
1. User presses Alt+Space (or hovers near top)
2. isBarVisible = true
3. Bar slides down (translateY: -100% → 0)
4. UI island becomes interactive
5. Overlay captures clicks
```

### Hide Sequence
```
1. User clicks empty overlay space (or presses Alt+Space)
2. isBarVisible = false
3. Bar slides up (translateY: 0 → -100%)
4. Overlay enters passive state
5. Ready for hover-to-reveal
```

### Hover Reveal Sequence
```
1. Bar is hidden (passive state)
2. Mouse moves to top 70px
3. 150ms debounce timer starts
4. Timer completes → isBarVisible = true
5. Bar slides down smoothly
```

### UI Island Click
```
1. User clicks button on Activation Bar
2. Event propagation stopped
3. Button action executes
4. Overlay remains visible
5. Bar stays visible
```

---

## Technical Architecture

### Backend (Rust)
**Commands:**
- `setup_fullscreen_overlay` - Sizes window to monitor, positions at origin
- No click-through commands (removed)

**Global shortcut:**
- Alt+Space registered via tauri-plugin-global-shortcut
- Toggles window visibility
- Manages focus

### Frontend (React)
**State:**
- `isBarVisible` - Controls bar visibility
- `mousePosition` - Tracks cursor position
- `debounceTimerRef` - Prevents flicker on reveal

**Event handlers:**
- `handleOverlayClick` - Hides bar when clicking empty space
- `handleBarClick` - Stops propagation for UI islands
- `handleMouseMove` - Tracks position for hover reveal

**Layout:**
```
app-container (fullscreen, interactive)
└── bar-container (slides from top)
    └── activation-bar (glassmorphic UI island)
        └── buttons (Extract, Capture, Hub)
```

---

## CSS Architecture

### Fullscreen Overlay
```css
.app-container {
  width: 100vw;
  height: 100vh;
  background: transparent;
  cursor: default;
}
```

### Bar Animation
```css
.bar-container {
  transform: translateX(-50%) translateY(-100%); /* Hidden */
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.bar-container.visible {
  transform: translateX(-50%) translateY(0); /* Visible */
}
```

### Glassmorphic Effect
```css
.activation-bar {
  background: rgba(20, 20, 30, 0.85);
  backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: layered shadows...
}
```

---

## Success Criteria - All Met ✅

- ✅ Alt+Space toggles overlay
- ✅ Overlay runs fullscreen
- ✅ UI islands are clickable
- ✅ Clicking empty space hides UI
- ✅ Hover near top reveals bar again
- ✅ No click-through behavior (fully interactive)
- ✅ UI is glassmorphic but readable
- ✅ No duplicate windows
- ✅ Smooth animations
- ✅ 150ms debounce on reveal
- ✅ Singleton behavior maintained

---

## Testing Instructions

**Run the application:**
```bash
cd scryer
npm run tauri dev
```

**Test scenarios:**

1. **Initial launch:**
   - Window appears fullscreen
   - Bar is visible at top

2. **Click empty space:**
   - Bar slides up and hides
   - Overlay remains active

3. **Hover reveal:**
   - Move mouse to top of screen
   - Bar slides down after 150ms
   - Smooth animation

4. **Click UI island:**
   - Click any button
   - Button action executes
   - Bar remains visible

5. **Alt+Space toggle:**
   - Press Alt+Space → overlay hides completely
   - Press Alt+Space → overlay shows, bar visible
   - Reliable toggle behavior

6. **Glassmorphic appearance:**
   - Bar has blur effect
   - Background visible but not readable
   - Strong contrast for text
   - Modern premium look

---

## Design Philosophy

This implementation creates a **non-intrusive overlay** that:

- **Stays accessible** - Hover reveal makes it easy to access
- **Stays out of the way** - Hides when not needed
- **Captures intent** - Click-away dismissal is intuitive
- **Looks premium** - Glassmorphic design is modern and sleek
- **Performs well** - Debounced hover, smooth animations
- **Maintains control** - Alt+Space always works

The UI islands model allows for future expansion (panels, modals) while maintaining consistent interaction patterns.

---

## Future Phase Compatibility

This architecture supports:
- **Phase 2:** OCR capture panels (new UI islands)
- **Phase 3:** Screenshot tools (new UI islands)
- **Phase 4:** AI processing indicators (overlay elements)
- **Phase 5:** Hub panel (large UI island)

All future UI elements will follow the same interaction model:
- Clickable UI islands
- Click-away dismissal
- Hover reveal for primary bar
- Glassmorphic styling
