# Chat Window Fixes - Complete

## Summary
Fixed three critical issues in ChatWindowStandalone.tsx to improve window controls, AI feedback, and error handling.

## Changes Applied

### 1. Window Draggability Fix
**Issue**: Header wasn't properly configured for Tauri drag region.

**Solution**: Added `data-tauri-drag-region` attribute to the header div.

```tsx
<div
  className="chat-window-header"
  data-tauri-drag-region
  onMouseDown={handleHeaderMouseDown}
>
```

This ensures the Tauri runtime recognizes the header as a draggable region while still allowing control buttons to function properly.

### 2. AI Streaming State Management
**Issue**: `isStreaming` state wasn't properly synchronized with actual streaming lifecycle.

**Solution**: 
- Set `isStreaming(true)` immediately when message is sent
- Listen for backend "ai-complete" event to turn off streaming indicator
- Listen for "ai-error" event to handle stream errors and update UI
- Keep streaming indicator visible while tokens arrive

```tsx
// In event listener
const unlistenToken = await listen<string>("ai-token", (event) => {
  // ... append token logic
  setIsStreaming(true); // Keep indicator visible
});

const unlistenComplete = await listen("ai-complete", () => {
  setIsStreaming(false); // Turn off when complete
});

const unlistenError = await listen<string>("ai-error", (event) => {
  // ... show error in chat
  setIsStreaming(false); // Turn off on error
});
```

### 3. Error Propagation to UI
**Issue**: Errors were only logged to console, users couldn't see why requests failed.

**Solution**: 
- Catch errors from `invoke("stream_ai")` and append error messages to chat
- Listen for backend "ai-error" events and display them in the chat UI
- Use the existing error message styling (red background, warning icon)

```tsx
try {
  await invoke("stream_ai", { ... });
  setIsStreaming(false);
} catch (err) {
  const errorMsg = err instanceof Error ? err.message : String(err);
  setMessages((m) => [
    ...m,
    { role: "error", content: `Failed to get AI response: ${errorMsg}` },
  ]);
  setIsStreaming(false);
}
```

## Testing Checklist
- [ ] Window can be dragged by header
- [ ] Minimize and close buttons work without triggering drag
- [ ] Streaming indicator appears when message is sent
- [ ] Streaming indicator stays visible while tokens arrive
- [ ] Streaming indicator disappears when stream completes
- [ ] Error messages appear in chat when backend fails
- [ ] Error messages appear in chat when stream errors occur
- [ ] Input is disabled while streaming
- [ ] Send button shows "..." while streaming

## Backend Integration
The fixes rely on these backend events (already implemented in `bedrock_stream.rs`):
- `ai-token`: Emitted for each text chunk
- `ai-complete`: Emitted when stream finishes successfully
- `ai-error`: Emitted when stream encounters an error

No backend changes were required.
