import { FillInBlanksQuestion } from "./fill-blanks-type";

export class FillInBlanksGenerator {
  static getDemoFillInBlanksQuestions(): FillInBlanksQuestion[] {
    return [
      {
        id: 'fib-1',
        question: 'Complete the sentence about JavaScript:',
        textWithBlanks: 'JavaScript is a [BLANK_0] programming language that is often used for [BLANK_1] development.',
        correctAnswers: ['high-level', 'web'],
        completeText: 'JavaScript is a high-level programming language that is often used for web development.',
        explanation: 'JavaScript is a high-level programming language primarily used for enhancing web pages and web applications.',
        difficulty: 'easy'
      },
      {
        id: 'fib-2',
        question: 'Fill in the blanks about React:',
        textWithBlanks: 'React is a [BLANK_0] library for building user interfaces. It was developed by [BLANK_1] and is maintained by a community of developers.',
        correctAnswers: ['JavaScript', 'Facebook'],
        completeText: 'React is a JavaScript library for building user interfaces. It was developed by Facebook and is maintained by a community of developers.',
        explanation: 'React is a popular JavaScript library created by Facebook (now Meta) for building interactive user interfaces.',
        difficulty: 'medium'
      },
      {
        id: 'fib-3',
        question: 'Complete the statement about HTML:',
        textWithBlanks: 'HTML stands for [BLANK_0] and it uses [BLANK_1] to structure content on the web.',
        correctAnswers: ['Hypertext Markup Language', 'tags'],
        completeText: 'HTML stands for Hypertext Markup Language and it uses tags to structure content on the web.',
        explanation: 'HTML (Hypertext Markup Language) is the standard markup language for documents designed to be displayed in a web browser.',
        difficulty: 'easy'
      }
    ];
  }

  static processResponses(questions: FillInBlanksQuestion[]): FillInBlanksQuestion[] {
    // Validate and sanitize incoming questions
    return questions.map(question => {
      // Ensure all required fields are present
      if (!question.textWithBlanks || !question.correctAnswers || !question.id) {
        throw new Error('Invalid fill-in-the-blanks question format');
      }

      // Count the number of [BLANK_X] in the text
      const blankMatches = question.textWithBlanks.match(/\[BLANK_\d+\]/g) || [];
      
      // Validate that number of blanks matches number of correct answers
      if (blankMatches.length !== question.correctAnswers.length) {
        console.warn(`Question ${question.id} has mismatched blanks and answers`);
        // Try to fix by adjusting correctAnswers array length
        if (blankMatches.length > question.correctAnswers.length) {
          question.correctAnswers = [
            ...question.correctAnswers,
            ...Array(blankMatches.length - question.correctAnswers.length).fill("???")
          ];
        } else {
          question.correctAnswers = question.correctAnswers.slice(0, blankMatches.length);
        }
      }

      // Generate completeText if not provided
      if (!question.completeText) {
        let completeText = question.textWithBlanks;
        for (let i = 0; i < question.correctAnswers.length; i++) {
          completeText = completeText.replace(`[BLANK_${i}]`, question.correctAnswers[i]);
        }
        question.completeText = completeText;
      }

      return question;
    });
  }

  static checkAnswers(question: FillInBlanksQuestion, userAnswers: string[]): boolean[] {
    return userAnswers.map((answer, index) => {
      if (!question.correctAnswers[index]) return false;
      
      // Case-insensitive comparison and trim whitespace
      const normalizedUserAnswer = answer.trim().toLowerCase();
      const normalizedCorrectAnswer = question.correctAnswers[index].trim().toLowerCase();
      
      // Check exact match first
      if (normalizedUserAnswer === normalizedCorrectAnswer) {
        return true;
      }
      
      // Check for alternative answers (assuming correctAnswers might have pipe-separated alternatives)
      const alternatives = normalizedCorrectAnswer.split('|').map(alt => alt.trim());
      return alternatives.includes(normalizedUserAnswer);
    });
  }
}