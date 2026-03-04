# Phase 3: AI Streaming - Quick Reference

## File Structure

```
visor/
├── src-tauri/
│   ├── Cargo.toml                          # Added AWS SDK dependencies
│   └── src/
│       ├── lib.rs                          # Wired up AI modules + stream_ai command
│       ├── ai/
│       │   ├── mod.rs                      # Module declaration
│       │   └── bedrock_stream.rs           # Bedrock ConverseStream implementation
│       ├── aws/
│       │   ├── mod.rs                      # Module declaration
│       │   └── credential_manager.rs       # AWS credential initialization
│       └── commands/
│           ├── mod.rs                      # Module declaration
│           └── ai_commands.rs              # Tauri command layer
└── src/
    ├── App.tsx                             # Added AI streaming state + listeners
    ├── components/
    │   └── AIChat.tsx                      # AI chat display component
    └── styles.css                          # Added AI chat styling
```

## Key Commands

### Tauri Command: `stream_ai`

```typescript
await invoke('stream_ai', {
  imageBase64: string | null,  // Base64 PNG
  textPrompt: string | null,   // Optional text
});
```

### Events Emitted

```typescript
// Token received
listen<string>('ai-token', (event) => {
  // event.payload contains the token text
});

// Streaming complete
listen('ai-complete', () => {
  // Stream finished successfully
});

// Error occurred
listen<string>('ai-error', (event) => {
  // event.payload contains error message
});
```

## Configuration

```rust
// In bedrock_stream.rs
const MODEL_ID: &str = "anthropic.claude-haiku-4-5-20251001-v1:0";
const MAX_TOKENS: i32 = 2048;
const TEMPERATURE: f32 = 0.2;
```

## Environment Variables Required

```bash
AWS_ACCESS_KEY_ID=your_key_here
AWS_SECRET_ACCESS_KEY=your_secret_here
AWS_REGION=us-east-1
```

## Testing

```powershell
# Dev mode (recommended for testing)
npm run tauri dev

# Production build
npm run tauri build
```

## Troubleshooting

### Build Error: "Access is denied"
- Close running `visor.exe` instances
- Run: `Get-Process visor -ErrorAction SilentlyContinue | Stop-Process -Force`

### AWS Credential Error
- Verify environment variables are set
- Check AWS console for Bedrock access
- Ensure model ID is correct for your region

### No Streaming Response
- Check browser console for errors
- Verify event listeners are registered
- Check Rust console output for API errors

## Architecture Flow

```
User Action (Capture Screen)
  ↓
Screen Capture (capture_region)
  ↓
Frontend invokes stream_ai
  ↓
Tauri Command (ai_commands.rs)
  ↓
Bedrock Module (bedrock_stream.rs)
  ↓
AWS Bedrock ConverseStream API
  ↓
Token Stream
  ↓
window.emit("ai-token")
  ↓
Frontend Listener
  ↓
UI Update (AIChat component)
```

## Protected Code (DO NOT MODIFY)

- `force_full_monitor_bounds()` - Windows framing fix
- `subclass_proc()` - WM_NCHITTEST override
- `install_hit_test_override()` - Hit test setup
- Window setup sequence in `lib.rs`
- Screen capture pipeline
- Global shortcut system

## Next Phase Features (Not Yet Implemented)

- DynamoDB persistence
- S3 storage
- Textract OCR
- STS credential rotation
- Knowledge hub
- Sticky bubbles
- Cost monitoring
