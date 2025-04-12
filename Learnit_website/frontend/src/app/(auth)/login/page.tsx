'use client';

import { useState, useEffect, useRef } from 'react';
import { auth } from '@/lib/firebaseConfig';
import { 
  signInWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup,
  PhoneAuthProvider,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  ConfirmationResult,
  sendPasswordResetEmail
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CountryCodeSelector } from '@/components/ui/country-code-selector';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [otp, setOtp] = useState('');
  const [verificationId, setVerificationId] = useState<ConfirmationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);
  const [activeTab, setActiveTab] = useState('email');
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only initialize reCAPTCHA when phone tab is active
    if (activeTab === 'phone' && recaptchaContainerRef.current && !recaptchaVerifier) {
      const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'normal',
        callback: () => {
          // reCAPTCHA solved
        }
      });
      setRecaptchaVerifier(verifier);
    }

    // Cleanup on unmount or tab change
    return () => {
      if (recaptchaVerifier) {
        recaptchaVerifier.clear();
        setRecaptchaVerifier(null);
      }
    };
  }, [activeTab, recaptchaVerifier]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Logged in successfully!');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      toast.success('Password reset email sent! Check your inbox.');
      setIsResetDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast.success('Logged in with Google successfully!');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneLogin = async (e: React.FormEvent) => {
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
      toast.success('Logged in successfully!');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950 dark:via-purple-950 dark:to-pink-950 p-4">
      <Card className="w-full max-w-md backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-blue-100 dark:border-blue-900">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-blue-600 to-pink-600 dark:from-blue-400 dark:to-pink-400 bg-clip-text text-transparent">Welcome Back</CardTitle>
          <CardDescription className="text-center">
            Choose your preferred login method
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="email" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="phone">Phone</TabsTrigger>
            </TabsList>
            
            <TabsContent value="email">
              <form onSubmit={handleEmailLogin} className="space-y-4">
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
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="flex justify-end">
                  <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="link" className="text-sm text-primary hover:text-primary/80">
                        Forgot password?
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-blue-600 to-pink-600 dark:from-blue-400 dark:to-pink-400 bg-clip-text text-transparent">Reset Password</DialogTitle>
                        <DialogDescription className="text-center text-base">
                          Enter your email address and we'll send you a link to reset your password.
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleForgotPassword} className="space-y-6 mt-4">
                        <div className="space-y-2">
                          <Label htmlFor="reset-email" className="text-base">Email Address</Label>
                          <Input
                            id="reset-email"
                            type="email"
                            placeholder="name@example.com"
                            value={resetEmail}
                            onChange={(e) => setResetEmail(e.target.value)}
                            required
                            className="h-12 text-base"
                          />
                        </div>
                        <div className="flex flex-col gap-4">
                          <Button type="submit" className="w-full h-12 text-base" disabled={isLoading}>
                            {isLoading ? (
                              <div className="flex items-center gap-2">
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Sending Reset Link...
                              </div>
                            ) : (
                              'Send Reset Link'
                            )}
                          </Button>
                          <p className="text-sm text-muted-foreground text-center">
                            Remember your password?{' '}
                            <Button
                              variant="link"
                              className="text-primary hover:text-primary/80 p-0 h-auto"
                              onClick={() => setIsResetDialogOpen(false)}
                            >
                              Back to Login
                            </Button>
                          </p>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Logging in...' : 'Login with Email'}
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
                onClick={handleGoogleLogin}
                className="w-full"
                variant="outline"
                disabled={isLoading}
              >
                <FcGoogle className="mr-2 h-4 w-4" />
                {isLoading ? 'Logging in...' : 'Login with Google'}
              </Button>
            </TabsContent>

            <TabsContent value="phone">
              <form onSubmit={handlePhoneLogin} className="space-y-4">
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
            Don't have an account?{' '}
            <a href="/signup" className="text-primary hover:text-primary/80">
              Sign up
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
} 