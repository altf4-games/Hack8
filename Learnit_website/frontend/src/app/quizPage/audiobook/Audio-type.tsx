import { Flashcard } from "../flashcards/flashcard-types";
import { MCQ } from "../MCQS/mcq-types";
import { TrueFalseQuestion } from "../trueOrFalse/true-false-type";

// In audiobook-section.tsx
interface AudiobookSectionProps {
  fileContent: string;
  fileName: string;
  isGenerating: boolean;
  flashcards: any[];
  mcqs: any[];
  trueFalseQuestions: any[];
  onGenerateAudio: () => Promise<void>; // Add this prop
  audioGenerationUrl?: string; // Keep this as optional
}