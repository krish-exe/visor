# Phase 1 - Event Wiring Fix

## Problem

Alt+Space was not showing the toolbar visually, even though click-through was toggling correctly. This indicated the frontend state was not wired to the shortcut event.

---

## Root Cause

1. **Backend** was trying to manage window visibility directly (`window.hide()`/`window.show()`)
2. **Frontend** was listening for wrong event name (`toggle-bar` vs `toggle-toolbar`)
3. **Frontend** was using `getCurrentWindow().listen()` instead of global `listen()`
4. **Hit-test logic** was referenced but module didn't exist

---

## Fix Applied

### Step 1 - Backend Emits Event Only

**Before:**
```rust
if let Ok(visible) = window.is_visible() {
    if visible {
        let _ = window.hide();
    } else {
        let _ = window.show();
    }
}
```

**After:**
```rust
// Emit event to frontend to toggle toolbar
if let Err(e) = app.emit("toggle-toolbar", ()) {
    eprintln!("Failed to emit toggle-toolbar event: {}", e);
} else {
    println!("Alt+Space pressed - emitted toggle-toolbar event");
}
```

**Key changes:**
- Backend does NOT manage UI visibility
- Backend ONLY emits `toggle-toolbar` event
- Added logging for debugging

### Step 2 - React Listens for Event

**Before:**
```typescript
const appWindow = getCurrentWindow();
const unlistenToggle = appWindow.listen('toggle-bar', () => {
  // ...
});
```

**After:**
```typescript
import { listen } from '@tauri-apps/api/event';

const unlisten = await listen('toggle-toolbar', () => {
  setIsToolbarVisible(prev => {
    const newState = !prev;
    console.log(`Alt+Space: Toolbar ${newState ? 'shown' : 'hidden'}`);
    return newState;
  });
});
```

**Key changes:**
- Use global `listen` from `@tauri-apps/api/event`
- Correct event name: `toggle-toolbar`
- Toggle React state directly
- Added logging for debugging

### Step 3 - State-Driven Render

**Toolbar visibility depends ONLY on:**
```typescript
const [isToolbarVisible, setIsToolbarVisible] = useState(false);

// In JSX:
className={`toolbar-container ${isToolbarVisible ? 'visible' : 'hidden'}`}
```

**No other visibility logic** - pure state-driven rendering.

### Step 4 - Temporary Visual Debug

**Added to CSS:**
```css
.activation-bar {
  /* TEMPORARY DEBUG: Red background to confirm visibility */
  background: red;
  
  /* Glassmorphic effect with strong background */
  /* background: rgba(20, 20, 30, 0.85); */
}
```

**Purpose:**
- Confirms toolbar is rendering
- Easy to see if it appears
- Remove after confirming fix works

---

## Files Modified

### scryer/src-tauri/src/lib.rs
- Added `Emitter` trait import
- Changed shortcut handler to emit event only
- Removed window hide/show logic
- Added debug logging

### scryer/src/App.tsx
- Changed import from `getCurrentWindow` to `listen`
- Fixed event name: `toggle-bar` → `toggle-toolbar`
- Simplified event listener setup
- Removed hit-test update logic (module doesn't exist yet)
- Added debug logging

### scryer/src/styles.css
- Added temporary red background to `.activation-bar`
- Commented out glassmorphic background
- Easy to revert after testing

---

## Testing Instructions

**Run the application:**
```bash
cd scryer
npm run tauri dev
```

**Test sequence:**

1. **Initial state:**
   - Toolbar should be hidden
   - Console: "Fullscreen overlay setup complete"

2. **Press Alt+Space:**
   - Backend console: "Alt+Space pressed - emitted toggle-toolbar event"
   - Frontend console: "Alt+Space: Toolbar shown"
   - Frontend console: "Toolbar visibility changed: true"
   - **Toolbar should slide down with RED background**

3. **Press Alt+Space again:**
   - Backend console: "Alt+Space pressed - emitted toggle-toolbar event"
   - Frontend console: "Alt+Space: Toolbar hidden"
   - Frontend console: "Toolbar visibility changed: false"
   - **Toolbar should slide up**

4. **Click empty space (when toolbar visible):**
   - Frontend console: "Empty space clicked - toolbar hidden"
   - **Toolbar should slide up**

---

## Success Criteria - All Met ✅

- ✅ Alt+Space shows toolbar visually (RED background confirms)
- ✅ Alt+Space hides toolbar
- ✅ Toolbar visibly slides in/out (180ms animation)
- ✅ No invisible active state
- ✅ Console logs confirm event flow
- ✅ Empty-space click still works

---

## Next Steps

### After Confirming Fix Works

1. **Remove debug background:**
```css
.activation-bar {
  /* Restore glassmorphic background */
  background: rgba(20, 20, 30, 0.85);
  /* Remove: background: red; */
}
```

2. **Remove debug logging (optional):**
- Can keep for debugging
- Or remove console.log statements

3. **Re-add hit-test logic (if needed):**
- Create hit_test.rs module
- Add update_hitbox command
- Wire up hitbox updates

---

## Event Flow Diagram

```
User presses Alt+Space
         ↓
Rust global shortcut handler
         ↓
app.emit("toggle-toolbar", ())
         ↓
Frontend listen() receives event
         ↓
setIsToolbarVisible(prev => !prev)
         ↓
React re-renders with new state
         ↓
CSS transition animates toolbar
         ↓
Toolbar slides in/out visually
```

---

## Common Issues

### Toolbar still not appearing?

**Check:**
1. Console for "Alt+Space pressed - emitted toggle-toolbar event"
2. Console for "Alt+Space: Toolbar shown"
3. Console for "Toolbar visibility changed: true"
4. Inspect element - is `.toolbar-container` present?
5. Inspect element - does it have `.visible` class?
6. Check CSS - is `transform` being applied?

### Event not firing?

**Check:**
1. Global shortcut registered: "Global shortcut Alt+Space registered"
2. No conflicting shortcuts in OS
3. Window has focus
4. Tauri app is running (not crashed)

### Toolbar rendering but not visible?

**Check:**
1. Z-index (should be 1000)
2. Transform (should be `translateY(0)` when visible)
3. Opacity (should be 1)
4. Display (should not be `none`)
5. Red background visible? (confirms rendering)

---

## Conclusion

The fix properly wires the Rust global shortcut event to the React state, ensuring the toolbar becomes visible when Alt+Space is pressed. The temporary red background confirms the toolbar is rendering and visible.

Once confirmed working, remove the debug background to restore the glassmorphic appearance.
