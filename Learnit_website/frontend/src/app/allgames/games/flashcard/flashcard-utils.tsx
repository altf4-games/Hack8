// Define types
export interface Flashcard {
    id: string;
    front: string;
    back: string;
    category?: string;
  }
  
  export class FlashcardGenerator {
    /**
     * Process raw flashcards from API to ensure they have IDs and proper formatting
     */
    static processFlashcards(rawFlashcards: any[]): Flashcard[] {
      if (!rawFlashcards || !Array.isArray(rawFlashcards)) {
        console.warn('Invalid flashcards data received from API');
        return this.getDemoFlashcards();
      }
      
      return rawFlashcards.map((card, index) => {
        // Ensure each card has the required properties
        if (!card.front || !card.back) {
          console.warn(`Flashcard at index ${index} is missing required properties`);
          return null;
        }
        
        // Ensure each card has an ID
        return {
          id: card.id || `flashcard-${index}-${Date.now()}`,
          front: card.front,
          back: card.back,
          category: card.category || 'General'
        };
      }).filter(Boolean) as Flashcard[]; // Filter out any null cards
    }
    
    /**
     * Get demo flashcards for fallback
     */
    static getDemoFlashcards(): Flashcard[] {
      return [
        {
          id: 'demo-1',
          front: 'What is the capital of France?',
          back: 'Paris',
          category: 'Geography'
        },
        {
          id: 'demo-2',
          front: 'Who wrote "To Kill a Mockingbird"?',
          back: 'Harper Lee',
          category: 'Literature'
        },
        {
          id: 'demo-3',
          front: 'What is the chemical symbol for water?',
          back: 'H₂O',
          category: 'Chemistry'
        },
        {
          id: 'demo-4',
          front: 'What is Newton\'s First Law?',
          back: 'An object at rest stays at rest, and an object in motion stays in motion with the same speed and direction unless acted upon by an external force.',
          category: 'Physics'
        },
        {
          id: 'demo-5',
          front: 'What does HTML stand for?',
          back: 'HyperText Markup Language',
          category: 'Computer Science'
        }
      ];
    }
  }