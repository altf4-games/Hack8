"use client";

import { useRef, useState, useEffect } from "react";
import axios from "axios";
import { Camera, FlipHorizontal } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function SignLanguageSection() {
  const [facing, setFacing] = useState<"user" | "environment">("user");
  const [permission, setPermission] = useState<boolean>(false);
  const [image, setImage] = useState<string>("");
  const [label, setLabel] = useState<string>("");
  const [isPredictingNumbers, setIsPredictingNumbers] = useState<boolean>(true);
  const [timer, setTimer] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Request camera permission
  const requestPermission = async () => {
    try {
      const constraints = {
        video: { facingMode: facing }
      };
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      setPermission(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      setPermission(false);
    }
  };

  // Switch camera facing mode
  const toggleFacing = () => {
    const newFacing = facing === "user" ? "environment" : "user";
    setFacing(newFacing);
    
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      requestPermission();
    }
  };

  // Initialize camera on component mount
  useEffect(() => {
    requestPermission();
    
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Take picture function
  const takePicture = async () => {
    setTimer(3); // Set timer to 3 seconds
    
    const countdown = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(countdown);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Wait for the countdown
    await new Promise((resolve) => setTimeout(resolve, 3000));

    try {
      if (videoRef.current && canvasRef.current) {
        const context = canvasRef.current.getContext("2d");
        if (context) {
          canvasRef.current.width = videoRef.current.videoWidth;
          canvasRef.current.height = videoRef.current.videoHeight;
          
          context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
          
          // For front camera when not predicting numbers, flip horizontally
          if (facing === "user" && !isPredictingNumbers) {
            context.translate(canvasRef.current.width, 0);
            context.scale(-1, 1);
            context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
          }

          const imageDataUrl = canvasRef.current.toDataURL('image/jpeg');
          setImage(imageDataUrl);
          sendImageToBackend(imageDataUrl);
        }
      }
    } catch (error) {
      console.error("Error taking picture:", error);
    }
  };

  // Send image to backend for prediction
  const sendImageToBackend = async (imageDataUrl: string) => {
    try {
      setIsLoading(true);

      // Convert base64 to blob
      const response = await fetch(imageDataUrl);
      const blob = await response.blob();
      
      const formData = new FormData();
      formData.append('file', blob, 'uploaded-file.jpg');

      const endpoint = isPredictingNumbers
        ? 'https://milan-app-api.onrender.com/predict/nums'
        : 'https://milan-app-api.onrender.com/predict/alpha';

      console.log('Sending to:', endpoint);

      const backendResponse = await axios.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setLabel(backendResponse.data.label || 'No label detected');
      console.log('Response:', backendResponse.data);
    } catch (error: any) {
      console.error('Error sending image to backend:', error.message);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      alert(`Failed to send image: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
                <div className="mb-8">
        <h2 className="text-2xl font-bold">Sign Language</h2>
        <p className="text-gray-500 mt-2">
          Learn to communicate through sign language and connect with the deaf community
        </p>
      </div>

      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Note</AlertTitle>
        <AlertDescription>
          This section would display real sign language courses from our database. The content below is a placeholder
          for the UI.
        </AlertDescription>
      </Alert>

      <h3 className="text-xl font-semibold mb-6">Sign Language Detection</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="flex flex-col">
          {/* Camera Section */}
          <div className="relative bg-black rounded-lg overflow-hidden aspect-video mb-4">
            {!permission ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 text-center p-4">
                <p className="text-gray-700 mb-4">We need your permission to access the camera</p>
                <Button onClick={requestPermission}>Grant Permission</Button>
              </div>
            ) : (
              <>
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="w-full h-full object-cover"
                  style={{ transform: facing === "user" ? "scaleX(-1)" : "none" }}
                />
                <canvas ref={canvasRef} className="hidden" />
                
                {timer > 0 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="text-white text-7xl font-bold">{timer}</span>
                  </div>
                )}
                
                <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                  <Button 
                    onClick={takePicture}
                    className="bg-green-600 hover:bg-green-700 text-white rounded-full px-6 py-3"
                  >
                    <Camera className="mr-2 h-5 w-5" />
                    Capture
                  </Button>
                </div>
                
                <Button
                  onClick={toggleFacing}
                  className="absolute top-4 right-4 bg-gray-800/70 hover:bg-gray-800 text-white rounded-full p-2"
                  size="icon"
                >
                  <FlipHorizontal className="h-5 w-5" />
                </Button>
              </>
            )}
          </div>
          
          {/* Detection Type Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-4">
            <span className={`${!isPredictingNumbers ? "font-medium" : "text-gray-500"}`}>
              Detect Alphabets
            </span>
            <Switch
              checked={isPredictingNumbers}
              onCheckedChange={() => setIsPredictingNumbers(prev => !prev)}
            />
            <span className={`${isPredictingNumbers ? "font-medium" : "text-gray-500"}`}>
              Detect Numbers
            </span>
          </div>
        </div>
        
        <div className="flex flex-col">
          {/* Result Section */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 h-full flex flex-col">
            <h4 className="text-lg font-medium mb-4">Recognition Result</h4>
            
            {image ? (
              <div className="mb-4 flex justify-center">
                <img 
                  src={image} 
                  alt="Captured sign" 
                  className="max-h-48 rounded-lg border border-gray-200"
                />
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500 mb-4">
                <p>Captured image will appear here</p>
              </div>
            )}
            
            <div className="text-center">
              {isLoading ? (
                <p className="text-blue-600 font-medium">Processing...</p>
              ) : label ? (
                <div>
                  <p className="text-gray-700 mb-1">Detected:</p>
                  <p className="text-2xl font-bold text-green-600">{label}</p>
                </div>
              ) : (
                <p className="text-gray-500">No detection yet</p>
              )}
            </div>
          </div>
        </div>
          </div>


      <h3 className="text-xl font-semibold mb-6">Sign Language Learning Resources</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <Card className="bg-gray-50 border-dashed flex flex-col justify-center items-center p-8 h-80">
          <div className="text-center">
            <h3 className="text-xl font-medium mb-2">Sign Language Courses</h3>
            <p className="text-gray-500 mb-6">Coming Soon</p>
            <Button variant="outline">Browse Courses</Button>
          </div>
        </Card>
        
        {/* Sign Language Video Card 1 */}
        <Card className="overflow-hidden">
          <div className="aspect-video bg-gray-100 flex justify-center items-center">
            <iframe 
              className="w-full h-full"
              src="https://drive.google.com/file/d/1-LgOoUhc3MwcHtHcSsWC4EeOzzSSwufY/preview" 
              allow="autoplay; encrypted-media"
              title="Sign Language Video 1"
            ></iframe>
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-lg">Alphabets in ISL</h3>
            <p className="text-gray-500 text-sm mt-1">Learn alphabets in Indian Sign Language.</p>
          </div>
        </Card>
        
        {/* Sign Language Video Card 2 */}
        <Card className="overflow-hidden">
          <div className="aspect-video bg-gray-100 flex justify-center items-center">
            <iframe 
              className="w-full h-full"
              src="https://drive.google.com/file/d/1WJWk196Hv8t1Tz55jsOOhnTU4tdEby-c/preview" 
              allow="autoplay; encrypted-media"
              title="Sign Language Video 2"
            ></iframe>
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-lg">Numbers in ISL</h3>
            <p className="text-gray-500 text-sm mt-1">Learn to count from 1-9 using Indian Sign Language</p>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default SignLanguageSection;