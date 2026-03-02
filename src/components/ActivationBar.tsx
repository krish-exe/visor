interface ActivationBarProps {
  onExtractText: () => void;
  onCaptureScreen: () => void;
  onOpenHub: () => void;
  onExit: () => void;
}

export default function ActivationBar({ onExtractText, onCaptureScreen, onOpenHub, onExit }: ActivationBarProps) {
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
        <button
          onClick={onExit}
          className="activation-bar-button button-exit"
          aria-label="Exit Application"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2V12M18.36 6.64C19.95 8.23 21 10.5 21 13C21 17.97 16.97 22 12 22C7.03 22 3 17.97 3 13C3 10.5 4.05 8.23 5.64 6.64"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
