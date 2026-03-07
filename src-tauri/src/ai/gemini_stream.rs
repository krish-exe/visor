use tauri::{AppHandle, Emitter};
use serde_json::{json, Value};
use futures_util::StreamExt;

pub struct StreamRequest {
    pub image_base64: Option<String>,
    pub text_prompt: Option<String>,
}

pub async fn stream_gemini_response(
    app: AppHandle,
    request: StreamRequest,
) -> Result<(), String> {

    println!("--- Gemini request start ---");

    let api_key = std::env::var("GEMINI_API_KEY")
        .map_err(|_| "GEMINI_API_KEY not set".to_string())?;

    let url = format!(
        "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:streamGenerateContent?key={}",
        api_key
    );

    let prompt = request.text_prompt.unwrap_or_default();

    let mut parts = vec![json!({ "text": prompt })];

    if let Some(img) = request.image_base64 {
        parts.push(json!({
            "inline_data": {
                "mime_type": "image/png",
                "data": img
            }
        }));
    }

    let body = json!({
        "contents": [{
            "role": "user",
            "parts": parts
        }]
    });

    println!("Sending request to Gemini");

    let client = reqwest::Client::new();

    let response = client
        .post(url)
        .json(&body)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    println!("Response status: {}", response.status());

    let mut stream = response.bytes_stream();

    let mut buffer = String::new();

    while let Some(item) = stream.next().await {

        let chunk = item.map_err(|e| e.to_string())?;

        let chunk_str = String::from_utf8_lossy(&chunk);

        println!("Raw chunk: {}", chunk_str);

        buffer.push_str(&chunk_str);

        if let Ok(json_array) = serde_json::from_str::<Value>(&buffer) {

            if let Some(items) = json_array.as_array() {

                for obj in items {

                    if let Some(text) = obj["candidates"][0]["content"]["parts"][0]["text"].as_str() {

                        println!("Token emitted: {}", text);

                        let _ = app.emit("ai-token", text.to_string());
                    }
                }
            }

            buffer.clear();
        }
    }

    println!("Gemini stream complete");

    let _ = app.emit("ai-complete", ());

    Ok(())
}