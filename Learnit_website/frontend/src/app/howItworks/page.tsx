'use client';

import React from 'react';
import { motion } from "framer-motion";

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">How It Works</h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Generate high-quality study materials in just three easy steps
          </p>
        </div>
        
        <div className="relative">
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700 -translate-y-1/2"></div>
          
          <div className="grid md:grid-cols-3 gap-8 relative">
            {[
              {
                step: "01",
                title: "Upload Your PDF",
                description: "Simply drag and drop your PDF document or click to select a file from your device."
              },
              {
                step: "02",
                title: "Generate Questions",
                description: "Our AI analyzes your document and automatically creates relevant questions and flashcards."
              },
              {
                step: "03",
                title: "Study & Download",
                description: "Use the interactive flashcards and quizzes online or download them for offline study."
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-gray-900 rounded-xl p-8 shadow-md relative"
              >
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-purple-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold">
                  {step.step}
                </div>
                <div className="pt-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 text-center">{step.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-center">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}