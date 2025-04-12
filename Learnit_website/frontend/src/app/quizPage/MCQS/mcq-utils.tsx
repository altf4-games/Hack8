import { MCQ } from './mcq-types';

export class MCQGenerator {
  // Static method to generate demo MCQs
  static getDemoMCQs(): MCQ[] {
    return [
      { 
        question: "What is the main function of mitochondria?", 
        options: [
          "Protein synthesis", 
          "Cellular respiration", 
          "Photosynthesis", 
          "Cell division"
        ], 
        correctAnswer: 1 
      },
      { 
        question: "Which planet is known as the Red Planet?", 
        options: [
          "Venus", 
          "Jupiter", 
          "Mars", 
          "Saturn"
        ], 
        correctAnswer: 2 
      }
    ];
  }

  // Method to shuffle MCQ options if needed
  static shuffleMCQOptions(mcq: MCQ): MCQ {
    // Create a copy of the MCQ to avoid mutating the original
    const shuffledMCQ = { ...mcq };
    
    // Create an array of indices to shuffle
    const indices = shuffledMCQ.options.map((_, index) => index);
    
    // Fisher-Yates shuffle algorithm
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    
    // Remap options and find new correct answer index
    const newOptions = indices.map(index => shuffledMCQ.options[index]);
    const newCorrectAnswerIndex = indices.indexOf(shuffledMCQ.correctAnswer);
    
    return {
      ...shuffledMCQ,
      options: newOptions,
      correctAnswer: newCorrectAnswerIndex
    };
  }

  // Method to validate MCQ generation
  static validateMCQs(mcqs: MCQ[]): boolean {
    return mcqs.every(mcq => 
      mcq.question && 
      mcq.options.length > 1 && 
      mcq.correctAnswer >= 0 && 
      mcq.correctAnswer < mcq.options.length
    );
  }
}