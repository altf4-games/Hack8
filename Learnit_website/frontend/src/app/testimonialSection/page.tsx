'use client'
import React from 'react';
import { motion } from "framer-motion";
export default function TestimonialSection() {
  const testimonials = [
    {
      quote: "This tool has completely changed how I study for my medical exams. The AI-generated questions are incredibly relevant and have helped me retain complex information more effectively.",
      author: "Dr. Jagannath Nirmal",
      role: "University ETRX HOD"
    },
    {
      quote: "As a teacher, I've been looking for a way to quickly create quiz materials from my lecture notes. This tool saves me hours of work and my students love the interactive flashcards!",
      author: "Dr Ninad Mehndale",
      role: "University Professor"
    },
    {
      quote: "I used the PDF Quiz Generator to prepare for my certification exam. The variety of question formats helped me identify my weak areas and focus my studies. I passed with flying colors!",
      author: "Jaden Rodrigues",
      role: "Engineering Student"
    }
  ];

  return (
    <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">What Our Users Say</h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Join X Number of students and educators who have transformed their learning experience
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8 shadow-sm"
            >
              <div className="flex flex-col h-full">
                <div className="mb-4">
                  <svg className="h-8 w-8 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-6 flex-grow italic">{testimonial.quote}</p>
                <div className="mt-auto">
                  <p className="font-medium text-gray-900 dark:text-white">{testimonial.author}</p>
                  <p className="text-gray-500 dark:text-gray-500 text-sm">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}