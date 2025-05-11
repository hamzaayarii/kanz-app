import React, { useState, useCallback, useEffect } from 'react';
import TTSContext from './TTSContext';

// Import the service correctly based on your project structure
// Assuming services is at the same level as components
import ttsService from '../../services/tts';

const TTSProvider = ({ children }) => {
  // Load the initial preference from localStorage if available
  const [isTTSEnabled, setIsTTSEnabled] = useState(() => {
    const savedPreference = localStorage.getItem('ttsEnabled');
    return savedPreference === 'true';
  });
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // Check speaking status periodically
  useEffect(() => {
    if (!isTTSEnabled) return;
    
    const interval = setInterval(() => {
      if (window.speechSynthesis) {
        setIsSpeaking(ttsService.isSpeaking());
      }
    }, 100);
    
    return () => clearInterval(interval);
  }, [isTTSEnabled]);
  
  // Toggle TTS on/off
  const toggleTTS = useCallback(() => {
    const newState = !isTTSEnabled;
    setIsTTSEnabled(newState);
    
    // Save preference to localStorage
    localStorage.setItem('ttsEnabled', newState.toString());
   
    // If turning off, stop any current speech
    if (!newState && ttsService.isSpeaking()) {
      ttsService.cancel();
      setIsSpeaking(false);
    }
   
    // Announce the status change
    if (newState) {
      ttsService.speak("Text-to-speech enabled");
    }
  }, [isTTSEnabled]);
  
  // Speak text
  const speak = useCallback((text) => {
    if (!isTTSEnabled || !text) return;
   
    ttsService.speak(text).then(() => {
      setIsSpeaking(false);
    }).catch(err => {
      console.error('TTS error:', err);
      setIsSpeaking(false);
    });
    
    setIsSpeaking(true);
  }, [isTTSEnabled]);
  
  // Stop speaking
  const stop = useCallback(() => {
    ttsService.cancel();
    setIsSpeaking(false);
  }, []);
  
  // Read the content of a DOM element
  const readElement = useCallback((element) => {
    if (!isTTSEnabled || !element) return;
   
    // Get text content, stripping out extra whitespace
    const text = element.textContent.replace(/\s+/g, ' ').trim();
    speak(text);
  }, [isTTSEnabled, speak]);
  
  // Create the context value
  const contextValue = {
    isTTSEnabled,
    isSpeaking,
    toggleTTS,
    speak,
    stop,
    readElement,
  };
  
  return (
    <TTSContext.Provider value={contextValue}>
      {children}
    </TTSContext.Provider>
  );
};

export default TTSProvider;