// AI Commands - Tauri Command Layer
//
// Provides frontend-facing commands for AI functionality
// Maintains separation: Frontend → Command → Service Layer → AWS

use tauri::{AppHandle, State, Emitter};
use aws_sdk_bedrockruntime::Client;
use crate::ai::bedrock_stream::{stream_ai_response, StreamRequest};

/// Tauri command: Stream AI response
///
/// This command initiates a streaming AI response from Bedrock.
/// Tokens are emitted via events, not returned directly.
///
/// Events emitted:
/// - "ai-token": Each text chunk as it arrives
/// - "ai-complete": When streaming finishes successfully  
/// - "ai-error": If an error occurs
///
/// Parameters:
/// - image_base64: Optional Base64-encoded PNG image
/// - text_prompt: Optional text prompt (required if no image)
#[tauri::command]
pub async fn stream_ai(
    app: AppHandle,
    bedrock_client: State<'_, Client>,
    image_base64: Option<String>,
    text_prompt: Option<String>,
) -> Result<(), String> {
    let request = StreamRequest {
        image_base64,
        text_prompt,
    };

    // Spawn async task to handle streaming
    // This prevents blocking the Tauri command thread
    let client = bedrock_client.inner().clone();
    tokio::spawn(async move {
        if let Err(e) = stream_ai_response(app.clone(), &client, request).await {
            // Emit error event if streaming fails
            let _ = app.emit("ai-error", e);
        }
    });

    Ok(())
}
