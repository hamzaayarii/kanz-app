/**
 * Text-to-Speech service using Web Speech API
 */

class TTSService {
  constructor() {
    this.synth = window.speechSynthesis;
    this.utterance = null;
    this.voices = [];
    this.selectedVoice = null;
    this.volume = 1.0;
    this.rate = 1.0;
    this.pitch = 1.0;
    this.lang = 'en-US';
    
    // Initialize voices
    this.initVoices();
  }

  initVoices() {
    // Get available voices
    this.voices = this.synth.getVoices();
    
    // If voices aren't loaded yet, wait for them
    if (this.voices.length === 0) {
      window.speechSynthesis.addEventListener('voiceschanged', () => {
        this.voices = this.synth.getVoices();
        this.selectDefaultVoice();
      });
    } else {
      this.selectDefaultVoice();
    }
  }

  selectDefaultVoice() {
    // Try to find a english voice
    this.selectedVoice = this.voices.find(voice => 
      voice.lang.includes('en') || voice.lang.includes('EN')
    );
    
    // If no english voice, use the first available
    if (!this.selectedVoice && this.voices.length > 0) {
      this.selectedVoice = this.voices[0];
    }
  }

  // Speak the provided text
  speak(text) {
    // Cancel any current speech
    this.cancel();
    
    if (!text) return;
    
    // Create a new utterance
    this.utterance = new SpeechSynthesisUtterance(text);
    
    // Set properties
    this.utterance.voice = this.selectedVoice;
    this.utterance.volume = this.volume;
    this.utterance.rate = this.rate;
    this.utterance.pitch = this.pitch;
    this.utterance.lang = this.lang;
    
    // Speak
    this.synth.speak(this.utterance);
    
    return new Promise((resolve) => {
      this.utterance.onend = resolve;
    });
  }

  // Check if speaking
  isSpeaking() {
    return this.synth.speaking;
  }

  // Pause speech
  pause() {
    if (this.synth.speaking) {
      this.synth.pause();
    }
  }

  // Resume speech
  resume() {
    if (this.synth.paused) {
      this.synth.resume();
    }
  }

  // Cancel speech
  cancel() {
    this.synth.cancel();
  }

  // Get all available voices
  getVoices() {
    return this.voices;
  }

  // Set the selected voice
  setVoice(voice) {
    this.selectedVoice = voice;
  }

  // Set speech volume (0 to 1)
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  // Set speech rate (0.1 to 10)
  setRate(rate) {
    this.rate = Math.max(0.1, Math.min(10, rate));
  }

  // Set speech pitch (0 to 2)
  setPitch(pitch) {
    this.pitch = Math.max(0, Math.min(2, pitch));
  }

  // Set speech language
  setLang(lang) {
    this.lang = lang;
  }
}

export default new TTSService();