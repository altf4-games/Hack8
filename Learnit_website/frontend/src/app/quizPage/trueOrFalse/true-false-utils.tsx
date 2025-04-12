import { TrueFalseQuestion } from "./true-false-type";

export class TrueFalseQuestionGenerator {
  // Static method to generate demo True/False questions
  static getDemoTrueFalseQuestions(): TrueFalseQuestion[] {
    return [
      {
        id: 1,
        question: "The Earth revolves around the Sun.",
        isTrue: true,
        explanation: "aook"
      },
      {
        id: 2,
        question: "The human body has 206 bones.",
        isTrue: true,
        explanation: "aook"
      },
      {
        id: 3,
        question: "Sound travels faster in water than in air.",
        isTrue: true,
        explanation: "aook"
      },
      {
        id: 4,
        question: "The Great Wall of China is visible from space with the naked eye.",
        isTrue: false,
        explanation: "aook"
      }
    ];
  }

  // Method to validate True/False questions
  static validateTrueFalseQuestions(questions: TrueFalseQuestion[]): boolean {
    return questions.every(question => 
      question.question && 
      question.question.trim().length > 0 && 
      typeof question.isTrue === 'boolean'
    );
  }

  // Method to shuffle True/False questions
  static shuffleTrueFalseQuestions(questions: TrueFalseQuestion[]): TrueFalseQuestion[] {
    const shuffledQuestions = [...questions];
    
    // Fisher-Yates shuffle algorithm
    for (let i = shuffledQuestions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledQuestions[i], shuffledQuestions[j]] = [shuffledQuestions[j], shuffledQuestions[i]];
    }
    
    return shuffledQuestions;
  }

  // Method to process True/False questions
  static processTrueFalseQuestions(questions: TrueFalseQuestion[]): TrueFalseQuestion[] {
    // Remove duplicate questions
    const uniqueQuestions = Array.from(
      new Map(questions.map(q => [q.question, q])).values()
    );

    // Validate and return
    return this.validateTrueFalseQuestions(uniqueQuestions)
      ? this.shuffleTrueFalseQuestions(uniqueQuestions)
      : this.getDemoTrueFalseQuestions();
  }

  // Optional: Method to balance True/False distribution
  static balanceTrueFalseQuestions(questions: TrueFalseQuestion[]): TrueFalseQuestion[] {
    const processedQuestions = [...questions];
    
    // Count true and false questions
    const trueCount = processedQuestions.filter(q => q.isTrue).length;
    const falseCount = processedQuestions.filter(q => !q.isTrue).length;
    
    // If distribution is too skewed, add demo questions to balance
    if (Math.abs(trueCount - falseCount) > processedQuestions.length / 2) {
      const demoQuestions = this.getDemoTrueFalseQuestions();
      const balancingQuestions = demoQuestions.filter(demoQ => 
        processedQuestions.findIndex(q => q.question === demoQ.question) === -1
      );
      
      processedQuestions.push(...balancingQuestions.slice(0, 2));
    }
    
    return this.processTrueFalseQuestions(processedQuestions);
  }
}