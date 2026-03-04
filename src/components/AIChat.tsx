// AI Chat Component - Phase 3
// Displays streaming AI responses with academic styling

interface AIChatProps {
  imageBase64?: string;
  streamingText: string;
  isStreaming: boolean;
  error?: string;
  onClose: () => void;
  onSendPrompt: (prompt: string) => void;
}

export default function AIChat({
  imageBase64,
  streamingText,
  isStreaming,
  error,
  onClose,
}: AIChatProps) {
  return (
    <div className="ai-chat-overlay">
      <div className="ai-chat-content">
        <div className="ai-chat-header">
          <span className="ai-badge">AI Academic Explanation</span>
          <button className="close-button" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="ai-chat-body">
          {/* Display image if provided */}
          {imageBase64 && (
            <div className="ai-image-preview">
              <img
                src={`data:image/png;base64,${imageBase64}`}
                alt="Content being analyzed"
                className="ai-preview-image"
              />
            </div>
          )}

          {/* Streaming response area */}
          <div className="ai-response-container">
            {error ? (
              <div className="ai-error">
                <span className="error-icon">⚠</span>
                <span className="error-text">{error}</span>
              </div>
            ) : (
              <>
                <div className="ai-response-text">
                  {streamingText || (isStreaming ? 'Analyzing...' : 'Waiting for response...')}
                </div>
                {isStreaming && (
                  <div className="ai-streaming-indicator">
                    <div className="streaming-dot"></div>
                    <div className="streaming-dot"></div>
                    <div className="streaming-dot"></div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
