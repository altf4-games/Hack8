"use client";

import { FC, useState } from "react";
import { ArrowLeft, CreditCard, Calendar, Lock, CheckCircle, ChevronDown, Smartphone, Globe, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useRouter } from "next/router";
import Link from "next/link";

const PremiumCheckoutPage: FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'netbanking' | 'wallet'>('card');
  const [upiId, setUpiId] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  const [selectedWallet, setSelectedWallet] = useState('');
  
  // Calculate prices based on billing cycle
  const getPrice = (basePrice: number) => {
    if (billingCycle === 'yearly') {
      return (basePrice * 0.8).toFixed(2);
    }
    return basePrice.toFixed(2);
  };
  
  // Get the yearly savings
  const getYearlySavings = (monthlyPrice: number): number => {
    return (monthlyPrice * 12 * 0.2); // 20% savings on annual plan
  };

  // Function to handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate Razorpay integration
    // In a real implementation, you would initialize Razorpay here
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentComplete(true);
    }, 2000);
  };

  // Mock function to simulate Razorpay initialization
  const initRazorpay = () => {
    // In a production environment, you would call your backend to create an order
    // and then initialize Razorpay with the order details
    console.log("Razorpay would be initialized here");
    
    // Mock implementation
    const options = {
      key: "rzp_test_XXXXXXXXXXXXXXX", // Enter the Key ID from Razorpay Dashboard
      amount: billingCycle === 'yearly' ? (3.99 * 12 * 0.8 * 100) : (3.99 * 100), // Amount in paisa
      currency: "INR",
      name: "Quizitt",
      description: `Premium Plan - ${billingCycle === 'yearly' ? 'Yearly' : 'Monthly'} Subscription`,
      image: "", // Removed logo URL placeholder
      prefill: {
        name: "",
        email: "",
        contact: ""
      },
      notes: {
        plan: "Premium",
        billing_cycle: billingCycle
      },
      theme: {
        color: "#7c3aed"
      }
    };
    
    // In actual implementation:
    // const razorpay = new window.Razorpay(options);
    // razorpay.open();
  };

  if (paymentComplete) {
    return (
      <div className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900 min-h-screen flex flex-col items-center justify-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 max-w-md w-full text-center"
        >
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Payment Successful!</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Thank you for upgrading to Premium. Your account has been successfully upgraded and you now have access to all Premium features.
          </p>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            A confirmation email has been sent to your registered email address.
          </p>
          <div className="space-y-4">
            <Button className="w-full bg-purple-600 hover:bg-purple-700">
              Start Using Premium Features
            </Button>
            <Button variant="outline" className="w-full">
              View Receipt
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/subscriptions">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Plans
            </Button>
          </Link>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Complete Your <span className="text-purple-600">Premium</span> Purchase
          </h1>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Payment form - takes up 2/3 of the grid on desktop */}
          <div className="md:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Account Information</h2>
              
              <form onSubmit={handleSubmit}>
                {/* Personal Information */}
                <div className="mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="first-name">First Name</Label>
                      <Input id="first-name"  required />
                    </div>
                    <div>
                      <Label htmlFor="last-name">Last Name</Label>
                      <Input id="last-name"  required />
                    </div>
                  </div>
                  <div className="mt-4">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email"  required />
                  </div>
                  <div className="mt-4">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" type="tel"  required />
                  </div>
                  <div className="mt-4">
                    <Label htmlFor="password">Create Password</Label>
                    <Input id="password" type="password"  required />
                    <p className="text-xs text-gray-500 mt-1">
                      Min. 8 characters with at least 1 number
                    </p>
                  </div>
                </div>
              </form>
            </div>

            {/* Payment Methods */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Payment Method</h2>
              
              <Tabs defaultValue="card" onValueChange={(value) => setPaymentMethod(value as any)}>
                <TabsList className="grid grid-cols-4 mb-6">
                  <TabsTrigger value="card" className="flex items-center justify-center">
                    <CreditCard className="h-4 w-4 mr-2" />
                    <span>Card</span>
                  </TabsTrigger>
                  <TabsTrigger value="upi" className="flex items-center justify-center">
                    <Globe className="h-4 w-4 mr-2" />
                    <span>UPI</span>
                  </TabsTrigger>
                  <TabsTrigger value="netbanking" className="flex items-center justify-center">
                    <Globe className="h-4 w-4 mr-2" />
                    <span>NetBanking</span>
                  </TabsTrigger>
                  <TabsTrigger value="wallet" className="flex items-center justify-center">
                    <Smartphone className="h-4 w-4 mr-2" />
                    <span>Wallet</span>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="card">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="card-number">Card Number</Label>
                      <div className="relative">
                        <Input 
                          id="card-number" 
                      
                          required 
                        />
                        <CreditCard className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiration">Expiration Date</Label>
                        <div className="relative">
                          <Input 
                            id="expiration" 
                        
                            required 
                          />
                          <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="cvv">CVV</Label>
                        <div className="relative">
                          <Input 
                            id="cvv" 
                     
                            required 
                          />
                          <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="name-on-card">Name on Card</Label>
                      <Input id="name-on-card" required />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="upi">
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Pay using any UPI app like Google Pay, PhonePe, Paytm, or any other UPI app.
                    </p>
                    <div>
                      <Label htmlFor="upi-id">UPI ID</Label>
                      <Input 
                        id="upi-id" 
                        placeholder="yourname@upi" 
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        required 
                      />
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="p-3 border rounded-lg text-center hover:border-purple-500 cursor-pointer">
                        <p className="text-xs">Google Pay</p>
                      </div>
                      <div className="p-3 border rounded-lg text-center hover:border-purple-500 cursor-pointer">
                        <p className="text-xs">PhonePe</p>
                      </div>
                      <div className="p-3 border rounded-lg text-center hover:border-purple-500 cursor-pointer">
                        <p className="text-xs">Paytm</p>
                      </div>
                      <div className="p-3 border rounded-lg text-center hover:border-purple-500 cursor-pointer">
                        <p className="text-xs">BHIM</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="netbanking">
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Pay directly from your bank account.
                    </p>
                    <div className="grid grid-cols-4 gap-4 mb-4">
                      <div 
                        className={`p-3 border rounded-lg text-center hover:border-purple-500 cursor-pointer ${selectedBank === 'HDFC' ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' : ''}`}
                        onClick={() => setSelectedBank('HDFC')}
                      >
                        <p className="text-xs">HDFC</p>
                      </div>
                      <div 
                        className={`p-3 border rounded-lg text-center hover:border-purple-500 cursor-pointer ${selectedBank === 'ICICI' ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' : ''}`}
                        onClick={() => setSelectedBank('ICICI')}
                      >
                        <p className="text-xs">ICICI</p>
                      </div>
                      <div 
                        className={`p-3 border rounded-lg text-center hover:border-purple-500 cursor-pointer ${selectedBank === 'SBI' ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' : ''}`}
                        onClick={() => setSelectedBank('SBI')}
                      >
                        <p className="text-xs">SBI</p>
                      </div>
                      <div 
                        className={`p-3 border rounded-lg text-center hover:border-purple-500 cursor-pointer ${selectedBank === 'Axis' ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' : ''}`}
                        onClick={() => setSelectedBank('Axis')}
                      >
                        <p className="text-xs">Axis</p>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="other-banks">Other Banks</Label>
                      <select 
                        id="other-banks" 
                        className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 py-2 px-3 text-gray-900 dark:text-gray-100"
                        onChange={(e) => setSelectedBank(e.target.value)}
                      >
                        <option value="">Select Bank</option>
                        <option value="KOTAK">Kotak Mahindra Bank</option>
                        <option value="YES">Yes Bank</option>
                        <option value="IDFC">IDFC First Bank</option>
                        <option value="BOB">Bank of Baroda</option>
                      </select>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="wallet">
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Pay using your preferred wallet.
                    </p>
                    <div className="grid grid-cols-4 gap-4">
                      <div 
                        className={`p-3 border rounded-lg text-center hover:border-purple-500 cursor-pointer ${selectedWallet === 'Paytm' ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' : ''}`}
                        onClick={() => setSelectedWallet('Paytm')}
                      >
                        <p className="text-xs">Paytm</p>
                      </div>
                      <div 
                        className={`p-3 border rounded-lg text-center hover:border-purple-500 cursor-pointer ${selectedWallet === 'Amazon Pay' ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' : ''}`}
                        onClick={() => setSelectedWallet('Amazon Pay')}
                      >
                        <p className="text-xs">Amazon Pay</p>
                      </div>
                      <div 
                        className={`p-3 border rounded-lg text-center hover:border-purple-500 cursor-pointer ${selectedWallet === 'Mobikwik' ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' : ''}`}
                        onClick={() => setSelectedWallet('Mobikwik')}
                      >
                        <p className="text-xs">Mobikwik</p>
                      </div>
                      <div 
                        className={`p-3 border rounded-lg text-center hover:border-purple-500 cursor-pointer ${selectedWallet === 'Freecharge' ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' : ''}`}
                        onClick={() => setSelectedWallet('Freecharge')}
                      >
                        <p className="text-xs">Freecharge</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Billing Address (Shown only for Card payments) */}
              {paymentMethod === 'card' && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Billing Address</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="address-line1">Address Line 1</Label>
                      <Input id="address-line1" placeholder="123 Main St" required />
                    </div>
                    <div>
                      <Label htmlFor="address-line2">Address Line 2 (Optional)</Label>
                      <Input id="address-line2" placeholder="Apartment, suite, etc." />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input id="city"  required />
                      </div>
                      <div>
                        <Label htmlFor="state">State</Label>
                        <Input id="state"required />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="zip">Postal Code</Label>
                        <Input id="zip"  required />
                      </div>
                      <div>
                        <Label htmlFor="country">Country</Label>
                        <select 
                          id="country" 
                          className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 py-2 px-3 text-gray-900 dark:text-gray-100"
                          defaultValue="IN"
                        >
                          <option value="IN">India</option>
                          <option value="US">United States</option>
                          <option value="CA">Canada</option>
                          <option value="UK">United Kingdom</option>
                          <option value="AU">Australia</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Terms and Agree */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-2">
                  <Checkbox id="terms" required />
                  <Label htmlFor="terms" className="text-sm">
                    I agree to the{" "}
                    <Link href="/terms" className="text-purple-600 hover:underline">Terms of Service</Link>,{" "}
                    <Link href="/privacy" className="text-purple-600 hover:underline">Privacy Policy</Link>,{" "}
                    and{" "}
                    <Link href="/shipping" className="text-purple-600 hover:underline">Shipping Policy</Link>
                  </Label>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Checkbox id="marketing" />
                  <Label htmlFor="marketing" className="text-sm">
                    I would like to receive product updates and marketing communications from Quizitt
                  </Label>
                </div>
              </div>
              
              {/* CTA */}
              <div className="mt-6">
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 py-6 text-lg font-semibold"
                  disabled={isProcessing}
                  onClick={handleSubmit}
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>Pay ₹{(parseInt(getPrice(3.99)) * 1.18 * 80 * (billingCycle === 'yearly' ? 12 : 1)).toFixed(0)}</>
                  )}
                </Button>
                
                <div className="flex items-center justify-center mt-4 text-xs text-gray-500 dark:text-gray-400">
                  <Shield className="h-4 w-4 mr-1" />
                  <span>Secured by Razorpay | SSL Encrypted Payment</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Order Summary - takes up 1/3 of the grid on desktop */}
          <div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 sticky top-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Order Summary</h2>
              
              {/* Plan Selection Toggle */}
              <div className="mb-6">
                <div className="bg-gray-100 dark:bg-gray-700 p-1 rounded-full flex mb-3">
                  <button
                    onClick={() => setBillingCycle('monthly')}
                    className={`${
                      billingCycle === 'monthly'
                        ? 'bg-purple-600 text-white'
                        : 'text-gray-700 dark:text-gray-300'
                    } relative w-full rounded-full py-2 text-sm font-medium focus:outline-none transition-colors duration-300`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setBillingCycle('yearly')}
                    className={`${
                      billingCycle === 'yearly'
                        ? 'bg-purple-600 text-white'
                        : 'text-gray-700 dark:text-gray-300'
                    } relative ml-0.5 w-full rounded-full py-2 text-sm font-medium focus:outline-none transition-colors duration-300`}
                  >
                    Yearly
                    <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                      -20%
                    </span>
                  </button>
                </div>
                
                {billingCycle === 'yearly' && (
                  <div className="text-center bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm rounded-lg p-2 mb-4">
                    Save ₹{(getYearlySavings(3.99) * 80).toFixed(2)} with annual billing!
                  </div>
                )}
              </div>
              
              {/* Order Details */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Premium Plan</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    ₹{(parseInt(getPrice(3.99)) * 80).toFixed(0)}/{billingCycle === 'monthly' ? 'mo' : 'mo (billed annually)'}
                  </span>
                </div>
                
                {billingCycle === 'yearly' && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Annual discount</span>
                    <span className="font-medium text-green-600">-20%</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">GST (18%)</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    ₹{(parseInt(getPrice(3.99)) * 0.18 * 80 * (billingCycle === 'yearly' ? 12 : 1)).toFixed(0)}
                  </span>
                </div>
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-6">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-900 dark:text-white">Total</span>
                  <span className="font-bold text-xl text-gray-900 dark:text-white">
                    ₹{(parseInt(getPrice(3.99)) * 1.18 * 80 * (billingCycle === 'yearly' ? 12 : 1)).toFixed(0)}
                    <span className="text-gray-500 dark:text-gray-400 text-sm font-normal">
                      {billingCycle === 'monthly' ? '/month' : ' for 12 months'}
                    </span>
                  </span>
                </div>
              </div>
              
              {/* Features Reminder */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Premium includes:</h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-purple-600 mr-2" />
                    Unlimited quizzes
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-purple-600 mr-2" />
                    All quiz types
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-purple-600 mr-2" />
                    AI-powered quiz generation
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-purple-600 mr-2" />
                    Advanced analytics
                  </li>
                </ul>
              </div>
              
              {/* Cancellation Policy */}
              <div className="mt-6">
                <Accordion type="single" collapsible>
                  <AccordionItem value="cancellation">
                    <AccordionTrigger className="text-sm">
                      Cancellation Policy
                    </AccordionTrigger>
                    <AccordionContent className="text-xs text-gray-600 dark:text-gray-400">
                      You can cancel your subscription anytime. If you cancel, you'll continue to have access until the end of your billing period. No refunds for partial months.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="refunds">
                    <AccordionTrigger className="text-sm">
                      Refund Policy
                    </AccordionTrigger>
                    <AccordionContent className="text-xs text-gray-600 dark:text-gray-400">
                      If you're not satisfied with our product, you can request a refund within 7 days of your initial purchase. Contact our support team with your order details to process your refund request.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="contact">
                    <AccordionTrigger className="text-sm">
                      Contact Us
                    </AccordionTrigger>
                    <AccordionContent className="text-xs text-gray-600 dark:text-gray-400">
                      Need help? Contact our support team at support@quizitt.com or call us at +91 9876543210. We're available 24/7 to assist you with any questions or concerns.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="shipping">
                    <AccordionTrigger className="text-sm">
                      Shipping Policy
                    </AccordionTrigger>
                    <AccordionContent className="text-xs text-gray-600 dark:text-gray-400">
                      As Quizitt Premium is a digital product, no physical shipping is involved. You'll get instant access to all premium features immediately after your payment is processed.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
              {/* Help & Support */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                  Need help? <Link href="/support" className="text-purple-600 hover:underline">Contact Support</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="mt-16 text-center text-xs text-gray-500 dark:text-gray-400">
        <div className="space-x-3 mb-2">
          <Link href="/terms" className="hover:text-purple-600 hover:underline">Terms and Conditions</Link>
          <span>•</span>
          <Link href="/privacy" className="hover:text-purple-600 hover:underline">Privacy Policy</Link>
          <span>•</span>
          <Link href="/shipping" className="hover:text-purple-600 hover:underline">Shipping Policy</Link>
          <span>•</span>
          <Link href="/cancellation" className="hover:text-purple-600 hover:underline">Cancellation and Refunds</Link>
          <span>•</span>
          <Link href="/contact" className="hover:text-purple-600 hover:underline">Contact Us</Link>
        </div>
        <p>© {new Date().getFullYear()} Quizitt. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default PremiumCheckoutPage;