"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { motion, useInView, useAnimation } from "framer-motion";
import { BookOpen, Brain, Zap, Heart, Award, Users, Sparkles, ChevronRight, Globe, Glasses, GiftIcon, HandHelping } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const AboutPage = () => {
  const controls = useAnimation();
  const statsRef = useRef(null);
  const isInView = useInView(statsRef, { once: true, amount: 0.3 });

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [controls, isInView]);

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const teamMembers = [
    {
      name: "Alex Rivera",
      role: "Founder & CEO",
      image: "/api/placeholder/300/300",
      bio: "Former education tech leader with a passion for AI-driven learning systems.",
    },
    {
      name: "Maya Chen",
      role: "CTO",
      image: "/api/placeholder/300/300",
      bio: "AI researcher with expertise in adaptive learning algorithms and personalization.",
    },
    {
      name: "Jamal Washington",
      role: "Head of Product",
      image: "/api/placeholder/300/300",
      bio: "EdTech veteran focused on creating intuitive learning experiences.",
    },
    {
      name: "Sofia Garcia",
      role: "Head of Learning Design",
      image: "/api/placeholder/300/300",
      bio: "Former professor with a background in cognitive science and education.",
    },
  ];

  return (
    <div className="bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-20 pb-24 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-blue-50 dark:bg-blue-950/20 -z-10 opacity-70 dark:opacity-30">
          <div className="absolute inset-0 bg-[url('/api/placeholder/1920/1080')] bg-cover bg-center opacity-10"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-gray-900 dark:text-white mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">
              Our Story
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              We're revolutionizing education with AI-powered tools that make learning smarter, faster, and more personalized than ever before.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-12 relative max-w-4xl mx-auto"
          >
            <div className="rounded-2xl overflow-hidden shadow-2xl border-4 border-white dark:border-gray-700 relative">
              <div className="aspect-w-16 aspect-h-9 relative">
                <Image 
                  src="/api/placeholder/1200/675" 
                  alt="Quizitt Team" 
                  width={1200} 
                  height={675}
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <h2 className="text-2xl font-bold mb-2">Where learning meets innovation</h2>
                  <p className="text-gray-200">Founded in 2025 with a mission to transform education</p>
                </div>
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-purple-500 rounded-full z-[-1] blur-2xl opacity-30"></div>
            <div className="absolute -left-8 -top-8 w-32 h-32 bg-blue-500 rounded-full z-[-1] blur-2xl opacity-30"></div>
          </motion.div>
        </div>
      </section>

      {/* Our Mission Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Our Mission</h2>
              <div className="space-y-6">
                <p className="text-lg text-gray-600 dark:text-gray-300">
                  At Quizitt, we believe that education should adapt to each student, not the other way around. Our mission is to create AI-driven learning tools that understand individual needs and provide personalized learning journeys.
                </p>
                <p className="text-lg text-gray-600 dark:text-gray-300">
                  We're building technology that makes quality education more accessible, engaging, and effective for everyone. Our adaptive quizzes evolve with you, focusing on what you need to learn most.
                </p>
                <div className="pt-4">
                  <Link href="/pricing">
                    <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-medium">
                      Join Our Community
                      <ChevronRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="rounded-2xl overflow-hidden shadow-xl border border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-2 gap-1 p-1 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
                  <div className="aspect-w-1 aspect-h-1 relative rounded-lg overflow-hidden">
                    <Image 
                      src="/api/placeholder/300/300" 
                      alt="Students learning" 
                      width={300} 
                      height={300}
                      className="object-cover"
                    />
                  </div>
                  <div className="aspect-w-1 aspect-h-1 relative rounded-lg overflow-hidden">
                    <Image 
                      src="/api/placeholder/300/300" 
                      alt="AI technology" 
                      width={300} 
                      height={300}
                      className="object-cover"
                    />
                  </div>
                  <div className="aspect-w-1 aspect-h-1 relative rounded-lg overflow-hidden">
                    <Image 
                      src="/api/placeholder/300/300" 
                      alt="Team collaboration" 
                      width={300} 
                      height={300}
                      className="object-cover"
                    />
                  </div>
                  <div className="aspect-w-1 aspect-h-1 relative rounded-lg overflow-hidden">
                    <Image 
                      src="/api/placeholder/300/300" 
                      alt="Data visualization" 
                      width={300} 
                      height={300}
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
              <div className="absolute -left-4 -bottom-4 w-32 h-32 bg-blue-500 rounded-full z-[-1] blur-3xl opacity-20"></div>
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500 rounded-full z-[-1] blur-2xl opacity-20"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Just The Beginning Section - ADDED */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500 rounded-full opacity-10 blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-4xl font-bold mb-6 text-gray-900 dark:text-white">
              This Is Just The Beginning
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              We're on a mission to transform traditional education worldwide.
            </p>
          </motion.div>

          <motion.div 
            variants={staggerChildren}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-10"
          >
            <motion.div
              variants={fadeInUp}
              className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-100 dark:border-gray-700"
            >
              <div className="flex items-start mb-6">
                <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-lg mr-4">
                  <Globe className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Global Education Transformation
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    We're challenging boring traditional educational methods by creating engaging, personalized learning experiences that adapt to each student's unique needs and learning style.
                  </p>
                </div>
              </div>
              <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span>Making education accessible in underserved regions</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span>Creating content that inspires rather than bores</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span>Building systems that adapt to individual learning paces</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span>Measuring real understanding, not just memorization</span>
                </li>
              </ul>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-100 dark:border-gray-700"
            >
              <div className="flex items-start mb-6">
                <div className="bg-purple-100 dark:bg-purple-900/50 p-3 rounded-lg mr-4">
                  <Glasses className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Exploring AR/VR Frontiers
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    We're developing immersive learning experiences using augmented and virtual reality to create memorable, effective educational environments.
                  </p>
                </div>
              </div>
              <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">•</span>
                  <span>Virtual field trips to historical sites and scientific phenomena</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">•</span>
                  <span>Interactive 3D models for complex concepts</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">•</span>
                  <span>Collaborative virtual classrooms and study spaces</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">•</span>
                  <span>Immersive language learning environments</span>
                </li>
              </ul>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Our Core Values</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-12">
              These principles guide everything we do at Quizitt, from product development to customer support.
            </p>
          </motion.div>

          <motion.div 
            variants={staggerChildren}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {[
              {
                icon: <Brain className="h-8 w-8 text-purple-500" />,
                title: "Intelligence",
                description: "Our AI systems learn and adapt continuously to provide smarter learning experiences."
              },
              {
                icon: <Heart className="h-8 w-8 text-red-500" />,
                title: "Empathy",
                description: "We design with deep understanding of learners' needs, frustrations, and goals."
              },
              {
                icon: <Award className="h-8 w-8 text-amber-500" />,
                title: "Excellence",
                description: "We strive for the highest quality in our products, content, and service."
              },
              {
                icon: <Zap className="h-8 w-8 text-blue-500" />,
                title: "Innovation",
                description: "We continuously explore new ways to improve how people learn and retain knowledge."
              },
              {
                icon: <Users className="h-8 w-8 text-green-500" />,
                title: "Community",
                description: "We believe in the power of collaborative learning and supportive communities."
              },
              {
                icon: <Sparkles className="h-8 w-8 text-pink-500" />,
                title: "Delight",
                description: "We create experiences that surprise and engage, making learning enjoyable."
              }
            ].map((value, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 p-8 border border-gray-100 dark:border-gray-700"
              >
                <div className="bg-gray-100 dark:bg-gray-700 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{value.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{value.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            variants={staggerChildren}
            initial="hidden"
            animate={controls}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
          >
            {[
              { number: "1M+", label: "Active Users" },
              { number: "30M+", label: "Quizzes Generated" },
              { number: "150+", label: "Countries" },
              { number: "97%", label: "Satisfaction" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="p-6"
              >
                <p className="text-4xl md:text-5xl font-bold mb-2">{stat.number}</p>
                <p className="text-lg opacity-90">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Meet Our Team</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-12">
              A passionate group of educators, engineers, and designers dedicated to transforming how the world learns.
            </p>
          </motion.div>

          <motion.div 
            variants={staggerChildren}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="relative group"
              >
                <div className="rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 bg-gray-50 dark:bg-gray-700 h-full">
                  <div className="aspect-w-1 aspect-h-1 relative">
                    <Image 
                      src={member.image} 
                      alt={member.name} 
                      width={300} 
                      height={300}
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                      <div className="p-4 text-white">
                        <p className="text-sm">{member.bio}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{member.name}</h3>
                    <p className="text-gray-600 dark:text-gray-300">{member.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Support Our Mission Section - ADDED */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900 relative overflow-hidden">
        <div className="absolute -top-12 right-12 w-64 h-64 bg-green-500 rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute -bottom-12 left-12 w-64 h-64 bg-yellow-500 rounded-full opacity-10 blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-12"
          >
            <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Support Our Mission</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Your contribution helps us build innovative educational tools and bring them to learners worldwide.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-8 md:p-12">
                <div className="flex items-center mb-6">
                  <HandHelping className="h-8 w-8 text-purple-600 mr-4" />
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Donate to Support Our Team</h3>
                </div>
                
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Your donations help us:
                </p>
                
                <ul className="space-y-3 text-gray-600 dark:text-gray-300 mb-8">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    <span>Develop new educational technologies</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    <span>Expand our platform to more languages</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    <span>Provide free access in underserved communities</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    <span>Research cutting-edge AR/VR educational applications</span>
                  </li>
                </ul>
                
                <Link href="/donate">
                  <Button className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white px-8 py-3 rounded-lg font-medium w-full sm:w-auto">
                    Make a Donation
                  </Button>
                </Link>
              </div>
              
              <div className="relative h-64 md:h-auto">
                <Image 
                  src="/api/placeholder/600/480" 
                  alt="Students using Quizitt" 
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent md:bg-gradient-to-l"></div>
                <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:bottom-4 md:top-4 md:w-1/2 p-4 bg-white/10 backdrop-blur-md rounded-lg text-white">
                  <p className="font-medium">
                    "Education is the most powerful weapon which you can use to change the world."
                  </p>
                  <p className="text-sm mt-2 opacity-80">- Nelson Mandela</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Join Us Section - MODIFIED */}
      <section className="py-20 bg-white dark:bg-gray-800 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-purple-500 rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-blue-500 rounded-full opacity-10 blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Join Our Journey</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-10">
              Help us build the future of education. Whether you're a learner, educator, creator, or passionate about AR/VR technology, there's a place for you in our community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-medium w-full sm:w-auto">
                  Get Started
                </Button>
              </Link>
              <Link href="/careers">
                <Button variant="outline" className="border-purple-500 text-purple-600 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-900/20 px-8 py-3 rounded-lg font-medium w-full sm:w-auto">
                  Join Our Team
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;