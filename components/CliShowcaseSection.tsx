'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const CLI_DATA = [
  {
    title: "Agent Workspace Structure",
    description: "Initialize a local workspace with the forge init command. This creates all necessary configurations, including your agent.yaml definition.",
    src: "/cli/Agentfolder.jpg"
  },
  {
    title: "Sandboxed Isolation",
    description: "Ensure secure operations inside PRoot sandboxed containers, wrapped with namespace and seccomp system-call filters.",
    src: "/cli/agent sandboxing.jpg"
  },
  {
    title: "0x402 Protocol Settlement",
    description: "Interact with the payment router for seamless protocol execution tariffs and fee routing.",
    src: "/cli/0x402protocol.jpg"
  },
  {
    title: "Paper Trading Balances",
    description: "Simulate swaps on the Stellar DEX and track virtual balances without risking real capital.",
    src: "/cli/paper trading balance for demo.jpg"
  },
  {
    title: "Paper Trade Proofs",
    description: "Verify simulated execution hashes logged and securely bound to your agent profile.",
    src: "/cli/paper trade proof.jpg"
  },
  {
    title: "Ledger Registration",
    description: "Deploy your compiled agent and register its signature directly to the Soroban Ledger.",
    src: "/cli/ledger.jpg"
  },
  {
    title: "Live Dashboard Monitoring",
    description: "Stream real-time sandbox logs and monitor active agent statuses through the unified console.",
    src: "/cli/liveDasboard.jpg"
  }
];

