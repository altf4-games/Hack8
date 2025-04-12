"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

export const AuthDebugger = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [authState, setAuthState] = useState<any>(null);
  
  const checkAuthState = () => {
    try {
      const auth = getAuth();
      
      onAuthStateChanged(auth, (user) => {
        if (user) {
          setAuthState({
            uid: user.uid,
            email: user.email,
            phoneNumber: user.phoneNumber,
            emailVerified: user.emailVerified,
            isAnonymous: user.isAnonymous,
            displayName: user.displayName,
            providerId: user.providerId,
            providerData: user.providerData,
          });
          
          toast.success("Auth State Retrieved", {
            description: `Logged in as: ${user.email || user.phoneNumber || "Unknown user"}`
          });
        } else {
          setAuthState(null);
          toast.info("Not Logged In", {
            description: "No user is currently logged in"
          });
        }
      });
    } catch (error) {
      console.error("Auth check error:", error);
      toast.error("Auth Check Failed", {
        description: "Could not verify authentication state"
      });
    }
  };
  
  const checkFirebaseConfig = () => {
    try {
      // Check if Firebase API Key is set
      const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
      const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
      const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
      
      if (!apiKey || !authDomain || !projectId) {
        toast.error("Firebase Config Issue", {
          description: "Some Firebase environment variables are missing"
        });
        return;
      }
      
      toast.success("Firebase Config Valid", {
        description: "Required environment variables are set"
      });
    } catch (error) {
      console.error("Config check error:", error);
      toast.error("Config Check Failed", {
        description: "Could not verify Firebase configuration"
      });
    }
  };

  if (!isOpen) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        className="fixed bottom-4 right-4 bg-white/80 text-gray-700 z-50"
        onClick={() => setIsOpen(true)}
      >
        Debug Auth
      </Button>
    );
  }
  
  return (
    <div className="fixed bottom-4 right-4 p-4 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-80">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium">Auth Debugger</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setIsOpen(false)}
        >
          Close
        </Button>
      </div>
      
      <div className="space-y-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={checkAuthState}
        >
          Check Auth State
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={checkFirebaseConfig}
        >
          Check Firebase Config
        </Button>
      </div>
      
      {authState && (
        <div className="mt-4 p-2 bg-gray-50 rounded text-xs overflow-auto max-h-40">
          <pre>{JSON.stringify(authState, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default AuthDebugger; 