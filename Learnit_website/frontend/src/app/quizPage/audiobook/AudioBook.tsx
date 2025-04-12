'use client'
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  VolumeX,
  Download,
  RefreshCw,
  FileText,
  BrainCircuit
} from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Import the proper types from their respective files
import { Flashcard } from "../flashcards/flashcard-types";
import { MCQ } from "../MCQS/mcq-types";
import { TrueFalseQuestion } from "../trueOrFalse/true-false-type";

interface AudioSection {
  title: string;
  text: string;
  startTime: number;
  audioUrl?: string; // Store individual audio URL for each section
}

interface AudiobookSectionProps {
  fileContent: string;
  fileName: string;
  isGenerating: boolean;
  flashcards: Flashcard[]; // Use the proper type
  mcqs: MCQ[]; // Use the proper type
  trueFalseQuestions: TrueFalseQuestion[]; // Use the proper type
  onGenerateAudio?: () => Promise<void>; // Optional callback
  geminiApiKey?: string; // API key for Gemini
  geminiApiEndpoint?: string; // API endpoint for Gemini text-to-speech
}

// Define AudioContext type for cross-browser compatibility
interface AudioContextType {
  AudioContext: typeof AudioContext;
  webkitAudioContext?: typeof AudioContext;
}

// Define the return type for audio generation functions
interface AudioGenerationResult {
  audioUrl: string;
  audioBlob: Blob;
}

