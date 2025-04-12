'use client';

import React from 'react';
import { motion } from "framer-motion";
import { BookMarked, FileText, RefreshCw } from "lucide-react";

export default function FeaturesSection() {
  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Key Features</h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Our powerful PDF Quiz Generator offers everything you need to create effective study materials
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 mt-12">
          {[
            {
              icon: <BookMarked className="h-12 w-12 text-blue-500" />,
              title: "AI-Generated Questions",
              description: "Our algorithms analyze your PDF content to create relevant and challenging questions automatically."
            },
            {
              icon: <RefreshCw className="h-12 w-12 text-purple-500" />,
              title: "Interactive Quizes",
              description: "Study with beautifully designed flashcards that help reinforce your knowledge through active recall."
            },
            {
              icon: <FileText className="h-12 w-12 text-green-500" />,
              title: "Multiple-Choice Tests",
              description: "Test your understanding with comprehensive multiple-choice questions and instant feedback."
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <div className="mb-5 inline-block p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}