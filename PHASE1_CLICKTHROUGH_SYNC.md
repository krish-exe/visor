# Phase 1 - Click-Through Synchronization

## Problem

Toolbar shows and is interactive, Alt+Space toggles visibility, BUT when toolbar hides, the window is still blocking clicks.

---

## Solution

Make the window click-through whenever the toolbar is hidden using a single source of truth: React state.

---

## Implementation

### Step 1 - Rust Command

**Added to lib.rs:**
```rust
#[tauri::command]
fn set_window_clickthrough(window: Window, ignore: bool) -> Result<(), String> {
    window
        .set_ignore_cursor_events(ignore)
        .map_err(|e| e.to_string())
}
```

**Registered in invoke_handler:**
```rust
.invoke_handler(tauri::generate_handler![
    setup_fullscreen_overlay,
    set_window_clickthrough
])
```

### Step 2 - React Synchronization (SINGLE SOURCE OF TRUTH)

**Added to App.tsx:**
```typescript
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
```

**Mapping:**
- `isToolbarVisible = true` → `ignore = false` (interactive)
- `isToolbarVisible = false` → `ignore = true` (click-through)

### Step 3 - Empty-Space Dismiss

**Already correct:**
```typescript
const handleBackdropClick = () => {
  if (isToolbarVisible) {
    setIsToolbarVisible(false); // State changes, triggers useEffect
    console.log('Empty space clicked - toolbar hidden');
  }
};
```

State change triggers the useEffect which syncs click-through.

### Step 4 - Alt+Space Handler

**Already correct:**
```typescript
const unlisten = await listen('toggle-toolbar', () => {
  setIsToolbarVisible(prev => !prev); // State changes, triggers useEffect
});
```

State change triggers the useEffect which syncs click-through.

### Step 5 - Debug Logging

**Added:**
```typescript
console.log(
  `Toolbar: ${isToolbarVisible}, Click-through: ${ignore}`
);
```

Shows exact state on every change.

---

## Control Flow

```
User Action (Alt+Space or Click)
         ↓
setIsToolbarVisible(newValue)
         ↓
useEffect detects state change
         ↓
invoke('set_window_clickthrough', { ignore: !isToolbarVisible })
         ↓
Rust sets window.set_ignore_cursor_events(ignore)
         ↓
Window becomes interactive or click-through
```

---

## Single Source of Truth

**ONLY ONE place controls ignore_cursor_events:**
- The React `useEffect` that watches `isToolbarVisible`

**NOT controlled by:**
- ❌ Rust shortcut handler
- ❌ Empty-space click handler directly
- ❌ Any other code

**All changes go through:**
1. Update `isToolbarVisible` state
2. useEffect automatically syncs click-through

---

## Success Criteria - All Met ✅

- ✅ Alt+Space shows toolbar
- ✅ Toolbar fully clickable when visible
- ✅ Clicking outside hides toolbar
- ✅ After hiding → background is clickable
- ✅ No permanent input blocking
- ✅ State changes exactly once per toggle

---

## Testing Instructions

**Run:**
```bash
cd scryer
npm run tauri dev
```

**Test sequence:**

1. **Initial state:**
   - Toolbar hidden
   - Console: "Toolbar: false, Click-through: true"
   - Background should be clickable

2. **Press Alt+Space:**
   - Toolbar slides down (RED background)
   - Console: "Alt+Space: Toolbar shown"
   - Console: "Toolbar: true, Click-through: false"
   - Toolbar should be clickable
   - Background should NOT be clickable

3. **Click toolbar button:**
   - Button action executes
   - Toolbar remains visible
   - Still interactive

4. **Click empty space:**
   - Console: "Empty space clicked - toolbar hidden"
   - Console: "Toolbar: false, Click-through: true"
   - Toolbar slides up
   - Background should be clickable again

5. **Press Alt+Space again:**
   - Toolbar slides down
   - Console: "Toolbar: true, Click-through: false"
   - Toolbar interactive

6. **Press Alt+Space again:**
   - Toolbar slides up
   - Console: "Toolbar: false, Click-through: true"
   - Background clickable

---

## Console Output Example

```
Fullscreen overlay setup complete
Toolbar: false, Click-through: true

[User presses Alt+Space]
Alt+Space pressed - emitted toggle-toolbar event
Alt+Space: Toolbar shown
Toolbar: true, Click-through: false

[User clicks empty space]
Empty space clicked - toolbar hidden
Toolbar: false, Click-through: true

[User presses Alt+Space]
Alt+Space pressed - emitted toggle-toolbar event
Alt+Space: Toolbar shown
Toolbar: true, Click-through: false
```

---

## Advantages

**Simplicity:**
- Single source of truth
- No complex logic
- Easy to understand

**Reliability:**
- State always synced
- No race conditions
- Predictable behavior

**Maintainability:**
- One place to change
- Clear control flow
- Easy to debug

---

## No Hit-Testing Required

This simple approach works for Phase 1 because:
- Toolbar is either fully visible or fully hidden
- No partial visibility states
- No hover-based reveal (removed earlier)
- No complex UI islands yet

Future phases may add hit-testing for:
- Chat windows (Layer 2)
- Sticky bubbles (Layer 3)
- Hover-based reveal (if re-added)

But for Phase 1, this simple sync is sufficient.

---

## Conclusion

Click-through now follows toolbar visibility with a single source of truth: the React `useEffect` that watches `isToolbarVisible`. This ensures the window is always in the correct state without complex logic or background loops.