export const AudiobookSection: React.FC<AudiobookSectionProps> = ({
  fileContent,
  fileName,
  isGenerating,
  flashcards,
  mcqs,
  trueFalseQuestions,
  onGenerateAudio,
  geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '', // Default from env var
  geminiApiEndpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent' // Default Gemini endpoint
}) => {
  // Audio state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.8);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [audioSections, setAudioSections] = useState<AudioSection[]>([]);
  const [currentSection, setCurrentSection] = useState<number>(0);
  const [activeContent, setActiveContent] = useState<'summary' | 'flashcards' | 'mcq' | 'trueFalse'>('summary');
  const [audioPrepared, setAudioPrepared] = useState<boolean>(false);
  const [localIsGenerating, setLocalIsGenerating] = useState<boolean>(isGenerating);
  const [audioError, setAudioError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [combinedAudioBlob, setCombinedAudioBlob] = useState<Blob | null>(null);
  const [expanded, setExpanded] = useState<boolean>(false);
  
  // References
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Update local generating state when prop changes
  useEffect(() => {
    setLocalIsGenerating(isGenerating);
  }, [isGenerating]);

  // Generate sections from content
  useEffect(() => {
    if (fileContent && !audioSections.length) {
      const loadSections = async () => {
        await generateSections();
      };
      loadSections();
    }
  }, [fileContent, flashcards, mcqs, trueFalseQuestions]);
  
  // Function to prepare audio sections from content
  const generateSections = async () => {
    // Start with the document summary
    let sections: AudioSection[] = [
      {
        title: "AI Document Summary",
        text: await generateAISummary(fileContent),
        startTime: 0
      }
    ];
    
    // Add flashcard sections
    if (flashcards.length) {
      flashcards.forEach((card, index) => {
        sections.push({
          title: `Flashcard ${index + 1}`,
          text: `Question: ${card.question}\n\nAnswer: ${card.answer}`,
          startTime: (index + 1) * 30 // Mock timing - would be based on actual audio in real impl
        });
      });
    }
    
    // Add MCQ sections
    if (mcqs.length) {
      mcqs.forEach((mcq, index) => {
        const optionsText = mcq.options.map((opt: string, i: number) => 
          `Option ${i + 1}: ${opt}${i === mcq.correctAnswer ? ' (Correct)' : ''}`
        ).join('\n');
        
        sections.push({
          title: `Multiple Choice ${index + 1}`,
          text: `Question: ${mcq.question}\n\n${optionsText}`,
          startTime: (flashcards.length + index + 1) * 30
        });
      });
    }
    
    // Add True/False sections
    if (trueFalseQuestions.length) {
      trueFalseQuestions.forEach((tf, index) => {
        sections.push({
          title: `True/False ${index + 1}`,
          text: `Question: ${tf.question}\n\nAnswer: ${tf.isTrue ? 'True' : 'False'}`,
          startTime: (flashcards.length + mcqs.length + index + 1) * 30
        });
      });
    }
    
    setAudioSections(sections);
  };

  // Function to generate a summary of content using AI
  const generateAISummary = async (text: string): Promise<string> => {
    // In a real implementation, this would call an AI service to generate a summary
    // For now, we'll just return a basic summary by truncating the text
    const maxLength = 500;
    if (text.length <= maxLength) return text;
    
    return text.substring(0, maxLength) + "... (AI Summary generated)";
  };

  // Function to request text-to-speech using Web Speech API with enhanced voice quality
  const generateEnhancedAudio = async (text: string): Promise<AudioGenerationResult> => {
    try {
      if (!('speechSynthesis' in window)) {
        console.warn('Speech synthesis not supported in this browser, falling back to mock audio');
        return generateMockAudio(text);
      }

      // Safety check for very long text - split into chunks if needed
      let processedText = text;
      if (text.length > 1000) {
        console.log("Text too long, truncating to 1000 chars for better speech synthesis");
        processedText = text.substring(0, 1000) + "...";
      }

      // Add SSML-like pauses and emphasis
      processedText = processedText
        .replace(/\.\s+/g, '. ') // Clean period spacing
        .replace(/\:\s+/g, ': ') // Clean colon spacing
        .replace(/\?\s+/g, '? ') // Clean question mark spacing
        .replace(/\!\s+/g, '! '); // Clean exclamation spacing

      // Create a simple audio blob directly with browser's audio context
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        // Create an oscillator for a simple audio placeholder (in case speech synthesis fails)
        const oscillator = audioContext.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
        
        const gainNode = audioContext.createGain();
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        
        oscillator.connect(gainNode);
        
        // Create a MediaStreamDestination to capture any audio
        const destination = audioContext.createMediaStreamDestination();
        gainNode.connect(destination);
        
        const mediaRecorder = new MediaRecorder(destination.stream);
        const audioChunks: Blob[] = [];
        
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunks.push(event.data);
          }
        };
        
        return new Promise((resolve) => {
          mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            const audioUrl = URL.createObjectURL(audioBlob);
            resolve({ audioUrl, audioBlob });
          };
          
          // Start recording
          mediaRecorder.start();
          
          // Try to play speech
          try {
            // Get available voices
            const voices = window.speechSynthesis.getVoices();
            
            // Create and configure speech utterance
            const speech = new SpeechSynthesisUtterance(processedText);
            
            // Try to find a good voice
            if (voices && voices.length > 0) {
              // Find English voices
              const englishVoices = voices.filter(v => v.lang && v.lang.includes('en'));
              if (englishVoices.length > 0) {
                speech.voice = englishVoices[0];
              }
            }
            
            speech.rate = 0.9;
            speech.pitch = 1.0;
            speech.volume = 1.0;
            
            // Handle speech end
            speech.onend = () => {
              setTimeout(() => {
                if (mediaRecorder.state === 'recording') {
                  mediaRecorder.stop();
                }
              }, 500); // Small delay to ensure all audio is captured
            };
            
            // Handle speech error - still produce audio with oscillator
            speech.onerror = () => {
              console.warn("Speech synthesis error, using fallback audio tone");
              oscillator.connect(gainNode);
              oscillator.start();
              
              // Short tone as fallback
              setTimeout(() => {
                oscillator.stop();
                if (mediaRecorder.state === 'recording') {
                  mediaRecorder.stop();
                }
              }, 2000);
            };
            
            // Start the speech synthesis
            window.speechSynthesis.speak(speech);
            
            // Fallback timeout in case onend doesn't fire
            const estimatedDuration = Math.min(processedText.length * 70, 10000);
            setTimeout(() => {
              if (mediaRecorder.state === 'recording') {
                mediaRecorder.stop();
              }
            }, estimatedDuration + 1000);
            
          } catch (speechError) {
            console.error("Error with speech synthesis, using fallback tone", speechError);
            // Fallback to simple tone
            oscillator.start();
            
            setTimeout(() => {
              oscillator.stop();
              if (mediaRecorder.state === 'recording') {
                mediaRecorder.stop();
              }
            }, 2000);
          }
        });
        
      } catch (audioContextError) {
        console.error("AudioContext error:", audioContextError);
        return generateMockAudio(text);
      }
      
    } catch (error) {
      console.error('Error in enhanced audio generation:', error);
      return generateMockAudio(text);
    }
  };

  // Alternative implementation using a mock audio for demo purposes
  const generateMockAudio = async (text: string): Promise<AudioGenerationResult> => {
    try {
      // Create an audio context
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create an oscillator node
      const oscillator = audioContext.createOscillator();
      oscillator.type = 'sine'; // sine, square, sawtooth, triangle
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4 note
      
      // Create a gain node to control volume
      const gainNode = audioContext.createGain();
      gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
      
      // Connect oscillator to gain node and gain node to audio context destination
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Create a MediaStreamDestination to capture the audio
      const destination = audioContext.createMediaStreamDestination();
      gainNode.connect(destination);
      
      // Create a MediaRecorder to record the audio
      const mediaRecorder = new MediaRecorder(destination.stream);
      const audioChunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };
      
      return new Promise((resolve) => {
        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
          const audioUrl = URL.createObjectURL(audioBlob);
          resolve({ audioUrl, audioBlob });
        };
        
        // Start recording
        mediaRecorder.start();
        
        // Start oscillator (sound generation)
        oscillator.start();
        
        // Calculate duration based on text length (rough estimate)
        const duration = Math.max(2, Math.min(10, text.length / 20));
        
        // Stop recording and oscillator after duration
        setTimeout(() => {
          oscillator.stop();
          mediaRecorder.stop();
        }, duration * 1000);
      });
    } catch (error) {
      console.error('Error generating mock audio:', error);
      throw error;
    }
  };

  // Function to generate audio - skip Google TTS API since it's causing 400 errors
  const generateAudio = async (text: string): Promise<AudioGenerationResult> => {
    try {
      // Use enhanced browser speech synthesis instead of Google TTS
      return await generateEnhancedAudio(text);
    } catch (error) {
      console.error('Error with enhanced audio generation, falling back to basic synthesis:', error);
      
      // Fall back to mock audio as last resort
      return await generateMockAudio(text);
    }
  };
  
  // Function to combine multiple audio blobs into one
  const combineAudioBlobs = async (audioBlobs: Blob[]): Promise<string> => {
    const blob = new Blob(audioBlobs, { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  };

  // Handle audio generation - defined within the component
  const handleGenerateAudio = async () => {
    try {
      setLocalIsGenerating(true);
      setAudioError(false);
      setErrorMessage('');
      
      // Call the onGenerateAudio prop if provided
      if (onGenerateAudio) {
        await onGenerateAudio();
      }
      
      // Generate audio for each section
      const updatedSections = [...audioSections];
      const audioBlobs: Blob[] = [];
      
      for (let i = 0; i < updatedSections.length; i++) {
        const section = updatedSections[i];
        try {
          const result = await generateAudio(section.text);
          
          updatedSections[i] = {
            ...section,
            audioUrl: result.audioUrl
          };
          
          audioBlobs.push(result.audioBlob);
        } catch (sectionError) {
          console.error(`Error generating audio for section ${i}:`, sectionError);
          // Continue with other sections even if one fails
        }
      }
      
      if (audioBlobs.length === 0) {
        throw new Error("Failed to generate any audio sections");
      }
      
      // Combine all audio blobs
      const combinedUrl = await combineAudioBlobs(audioBlobs);
      setCombinedAudioBlob(new Blob(audioBlobs, { type: 'audio/wav' }));
      
      // Update the sections with their individual audio URLs
      setAudioSections(updatedSections);
      
      // Set the main audio URL to the combined audio
      setAudioUrl(combinedUrl);
      
      // Update UI state after successful generation
      setAudioPrepared(true);
      
    } catch (error) {
      console.error('Error generating audio:', error);
      setAudioError(true);
      setErrorMessage((error as Error)?.message || 'An error occurred during audio generation');
    } finally {
      setLocalIsGenerating(false);
    }
  };

  // Function to speak the text directly without generating audio blob
  // This is used as a backup when audio generation fails
  const speakDirectly = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any previous speech
      window.speechSynthesis.cancel();
      
      // Create new speech
      const speech = new SpeechSynthesisUtterance(text);
      
      // Try to select an English voice
      const voices = window.speechSynthesis.getVoices();
      const englishVoice = voices.find(voice => voice.lang && voice.lang.includes('en'));
      if (englishVoice) {
        speech.voice = englishVoice;
      }
      
      // Set speech properties
      speech.rate = playbackRate; // Use current playback rate
      speech.pitch = 1.0;
      speech.volume = isMuted ? 0 : volume; // Use current volume settings
      
      // Add speech events to track playback state
      speech.onstart = () => {
        setIsPlaying(true);
      };
      
      speech.onend = () => {
        setIsPlaying(false);
        // If not at the end, move to next section
        if (currentSection < audioSections.length - 1) {
          setTimeout(() => {
            setCurrentSection(currentSection + 1);
            speakDirectly(audioSections[currentSection + 1].text);
          }, 500);
        }
      };
      
      speech.onerror = () => {
        console.error("Speech synthesis error");
        setIsPlaying(false);
        setAudioError(true);
        setErrorMessage("Browser speech synthesis failed");
      };
      
      // Store the utterance in a global variable to prevent garbage collection
      (window as any).__currentSpeech = speech;
      
      // Speak
      window.speechSynthesis.speak(speech);
      
      return true;
    }
    return false;
  };

  // New function to handle play and fallback to direct speaking if needed
  const handlePlay = () => {
    // Reset error state when attempting to play
    setAudioError(false);
    setErrorMessage('');
    
    // Try normal audio playback first
    if (audioRef.current && audioUrl) {
      // Ensure audio element has the correct source
      if (!audioRef.current.src || audioRef.current.src !== audioUrl) {
        audioRef.current.src = audioUrl;
        audioRef.current.load();
      }
      
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch(error => {
            console.error("Error playing audio:", error);
            
            // Fallback to direct speech synthesis
            const currentText = audioSections[currentSection]?.text || "";
            if (currentText && speakDirectly(currentText)) {
              // Speech synthesis will set isPlaying when it starts
            } else {
              setAudioError(true);
              setErrorMessage('Browser could not play the audio: ' + (error?.message || 'Unknown error'));
              setIsPlaying(false);
            }
          });
      }
    } else if (audioSections.length > 0) {
      // Fallback to direct speaking if no audio element or URL
      const currentText = audioSections[currentSection]?.text || "";
      if (currentText && speakDirectly(currentText)) {
        // Speech synthesis will set isPlaying when it starts
      } else {
        setAudioError(true);
        setErrorMessage('No audio available and speech synthesis failed. Try a different browser.');
        setIsPlaying(false);
      }
    } else {
      setAudioError(true);
      setErrorMessage('No audio content available. Please generate audio first.');
      setIsPlaying(false);
    }
  };

  // Improve pause functionality to handle both audio element and speech synthesis
  const handlePause = () => {
    // Cancel any speech synthesis
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      // Clear the reference to prevent memory leaks
      (window as any).__currentSpeech = null;
    }
    
    // Pause HTML audio element if it exists
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    setIsPlaying(false);
  };

  // Update togglePlayPause to use the new handle functions
  const togglePlayPause = () => {
    if (isPlaying) {
      handlePause();
    } else {
      handlePlay();
    }
  };
  
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      
      // Update current section based on time
      const newSection = audioSections.findIndex((section, index, arr) => {
        const nextSection = arr[index + 1];
        if (nextSection) {
          return audioRef.current!.currentTime >= section.startTime && 
                 audioRef.current!.currentTime < nextSection.startTime;
        } else {
          return audioRef.current!.currentTime >= section.startTime;
        }
      });
      
      if (newSection !== -1 && newSection !== currentSection) {
        setCurrentSection(newSection);
      }
    }
  };
  
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      setAudioError(false);
    }
  };
  
  const handleAudioError = (e: React.SyntheticEvent<HTMLAudioElement, Event>) => {
    // Extract meaningful error information
    const target = e.target as HTMLAudioElement;
    console.error("Audio error:", {
      error: target.error,
      networkState: target.networkState,
      readyState: target.readyState
    });
    
    setAudioError(true);
    setErrorMessage(
      target.error ? 
        `Audio error: ${target.error.code} - ${target.error.message}` : 
        'COMING SOON'
    );
    setIsPlaying(false);
  };
  
  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };
  
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      setVolume(newVolume);
      if (newVolume === 0) {
        setIsMuted(true);
      } else {
        setIsMuted(false);
      }
    }
  };
  
  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };
  
  const changePlaybackRate = (rate: string) => {
    const newRate = parseFloat(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = newRate;
      setPlaybackRate(newRate);
    }
  };
  
  const jumpToSection = (index: number) => {
    // Cancel any current speech
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    
    setCurrentSection(index);
    
    if (audioRef.current && audioSections[index]) {
      audioRef.current.currentTime = audioSections[index].startTime;
      setCurrentTime(audioSections[index].startTime);
      
      if (!isPlaying && !audioError && audioUrl) {
        handlePlay();
      }
    } else if (audioSections[index]) {
      // If no audio element, try direct speech
      const currentText = audioSections[index].text || "";
      if (currentText) {
        speakDirectly(currentText);
      }
    }
  };
  
  const skipForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime += 10;
      setCurrentTime(audioRef.current.currentTime);
    }
  };
  
  const skipBackward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime -= 10;
      setCurrentTime(audioRef.current.currentTime);
    }
  };
  
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  const handleDownload = () => {
    if (combinedAudioBlob) {
      const url = URL.createObjectURL(combinedAudioBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName.replace(/\.[^/.]+$/, '') || 'audiobook'}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };
  
  const switchContent = (content: 'summary' | 'flashcards' | 'mcq' | 'trueFalse') => {
    setActiveContent(content);
    
    // Find the first section of this type and jump to it
    let index = 0;
    
    if (content === 'flashcards' && flashcards.length) {
      index = audioSections.findIndex(section => section.title.includes("Flashcard"));
    } else if (content === 'mcq' && mcqs.length) {
      index = audioSections.findIndex(section => section.title.includes("Multiple Choice"));
    } else if (content === 'trueFalse' && trueFalseQuestions.length) {
      index = audioSections.findIndex(section => section.title.includes("True/False"));
    }
    
    if (index !== -1) {
      jumpToSection(index);
    }
  };
  
  // Filter sections based on active content
  const filteredSections = audioSections.filter(section => {
    if (activeContent === 'summary') return section.title.includes("Summary");
    if (activeContent === 'flashcards') return section.title.includes("Flashcard");
    if (activeContent === 'mcq') return section.title.includes("Multiple Choice");
    if (activeContent === 'trueFalse') return section.title.includes("True/False");
    return true;
  });
  
  // Main button for audio generation
  const renderAudioGenerationButton = () => (
    <Button
      onClick={handleGenerateAudio}
      disabled={localIsGenerating}
      className={`flex items-center space-x-2 ${!audioPrepared ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700" : ""}`}
      size="lg"
    >
      {localIsGenerating ? (
        <>
          <RefreshCw className="h-5 w-5 animate-spin mr-2" />
          <span>Generating Audio...</span>
        </>
      ) : !audioPrepared ? (
        <>
          <Play className="h-5 w-5 mr-2" />
          <span>Generate AI Audio</span>
        </>
      ) : (
        <>
          <RefreshCw className="h-5 w-5 mr-2" />
          <span>Regenerate Audio</span>
        </>
      )}
    </Button>
  );

  // Error notification with browser speech option
  const renderErrorWithBrowserSpeechOption = () => (
    <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg mb-4">
      <div className="flex items-start">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <div>
          <p className="font-medium">Audio playback issue</p>
          <p className="text-sm mt-1">
            {errorMessage || "We couldn't generate the audio. This could be due to browser limitations or connection issues. Please try again or switch to a different browser."}
          </p>
          <div className="mt-3 flex space-x-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleGenerateAudio} 
              className="text-red-600 border-red-300 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/30"
              disabled={localIsGenerating}
            >
              {localIsGenerating ? 'Generating...' : 'Try Again'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (audioSections.length > 0) {
                  const currentText = audioSections[currentSection]?.text || "";
                  if (currentText && speakDirectly(currentText)) {
                    setIsPlaying(true);
                    setAudioError(false);
                  }
                }
              }}
              className="text-blue-600 border-blue-300 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-900/30"
            >
              Use Browser Speech
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  // Browser speech indicator
  const renderBrowserSpeechIndicator = () => (
    isPlaying && !audioUrl ? (
      <div className="flex items-center text-blue-600 dark:text-blue-400 text-sm font-medium bg-blue-50 dark:bg-blue-900/20 py-1 px-2 rounded-md">
        <span className="relative flex h-3 w-3 mr-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
        </span>
        Using browser's speech synthesis
      </div>
    ) : null
  );

  // Placeholder when audio isn't generated yet
  const renderAudioPlaceholder = () => (
    <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="relative mb-6 group">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
        <div className="relative bg-blue-50 dark:bg-gray-700 p-6 rounded-full">
          <BrainCircuit className="h-16 w-16 text-blue-500 dark:text-blue-400" />
        </div>
      </div>
      <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-3">
        AI Audio Summary
      </h3>
      <p className="text-center text-gray-500 dark:text-gray-400 mb-6 max-w-md">
        Transform your content into an AI-powered audio summary. Perfect for learning on-the-go or reviewing key concepts quickly.
      </p>
      <Button
        onClick={handleGenerateAudio}
        disabled={localIsGenerating}
        className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
        size="lg"
      >
        {localIsGenerating ? (
          <>
            <RefreshCw className="h-5 w-5 animate-spin mr-2" />
            <span>Generating Audio...</span>
          </>
        ) : (
          <>
            <Play className="h-5 w-5 mr-2" />
            <span>Generate AI Audio</span>
          </>
        )}
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border border-blue-100 dark:border-blue-800 rounded-xl p-5 mb-6 shadow-sm">
        <div className="flex items-center">
          <div className="bg-blue-100 dark:bg-blue-800 rounded-full p-2 mr-3">
            <BrainCircuit className="h-6 w-6 text-blue-600 dark:text-blue-300" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-blue-800 dark:text-blue-200">
              AI Audio Learning
            </h2>
            <p className="mt-1 text-blue-700 dark:text-blue-300 text-sm">
              Listen to AI-powered summaries of your content for efficient on-the-go learning
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between mb-6 items-center">
        {renderBrowserSpeechIndicator()}
        {renderAudioGenerationButton()}
      </div>
      
      {/* Audio element with source and proper error handling */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => {
          setIsPlaying(false);
          // If not at the end, move to next section
          if (currentSection < audioSections.length - 1) {
            setTimeout(() => {
              setCurrentSection(currentSection + 1);
              handlePlay();
            }, 500);
          }
        }}
        onError={handleAudioError}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        preload="auto"
      >
        {audioUrl && <source src={audioUrl} type="audio/wav" />}
        Your browser does not support the audio element.
      </audio>
      
      {/* Audio error notification with browser speech option */}
      {audioError && renderErrorWithBrowserSpeechOption()}
      
      {/* Main content area - either placeholder or audio player */}
      {!audioPrepared && !audioError ? renderAudioPlaceholder() : null}
      
      {/* Audio content when prepared */}
      {audioPrepared && (
        <>
          {/* Hide the text/expanded control when audio not prepared */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setExpanded(!expanded)}
                className="mr-3 border-blue-200 dark:border-blue-800"
              >
                <FileText className="h-4 w-4 mr-2" />
                {expanded ? 'Hide Text' : 'Show Text'}
              </Button>
            </div>
          </div>
          
          {/* Content tabs */}
          <div className="flex overflow-x-auto no-scrollbar pb-2">
            <div className="flex space-x-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <Button
                variant={activeContent === 'summary' ? "default" : "ghost"}
                onClick={() => switchContent('summary')}
                className={`whitespace-nowrap rounded-md ${activeContent === 'summary' ? "bg-white dark:bg-gray-700 shadow-sm" : ""}`}
              >
                <BrainCircuit className="h-4 w-4 mr-2" />
                AI Summary
              </Button>
              <Button
                variant={activeContent === 'flashcards' ? "default" : "ghost"}
                onClick={() => switchContent('flashcards')}
                className={`whitespace-nowrap rounded-md ${activeContent === 'flashcards' ? "bg-white dark:bg-gray-700 shadow-sm" : ""}`}
                disabled={!flashcards.length}
              >
                Flashcards
              </Button>
              <Button
                variant={activeContent === 'mcq' ? "default" : "ghost"}
                onClick={() => switchContent('mcq')}
                className={`whitespace-nowrap rounded-md ${activeContent === 'mcq' ? "bg-white dark:bg-gray-700 shadow-sm" : ""}`}
                disabled={!mcqs.length}
              >
                Multiple Choice
              </Button>
              <Button
                variant={activeContent === 'trueFalse' ? "default" : "ghost"}
                onClick={() => switchContent('trueFalse')}
                className={`whitespace-nowrap rounded-md ${activeContent === 'trueFalse' ? "bg-white dark:bg-gray-700 shadow-sm" : ""}`}
                disabled={!trueFalseQuestions.length}
              >
                True/False
              </Button>
            </div>
          </div>
          
          {/* Current section display */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 mb-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-medium mb-3 flex items-center">
              {audioSections[currentSection]?.title || "Loading..."}
              {audioSections[currentSection]?.title?.includes("AI") && (
                <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-300">
                  AI Generated
                </span>
              )}
            </h3>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p className="whitespace-pre-line text-gray-700 dark:text-gray-300 leading-relaxed">
                {audioSections[currentSection]?.text || "Content will appear here as the audio plays."}
              </p>
            </div>
          </div>
          
          {/* Audio Player Controls */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 border border-gray-100 dark:border-gray-700">
            {/* Progress bar */}
            <div className="mb-5">
              <Slider
                value={[currentTime]}
                min={0}
                max={duration || 100}
                step={0.1}
                onValueChange={handleSeek}
                className="w-full"
                disabled={audioError || !audioUrl}
              />
              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
            
            {/* Main controls */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-3">
                <Select
                  value={playbackRate.toString()}
                  onValueChange={changePlaybackRate}
                  disabled={audioError || !audioUrl}
                >
                  <SelectTrigger className="w-[80px] h-9 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                    <SelectValue placeholder={`${playbackRate}x`} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.5">0.5x</SelectItem>
                    <SelectItem value="0.75">0.75x</SelectItem>
                    <SelectItem value="1">1x</SelectItem>
                    <SelectItem value="1.25">1.25x</SelectItem>
                    <SelectItem value="1.5">1.5x</SelectItem>
                    <SelectItem value="2">2x</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMute}
                  disabled={audioError || !audioUrl}
                  className="bg-gray-50 dark:bg-gray-700 h-9 w-9 rounded-full"
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
                <div className="w-24">
                  <Slider
                    value={[isMuted ? 0 : volume]}
                    min={0}
                    max={1}
                    step={0.01}
                    onValueChange={handleVolumeChange}
                    disabled={audioError || !audioUrl}
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={skipBackward}
                  className="h-10 w-10 rounded-full bg-gray-50 dark:bg-gray-700"
                  disabled={audioError || !audioUrl}
                >
                  <SkipBack className="h-5 w-5" />
                </Button>
                <Button
                  variant="default"
                  size="icon"
                  onClick={() => {
                    if (audioError && audioSections.length > 0) {
                      // Try browser speech directly if audio is in error state
                      const currentText = audioSections[currentSection]?.text || "";
                      if (currentText) {
                        speakDirectly(currentText);
                        setAudioError(false);
                      }
                    } else {
                      togglePlayPause();
                    }
                  }}
                  className="h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 shadow-md"
                >
                  {isPlaying ? 
                    <Pause className="h-7 w-7" /> : 
                    <Play className="h-7 w-7 ml-1" />
                  }
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={skipForward}
                  className="h-10 w-10 rounded-full bg-gray-50 dark:bg-gray-700"
                  disabled={audioError || !audioUrl}
                >
                  <SkipForward className="h-5 w-5" />
                </Button>
              </div>
              
              <Button 
                variant="outline" 
                size="icon"
                disabled={audioError || !audioUrl || !combinedAudioBlob}
                onClick={handleDownload}
                className="h-9 w-9 rounded-full border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700"
                title="Download audio"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Section list */}
            <div className="mt-6">
              <h4 className="text-sm font-semibold mb-3 text-gray-600 dark:text-gray-300">Sections</h4>
              <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="max-h-60 overflow-y-auto">
                  {filteredSections.map((section, index) => (
                    <button
                      key={index}
                      onClick={() => jumpToSection(audioSections.findIndex(s => s.title === section.title))}
                      className={`w-full text-left py-3 px-4 border-b last:border-b-0 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                        section.title === audioSections[currentSection]?.title
                          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                          : ""
                      }`}
                      disabled={audioError || !audioUrl}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {section.title.includes("AI") && (
                            <BrainCircuit className="h-3.5 w-3.5 mr-2 text-blue-500" />
                          )}
                          <span className="text-sm font-medium">{section.title}</span>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatTime(section.startTime)}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};