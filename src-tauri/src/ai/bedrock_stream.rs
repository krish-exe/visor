// Bedrock Streaming Module
//
// Implements AWS Bedrock ConverseStream API for Claude Haiku 4.5
// Streams tokens incrementally to frontend via Tauri events
//
// Architecture:
// Frontend → Tauri Command → This Module → Bedrock API → Token Stream → window.emit("ai-token")

use aws_sdk_bedrockruntime::{
    Client,
    types::{
        ContentBlock, ConversationRole, Message, SystemContentBlock,
        ConverseStreamOutput, ImageBlock, ImageFormat, ImageSource,
    },
};
use tauri::{AppHandle, Emitter};

// Configuration constants (from user confirmation)
const MODEL_ID: &str = "arn:aws:bedrock:us-east-1:362497158628:application-inference-profile/xkgmlvnxitq5";
const MAX_TOKENS: i32 = 2048;
const TEMPERATURE: f32 = 0.2;

const SYSTEM_PROMPT: &str = "You are an academic explanation engine.\n\
Provide concise, precise, structured explanations.\n\
Use step-by-step reasoning where appropriate.\n\
Avoid verbosity.\n\
Avoid motivational or conversational language.\n\
If making inferences beyond the provided content, explicitly state the assumption and its uncertainty.\n\
If analyzing a diagram, identify major components and describe their relationships clearly.\n\
Do not fabricate missing information.\n\
Respond in a professional academic tone.";

/// Input for AI streaming request
#[derive(serde::Deserialize)]
pub struct StreamRequest {
    /// Optional Base64-encoded PNG image
    pub image_base64: Option<String>,
    /// Optional text prompt (if no image, this is required)
    pub text_prompt: Option<String>,
}

/// Stream AI response from Bedrock
///
/// Emits events:
/// - "ai-token" with each token chunk
/// - "ai-complete" when stream finishes
/// - "ai-error" if stream fails
pub async fn stream_ai_response(
    app: AppHandle,
    client: &Client,
    request: StreamRequest,
) -> Result<(), String> {
    // Validate input
    if request.image_base64.is_none() && request.text_prompt.is_none() {
        return Err("Either image_base64 or text_prompt must be provided".to_string());
    }

    // Build user message content
    let mut content_blocks = Vec::new();

    // Add image if provided
    if let Some(image_b64) = request.image_base64 {
        // Decode base64 to bytes
        let image_bytes = base64::Engine::decode(
            &base64::engine::general_purpose::STANDARD,
            image_b64
        ).map_err(|e| format!("Invalid base64 image: {}", e))?;

        let image_source = ImageSource::Bytes(image_bytes.into());
        let image_block = ImageBlock::builder()
            .format(ImageFormat::Png)
            .source(image_source)
            .build()
            .map_err(|e| format!("Failed to build image block: {}", e))?;

        content_blocks.push(
            ContentBlock::Image(image_block)
        );
    }

    // Build text prompt
    let user_text = if let Some(text) = request.text_prompt {
        text
    } else {
        // Default prompt for image-only requests
        "Analyze the provided academic content image. Explain the concept clearly and concisely. \
         If it is a diagram, identify major components and describe their relationships.".to_string()
    };

    content_blocks.push(
        ContentBlock::Text(user_text)
    );

    // Build message
    let user_message = Message::builder()
        .role(ConversationRole::User)
        .set_content(Some(content_blocks))
        .build()
        .map_err(|e| format!("Failed to build message: {}", e))?;

    // Build system prompt
    let system_block = SystemContentBlock::Text(SYSTEM_PROMPT.to_string());

    // Create streaming request
    let response = client
        .converse_stream()
        .model_id(MODEL_ID)
        .messages(user_message)
        .system(system_block)
        .inference_config(
            aws_sdk_bedrockruntime::types::InferenceConfiguration::builder()
                .max_tokens(MAX_TOKENS)
                .temperature(TEMPERATURE)
                .build()
        )
        .send()
        .await
        .map_err(|e| format!("Bedrock API error: {:?}", e))?;

    // Process stream using the receiver
    let mut stream = response.stream;
    
    loop {
        match stream.recv().await {
            Ok(Some(output)) => {
                match output {
                    ConverseStreamOutput::ContentBlockDelta(delta) => {
                        // Extract text token from delta
                        if let Some(delta_content) = delta.delta {
                            if let aws_sdk_bedrockruntime::types::ContentBlockDelta::Text(text) = delta_content {
                                // Emit token to frontend
                                app.emit("ai-token", text)
                                    .map_err(|e| format!("Failed to emit token: {}", e))?;
                            }
                        }
                    }
                    ConverseStreamOutput::MessageStop(_) => {
                        // Stream completed successfully
                        app.emit("ai-complete", ())
                            .map_err(|e| format!("Failed to emit completion: {}", e))?;
                        break;
                    }
                    ConverseStreamOutput::Metadata(metadata) => {
                        // Log usage metadata (no sensitive data)
                        if let Some(usage) = metadata.usage {
                            println!("Token usage - Input: {}, Output: {}, Total: {}",
                                usage.input_tokens,
                                usage.output_tokens,
                                usage.total_tokens
                            );
                        }
                    }
                    _ => {
                        // Other event types (ContentBlockStart, ContentBlockStop, etc.)
                        // No action needed for MVP
                    }
                }
            }
            Ok(None) => {
                // Stream ended
                break;
            }
            Err(e) => {
                let error_msg = format!("Stream error: {:?}", e);
                app.emit("ai-error", error_msg.clone())
                    .map_err(|e| format!("Failed to emit error: {}", e))?;
                return Err(error_msg);
            }
        }
    }

    Ok(())
}
