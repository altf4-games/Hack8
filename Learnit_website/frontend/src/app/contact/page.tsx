// components/ContactPage.tsx
import React from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';

const ContactPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-extrabold text-center mb-2 text-gray-900 dark:text-white">
          Contact Us
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-300 mb-8">
          Have questions? We're here to help!
        </p>
        
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <div className="space-y-6">
              {/* Company Info Section */}
              <div>
                <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  QuizItt
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  We Highly Value Your Feedback.
                  Have questions or want to learn more about our services? 
                  Reach out to us directly using the contact information below.
                </p>
              </div>
              
              {/* Contact Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Email */}
                <div className="flex items-start p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
                  <div className="flex-shrink-0">
                    <Mail className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">Email</h3>
                    <p className="mt-1">
                      <Link 
                        href="mailto:quizittindia@gmail.com" 
                        className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 hover:underline"
                      >
                        quizittindia@gmail.com
                      </Link>
                    </p>
                  </div>
                </div>
                
                {/* Phone */}
                <div className="flex items-start p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
                  <div className="flex-shrink-0">
                    <Phone className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">Phone</h3>
                    <p className="mt-1">
                      <Link 
                        href="tel:+918104796542" 
                        className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 hover:underline"
                      >
                        +91 81047 96542
                      </Link>
                    </p>
                  </div>
                </div>
                
                {/* Address */}
                <div className="flex items-start p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
                  <div className="flex-shrink-0">
                    <MapPin className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">Address</h3>
                    <p className="mt-1 text-gray-600 dark:text-gray-300">
                      Niraml Lifestyle<br />
                      Mulund West, Mumbai<br />
                      Maharashtra, India 400080
                    </p>
                  </div>
                </div>
                
                {/* Business Hours */}
                <div className="flex items-start p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
                  <div className="flex-shrink-0">
                    <Clock className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">Business Hours</h3>
                    <p className="mt-1 text-gray-600 dark:text-gray-300">
                      Monday - Friday: 9:00 AM - 6:00 PM<br />
                      Saturday: 10:00 AM - 2:00 PM<br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Direct Contact Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="mailto:quizittindia@gmail.com" 
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200"
                >
                  <Mail className="mr-2 h-5 w-5" />
                  Email Us
                </Link>
                <Link 
                  href="tel:+918104796542" 
                  className="inline-flex items-center justify-center px-6 py-3 border-2 border-purple-600 text-base font-medium rounded-lg text-purple-600 bg-transparent hover:bg-purple-50 dark:hover:bg-purple-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200"
                >
                  <Phone className="mr-2 h-5 w-5" />
                  Call Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;