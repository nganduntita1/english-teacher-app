// Text-to-Speech utility using Web Speech API
// Free, browser-native speech synthesis

export const speak = (text: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Check browser support
    if (!('speechSynthesis' in window)) {
      reject(new Error('Text-to-speech not supported in this browser'));
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configure voice settings for English learning
    utterance.lang = 'en-US'; // American English
    utterance.rate = 0.85; // Slightly slower for learning
    utterance.pitch = 1.0; // Normal pitch
    utterance.volume = 1.0; // Full volume

    utterance.onend = () => resolve();
    utterance.onerror = (event) => reject(event);

    window.speechSynthesis.speak(utterance);
  });
};

// Get available English voices
export const getEnglishVoices = (): SpeechSynthesisVoice[] => {
  if (!('speechSynthesis' in window)) return [];
  
  const voices = window.speechSynthesis.getVoices();
  return voices.filter(voice => voice.lang.startsWith('en'));
};

// Check if text-to-speech is supported
export const isSpeechSupported = (): boolean => {
  return 'speechSynthesis' in window;
};
