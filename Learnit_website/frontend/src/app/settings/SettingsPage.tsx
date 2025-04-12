'use client'
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from 'framer-motion';
import { useAuth } from '@/app/contexts/AuthContext/auth-type';
import { Loader2 } from 'lucide-react'; 
// You'll need to create this component or install the proper package
import { useToast } from "@/hooks/use-toast"

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  
  // User profile state
  const [profile, setProfile] = useState({
    displayName: '',
    email: '',
    photoURL: '',
    bio: '',
    phone: ''
  });

  // Preferences state
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    studyReminders: true,
    darkMode: false,
    autoGenerateQuizzes: true,
    showProgressOnDashboard: true
  });

  // Load user data
  useEffect(() => {
    if (user) {
      setProfile({
        displayName: user.displayName || '',
        email: user.email || '',
        photoURL: user.photoURL || '',
        bio: '',
        phone: ''
      });
      
      // In a real app, you'd fetch preferences from your database or localStorage
      const savedPreferences = localStorage.getItem('quizitt_user_preferences');
      if (savedPreferences) {
        try {
          setPreferences(JSON.parse(savedPreferences));
        } catch (e) {
          console.error('Error parsing saved preferences:', e);
        }
      }
      
      setLoading(false);
    }
  }, [user]);

  // Handle profile update
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // In a real app, you'd update the user profile in your database
      // For this demo, we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Profile updated",
        description: "Your profile information has been saved.",
      });
    } catch (error) {
      toast({
        title: "Error updating profile",
        description: "There was a problem saving your profile.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle preferences update
  const handlePreferenceChange = (key: keyof typeof preferences, value: boolean) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    
    // Save to localStorage
    localStorage.setItem('quizitt_user_preferences', JSON.stringify(newPreferences));
    
    toast({
      title: "Preference updated",
      description: "Your preferences have been saved.",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-gradient-to-br from-purple-50 to-white dark:from-gray-900 dark:to-gray-800 py-8 px-4 min-h-screen"
    >
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 dark:text-white">Settings</h1>
        
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="mb-6">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>
          
          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal information and how others see you.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  {/* Profile Picture */}
                  <div className="flex flex-col items-center sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-4">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                        {profile.photoURL ? (
                          <img src={profile.photoURL} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <div className="absolute -bottom-1 -right-1">
                        <Button type="button" size="sm" variant="outline" className="rounded-full p-1 h-8 w-8 bg-white dark:bg-gray-800">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
                          </svg>
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <Label htmlFor="displayName" className="block text-sm font-medium mb-1 dark:text-gray-300">Display Name</Label>
                      <Input 
                        id="displayName"
                        value={profile.displayName}
                        onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">This is how your name will appear across the app.</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email" className="block text-sm font-medium mb-1 dark:text-gray-300">Email Address</Label>
                      <Input 
                        id="email"
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        disabled
                        className="w-full bg-gray-50 dark:bg-gray-800"
                      />
                      <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">Your email cannot be changed.</p>
                    </div>
                    <div>
                      <Label htmlFor="phone" className="block text-sm font-medium mb-1 dark:text-gray-300">Phone Number</Label>
                      <Input 
                        id="phone"
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">Optional for account recovery.</p>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="bio" className="block text-sm font-medium mb-1 dark:text-gray-300">Bio</Label>
                    <textarea
                      id="bio"
                      value={profile.bio}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      rows={3}
                      className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:text-white"
                    />
                    <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">A brief description about yourself.</p>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button type="submit" disabled={saving}>
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Preferences Tab */}
          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>Preferences</CardTitle>
                <CardDescription>Manage your app preferences and notifications.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium dark:text-white">Notifications</h3>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm dark:text-gray-300">Email Notifications</Label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Receive notifications about quiz results and new features.</p>
                    </div>
                    <Switch 
                      checked={preferences.emailNotifications}
                      onCheckedChange={(checked) => handlePreferenceChange('emailNotifications', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm dark:text-gray-300">Study Reminders</Label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Receive daily reminders to study and maintain your streak.</p>
                    </div>
                    <Switch 
                      checked={preferences.studyReminders}
                      onCheckedChange={(checked) => handlePreferenceChange('studyReminders', checked)}
                    />
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <h3 className="text-sm font-medium dark:text-white">Appearance</h3>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm dark:text-gray-300">Dark Mode</Label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Use dark mode for all screens.</p>
                    </div>
                    <Switch 
                      checked={preferences.darkMode}
                      onCheckedChange={(checked) => handlePreferenceChange('darkMode', checked)}
                    />
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <h3 className="text-sm font-medium dark:text-white">Quiz Settings</h3>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm dark:text-gray-300">Auto-generate Quizzes</Label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Automatically generate quizzes when uploading new documents.</p>
                    </div>
                    <Switch 
                      checked={preferences.autoGenerateQuizzes}
                      onCheckedChange={(checked) => handlePreferenceChange('autoGenerateQuizzes', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm dark:text-gray-300">Show Progress on Dashboard</Label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Display your learning progress on the dashboard.</p>
                    </div>
                    <Switch 
                      checked={preferences.showProgressOnDashboard}
                      onCheckedChange={(checked) => handlePreferenceChange('showProgressOnDashboard', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Account Tab */}
          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your account and security settings.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium mb-2 dark:text-white">Change Password</h3>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="currentPassword" className="block text-sm font-medium mb-1 dark:text-gray-300">Current Password</Label>
                      <Input id="currentPassword" type="password" className="w-full" />
                    </div>
                    <div>
                    <Label htmlFor="newPassword" className="block text-sm font-medium mb-1 dark:text-gray-300">New Password</Label>
                      <Input id="newPassword" type="password" className="w-full" />
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword" className="block text-sm font-medium mb-1 dark:text-gray-300">Confirm Password</Label>
                      <Input id="confirmPassword" type="password" className="w-full" />
                    </div>
                    <Button className="mt-2">Update Password</Button>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-sm font-medium mb-2 dark:text-white">Connected Accounts</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                          <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium dark:text-white">Facebook</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Not connected</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Connect</Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                          <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium dark:text-white">Twitter</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Not connected</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Connect</Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mr-3">
                          <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032
                                  s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2
                                  C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium dark:text-white">Google</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Connected</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Disconnect</Button>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <h3 className="text-sm font-medium mb-2 dark:text-white">Danger Zone</h3>
                  
                  <div className="rounded-lg border border-red-200 dark:border-red-900 p-4 bg-red-50 dark:bg-red-900/20">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div className="mb-3 md:mb-0">
                        <h4 className="text-sm font-medium text-red-800 dark:text-red-400">Delete Account</h4>
                        <p className="text-xs text-red-700 dark:text-red-300">Once you delete your account, there is no going back. Please be certain.</p>
                      </div>
                      <Button variant="destructive" size="sm">Delete Account</Button>
                    </div>
                  </div>
                  
                  <div className="rounded-lg border border-orange-200 dark:border-orange-900 p-4 bg-orange-50 dark:bg-orange-900/20">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div className="mb-3 md:mb-0">
                        <h4 className="text-sm font-medium text-orange-800 dark:text-orange-400">Export Data</h4>
                        <p className="text-xs text-orange-700 dark:text-orange-300">Download all your data including documents and quiz history.</p>
                      </div>
                      <Button variant="outline" size="sm" className="border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-400">
                        Export
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  );
};

export default SettingsPage;