'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { AlertCircle, ArrowLeft, CheckCircle, Upload } from 'lucide-react';
import { auth } from '@/lib/firebaseConfig';

export default function CreateQuiz() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDescription, setQuizDescription] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isQuizGenerated, setIsQuizGenerated] = useState(false);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  // Setup network status detection
  useEffect(() => {
    // Initial check
    setIsOffline(!navigator.onLine);
    
    // Listen for online/offline status
    const handleOnline = () => {
      setIsOffline(false);
      toast.success("You're back online!");
    };
    
    const handleOffline = () => {
      setIsOffline(true);
      toast.warning("You're offline. Some features may be limited.");
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Mock class data
  const classes = [
    { id: 'class-a', name: 'Class A', studentCount: 25 },
    { id: 'class-b', name: 'Class B', studentCount: 30 },
    { id: 'class-c', name: 'Class C', studentCount: 22 },
    { id: 'class-d', name: 'Class D', studentCount: 28 }
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!uploadedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    setIsUploading(true);
    
    // Show offline warning if applicable
    if (isOffline) {
      toast.warning("You are currently offline. Changes will be synchronized when back online.");
    }
    
    // Simulate upload process
    setTimeout(() => {
      setIsUploading(false);
      toast.success('Document uploaded successfully!');
      setIsGenerating(true);
      
      // Simulate quiz generation process
      setTimeout(() => {
        setIsGenerating(false);
        setIsQuizGenerated(true);
        toast.success('Quiz generated successfully!');
        setStep(2);
      }, 2000);
    }, 1500);
  };

  const handleClassSelection = (classId: string) => {
    setSelectedClasses(prev => 
      prev.includes(classId) 
        ? prev.filter(id => id !== classId) 
        : [...prev, classId]
    );
  };

  const handleSend = () => {
    if (selectedClasses.length === 0) {
      toast.error('Please select at least one class');
      return;
    }

    setIsSending(true);
    
    // Show offline warning if applicable
    if (isOffline) {
      toast.warning("You are currently offline. The quiz will be sent when you're back online.");
    }
    
    // Simulate sending process
    setTimeout(() => {
      setIsSending(false);
      setSent(true);
      setStep(3);
      
      const classNames = selectedClasses.map(id => 
        classes.find(c => c.id === id)?.name
      ).join(', ');
      
      toast.success(`Quiz sent successfully to ${classNames}!`);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {isOffline && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded dark:bg-yellow-900/20 dark:border-yellow-600">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              You are currently offline. The app will continue to work, and changes will be synchronized when you're back online.
            </p>
          </div>
        </div>
      )}
    
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Quizzes
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Create New Quiz</h1>
        <div className="w-[100px]"></div> {/* Spacer for alignment */}
      </div>

      {/* Step indicator */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center">
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
            1
          </div>
          <div className={`w-16 h-1 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
            2
          </div>
          <div className={`w-16 h-1 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
            3
          </div>
        </div>
      </div>

      {step === 1 && (
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Quiz Details & Document Upload</CardTitle>
            <CardDescription>
              Provide basic quiz information and upload a document to generate your quiz
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Quiz Title</Label>
              <Input 
                id="title" 
                placeholder="Enter quiz title" 
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                placeholder="Enter quiz description" 
                rows={3}
                value={quizDescription}
                onChange={(e) => setQuizDescription(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="document">Upload Document</Label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                {uploadedFile ? (
                  <div className="flex items-center justify-center flex-col">
                    <CheckCircle className="h-10 w-10 text-green-500 mb-2" />
                    <p className="text-sm font-medium">{uploadedFile.name}</p>
                    <p className="text-xs text-gray-500">
                      {(uploadedFile.size / 1024).toFixed(2)} KB
                    </p>
                    <Button 
                      variant="ghost" 
                      className="mt-2 text-red-500"
                      onClick={() => setUploadedFile(null)}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center flex-col">
                    <Upload className="h-10 w-10 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Drag & drop your document here, or click to browse
                    </p>
                    <Input
                      id="document"
                      type="file"
                      className="mt-2 cursor-pointer"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.txt"
                    />
                  </div>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full"
              onClick={handleUpload}
              disabled={!quizTitle || !uploadedFile || isUploading || isGenerating}
            >
              {isUploading ? (
                <>
                  <div className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Uploading...
                </>
              ) : isGenerating ? (
                <>
                  <div className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Generating Quiz...
                </>
              ) : isQuizGenerated ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Quiz Generated - Continue
                </>
              ) : (
                'Upload & Generate Quiz'
              )}
            </Button>
          </CardFooter>
        </Card>
      )}

      {step === 2 && (
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Quiz Generated Successfully</CardTitle>
            <CardDescription>
              Your quiz "{quizTitle}" has been generated. Select classes to send it to.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg border p-4 bg-green-50 dark:bg-green-900/20">
              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 mr-3 mt-0.5" />
                <div>
                  <h3 className="font-medium text-green-600 dark:text-green-400">Quiz Generated Successfully</h3>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                    Your quiz "{quizTitle}" was created from the document {uploadedFile?.name}.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Select classes to send the quiz to:</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                {classes.map((classItem) => (
                  <div 
                    key={classItem.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedClasses.includes(classItem.id)
                        ? 'bg-blue-50 border-blue-300 dark:bg-blue-900/20 dark:border-blue-700'
                        : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                    onClick={() => handleClassSelection(classItem.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{classItem.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {classItem.studentCount} students
                        </p>
                      </div>
                      <Checkbox 
                        checked={selectedClasses.includes(classItem.id)}
                        onCheckedChange={() => handleClassSelection(classItem.id)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setStep(1)}
            >
              Back
            </Button>
            <Button
              onClick={handleSend}
              disabled={selectedClasses.length === 0 || isSending}
            >
              {isSending ? (
                <>
                  <div className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Sending...
                </>
              ) : (
                'Send Quiz to Selected Classes'
              )}
            </Button>
          </CardFooter>
        </Card>
      )}

      {step === 3 && (
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Quiz Sent Successfully</CardTitle>
            <CardDescription>
              Your quiz has been sent to the selected classes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg border p-6 bg-green-50 dark:bg-green-900/20 text-center">
              <CheckCircle className="h-16 w-16 text-green-600 dark:text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-green-600 dark:text-green-400">
                Quiz Distribution Complete
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300 mt-2 max-w-md mx-auto">
                Your quiz "{quizTitle}" has been successfully sent to {selectedClasses.length} classes.
                Students will receive an email notification with access to the quiz.
              </p>

              <div className="mt-6 space-y-2">
                <h4 className="font-medium">Classes Notified:</h4>
                <ul className="text-sm">
                  {selectedClasses.map(id => {
                    const classItem = classes.find(c => c.id === id);
                    return (
                      <li key={id} className="flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mr-2" />
                        {classItem?.name} ({classItem?.studentCount} students)
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => router.push('/admin/dashboard/quizzes')}
            >
              Back to Quizzes
            </Button>
            <Button
              onClick={() => {
                setStep(1);
                setQuizTitle('');
                setQuizDescription('');
                setUploadedFile(null);
                setIsQuizGenerated(false);
                setSelectedClasses([]);
                setSent(false);
              }}
            >
              Create Another Quiz
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
} 