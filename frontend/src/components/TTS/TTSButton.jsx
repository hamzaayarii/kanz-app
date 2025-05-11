import { useTTS } from './TTSContext';

const TTSButton = ({ text, elementId, className = '', size = 'md', label = 'Lire à voix haute' }) => {
  const { isTTSEnabled, isSpeaking, speak, stop, readElement } = useTTS();

  const handleClick = () => {
    if (isSpeaking) {
      stop();
      return;
    }

    if (elementId) {
      const element = document.getElementById(elementId);
      if (element) {
        readElement(element);
      }
    } else if (text) {
      speak(text);
    }
  };

  // Don't render if TTS is disabled
  if (!isTTSEnabled) {
    return null;
  }

  const getButtonSize = () => {
    switch (size) {
      case 'sm': return 'text-xs px-2 py-1';
      case 'lg': return 'text-base px-4 py-2';
      default: return 'text-sm px-3 py-1.5';
    }
  };

  return (
    <button
      className={`mt-2 custom-tts-button ${getButtonSize()} ${className}`}
      onClick={handleClick}
      aria-label={isSpeaking ? 'Arrêter la lecture' : label}
    >
      {/* Speaker icon (speaking or not) */}
      <span className="mr-1">
        {isSpeaking ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.465a5 5 0 001.414-9.465m4 0a9 9 0 00-2.828 17.172" />
          </svg>
        )}
      </span>
      {isSpeaking ? 'Arrêter' : 'Écouter'}
    </button>
  );
};

export default TTSButton;