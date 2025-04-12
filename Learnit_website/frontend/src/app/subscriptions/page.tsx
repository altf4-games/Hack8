"use client";

import { FC, useState, useEffect } from "react";
import { Check, Star, Info } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";

const SubscriptionPage: FC = () => {
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handlePremiumClick = () => {
    if (!auth.currentUser) {
      toast.error("Please login to access premium features");
      router.push('/login');
      return;
    }
    router.push('/subscriptions/checkout');
  };

  // Calculate discounts and savings
  const getPrice = (basePrice: number, discounted: boolean = false) => {
    if (billingCycle === 'yearly') {
      return discounted ? (basePrice * 0.8).toFixed(2) : basePrice.toFixed(2);
    }
    return basePrice.toFixed(2);
  };
  
  // Get the yearly savings
  const getYearlySavings = (monthlyPrice: number) => {
    return ((monthlyPrice * 12) - (monthlyPrice * 12 * 0.8)).toFixed(2);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-sm font-semibold text-purple-600 uppercase tracking-wide">PRICING</h2>
          <h1 className="mt-2 text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl">
            Simple. Transparent.<span className="text-purple-600"> Built for You</span>
          </h1>
          <p className="mt-4 text-xl text-gray-500 dark:text-gray-300">
            Choose the best solution to achieve your learning goals with LearnIt.com.
          </p>
          
          {/* Billing toggle */}
          <div className="mt-8 flex justify-center">
            <div className="relative bg-white dark:bg-gray-800 p-1 rounded-full flex">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`${
                  billingCycle === 'monthly'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-700 dark:text-gray-300'
                } relative w-28 rounded-full py-2 text-sm font-medium focus:outline-none transition-colors duration-300`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`${
                  billingCycle === 'yearly'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-700 dark:text-gray-300'
                } relative ml-0.5 w-28 rounded-full py-2 text-sm font-medium focus:outline-none transition-colors duration-300`}
              >
                Yearly
                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  -20%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Pricing cards */}
        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          {/* Free Plan */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Free</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Perfect for beginners</p>
              <p className="mt-4">
                <span className="text-4xl font-extrabold text-gray-900 dark:text-white">$0</span>
                <span className="text-base font-medium text-gray-500 dark:text-gray-400">/month</span>
              </p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">No credit card required</p>
              
              <div className="mt-6">
              <Link href="/" className="w-full">
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  Start Learning
                </Button>
              </Link>
              </div>
            </div>
            
            <div className="px-6 pt-6 pb-8">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide mb-4">
                What's included:
              </h4>
              <ul className="space-y-4">
                <FeatureItem text="5 quizzes per day" />
                <FeatureItem text="4 quiz types" subtext="(Multiple Choice, True/False, Fill-in-the-blank, Matching)" />
                <FeatureItem text="Basic analytics dashboard" />
                <FeatureItem text="Community templates" />
                <FeatureItem text="Email support" />
              </ul>
            </div>
          </div>

          {/* Premium Plan */}
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden border-2 border-purple-500 transform scale-105 z-10">
            <div className="absolute top-0 inset-x-0 bg-purple-600 text-white text-center py-1 text-sm font-semibold">
              MOST POPULAR
            </div>
            <div className="p-6 pt-10">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Pro</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">For dedicated learners who want to master subjects quickly.</p>
              <p className="mt-4">
                <span className="text-4xl font-extrabold text-gray-900 dark:text-white">
                  ${getPrice(3.99, true)}
                </span>
                <span className="text-base font-medium text-gray-500 dark:text-gray-400">/month</span>
                {billingCycle === 'yearly' && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Save ${getYearlySavings(3.99)}
                  </span>
                )}
              </p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {billingCycle === 'yearly' ? 'Billed annually' : 'Billed monthly'}
              </p>
              
              <div className="mt-6">
                <Button 
                  onClick={handlePremiumClick}
                  className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
                >
                  Start Premium
                </Button>
              </div>
            </div>
            
            <div className="px-6 pt-6 pb-8">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide mb-4">
                Everything in Free, plus:
              </h4>
              <ul className="space-y-4">
                <FeatureItem text="Unlimited quizzes" highlighted />
                <FeatureItem text="All quiz types" highlighted subtext="(Including Image-based, Audio, Video, Coding)" />
                <FeatureItem text="Advanced analytics" highlighted />
                <FeatureItem text="AI-powered quiz generation" highlighted />
                <FeatureItem text="Custom branding" />
                <FeatureItem text="Team collaboration features" />
                <FeatureItem text="Priority support" />
                <FeatureItem text="Offline mode" />
              </ul>
            </div>
          </div>

          {/* Pro Plan */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Enterprise</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">For Enterprises and Educational Institutes</p>
              <p className="mt-4">
                <span className="text-4xl font-extrabold text-gray-900 dark:text-white">
                  ${getPrice(19.99, true)}
                </span>
                <span className="text-base font-medium text-gray-500 dark:text-gray-400">/month</span>
                {billingCycle === 'yearly' && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Save ${getYearlySavings(19.99)}
                  </span>
                )}
              </p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {billingCycle === 'yearly' ? 'Billed annually' : 'Billed monthly'}
              </p>
              
              <div className="mt-6">
                <Link href="/contact">
                  <Button className="w-full border-2 border-purple-600 text-purple-600 bg-transparent hover:bg-purple-50 dark:hover:bg-purple-900 dark:hover:text-white">
                    Contact Sales
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="px-6 pt-6 pb-8">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide mb-4">
                Everything in Premium, plus:
              </h4>
              <ul className="space-y-4">
                <FeatureItem text="Unlimited team members" />
                <FeatureItem text="Advanced user permissions" />
                <FeatureItem text="Custom domain" />
                <FeatureItem text="SSO & Enterprise security" />
                <FeatureItem text="API access" />
                <FeatureItem text="Dedicated account manager" />
                <FeatureItem text="Custom integrations" />
                <FeatureItem text="Enterprise SLA" />
              </ul>
            </div>
          </div>
        </div>

        {/* Feature comparison table */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Compare Features
          </h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700">
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Feature
                  </th>
                  <th className="py-4 px-6 text-center text-sm font-semibold text-gray-900 dark:text-white">
                    Free
                  </th>
                  <th className="py-4 px-6 text-center text-sm font-semibold text-purple-600">
                    Premium
                  </th>
                  <th className="py-4 px-6 text-center text-sm font-semibold text-gray-900 dark:text-white">
                    Pro
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                <TableRow 
                  feature="Daily Quizzes" 
                  free="5 per day" 
                  premium="Unlimited" 
                  pro="Unlimited" 
                />
                <TableRow 
                  feature="Quiz Types" 
                  free="4 types" 
                  premium="All types" 
                  pro="All types + Custom" 
                />
                <TableRow 
                  feature="AI Generation" 
                  free="❌" 
                  premium="✅" 
                  pro="Advanced AI" 
                />
                <TableRow 
                  feature="Team Members" 
                  free="1" 
                  premium="Up to 5" 
                  pro="Unlimited" 
                />
                <TableRow 
                  feature="Analytics" 
                  free="Basic" 
                  premium="Advanced" 
                  pro="Enterprise" 
                />
                <TableRow 
                  feature="Custom Branding" 
                  free="❌" 
                  premium="✅" 
                  pro="✅" 
                />
                <TableRow 
                  feature="Export Options" 
                  free="PDF only" 
                  premium="PDF, Excel, API" 
                  pro="All formats + API" 
                />
                <TableRow 
                  feature="Support" 
                  free="Email" 
                  premium="Priority Email" 
                  pro="Dedicated Manager" 
                />
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQs */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="grid gap-6 lg:grid-cols-2">
            <FaqItem
              question="How does the free trial work?"
              answer="The free plan allows you to create 5 quizzes per day using 4 different quiz types. There's no time limit, and you can use the free plan indefinitely."
            />
            <FaqItem
              question="Can I switch between plans?"
              answer="Yes, you can upgrade or downgrade your plan at any time. If you upgrade, the changes take effect immediately. If you downgrade, the changes will take effect at the end of your current billing cycle."
            />
            <FaqItem
              question="Is there a discount for educational institutions?"
              answer="Yes, we offer special pricing for schools and educational institutions. Please contact our sales team for more information."
            />
            <FaqItem
              question="Can I cancel my subscription at any time?"
              answer="Yes, you can cancel your subscription at any time. If you cancel, you'll still have access to your premium features until the end of your billing period."
            />
          </div>
        </div>

        {/* CTA */}
        <div className="mt-20 bg-purple-600 rounded-xl shadow-xl overflow-hidden">
          <div className="px-6 py-12 sm:px-12 lg:flex lg:items-center lg:justify-between">
            <div>
              <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                Ready to level up your quiz game?
              </h2>
              <p className="mt-3 max-w-3xl text-lg text-purple-100">
                Join thousands of educators, trainers, and quiz enthusiasts who use Quizitt to create engaging learning experiences.
              </p>
            </div>
            <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
              <div className="inline-flex rounded-md shadow">
                <Button 
                  onClick={handlePremiumClick}
                  className="bg-white text-purple-600 hover:bg-purple-50 px-8 py-6 text-lg font-semibold"
                >
                  Start Premium Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Feature item component for the pricing cards
const FeatureItem: FC<{ text: string; subtext?: string; highlighted?: boolean }> = ({ 
  text, 
  subtext,
  highlighted = false 
}) => (
  <li className="flex items-start">
    <div className={`flex-shrink-0 ${highlighted ? 'text-purple-600' : 'text-gray-600 dark:text-gray-400'}`}>
      <Check className="h-5 w-5" />
    </div>
    <div className="ml-3">
      <p className={`text-sm ${highlighted ? 'font-medium text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
        {text}
      </p>
      {subtext && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">{subtext}</p>
      )}
    </div>
  </li>
);

// Table row component for the feature comparison table
const TableRow: FC<{ 
  feature: string; 
  free: string; 
  premium: string; 
  pro: string;
}> = ({ feature, free, premium, pro }) => (
  <tr className="hover:bg-gray-50 dark:hover:bg-gray-750">
    <td className="py-4 px-6 text-sm text-gray-900 dark:text-white">
      {feature}
    </td>
    <td className="py-4 px-6 text-sm text-center text-gray-600 dark:text-gray-400">
      {free}
    </td>
    <td className="py-4 px-6 text-sm text-center font-medium text-purple-600">
      {premium}
    </td>
    <td className="py-4 px-6 text-sm text-center text-gray-600 dark:text-gray-400">
      {pro}
    </td>
  </tr>
);

// FAQ item component
const FaqItem: FC<{ question: string; answer: string }> = ({ question, answer }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
    className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md"
  >
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{question}</h3>
    <p className="mt-2 text-gray-600 dark:text-gray-400">{answer}</p>
  </motion.div>
);

export default SubscriptionPage;