# Text-to-Speech (TTS) Feature

## Overview
The app now includes **free text-to-speech pronunciation** using the Web Speech API for all vocabulary words.

## Technology
- **API**: Web Speech API (browser-native, no cost)
- **Voice**: American English (en-US)
- **Rate**: 0.85 (slightly slower for learning)
- **Quality**: Good enough for pronunciation practice

## Features
✅ Speaker button on every vocabulary card
✅ Blue button with speaker icon (🔊)
✅ Animated pulse effect while speaking
✅ Disabled state prevents overlapping speech
✅ Works on both vocabulary page and lesson detail pages
✅ Browser compatibility check with fallback alert

## Where It Works
1. **Vocabulary Page** (`/vocabulary`)
   - Speaker button next to "Mark as Learned" button
   - Click to hear pronunciation of any word

2. **Lesson Detail Page** (`/lessons/[id]`)
   - **Content Tab**: Preview vocabulary cards have speaker buttons
   - **Vocabulary Tab**: Full vocabulary list with speaker buttons

## Browser Support
- ✅ Chrome/Edge (excellent support)
- ✅ Safari (good support)
- ✅ Firefox (good support)
- ❌ Opera Mini, older browsers (shows alert message)

## Usage
1. Navigate to vocabulary page or open any lesson
2. Click the **blue speaker button** (🔊) next to any word
3. Listen to the pronunciation
4. Button pulses while speaking
5. Wait for speech to finish before clicking again

## Implementation Details

### Files Modified
- **Created**: `/src/lib/speech.ts` - TTS utility functions
- **Updated**: `/src/app/vocabulary/page.tsx` - Added speaker buttons
- **Updated**: `/src/app/lessons/[id]/page.tsx` - Added speaker buttons

### Code Structure
```typescript
// Utility function
speak(text: string): Promise<void>

// Usage in components
const handleSpeak = async (word: string, vocabId: string) => {
  setSpeakingWord(vocabId); // Show loading state
  await speak(word);
  setSpeakingWord(null); // Reset state
};
```

## Cost
💰 **$0.00** - Completely free (uses browser's built-in speech engine)

## Future Enhancements (Optional)
- Voice selection (British vs American English)
- Speed control slider
- Repeat button for practice
- Sentence pronunciation (for examples)
- Offline support (already works offline!)

## Testing
To test the feature:
1. Open the app in your browser
2. Go to Vocabulary page or any lesson
3. Click any blue speaker button
4. You should hear the word pronounced
5. Try on different browsers to test compatibility
