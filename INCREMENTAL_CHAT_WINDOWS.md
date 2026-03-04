# Incremental Migration: Chat Windows

## Overview

This is Step 1 of migrating Visor to a multi-window architecture. In this step, we ONLY add the ability to spawn chat windows as separate Tauri WebviewWindow instances.

## What Changed

### Backend (Rust)

Added a single new command: `create_chat_window`

**Location:** `visor/src-tauri/src/lib.rs`

**Implementation:**
```rust
// Global counter for unique chat window IDs
static CHAT_COUNTER: AtomicU32 = AtomicU32::new(1);

#[tauri::command]
fn create_chat_window(app: AppHandle) -> Result<u32, String> {
    let chat_id = CHAT_COUNTER.fetch_add(1, Ordering::SeqCst);
    let label = format!("chat-{}", chat_id);
    
    let _window = tauri::WebviewWindowBuilder::new(
        &app,
        &label,
        WebviewUrl::App("index.html?type=chat".into())
    )
    .title(format!("Chat {}", chat_id))
    .inner_size(500.0, 600.0)
    .resizable(true)
    .decorations(false)
    .transparent(true)
    .always_on_top(true)
    .visible(true)
    .build()
    .map_err(|e| e.to_string())?;
    
    Ok(chat_id)
}
```

**Properties:**
- Width: 500px
- Height: 600px
- Decorations: false (frameless)
- Resizable: true
- Always on top: true
- Transparent: true

**Window Labels:**
- `chat-1`
- `chat-2`
- `chat-3`
- etc.

**Return Value:**
Returns the chat ID (u32) that was assigned to the window.

## What Did NOT Change

- ✅ `capture_region` command - unchanged
- ✅ `stream_ai` command - unchanged
- ✅ Overlay logic - unchanged
- ✅ Toolbar behavior - unchanged
- ✅ AI streaming events - unchanged
- ✅ Existing embedded chat system - still present and functional
- ✅ Current capture workflow - unchanged

## Testing the Command

You can test the command from the browser console or by adding a temporary button:

```typescript
// Test from console
await invoke('create_chat_window');
// Returns: 1 (first chat ID)

await invoke('create_chat_window');
// Returns: 2 (second chat ID)
```

## Validation Criteria

✅ Calling `create_chat_window` opens a new window  
✅ Multiple chat windows can be opened simultaneously  
✅ Each window has a unique label (chat-1, chat-2, etc.)  
✅ Windows are 500x600, frameless, resizable, always on top  
✅ Existing application behavior is completely unchanged  
✅ Application still compiles and runs  

## Next Steps

In future incremental steps, we will:
1. Add routing logic to detect `?type=chat` parameter
2. Render chat UI in the separate windows
3. Migrate chat state management to work across windows
4. Remove the embedded chat system from the overlay

But for now, this step ONLY adds the ability to spawn windows. The existing chat system continues to work as before.

## Files Modified

- `visor/src-tauri/src/lib.rs` - Added `create_chat_window` command and atomic counter
- No frontend changes in this step

## Build Verification

```bash
cd visor/src-tauri
cargo check
# Should compile successfully with no errors
```
