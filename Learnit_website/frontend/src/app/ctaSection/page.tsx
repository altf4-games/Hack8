'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useAuth } from '../contexts/AuthContext/auth-type';

export default function CTASection() {
  const router = useRouter();
  const { user } = useAuth();

  const handleButtonClick = () => {
    if (!user) {
      // If not logged in, navigate to login page
      router.push('/login');
    } else {
      // If logged in, scroll to the top of the page
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
      <div className="max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold text-white mb-6">Ready to Transform Your Study Experience?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Join thousands of students and educators who have already discovered the power of AI-generated study materials.
          </p>
          <Button 
            className="bg-white text-blue-600 hover:bg-blue-50 text-lg py-6 px-8"
            onClick={handleButtonClick}
          >
            {!user ? 'Start Creating Quizzes Now' : 'Go to Dashboard'}
          </Button>
        </motion.div>
      </div>
    </section>
  );
}