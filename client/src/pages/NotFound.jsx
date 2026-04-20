import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const NotFound = () => {
  return (
    <div className="bg-[#0B0617] text-white min-h-screen font-sans flex flex-col">
      <Navbar />
      
      <main className="flex-grow flex flex-col items-center justify-center relative overflow-hidden px-4 py-20">
        {/* Abstract Glow Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-fuchsia-600/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="text-center relative z-10">
          <div className="relative inline-block mb-6">
            <h1 className="text-9xl md:text-[150px] font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white/80 to-white/10 select-none">
              404
            </h1>
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500/30 to-fuchsia-500/30 blur-2xl -z-10 rounded-full opacity-50" />
          </div>
          
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white drop-shadow-md">
            Lost in the Void
          </h2>
          <p className="text-gray-400 mb-10 max-w-lg mx-auto text-lg leading-relaxed">
            We've searched the entire algorithm, but the page you're looking for doesn't seem to exist. It might have been moved or deleted.
          </p>
          
          <Link 
            to="/" 
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-violet-600/20 text-violet-400 font-semibold hover:bg-violet-600 hover:text-white transition-all duration-300 border border-violet-500/30 hover:border-violet-500 hover:shadow-lg hover:shadow-violet-500/25 group"
          >
            <svg 
              className="w-5 h-5 group-hover:-translate-x-1 transition-transform" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Return to Dashboard
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NotFound;
