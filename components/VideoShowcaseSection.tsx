'use client';

import React, { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const VIDEOS = [
  { 
    id: "01", 
    title: "Autonomous Trading Loop", 
    desc: "Watch the sandboxed agent execute a high-frequency trading loop entirely on-chain." 
  },
  { 
    id: "02", 
    title: "0x402 Micro-Settlement", 
    desc: "See the protocol handle sub-cent micro-settlements automatically as the workflow completes." 
  }
];

export default function VideoShowcaseSection() {
  const containerRef = useRef<HTMLElement>(null);
  
  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=3500", // Gives us plenty of scroll distance for the effect
          scrub: true, // Use strict scrub instead of delayed scrub to prevent rubber-banding jitter
          pin: true,
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
         <div key={vid.id} className={`absolute inset-0 flex flex-col items-center justify-center gap-6 md:gap-10 pointer-events-none p-4 md:p-8 pt-20 md:pt-32`}>
           
           {/* Text Overlay */}
           <div className={`text-wrapper-${i} z-20 flex flex-col items-center text-center max-w-2xl px-4 pointer-events-auto will-change-transform`}>
              <h2 className="font-syne text-3xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 drop-shadow-2xl">
                {vid.title}
              </h2>
              <p className="text-[#8b8b93] text-[14px] md:text-[17px] leading-[1.6] max-w-xl mx-auto drop-shadow-md">
                {vid.desc}
              </p>
           </div>
           
           {/* Video Box */}
           <div className={`video-wrapper-${i} z-10 w-full md:w-[70vw] max-w-[1000px] max-h-[45vh] md:max-h-[55vh] aspect-video bg-[#0a0a0f] border border-white/10 rounded-2xl shadow-[0_0_80px_rgba(0,208,182,0.1)] overflow-hidden flex flex-col items-center justify-center pointer-events-auto will-change-transform`}>
             
             {/* Fake browser/video header */}
             <div className="w-full h-10 bg-[#0e0e14] border-b border-white/5 flex items-center px-4 gap-2 shrink-0">
               <div className="w-3 h-3 rounded-full bg-white/10" />
               <div className="w-3 h-3 rounded-full bg-white/10" />
               <div className="w-3 h-3 rounded-full bg-white/10" />
             </div>

             {/* Placeholder Content */}
             <div className="flex-1 w-full flex items-center justify-center bg-black">
                <div className="text-[var(--color-green-strong)] font-mono text-xl md:text-3xl tracking-[0.2em] opacity-40 uppercase">
                    VIDEO PLAYING...
                </div>
                {/* 
                  When you have the video, replace the above div with your video tag:
                  <video src="/path-to-video.mp4" autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover" />
                */}
             </div>
           </div>

         </div>
       ))}
    </section>
  );
}
