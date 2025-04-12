import { MatchingQuestion } from './matching-question-type';

export class MatchingQuestionGenerator {
  // Generate demo matching questions for fallback
  static getDemoMatchingQuestions(): MatchingQuestion[] {
    return [
      {
        id: 1,
        question: "Match the chemical compounds with their formulas:",
        leftItems: ["Water", "Oxygen", "Carbon Dioxide", "Glucose"],
        rightItems: ["H₂O", "O₂", "CO₂", "C₆H₁₂O₆"],
        correctMatches: [0, 1, 2, 3]
      },
      {
        id: 2,
        question: "Match the countries with their capitals:",
        leftItems: ["France", "Germany", "Italy", "Spain"],
        rightItems: ["Paris", "Berlin", "Rome", "Madrid"],
        correctMatches: [0, 1, 2, 3]
      }
    ];
  }

  // Shuffle matching questions to randomize right-side items
  static shuffleMatchingQuestions(question: MatchingQuestion): MatchingQuestion {
    // Create a copy of the question
    const shuffledQuestion = { ...question };
    
    // Create a mapping of original indices to shuffled indices
    const shuffledIndices = [...Array(question.rightItems.length).keys()];
    
    // Shuffle the indices
    for (let i = shuffledIndices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledIndices[i], shuffledIndices[j]] = [shuffledIndices[j], shuffledIndices[i]];
    }
    
    // Shuffle the right items using the shuffled indices
    const shuffledRightItems = shuffledIndices.map(i => question.rightItems[i]);
    
    // Update the correctMatches to reflect the new positions
    const newCorrectMatches = question.correctMatches.map(originalIndex => 
      shuffledIndices.findIndex(shuffledIndex => shuffledIndex === originalIndex)
    );
    
    // Return the updated question
    return {
      ...shuffledQuestion,
      rightItems: shuffledRightItems,
      correctMatches: newCorrectMatches
    };
  }

  // Validate matching questions (optional, can add more sophisticated validation)
  static validateMatchingQuestions(questions: MatchingQuestion[]): boolean {
    return questions.every(q => 
      q.leftItems.length === q.rightItems.length && 
      q.correctMatches.length === q.leftItems.length &&
      q.correctMatches.every(match => match >= 0 && match < q.rightItems.length)
    );
  }
}