'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const WORKFLOW_DATA = [
  {
    title: "Full Workflow Pipeline",
    description: "End-to-end execution flow of an AgentForge task, from client request to final settlement.",
    src: "/full%20workflow.png"
  },
  {
    title: "0x402 Pipeline",
    description: "Settlement layer handling machine-to-machine micropayments and verification on Stellar.",
    src: "/0x402%20pipeline.png"
  },
  {
    title: "CRUD Pipeline",
    description: "High-performance persistent storage operations interacting with the AgentForge backend.",
    src: "/CRUD%20pipeline.png"
  },
  {
    title: "GPU Pipeline",
    description: "Accelerated compute allocation and orchestration for intensive on-device inference.",
    src: "/Gpu%20pipeline.png"
  },
  {
    title: "T54 Trust Layer",
    description: "Verifiable audit trails anchoring sandbox state and hashes to the Soroban Ledger.",
    src: "/T54%20trust%20layer%20pipeline.png"
  },
  {
    title: "Dev Toolkit Pipeline",
    description: "Local development, scaffolding, testing, and simulation lifecycle workflows.",
    src: "/dev%20toolkit%20pipeline.png"
  },
  {
    title: "Execution Pipeline",
    description: "PRoot-sandboxed deterministic runtime execution loop and resource bounding.",
    src: "/Execution%20Pipeline.png"
  }
];

export default function WorkflowShowcaseSection() {
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

  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      // Pin the left panel while scrolling through the right panel
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top top",
        end: "bottom bottom",
        pin: leftPanelRef.current,
        pinSpacing: false, // The container itself defines the height
        id: "workflowShowcasePin"
      });
      // Animate images entering
      const images = gsap.utils.toArray('.workflow-image-container') as HTMLElement[];
      
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
      if (e.key === 'ArrowRight') setLightboxIndex(prev => (prev + 1) % WORKFLOW_DATA.length);
      if (e.key === 'ArrowLeft') setLightboxIndex(prev => (prev - 1 + WORKFLOW_DATA.length) % WORKFLOW_DATA.length);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen]);

  const activeData = WORKFLOW_DATA[activeIndex] || WORKFLOW_DATA[0];

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
              <span className="inline-block px-3 py-1 mb-4 rounded-full border border-[#00D0B6]/30 bg-[#00D0B6]/10 text-[10px] font-mono tracking-widest text-[#00D0B6] uppercase">
                System Architecture
              </span>
              <div className="text-[13px] text-[#888] tracking-[0.1em] font-mono mb-6">
                {String(activeIndex + 1).padStart(2, '0')} / {String(WORKFLOW_DATA.length).padStart(2, '0')}
              </div>
              <h2 
                ref={titleRef} 
                className="workflow-title font-syne font-[800] text-white max-w-[450px] mb-5"
                style={{ fontSize: 'clamp(40px, 5vw, 64px)', lineHeight: '1.1' }}
              >
                {activeData.title}
              </h2>
              <p 
                ref={descRef} 
                className="workflow-desc text-[#aaaaaa] text-[16px] md:text-[17px] leading-[1.7] max-w-[380px]"
              >
                {activeData.description}
              </p>
            </div>
          </div>

          {/* Right Panel - Scrolling Images */}
          <div ref={rightPanelRef} className="w-full md:w-[60%] flex flex-col pb-[10vh]">
            {WORKFLOW_DATA.map((item, i) => (
              <div 
                key={i} 
                className="workflow-image-container w-full h-[80vh] md:h-[100vh] flex items-center justify-center p-4 md:p-12 xl:p-20"
              >
                <div 
                  className={`relative w-full h-full max-h-[70vh] flex flex-col overflow-hidden rounded-xl border border-white/10 bg-[#050508] transition-all duration-500 cursor-zoom-in ${activeIndex === i ? 'shadow-[0_0_40px_rgba(0,208,182,0.15)] border-[#00D0B6]/40' : 'shadow-2xl'}`}
                  onClick={() => {
                    setLightboxIndex(i);
                    setLightboxOpen(true);
                  }}
                >
                  {/* Diagram Header */}
                  <div className="flex items-center justify-between px-6 py-4 bg-[#0a0a0f] border-b border-white/5 shrink-0">
                    <div className="text-[11px] font-mono tracking-widest text-gray-500 uppercase">
                      PIPELINE VIEWER
                    </div>
                    <div className="text-[10px] text-gray-600 font-mono tracking-wider bg-white/5 px-2 py-1 rounded">
                      {item.src.split('/').pop()?.replace(/%20/g, ' ')}
                    </div>
                  </div>
                  {/* Image */}
                  <div className="relative flex-1 w-full bg-[#000] p-8">
                    <Image 
                      src={item.src} 
                      alt={item.title}
                      fill
                      className="object-contain object-center opacity-90 transition-opacity duration-300 hover:opacity-100 p-4"
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
                setLightboxIndex(prev => (prev - 1 + WORKFLOW_DATA.length) % WORKFLOW_DATA.length); 
              }}
            >
              ‹
            </button>

            {/* Image Container */}
            <div className="relative w-[90vw] h-[85vh] max-w-6xl max-h-[900px]" onClick={e => e.stopPropagation()}>
              <Image 
                src={WORKFLOW_DATA[lightboxIndex].src}
                alt={WORKFLOW_DATA[lightboxIndex].title}
                fill
                className="object-contain p-4"
                unoptimized
              />
            </div>

            {/* Right Nav Button */}
            <button 
              className="absolute right-[2%] md:right-[5%] text-white opacity-50 hover:opacity-100 text-5xl z-[210] p-4 transition-opacity"
              onClick={(e) => { 
                e.stopPropagation(); 
                setLightboxIndex(prev => (prev + 1) % WORKFLOW_DATA.length); 
              }}
            >
              ›
            </button>

            {/* Image Counter */}
            <div className="absolute bottom-[20px] left-1/2 -translate-x-1/2 text-white/80 text-sm font-mono tracking-widest z-[210]">
              {lightboxIndex + 1} / {WORKFLOW_DATA.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
