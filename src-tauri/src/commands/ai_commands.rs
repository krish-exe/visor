use tauri::AppHandle;
use crate::ai::gemini_stream::{stream_gemini_response, StreamRequest};

#[tauri::command]
pub async fn stream_ai(
    app: AppHandle,
    image_base64: Option<String>,
    text_prompt: Option<String>,
) -> Result<(), String> {

    println!("AI command received");

    let request = StreamRequest {
        image_base64,
        text_prompt,
    };

    stream_gemini_response(app, request).await
}