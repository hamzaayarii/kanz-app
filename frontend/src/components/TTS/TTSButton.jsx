import { useTTS } from './TTSContext';

const TTSButton = ({ text, elementId, className = '', size = 'md', label = 'Read aloud' }) => {
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

  if (!isTTSEnabled) {
    return null;
  }

  const getButtonSize = () => {
    switch (size) {
      case 'sm': return 'text-xs px-3 py-2';
      case 'lg': return 'text-lg px-6 py-3';
      default: return 'text-base px-5 py-2.5';
    }
  };

  return (
    <button
      className={`tts-toggle-button ${getButtonSize()} ${className} ${isSpeaking ? 'active' : ''}`}
      onClick={handleClick}
      aria-label={isSpeaking ? 'Stop reading' : label}
    >
      <span className="flex items-center justify-center">
        {isSpeaking ? (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            <span className="ml-2">Stop</span>
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.465a5 5 0 001.414-9.465m4 0a9 9 0 00-2.828 17.172" />
            </svg>
            <span className="ml-2">Listen</span>
          </>
        )}
      </span>
    </button>
  );
};

export default TTSButton;