export default function CliShowcaseSection() {
  const containerRef = useRef<HTMLElement>(null);
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // We need refs to text elements for animation
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);

  // Keep a ref of the active index for synchronous checks in ScrollTrigger
  const activeIndexRef = useRef(0);

  useEffect(() => {
    let ctx = gsap.context(() => {
      // Pin the left panel while scrolling through the right panel
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top top",
        end: "bottom bottom",
        pin: leftPanelRef.current,
        pinSpacing: false, // The container itself defines the height
        id: "cliShowcasePin"
      });

      // Animate images entering
      const images = gsap.utils.toArray('.cli-image-container') as HTMLElement[];
      
      images.forEach((img, i) => {
        // Entrance animation
        gsap.fromTo(img, 
          { opacity: 0, y: 40 },
          {
            opacity: 1, 
            y: 0,
            duration: 0.6,
            ease: "power2.out",
            scrollTrigger: {
              trigger: img,
              start: "top 70%",
              toggleActions: "play none none reverse"
            }
          }
        );

        // Track active index to update text
        ScrollTrigger.create({
          trigger: img,
          start: "top center",
          end: "bottom center",
          onEnter: () => updateActiveIndex(i),
          onEnterBack: () => updateActiveIndex(i)
        });
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  const updateActiveIndex = (newIndex: number) => {
    if (newIndex === activeIndexRef.current) return;
    activeIndexRef.current = newIndex;
    
    // Kill any existing animations on the text to prevent glitches from rapid scrolling
    gsap.killTweensOf([titleRef.current, descRef.current]);

    // Animate text swap out
    gsap.to([titleRef.current, descRef.current], {
      y: -10,
      opacity: 0,
      duration: 0.2,
      onComplete: () => {
        // Update React state after fade-out completes
        setActiveIndex(newIndex);
      }
    });
  };

  // Run the fade-in animation whenever the activeIndex state actually changes
  useEffect(() => {
    gsap.killTweensOf([titleRef.current, descRef.current]);
    gsap.fromTo([titleRef.current, descRef.current], 
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: "power3.out", stagger: 0.1 }
    );
  }, [activeIndex]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowRight') setLightboxIndex(prev => (prev + 1) % CLI_DATA.length);
      if (e.key === 'ArrowLeft') setLightboxIndex(prev => (prev - 1 + CLI_DATA.length) % CLI_DATA.length);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen]);

  const activeData = CLI_DATA[activeIndex] || CLI_DATA[0];

  return (
    <>
      <section ref={containerRef} className="relative w-full bg-[#050508] border-t border-white/5 py-10 md:py-0">
        <div className="flex flex-col md:flex-row relative w-full items-start max-w-[1600px] mx-auto">
          {/* Left Panel - Sticky */}
          <div 
            ref={leftPanelRef}
            className="w-full md:w-[40%] md:h-[100vh] flex flex-col justify-center px-6 md:px-12 xl:px-20 py-12 md:py-0 bg-[#050508] z-10 sticky top-0 md:relative border-b border-white/5 md:border-b-0"
          >
            <div className="max-w-xl mx-auto md:mx-0">
              <span className="inline-block px-3 py-1 mb-4 rounded-full border border-[var(--color-green-strong)]/30 bg-[var(--color-green-strong)]/10 text-[10px] font-mono tracking-widest text-[var(--color-green-strong)] uppercase">
                CLI Preview
              </span>
              <div className="text-[13px] text-[#888] tracking-[0.1em] font-mono mb-6">
                {String(activeIndex + 1).padStart(2, '0')} / {String(CLI_DATA.length).padStart(2, '0')}
              </div>
              <h2 
                ref={titleRef} 
                className="headline font-syne font-[800] text-white max-w-[400px] mb-5"
                style={{ fontSize: 'clamp(40px, 5vw, 68px)', lineHeight: '1.1' }}
              >
                {activeData.title}
              </h2>
              <p 
                ref={descRef} 
                className="headline text-[#aaaaaa] text-[16px] md:text-[17px] leading-[1.7] max-w-[380px]"
              >
                {activeData.description}
              </p>
            </div>
          </div>

          {/* Right Panel - Scrolling Images */}
          <div ref={rightPanelRef} className="w-full md:w-[60%] flex flex-col pb-[10vh]">
            {CLI_DATA.map((item, i) => (
              <div 
                key={i} 
                className="cli-image-container w-full h-[80vh] md:h-[100vh] flex items-center justify-center p-4 md:p-12 xl:p-20"
              >
                <div 
                  className={`relative w-full h-full max-h-[70vh] flex flex-col overflow-hidden rounded-xl border border-white/10 bg-[#050508] transition-all duration-500 cursor-zoom-in ${activeIndex === i ? 'shadow-[0_0_40px_rgba(46,242,142,0.15)] border-[var(--color-green-strong)]/40' : 'shadow-2xl'}`}
                  onClick={() => {
                    setLightboxIndex(i);
                    setLightboxOpen(true);
                  }}
                >
                  {/* Fake Terminal Header */}
                  <div className="flex items-center px-4 py-3 bg-[#0a0a0f] border-b border-white/5 shrink-0">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                    </div>
                    <div className="mx-auto text-[10px] text-gray-500 font-mono tracking-wider">
                      {item.src.split('/').pop()}
                    </div>
                  </div>
                  {/* Image */}
                  <div className="relative flex-1 w-full bg-[#000]">
                    <Image 
                      src={item.src} 
                      alt={item.title}
                      fill
                      className="object-contain object-center"
                      unoptimized
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md"
            onClick={() => setLightboxOpen(false)}
          >
            {/* Close Button */}
            <button 
              className="fixed top-[20px] right-[24px] text-white opacity-70 hover:opacity-100 transition-opacity z-[210] flex items-center justify-center"
              onClick={(e) => { e.stopPropagation(); setLightboxOpen(false); }}
              style={{ fontSize: '32px', width: '44px', height: '44px' }}
            >
              ✕
            </button>

            {/* Left Nav Button */}
            <button 
              className="absolute left-[2%] md:left-[5%] text-white opacity-50 hover:opacity-100 text-5xl z-[210] p-4 transition-opacity"
              onClick={(e) => { 
                e.stopPropagation(); 
                setLightboxIndex(prev => (prev - 1 + CLI_DATA.length) % CLI_DATA.length); 
              }}
            >
              ‹
            </button>

            {/* Image Container */}
            <div className="relative w-[90vw] h-[85vh] max-w-6xl max-h-[900px]" onClick={e => e.stopPropagation()}>
              <Image 
                src={CLI_DATA[lightboxIndex].src}
                alt={CLI_DATA[lightboxIndex].title}
                fill
                className="object-contain"
                unoptimized
              />
            </div>

            {/* Right Nav Button */}
            <button 
              className="absolute right-[2%] md:right-[5%] text-white opacity-50 hover:opacity-100 text-5xl z-[210] p-4 transition-opacity"
              onClick={(e) => { 
                e.stopPropagation(); 
                setLightboxIndex(prev => (prev + 1) % CLI_DATA.length); 
              }}
            >
              ›
            </button>

            {/* Image Counter */}
            <div className="absolute bottom-[20px] left-1/2 -translate-x-1/2 text-white/80 text-sm font-mono tracking-widest z-[210]">
              {lightboxIndex + 1} / {CLI_DATA.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
