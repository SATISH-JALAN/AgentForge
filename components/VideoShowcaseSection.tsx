'use client';

import React, { useRef, useLayoutEffect, useState, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion, AnimatePresence } from 'framer-motion';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const VIDEOS = [
  { 
    id: "01", 
    title: "Wallet Balance & Withdrawal", 
    desc: "Watch the sandboxed agent manage its smart wallet balance and execute on-chain withdrawals.",
    src: "/demo2.1.mp4"
  },
  { 
    id: "02", 
    title: "0x402 Micro-Settlement", 
    desc: "See the protocol handle sub-cent micro-settlements automatically as the workflow completes.",
    src: "/demo1.1.mp4"
  }
];

const VideoPlayer = ({ 
  src, 
  isMuted, 
  isActive, 
  onToggleMute 
}: { 
  src: string; 
  isMuted: boolean; 
  isActive: boolean; 
  onToggleMute: () => void;
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showIcon, setShowIcon] = useState<'play' | 'pause' | null>(null);

  useEffect(() => {
    if (isActive) {
      videoRef.current?.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    } else {
      videoRef.current?.pause();
      setIsPlaying(false);
    }
  }, [isActive]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
        triggerIcon('play');
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
        triggerIcon('pause');
      }
    }
  };

  const triggerIcon = (type: 'play' | 'pause') => {
    setShowIcon(type);
    setTimeout(() => setShowIcon(null), 600); // fade out after 600ms
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100);
    }
  };

  const handleScrub = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (videoRef.current && videoRef.current.duration) {
      const rect = e.currentTarget.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      videoRef.current.currentTime = pos * videoRef.current.duration;
      setProgress(pos * 100);
    }
  };

  return (
    <div className="relative w-full flex flex-col bg-black group">
      <div className="relative flex-1 cursor-pointer flex justify-center overflow-hidden" onClick={togglePlay}>
        <video 
          ref={videoRef}
          src={src}
          loop
          muted={isMuted}
          playsInline
          onTimeUpdate={handleTimeUpdate}
          className="w-auto h-auto max-w-full max-h-[55vh] md:max-h-[60vh] block object-contain"
        />

        {/* Play/Pause Center Icon Animation */}
        <AnimatePresence>
          {showIcon && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.5 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <div className="w-20 h-20 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white shadow-2xl">
                {showIcon === 'play' ? (
                  <svg className="w-10 h-10 ml-2" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                ) : (
                  <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Persistent Pause state icon if it's paused and active */}
        {!isPlaying && isActive && !showIcon && (
           <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-50 transition-opacity group-hover:opacity-100">
             <div className="w-20 h-20 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white">
                <svg className="w-10 h-10 ml-2" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
             </div>
           </div>
        )}
      </div>

      {/* Custom Controls Bar */}
      <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col gap-3">
        {/* Scrubber */}
        <div 
          className="w-full h-2 bg-white/20 rounded-full cursor-pointer relative overflow-hidden group/scrub"
          onClick={handleScrub}
        >
          <div 
            className="absolute top-0 left-0 h-full bg-[var(--color-green-strong)] rounded-full transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
          <div className="absolute top-0 left-0 w-full h-full hover:bg-white/10 transition-colors" />
        </div>
        
        {/* Bottom Bar: Mute / Unmute */}
        <div className="flex justify-between items-center px-2">
          <button 
             onClick={(e) => { e.stopPropagation(); togglePlay(); }}
             className="text-white hover:text-[var(--color-green-strong)] transition-colors"
          >
             {isPlaying ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
             ) : (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
             )}
          </button>

          <button 
             onClick={(e) => { e.stopPropagation(); onToggleMute(); }}
             className="text-white hover:text-[var(--color-green-strong)] transition-colors flex items-center gap-2"
          >
             {isMuted ? (
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
             ) : (
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
             )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function VideoShowcaseSection() {
  const containerRef = useRef<HTMLElement>(null);
  const activeIndexRef = useRef(0);
  
  const [activeIndex, setActiveIndex] = useState(0);
  const [isSectionActive, setIsSectionActive] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  
  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=3500", // Gives us plenty of scroll distance for the effect
          scrub: true, // Use strict scrub instead of delayed scrub to prevent rubber-banding jitter
          pin: true,
          onEnter: () => setIsSectionActive(true),
          onLeave: () => setIsSectionActive(false),
          onEnterBack: () => setIsSectionActive(true),
          onLeaveBack: () => setIsSectionActive(false),
          onUpdate: (self) => {
             const newIndex = self.progress < 0.5 ? 0 : 1;
             if (newIndex !== activeIndexRef.current) {
                activeIndexRef.current = newIndex;
                setActiveIndex(newIndex);
             }
          }
        }
      });
      
      VIDEOS.forEach((_, i) => {
        const videoWrapper = `.video-wrapper-${i}`;
        const textWrapper = `.text-wrapper-${i}`;
        
        if (i === 0) {
          // First video is already visible when we arrive at the section
          gsap.set(videoWrapper, { scale: 1, opacity: 1, autoAlpha: 1 });
          gsap.set(textWrapper, { opacity: 1, y: 0, autoAlpha: 1 });
          
          // 1. Pause (user watches first video)
          tl.to({}, { duration: 1.5 });
          
          // 2. Fly out
          tl.to(textWrapper, { 
            opacity: 0, 
            y: -30, 
            autoAlpha: 0, 
            duration: 0.5 
          })
          .to(videoWrapper, { 
            scale: 4, 
            opacity: 0, 
            autoAlpha: 0, 
            duration: 1.5,
            ease: "power2.in"
          }, "<0.2");

        } else {
          // Initial state for subsequent videos: Tiny in the background, invisible
          gsap.set(videoWrapper, { scale: 0.1, opacity: 0, autoAlpha: 0 });
          gsap.set(textWrapper, { opacity: 0, y: 30, autoAlpha: 0 });
          
          // 1. Fly in from the deep background
          tl.to(videoWrapper, { 
            scale: 1, 
            opacity: 1, 
            autoAlpha: 1, 
            duration: 1.5,
            ease: "power2.inOut" 
          })
          // Text enters slightly delayed
          .to(textWrapper, { 
            opacity: 1, 
            y: 0, 
            autoAlpha: 1, 
            duration: 0.8,
            ease: "power2.out"
          }, "<0.7");
            
          // 2. Pause 
          tl.to({}, { duration: 1.5 });

          // 3. Fly out (if not the last video)
          if (i !== VIDEOS.length - 1) {
            tl.to(textWrapper, { 
              opacity: 0, 
              y: -30, 
              autoAlpha: 0, 
              duration: 0.5 
            })
            .to(videoWrapper, { 
              scale: 4, 
              opacity: 0, 
              autoAlpha: 0, 
              duration: 1.5,
              ease: "power2.in"
            }, "<0.2");
          }
        }
      });
    }, containerRef);
    
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative w-full h-screen bg-[#050508] overflow-hidden flex items-center justify-center border-t border-white/5">
       
       {/* Background Depth Lines to give a sense of 3D space */}
       <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--color-green-strong)] to-transparent" />
          <div className="absolute left-1/2 top-0 h-full w-[1px] bg-gradient-to-b from-transparent via-[var(--color-green-strong)] to-transparent" />
       </div>

        {VIDEOS.map((vid, i) => (
         <div key={vid.id} className={`absolute inset-0 flex flex-col items-center justify-start pt-[100px] pb-[40px] pointer-events-none px-4 md:px-8 overflow-hidden`}>
           
           {/* Text Overlay */}
           <div className={`text-wrapper-${i} z-20 flex flex-col items-center text-center max-w-3xl px-4 pointer-events-auto will-change-transform shrink-0`}>
              <h2 className="font-syne text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-3 drop-shadow-2xl">
                {vid.title}
              </h2>
              <p className="text-[#8b8b93] text-[14px] md:text-[16px] leading-[1.6] max-w-xl mx-auto drop-shadow-md">
                {vid.desc}
              </p>
           </div>
           
            {/* Video Container (Dynamic size to perfectly fit remaining space) */}
            <div className="w-full flex-1 flex justify-center items-center min-h-0 mt-6 md:mt-8 pointer-events-none">
              <div className={`video-wrapper-${i} z-10 w-fit max-w-[1200px] h-fit bg-[#0a0a0f] border border-white/10 rounded-2xl shadow-[0_0_80px_rgba(0,208,182,0.1)] overflow-hidden flex flex-col pointer-events-auto will-change-transform shrink-0`}>
               
               {/* Fake browser/video header */}
               <div className="w-full h-8 md:h-10 bg-[#0e0e14] border-b border-white/5 flex items-center px-4 justify-between shrink-0">
                 <div className="flex gap-2">
                   <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                   <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                   <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                 </div>
                 
                 <div className="text-white/30 text-[10px] font-mono tracking-widest hidden md:block">
                   AGENTFORGE // SANDBOX
                 </div>

                 <button 
                   onClick={() => setIsMuted(!isMuted)}
                   className="flex items-center gap-2 text-white/50 hover:text-white transition-colors pointer-events-auto"
                 >
                   {isMuted ? (
                     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                     </svg>
                   ) : (
                     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                     </svg>
                   )}
                   <span className="text-[10px] tracking-widest uppercase font-mono">{isMuted ? 'Unmute' : 'Mute'}</span>
                 </button>
               </div>

               {/* Video Content with Custom Controls */}
               <VideoPlayer 
                 src={vid.src}
                 isMuted={isMuted}
                 isActive={isSectionActive && activeIndex === i}
                 onToggleMute={() => setIsMuted(!isMuted)}
               />

              </div>
            </div>

          </div>
        ))}
    </section>
  );
}
