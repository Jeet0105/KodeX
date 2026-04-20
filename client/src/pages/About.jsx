import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const About = () => {
  return (
    <div className="bg-[#0B0617] text-white min-h-screen font-sans flex flex-col">
      <Navbar />

      {/* Core Content wraps main page growth */}
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
          {/* Glassmorphism Glow Effects */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-fuchsia-600/10 rounded-full blur-[120px] pointer-events-none" />

          <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.1] text-violet-300 text-sm font-medium mb-8">
              <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse"></span>
              Redefining Coding Platforms
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
              Empowering Next-Gen <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
                Developers.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-400 mb-10 leading-relaxed max-w-2xl mx-auto">
              KodeX is more than just a coding platform. It's an immersive environment designed for algorithmic thinkers to hone their craft, connect with like-minded peers, and push the boundaries of what they can build.
            </p>
          </div>
        </div>

        {/* Mission & Vision grid */}
        <div className="container mx-auto px-4 py-24 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Driving Innovation</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Our core philosophy is centered around delivering the most seamless and performant experience for engineers.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Mission Card */}
            <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] p-10 rounded-3xl hover:bg-white/[0.05] hover:-translate-y-1 hover:border-violet-500/30 transition-all duration-300 group">
              <div className="w-14 h-14 bg-violet-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-violet-500/20 transition-colors">
                <svg className="w-7 h-7 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">Our Mission</h3>
              <p className="text-gray-400 leading-relaxed">
                To democratize programming education by providing high-performance execution environments, rich analytics, and an intuitive user interface to developers of all skill levels globally. We believe access to a stellar development environment shouldn't be a privilege.
              </p>
            </div>

            {/* Vision Card */}
            <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] p-10 rounded-3xl hover:bg-white/[0.05] hover:-translate-y-1 hover:border-fuchsia-500/30 transition-all duration-300 group">
              <div className="w-14 h-14 bg-fuchsia-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-fuchsia-500/20 transition-colors">
                <svg className="w-7 h-7 text-fuchsia-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">Our Vision</h3>
              <p className="text-gray-400 leading-relaxed">
                Building the definitive ecosystem where learning data structures, algorithms, and system design is an engaging, seamless, and community-driven experience. We envision KodeX as the central hub where the world's most brilliant minds come to test their logic.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;
