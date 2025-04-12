'use client';

import { useState, useEffect, useRef } from 'react';
import { auth } from '@/lib/firebaseConfig';
import { 
  createUserWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup,
  PhoneAuthProvider,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  ConfirmationResult,
  sendEmailVerification
} from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { FcGoogle } from 'react-icons/fc';
import { FaPhone } from 'react-icons/fa';
import { CountryCodeSelector } from '@/components/ui/country-code-selector';

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [otp, setOtp] = useState('');
  const [verificationId, setVerificationId] = useState<ConfirmationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);
  const [activeTab, setActiveTab] = useState('email');
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let verifier: RecaptchaVerifier | null = null;

    // Only initialize reCAPTCHA when phone tab is active
    if (activeTab === 'phone' && recaptchaContainerRef.current && !recaptchaVerifier) {
      try {
        verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'normal',
          callback: () => {
            // reCAPTCHA solved
          }
        });
        setRecaptchaVerifier(verifier);
      } catch (error) {
        console.error('Error initializing reCAPTCHA:', error);
        toast.error('Failed to initialize reCAPTCHA. Please refresh the page.');
      }
    }

    // Cleanup on unmount or tab change
    return () => {
      if (verifier) {
        try {
          verifier.clear();
        } catch (error) {
          console.error('Error clearing reCAPTCHA:', error);
        }
      }
      setRecaptchaVerifier(null);
    };
  }, [activeTab]);

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user);
      toast.success('Account created! Please check your email to verify your account.');
      router.push('/login');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast.success('Signed in with Google successfully!');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recaptchaVerifier) {
      toast.error('reCAPTCHA not initialized. Please refresh the page.');
      return;
    }
    
    setIsLoading(true);
    try {
      const formattedPhoneNumber = `${countryCode}${phoneNumber}`;
      const confirmationResult = await signInWithPhoneNumber(auth, formattedPhoneNumber, recaptchaVerifier);
      setVerificationId(confirmationResult);
      toast.success('OTP sent successfully!');
    } catch (error: any) {
      toast.error(error.message);
      // Reset reCAPTCHA on error
      recaptchaVerifier.clear();
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationId) return;
    
    setIsLoading(true);
    try {
      await verificationId.confirm(otp);
      toast.success('Phone number verified successfully!');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4">
      <Card className="w-full max-w-md backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-blue-100 dark:border-blue-900">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-blue-600 to-pink-600 dark:from-blue-400 dark:to-pink-400 bg-clip-text text-transparent">Create Account</CardTitle>
          <CardDescription className="text-center">
            Choose your preferred sign-up method
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="email" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="phone">Phone</TabsTrigger>
            </TabsList>
            
            <TabsContent value="email">
              <form onSubmit={handleEmailSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Creating account...' : 'Sign up with Email'}
                </Button>
              </form>
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>
              <Button
                onClick={handleGoogleSignUp}
                className="w-full"
                variant="outline"
                disabled={isLoading}
              >
                <FcGoogle className="mr-2 h-4 w-4" />
                {isLoading ? 'Signing in...' : 'Sign up with Google'}
              </Button>
            </TabsContent>

            <TabsContent value="phone">
              <form onSubmit={handlePhoneSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="flex">
                    <CountryCodeSelector value={countryCode} onChange={setCountryCode} />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                      className="rounded-l-none"
                      required
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">Enter your phone number without country code</p>
                </div>
                <div id="recaptcha-container" ref={recaptchaContainerRef}></div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Sending OTP...' : 'Send OTP'}
                </Button>
              </form>

              {verificationId && (
                <form onSubmit={handleOTPVerification} className="mt-4 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="otp">Enter OTP</Label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="Enter the OTP sent to your phone"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Verifying...' : 'Verify OTP'}
                  </Button>
                </form>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <a href="/login" className="text-primary hover:text-primary/80">
              Log in
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
} 