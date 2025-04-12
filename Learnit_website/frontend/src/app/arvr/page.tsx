'use client'
import React, { useEffect, useRef, useState } from 'react';

const ARVRComingSoon: React.FC = () => {
  const [activeTimelineItem, setActiveTimelineItem] = useState(0);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    // Animation for elements that should animate on page load
    const elementsToAnimate = document.querySelectorAll('.animate-on-load');
    elementsToAnimate.forEach((element, index) => {
      setTimeout(() => {
        element.classList.add('appear');
      }, 100 * index);
    });

    // Set up intersection observer for scroll animations
    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('appear');
          // If it's a timeline item, update the active state
          if (entry.target.classList.contains('timeline-item')) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0');
            setActiveTimelineItem(index);
          }
        }
      });
    }, { threshold: 0.2 });

    // Observe all elements that should animate on scroll
    const animateOnScrollElements = document.querySelectorAll('.animate-on-scroll');
    animateOnScrollElements.forEach(element => {
      observerRef.current?.observe(element);
    });

    // Clean up
    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  return (
    <div className="bg-gray-900 text-white">
      {/* Global Styles */}
      <style jsx global>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
        
        @keyframes pulse {
          0% { opacity: 0.8; }
          50% { opacity: 1; }
          100% { opacity: 0.8; }
        }
        
        @keyframes rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes expand {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        
        .shimmer-text {
          background: linear-gradient(90deg, #ffffff 0%, #ffcb6b 20%, #ffffff 40%, #ffcb6b 60%, #ffffff 80%, #ffcb6b 100%);
          background-size: 200% auto;
          color: transparent;
          background-clip: text;
          -webkit-background-clip: text;
          animation: shimmer 8s linear infinite;
        }
        
        .floating {
          animation: float 6s ease-in-out infinite;
        }
        
        .rotating-border {
          position: relative;
        }
        
        .rotating-border::before {
          content: '';
          position: absolute;
          top: -4px;
          left: -4px;
          right: -4px;
          bottom: -4px;
          border: 2px solid transparent;
          border-radius: inherit;
          background: linear-gradient(45deg, #ffcb6b, #4f46e5, #06b6d4, #ffcb6b) border-box;
          -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: destination-out;
          mask-composite: exclude;
          animation: rotate 20s linear infinite;
        }
        
        .animate-on-load, .animate-on-scroll {
          opacity: 0;
          transition: opacity 0.8s ease, transform 0.8s ease;
        }
        
        .animate-on-load.appear, .animate-on-scroll.appear {
          opacity: 1;
        }
        
        .fade-in-animation.appear {
          animation: fadeIn 1s forwards;
        }
        
        .slide-up-animation.appear {
          animation: slideUp 1s forwards;
        }
        
        .slide-left-animation.appear {
          animation: slideInLeft 1s forwards;
        }
        
        .slide-right-animation.appear {
          animation: slideInRight 1s forwards;
        }
        
        .expand-animation.appear {
          animation: expand 1s forwards;
        }
        
        .delay-100 { transition-delay: 100ms; }
        .delay-200 { transition-delay: 200ms; }
        .delay-300 { transition-delay: 300ms; }
        .delay-400 { transition-delay: 400ms; }
        .delay-500 { transition-delay: 500ms; }
        .delay-600 { transition-delay: 600ms; }
        .delay-700 { transition-delay: 700ms; }
        .delay-800 { transition-delay: 800ms; }
        
        .glow {
          filter: drop-shadow(0 0 8px rgba(255, 203, 107, 0.5));
        }
        
        .timeline-progress-line {
          transition: height 0.5s ease;
        }
        
        .timeline-item {
          transition: opacity 0.3s ease, transform 0.3s ease;
        }
        
        .timeline-item.active {
          opacity: 1;
          transform: scale(1.05);
        }
        
        .parallax-bg {
          background-attachment: fixed;
          background-position: center;
          background-repeat: no-repeat;
          background-size: cover;
        }
        
        .glass-effect {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .hero-gradient {
          background: radial-gradient(circle at 50% 50%, #4338ca, #1e1b4b);
        }
        
        .feature-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .feature-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
        }
      `}</style>

      {/* Hero Section with Concept Art */}
      <section className="relative overflow-hidden min-h-screen flex items-center hero-gradient">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full">
            {/* Grid lines */}
            <div className="absolute inset-0 grid grid-cols-6 grid-rows-6">
              {Array.from({ length: 36 }).map((_, i) => (
                <div key={i} className="border border-indigo-500/10"></div>
              ))}
            </div>
            
            {/* Floating geometric shapes */}
            <div className="absolute top-1/4 left-1/6 w-32 h-32 rounded-full bg-cyan-600/10 floating" style={{ animationDelay: '0s' }}></div>
            <div className="absolute top-1/3 right-1/6 w-24 h-24 rounded-full bg-purple-600/10 floating" style={{ animationDelay: '1s' }}></div>
            <div className="absolute bottom-1/4 left-1/3 w-40 h-40 rounded-full bg-amber-500/10 floating" style={{ animationDelay: '2s' }}></div>
            
            {/* Glowing particles */}
            {Array.from({ length: 20 }).map((_, i) => (
              <div 
                key={i}
                className="absolute w-2 h-2 rounded-full bg-amber-400/80 glow"
                style={{ 
                  top: `${Math.random() * 100}%`, 
                  left: `${Math.random() * 100}%`,
                  animation: `pulse 3s infinite, float 8s infinite`,
                  animationDelay: `${Math.random() * 5}s`
                }}
              ></div>
            ))}
          </div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 py-16">
            <div className="lg:w-1/2 space-y-8">
              <div className="inline-block px-4 py-2 rounded-full bg-indigo-900/50 border border-indigo-400/50 text-indigo-200 font-medium text-lg animate-on-load slide-right-animation">
                Coming Soon
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                <span className="block animate-on-load slide-up-animation">Experience</span>
                <span className="shimmer-text font-extrabold text-6xl md:text-8xl block mt-2 animate-on-load slide-up-animation delay-200">Immersive Learning</span>
                <span className="block mt-2 animate-on-load slide-up-animation delay-300">With AR/VR</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-300 animate-on-load fade-in-animation delay-400">
                Transform your educational experience with our upcoming Augmented and Virtual Reality features. Dive into interactive 3D quizzes and immersive flashcards.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 animate-on-load fade-in-animation delay-500">
                <button className="px-8 py-4 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold hover:from-amber-400 hover:to-amber-500 transition-all text-lg transform hover:scale-105">
                  Donate to our Cause
                </button>
                <button className="px-8 py-4 rounded-lg bg-indigo-900/40 backdrop-blur-sm border border-indigo-500/50 text-white hover:bg-indigo-800/40 transition-all font-bold text-lg transform hover:scale-105">
                  Learn More
                </button>
              </div>
            </div>

            {/* Concept Art Section */}
            <div className="lg:w-1/2 animate-on-load expand-animation delay-400">
              <div className="relative">
                {/* Main concept art - VR device */}
                <div className="relative w-full h-96 rounded-xl overflow-hidden rotating-border glass-effect">
                  <div className="absolute inset-0 flex items-center justify-center p-6">
                    {/* This would be replaced with actual concept art in a real implementation */}
                    <div className="relative w-72 h-64 floating">
                      {/* VR Headset concept */}
                      <div className="absolute top-0 left-0 right-0 bottom-0 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center border border-amber-500/30">
                        {/* Headset display */}
                        <div className="w-48 h-24 bg-gradient-to-r from-cyan-600/70 to-blue-800/70 rounded-lg"></div>
                        
                        {/* Head strap */}
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-4 h-12 bg-gray-700 rounded-t-lg"></div>
                        <div className="absolute top-0 left-0 right-0 h-2 bg-gray-700 rounded-full"></div>
                        
                        {/* Side controls */}
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-amber-500 rounded-full glow"></div>
                      </div>
                      
                      {/* AR glasses concept floating in front */}
                      <div className="absolute -bottom-8 -right-12 w-48 h-24 rounded-lg bg-gradient-to-br from-indigo-800/80 to-purple-900/80 border border-indigo-500/30 transform rotate-12 floating" style={{ animationDelay: '1.5s' }}>
                        {/* Glasses frame */}
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-12 flex items-center">
                          {/* Left lens */}
                          <div className="w-12 h-8 rounded-full bg-cyan-500/30 border border-cyan-400"></div>
                          {/* Bridge */}
                          <div className="w-8 h-1 bg-gray-400"></div>
                          {/* Right lens */}
                          <div className="w-12 h-8 rounded-full bg-cyan-500/30 border border-cyan-400"></div>
                        </div>
                      </div>
                      
                      {/* Holographic UI elements floating around */}
                      <div className="absolute -top-12 -left-8 w-32 h-20 rounded bg-transparent border border-cyan-400/40 transform -rotate-12 floating" style={{ animationDelay: '2s' }}>
                      <div className="absolute top-2 left-2 w-12 h-2 bg-cyan-400/60 rounded-full"></div>
                        <div className="absolute top-6 left-4 w-20 h-2 bg-cyan-400/60 rounded-full"></div>
                        <div className="absolute top-10 left-6 w-16 h-2 bg-cyan-400/60 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Decorative elements */}
                <div className="absolute -z-10 -top-10 -right-10 w-64 h-64 rounded-full bg-gradient-to-r from-purple-700/20 to-indigo-700/20 blur-3xl"></div>
                <div className="absolute -z-10 -bottom-10 -left-10 w-64 h-64 rounded-full bg-gradient-to-r from-amber-700/20 to-red-700/20 blur-3xl"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-24 bg-gradient-to-b from-gray-900 to-gray-950 relative">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-full h-full bg-[url('/grid-pattern.svg')] opacity-5"></div>
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16 animate-on-scroll slide-up-animation">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="shimmer-text font-extrabold">Development Roadmap</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">Follow our journey as we build the next generation of immersive learning experiences.</p>
          </div>
          
          <div className="flex flex-col lg:flex-row max-w-6xl mx-auto">
            {/* Timeline vertical line */}
            <div className="hidden lg:flex flex-col items-center relative px-8">
              <div className="w-0.5 bg-gray-700 rounded h-full absolute left-1/2 transform -translate-x-1/2"></div>
              <div className={`w-0.5 bg-gradient-to-b from-amber-400 to-amber-600 rounded absolute left-1/2 transform -translate-x-1/2 top-0 timeline-progress-line transition-all duration-1000 ease-in-out`} style={{ height: `${(activeTimelineItem + 1) * 25}%` }}></div>
              
              {/* Timeline milestones */}
              {[0, 1, 2, 3].map((index) => (
                <div 
                  key={index}
                  className={`w-6 h-6 rounded-full border-2 ${index <= activeTimelineItem ? 'bg-amber-500 border-amber-400' : 'bg-gray-800 border-gray-700'} absolute left-1/2 transform -translate-x-1/2 z-10 transition-all duration-500`}
                  style={{ top: `${index * 25}%` }}
                ></div>
              ))}
            </div>
            
            {/* Timeline content */}
            <div className="flex-1">
              {/* Phase 1 */}
              <div 
                className={`timeline-item animate-on-scroll slide-right-animation mb-24 p-6 rounded-xl glass-effect ${activeTimelineItem === 0 ? 'active' : ''}`}
                data-index="0"
              >
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-black font-bold text-xl mr-4">1</div>
                  <h3 className="text-2xl font-bold text-amber-300">Research & Design</h3>
                </div>
                <p className="text-gray-300 mb-6 pl-14">Exploring cutting-edge AR/VR technologies and designing immersive educational experiences that enhance learning outcomes.</p>
                <div className="pl-14 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="rounded-xl overflow-hidden h-48 bg-gradient-to-br from-purple-900 to-indigo-900 flex items-center justify-center p-4">
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full bg-purple-500/30 mx-auto mb-4 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0114 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-bold text-purple-300">User Research</h4>
                      <p className="text-purple-100/80 text-sm">Understanding learner needs and cognitive patterns</p>
                    </div>
                  </div>
                  <div className="rounded-xl overflow-hidden h-48 bg-gradient-to-br from-blue-900 to-cyan-900 flex items-center justify-center p-4">
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full bg-blue-500/30 mx-auto mb-4 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-bold text-blue-300">UX Prototyping</h4>
                      <p className="text-blue-100/80 text-sm">Creating intuitive spatial interfaces for learning</p>
                    </div>
                  </div>
                </div>
                <div className="pl-14 mt-4 text-sm text-amber-200/70">
                  Status: <span className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded">Completed</span>
                </div>
              </div>
              
              {/* Phase 2 */}
              <div 
                className={`timeline-item animate-on-scroll slide-right-animation mb-24 p-6 rounded-xl glass-effect ${activeTimelineItem === 1 ? 'active' : ''}`}
                data-index="1"
              >
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-black font-bold text-xl mr-4">2</div>
                  <h3 className="text-2xl font-bold text-amber-300">Prototype Development</h3>
                </div>
                <p className="text-gray-300 mb-6 pl-14">Building functional prototypes of our core AR/VR features and testing them with real students and educators.</p>
                <div className="pl-14 rounded-xl overflow-hidden bg-gradient-to-br from-indigo-900 to-blue-900 p-1">
                  <div className="bg-gray-900/40 rounded-lg p-4">
                    <div className="grid grid-cols-4 gap-4">
                      <div className="h-16 rounded bg-indigo-800/50 border border-indigo-700/50 flex items-center justify-center text-indigo-300 font-medium">3D Models</div>
                      <div className="h-16 rounded bg-indigo-800/50 border border-indigo-700/50 flex items-center justify-center text-indigo-300 font-medium">Spatial UI</div>
                      <div className="h-16 rounded bg-indigo-800/50 border border-indigo-700/50 flex items-center justify-center text-indigo-300 font-medium">Gestures</div>
                      <div className="h-16 rounded bg-indigo-800/50 border border-indigo-700/50 flex items-center justify-center text-indigo-300 font-medium">Voice Control</div>
                    </div>
                    <div className="mt-4 h-40 rounded-xl bg-indigo-800/20 border border-indigo-700/30 flex items-center justify-center p-4">
                      <div className="text-center">
                        <div className="w-16 h-16 rounded-full bg-blue-500/20 mx-auto mb-2 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <h4 className="text-lg font-bold text-blue-300">Interactive Prototype</h4>
                        <p className="text-blue-100/80 text-sm">Core experiences ready for testing with real users</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="pl-14 mt-4 text-sm text-amber-200/70">
                  Status: <span className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded">Completed</span>
                </div>
              </div>
              
              {/* Phase 3 */}
              <div 
                className={`timeline-item animate-on-scroll slide-right-animation mb-24 p-6 rounded-xl glass-effect ${activeTimelineItem === 2 ? 'active' : ''}`}
                data-index="2"
              >
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-black font-bold text-xl mr-4">3</div>
                  <h3 className="text-2xl font-bold text-amber-300">Beta Testing & Refinement</h3>
                </div>
                <p className="text-gray-300 mb-6 pl-14">Expanding our test group and refining the experience based on real-world feedback from classrooms and study groups.</p>
                <div className="pl-14 grid grid-cols-1 gap-6">
                  <div className="rounded-xl overflow-hidden bg-gradient-to-br from-cyan-900 to-teal-900 p-6">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                      <div className="w-full md:w-1/3">
                        <div className="aspect-square rounded-xl bg-cyan-800/30 border border-cyan-700/30 flex items-center justify-center">
                          <div className="w-24 h-24 rounded-full bg-cyan-500/20 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-cyan-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      <div className="w-full md:w-2/3">
                        <h4 className="text-xl font-bold text-cyan-300 mb-2">User Testing Program</h4>
                        <p className="text-cyan-100/80 mb-4">12 schools, 45 teachers, and over 500 students testing our early access features</p>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="p-2 rounded bg-cyan-800/30 text-center text-cyan-200 text-sm">3D Quiz Module</div>
                          <div className="p-2 rounded bg-cyan-800/30 text-center text-cyan-200 text-sm">Flashcard System</div>
                          <div className="p-2 rounded bg-cyan-800/30 text-center text-cyan-200 text-sm">Study Room</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="pl-14 mt-4 text-sm text-amber-200/70">
                  Status: <span className="bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded">In Progress</span>
                </div>
              </div>
              
              {/* Phase 4 */}
              {/* Phase 4 */}
              <div 
                className={`timeline-item animate-on-scroll slide-right-animation mb-24 p-6 rounded-xl glass-effect ${activeTimelineItem === 3 ? 'active' : ''}`}
                data-index="3"
              >
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-black font-bold text-xl mr-4">4</div>
                  <h3 className="text-2xl font-bold text-amber-300">Public Launch</h3>
                </div>
                <p className="text-gray-300 mb-6 pl-14">Bringing our immersive AR/VR learning tools to students and educators worldwide with full platform integration.</p>
                <div className="pl-14 rounded-xl overflow-hidden bg-gradient-to-br from-amber-900 to-orange-900 p-6">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-24 h-24 rounded-full bg-amber-500/20 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h4 className="text-xl font-bold text-amber-300 text-center">Full Platform Integration</h4>
                    <p className="text-amber-100/80 text-center">Seamless AR/VR experiences across all devices and learning modules</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full mt-4">
                      <div className="p-3 rounded bg-amber-800/30 text-center text-amber-200 text-sm">Mobile AR</div>
                      <div className="p-3 rounded bg-amber-800/30 text-center text-amber-200 text-sm">Desktop VR</div>
                      <div className="p-3 rounded bg-amber-800/30 text-center text-amber-200 text-sm">Headset Support</div>
                      <div className="p-3 rounded bg-amber-800/30 text-center text-amber-200 text-sm">Classroom Tools</div>
                    </div>
                  </div>
                </div>
                <div className="pl-14 mt-4 text-sm text-amber-200/70">
                  Status: <span className="bg-gray-500/20 text-gray-400 px-2 py-0.5 rounded">Coming Soon</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-950 relative">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-indigo-900/10 to-transparent"></div>
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-indigo-900/10 blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-purple-900/10 blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16 animate-on-scroll slide-up-animation">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="shimmer-text font-extrabold">Immersive Learning Features</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">Discover how our AR/VR tools will transform your educational experience.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Feature 1 */}
            <div className="feature-card animate-on-scroll slide-up-animation p-6 rounded-xl glass-effect border border-indigo-500/20">
              <div className="w-16 h-16 rounded-full bg-indigo-900 flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-indigo-300 mb-3">3D Flashcards</h3>
              <p className="text-gray-300 mb-4">Transform traditional flashcards into interactive 3D models that you can manipulate, explore, and memorize more effectively.</p>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Spatial memory enhancement
                </li>
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Interactive animations
                </li>
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Multi-sensory learning
                </li>
              </ul>
            </div>
            
            {/* Feature 2 */}
            <div className="feature-card animate-on-scroll slide-up-animation delay-200 p-6 rounded-xl glass-effect border border-cyan-500/20">
              <div className="w-16 h-16 rounded-full bg-cyan-900 flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyan-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-cyan-300 mb-3">Virtual Study Rooms</h3>
              <p className="text-gray-300 mb-4">Join friends in customizable virtual spaces designed for collaborative learning and knowledge sharing.</p>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Real-time collaboration
                </li>
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Shared whiteboards & notes
                </li>
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Virtual teaching tools
                </li>
              </ul>
            </div>
            
            {/* Feature 3 */}
            <div className="feature-card animate-on-scroll slide-up-animation delay-400 p-6 rounded-xl glass-effect border border-amber-500/20">
              <div className="w-16 h-16 rounded-full bg-amber-900 flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-amber-300 mb-3">Interactive Quizzes</h3>
              <p className="text-gray-300 mb-4">Experience quizzes in a whole new dimension with interactive 3D objects and immersive environments.</p>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Gamified learning
                </li>
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Adaptive difficulty
                </li>
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Instant feedback
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 bg-gradient-to-t from-gray-950 to-gray-900 relative">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full">
            {/* Particle effects */}
            {Array.from({ length: 30 }).map((_, i) => (
              <div 
                key={i}
                className="absolute w-2 h-2 rounded-full bg-amber-400/60 glow"
                style={{ 
                  top: `${Math.random() * 100}%`, 
                  left: `${Math.random() * 100}%`,
                  animation: `pulse 3s infinite, float 8s infinite`,
                  animationDelay: `${Math.random() * 5}s`
                }}
              ></div>
            ))}
          </div>
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-indigo-900/30 to-purple-900/30 p-1 rounded-2xl animate-on-scroll expand-animation">
            <div className="bg-gray-900/80 rounded-2xl p-8 md:p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                <span className="shimmer-text font-extrabold">Be The First To Experience</span>
              </h2>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Join our early access program and help shape the future of immersive learning. Limited spots available.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="px-8 py-4 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold hover:from-amber-400 hover:to-amber-500 transition-all text-to-amber-500 transition-all text-lg transform hover:scale-105">
              Join Early Access
              </button>
              <button className="px-8 py-4 rounded-lg bg-gradient-to-r from-indigo-700/50 to-indigo-800/50 text-white border border-indigo-500/30 hover:from-indigo-600/50 hover:to-indigo-700/50 transition-all font-bold text-lg transform hover:scale-105">
              Request Demo
              </button>
              </div>
              <div className="mt-8 flex justify-center">
              <div className="space-y-2">
              <p className="text-amber-300 font-medium">Stay updated with our progress</p>
              <div className="flex">
              <input type="email" placeholder="Enter your email" className="px-4 py-3 rounded-l-lg bg-gray-800 border border-gray-700 focus:outline-none focus:border-amber-500 w-64" />
              <button className="px-4 py-3 rounded-r-lg bg-amber-500 text-black font-medium hover:bg-amber-400 transition-all">Subscribe</button>
              </div>
              </div>
              </div>
              </div>
              </div>
              </div>
              </section>
            </div>
            );
};
export default ARVRComingSoon;