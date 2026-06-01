import React from 'react';

const Footer = () => {
  return (
    <footer className="w-full bg-[#050508] text-white pt-24 pb-8 px-6 md:px-12 border-t border-white/10 mt-20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-16 mb-32 relative z-10">
        
        {/* Resources */}
        <div className="flex-1">
          <div className="border-t border-white/20 pt-4 mb-6">
            <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/50 mb-6">Resources (Coming Soon)</h3>
            <ul className="space-y-4 text-[13px] text-white/70">
              <li><a href="#" className="hover:text-[#00FFE5] transition-colors">Agent Framework</a></li>
              <li><a href="#" className="hover:text-[#00FFE5] transition-colors">Stellar Payments</a></li>
              <li><a href="#" className="hover:text-[#00FFE5] transition-colors">Rust SDK</a></li>
              <li><a href="#" className="hover:text-[#00FFE5] transition-colors">Smart Contracts</a></li>
            </ul>
          </div>
        </div>

        {/* Socials */}
        <div className="flex-1">
          <div className="border-t border-white/20 pt-4 mb-6">
            <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/50 mb-6">Socials</h3>
            <ul className="space-y-4 text-[13px] text-white/70">
              <li>
                <a href="#" className="hover:text-[#00FFE5] transition-colors flex items-center gap-3">
                  <span className="opacity-50 text-[10px]">X</span> Twitter / X
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#00FFE5] transition-colors flex items-center gap-3">
                  <span className="opacity-50 text-[10px]">IN</span> LinkedIn
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#00FFE5] transition-colors flex items-center gap-3">
                  <span className="opacity-50 text-[10px]">D</span> Discord
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Waitlist */}
        <div className="flex-[1.5]" id="early-access">
          <div className="border-t border-white/20 pt-4 mb-6">
            <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/50 mb-6">Waitlist</h3>
            <h2 className="text-4xl md:text-5xl font-serif mb-4 text-white">Be the first praetorian.</h2>
            <p className="text-white/60 text-sm mb-8">Early access to the terminal and agent templates.</p>
            
            <div className="relative border-b border-white/30 pb-2 flex items-center group hover:border-[#00FFE5]/50 transition-colors">
              <input 
                type="email" 
                placeholder="you@domain.com" 
                className="bg-transparent border-none outline-none w-full text-white placeholder:text-white/30 text-sm"
              />
              <button className="text-white/50 hover:text-[#00FFE5] transition-colors ml-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full text-center overflow-hidden flex justify-center items-center relative z-10 pointer-events-none select-none opacity-90 px-4">
        <h1 className="text-[11.5vw] font-serif tracking-widest leading-none text-white m-0 p-0 whitespace-nowrap">
          AGENTFORGE
        </h1>
      </div>
      
      {/* Background Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[50%] bg-[#00FFE5]/5 blur-[120px] rounded-full pointer-events-none -z-0"></div>
    </footer>
  );
};

export default Footer;
