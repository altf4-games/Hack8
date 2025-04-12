// soundEffects.ts
// Utility functions for playing sound effects in the app

// Cache audio objects for better performance
let correctSoundEffect: HTMLAudioElement | null = null;
let incorrectSoundEffect: HTMLAudioElement | null = null;

// Track consecutive correct answers for pitch increase
let consecutiveCorrectAnswers = 0;

/**
 * Plays the correct answer sound effect
 * Each consecutive correct answer increases the pitch
 */
export const playCorrectSound = () => {
  try {
    // Increment consecutive correct answers counter
    consecutiveCorrectAnswers++;
    
    if (!correctSoundEffect) {
      correctSoundEffect = new Audio('/correct-sound.mp3');
      correctSoundEffect.volume = 0.7;
    }
    
    // Reset the sound
    correctSoundEffect.pause();
    correctSoundEffect.currentTime = 0;
    
    // Calculate pitch increase based on consecutive correct answers
    // Cap at 12 semitones (one octave) higher
    const maxPitchIncrease = 12;
    const pitchIncrease = Math.min(consecutiveCorrectAnswers - 1, maxPitchIncrease);
    
    // Each semitone is approximately 1.059 times higher
    const rate = Math.pow(1.059, pitchIncrease);
    
    // Set playback rate for pitch shift if supported
    if ('preservesPitch' in correctSoundEffect) {
      // @ts-ignore - TypeScript may not recognize this property
      correctSoundEffect.preservesPitch = false;
    }
    correctSoundEffect.playbackRate = rate;
    
    // Add visual feedback about the streak in the console
    console.log(`🎵 Correct streak: ${consecutiveCorrectAnswers}, Pitch increase: ${pitchIncrease} semitones`);
    
    // Play the sound
    correctSoundEffect.play().catch(error => {
      console.warn('Could not play correct sound effect:', error);
    });
  } catch (error) {
    console.error('Error playing correct sound effect:', error);
  }
};

/**
 * Plays the incorrect answer sound effect
 * Also resets the consecutive correct answers counter
 */
export const playIncorrectSound = () => {
  try {
    // Reset consecutive correct answers when user gets an answer wrong
    consecutiveCorrectAnswers = 0;
    
    if (!incorrectSoundEffect) {
      incorrectSoundEffect = new Audio('/incorrect-sound.mp3');
      incorrectSoundEffect.volume = 0.6;
    }
    
    // Reset and play
    incorrectSoundEffect.currentTime = 0;
    incorrectSoundEffect.play().catch(error => {
      console.warn('Could not play incorrect sound effect:', error);
    });
  } catch (error) {
    console.error('Error playing incorrect sound effect:', error);
  }
};

/**
 * Toggle sound effects on/off based on user preference
 * @param enabled - Whether sound effects should be enabled
 */
export const setSoundEffectsEnabled = (enabled: boolean) => {
  localStorage.setItem('soundEffectsEnabled', enabled ? 'true' : 'false');
};

/**
 * Get current sound effects preference
 * @returns boolean indicating if sound effects are enabled
 */
export const areSoundEffectsEnabled = (): boolean => {
  // Default to enabled if not set
  const preference = localStorage.getItem('soundEffectsEnabled');
  return preference === null ? true : preference === 'true';
};

/**
 * Reset the consecutive correct answers counter
 * Use this when switching between question types, not between questions
 */
export const resetConsecutiveCorrectCounter = () => {
  consecutiveCorrectAnswers = 0;
};

/**
 * Get the current streak of consecutive correct answers
 * @returns number of consecutive correct answers
 */
export const getConsecutiveCorrectCount = (): number => {
  return consecutiveCorrectAnswers;
}; 