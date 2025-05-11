import { createContext, useContext } from 'react';

// Create context with default values
const TTSContext = createContext({
  isTTSEnabled: false,
  isSpeaking: false,
  toggleTTS: () => {},
  speak: () => {},
  stop: () => {},
  readElement: () => {},
});

// Custom hook to use TTS context
export const useTTS = () => useContext(TTSContext);

export default TTSContext;