export interface MatchingQuestion {
    id: number;
    question: string;
    leftItems: string[];
    rightItems: string[];
    correctMatches: number[];
  }