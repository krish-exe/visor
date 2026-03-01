interface ActivationBarProps {
  onExtractText: () => void;
  onCaptureScreen: () => void;
  onOpenHub: () => void;
}

export default function ActivationBar({ onExtractText, onCaptureScreen, onOpenHub }: ActivationBarProps) {
  return (
    <div className="activation-bar">
      <div className="activation-bar-content">
        <button
          onClick={onExtractText}
          className="activation-bar-button button-extract"
        >
          Extract Text
        </button>
        <button
          onClick={onCaptureScreen}
          className="activation-bar-button button-capture"
        >
          Capture Screen
        </button>
        <button
          onClick={onOpenHub}
          className="activation-bar-button button-hub"
        >
          Open Hub
        </button>
      </div>
    </div>
  );
}
