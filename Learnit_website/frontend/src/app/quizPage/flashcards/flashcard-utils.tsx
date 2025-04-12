import { Flashcard } from './flashcard-types';

export class FlashcardGenerator {
  // Static method to generate demo flashcards
  static getDemoFlashcards(): Flashcard[] {
    return [
      {
        question: "What is photosynthesis?",
        answer: "The process by which green plants and some other organisms use sunlight to synthesize foods with the help of chlorophyll.",
        front: ''
      },
      {
        question: "What is the capital of France?",
        answer: "Paris",
        front: ''
      },
      {
        question: "What is Newton's First Law?",
        answer: "An object at rest stays at rest and an object in motion stays in motion with the same speed and in the same direction unless acted upon by an unbalanced force.",
        front: ''
      }
    ];
  }

  // Method to validate flashcards
  static validateFlashcards(flashcards: Flashcard[]): boolean {
    return flashcards.every(flashcard => 
      flashcard.question && 
      flashcard.question.trim().length > 0 && 
      flashcard.answer && 
      flashcard.answer.trim().length > 0
    );
  }

  // Method to shuffle flashcards
  static shuffleFlashcards(flashcards: Flashcard[]): Flashcard[] {
    const shuffledFlashcards = [...flashcards];
    
    // Fisher-Yates shuffle algorithm
    for (let i = shuffledFlashcards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledFlashcards[i], shuffledFlashcards[j]] = [shuffledFlashcards[j], shuffledFlashcards[i]];
    }
    
    return shuffledFlashcards;
  }

  // Method to filter and process flashcards
  static processFlashcards(flashcards: Flashcard[]): Flashcard[] {
    // Remove duplicate flashcards
    const uniqueFlashcards = Array.from(
      new Map(flashcards.map(fc => [fc.question, fc])).values()
    );

    // Validate and return
    return this.validateFlashcards(uniqueFlashcards) 
      ? this.shuffleFlashcards(uniqueFlashcards)
      : this.getDemoFlashcards();
  }
}