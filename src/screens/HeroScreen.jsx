import React, { useEffect, useRef, useState, useMemo } from 'react';
import gsap from 'gsap';
import MovieCard from '../components/MovieCard';
import { MOCK_MOVIES } from '../data/movies';
import './HeroScreen.css';

const HeroScreen = ({ onStart }) => {
  const cardsRef = useRef([]);
  const containerRef = useRef(null);
  const audioContext = useRef(null);
  const [isExiting, setIsExiting] = useState(false);

  // Initialize AudioContext on first interaction
  const initAudio = () => {
    if (!audioContext.current) {
      audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContext.current.state === 'suspended') {
      audioContext.current.resume();
    }
  };

  // Synthetic Click Sound (Tactile Pop)
  const playClick = () => {
    initAudio();
    const ctx = audioContext.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(10, ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  };

  // Synthetic Swoosh Sound (Wind/Motion)
  const playSwoosh = () => {
    initAudio();
    const ctx = audioContext.current;
    
    // Create white noise
    const bufferSize = ctx.sampleRate * 0.5; // 0.5 seconds
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(100, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(3000, ctx.currentTime + 0.2);
    filter.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.5);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.2);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start();
    noise.stop(ctx.currentTime + 0.5);
  };

  // Generate 24 background cards for full screen coverage
  const backgroundCards = useMemo(() => {
    const cards = [];
    const rows = 4;
    const cols = 6;
    
    for (let i = 0; i < 24; i++) {
      const row = Math.floor(i / cols);
      const col = i % cols;
      
      // More thorough coverage with tighter grid + jitter
      const x = (col * (100 / cols)) + (Math.random() * 10 - 5);
      const y = (row * (100 / rows)) + (Math.random() * 10 - 5);
      
      cards.push({
        ...MOCK_MOVIES[i % MOCK_MOVIES.length],
        instanceId: i,
        initialPos: { x, y },
        depth: {
          scale: 0.4 + Math.random() * 0.8,
          opacity: 0.2 + Math.random() * 0.3,
          blur: Math.random() > 0.7 ? Math.random() * 4 : 0,
          rotate: (Math.random() - 0.5) * 80,
        }
      });
    }
    return cards;
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      cardsRef.current.forEach((card, index) => {
        if (!card) return;

        // Wide, complex movement to cover all negative space
        const driftX = (Math.random() - 0.5) * 500;
        const driftY = (Math.random() - 0.5) * 500;
        const rotation = (Math.random() - 0.5) * 120;

        gsap.to(card, {
          x: `+=${driftX}`,
          y: `+=${driftY}`,
          rotate: `+=${rotation}`,
          rotateX: `+=${(Math.random() - 0.5) * 40}`,
          rotateY: `+=${(Math.random() - 0.5) * 40}`,
          duration: 10 + Math.random() * 12,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: Math.random() * 3
        });
      });

      // Spotlight Animations
      const beams = [".spotlight-left", ".spotlight-right"];
      beams.forEach((beam, i) => {
        const isLeft = i === 0;
        
        // Scanning movement
        gsap.to(`${beam} .spotlight-beam`, {
          rotate: isLeft ? 5 : -5,
          duration: 3 + Math.random() * 2,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut"
        });

        // Intensity fluctuation
        gsap.to(`${beam} .spotlight-beam`, {
          opacity: 0.4,
          duration: 0.15,
          repeat: -1,
          yoyo: true,
          ease: "rough({ strength: 1, template: sine.inOut, points: 20, taper: 'none', randomize: true })",
          delay: Math.random()
        });
      });

      // Button highlight glow
      gsap.to(".spotlight-target", {
        boxShadow: "0 0 30px rgba(59, 130, 246, 0.6), 0 0 10px rgba(255, 255, 255, 0.4)",
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });

      // Diagonal Ambient Sweep Animation
      gsap.fromTo(".diagonal-sweep", 
        { x: '-100%', opacity: 0 },
        { 
          x: '200%', 
          opacity: 0.5, 
          duration: 12, 
          repeat: -1, 
          ease: "none",
          onUpdate: function() {
            // Check if sweep is near center to pulse button
            const progress = this.progress();
            if (progress > 0.4 && progress < 0.6) {
              gsap.to(".spotlight-target", { 
                scale: 1.05, 
                filter: "brightness(1.3)", 
                duration: 0.5,
                overwrite: 'auto'
              });
            } else {
              gsap.to(".spotlight-target", { 
                scale: 1, 
                filter: "brightness(1)", 
                duration: 0.5,
                overwrite: 'auto'
              });
            }
          }
        }
      );
      // Fast Typewriter Effect
      const tlText = gsap.timeline({ delay: 0.5 });
      tlText.to(".char-1", {
        opacity: 1,
        stagger: 0.03,
        duration: 0.01,
        ease: "none"
      });
      tlText.to(".char-2", {
        opacity: 1,
        stagger: 0.03,
        duration: 0.01,
        ease: "none"
      }, "+=0.2");

    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleVoteClick = () => {
    if (isExiting) return;
    setIsExiting(true);

    // Play synthetic click
    playClick();

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.to(containerRef.current, {
          opacity: 0,
          duration: 0.4,
          onComplete: onStart
        });
      }
    });

    // Play synthetic swoosh synced with gravity
    tl.add(() => {
      playSwoosh();
    }, 0.05);

    // Gravity fall for 24 cards
    cardsRef.current.forEach((card, index) => {
      if (!card) return;
      tl.to(card, {
        y: window.innerHeight + 1200,
        rotate: (Math.random() - 0.5) * 180,
        opacity: 0,
        duration: 0.8 + Math.random() * 0.6,
        ease: "power2.in",
      }, 0.05 + index * 0.02);
    });

    tl.to(".hero-content", {
      opacity: 0,
      scale: 0.85,
      duration: 0.5,
      ease: "power2.out"
    }, 0);
  };

  const renderChars = (text, className) => {
    return text.split('').map((char, i) => (
      <span key={i} className={className} style={{ opacity: 0 }}>
        {char}
      </span>
    ));
  };

  return (
    <div ref={containerRef} className="hero-container">
      {/* Cinematic Spotlights */}
      <div className="spotlight spotlight-left">
        <div className="spotlight-beam"></div>
        <div className="spotlight-stand">
          <div className="stand-head"></div>
          <div className="stand-base"></div>
        </div>
      </div>
      <div className="spotlight spotlight-right">
        <div className="spotlight-beam"></div>
        <div className="spotlight-stand">
          <div className="stand-head"></div>
          <div className="stand-base"></div>
        </div>
      </div>

      {/* Diagonal Ambient Sweep */}
      <div className="diagonal-sweep"></div>

      <div className="hero-background-cards">
        {backgroundCards.map((card, index) => (
          <div 
            key={card.instanceId}
            ref={el => cardsRef.current[index] = el}
            className="ambient-card-wrapper"
            style={{
              left: `${card.initialPos.x}%`,
              top: `${card.initialPos.y}%`,
              transform: `scale(${card.depth.scale}) rotate(${card.depth.rotate}deg)`,
              opacity: card.depth.opacity,
              filter: `blur(${card.depth.blur}px)`,
              zIndex: Math.floor(card.depth.scale * 10),
            }}
          >
            <MovieCard movie={card} isInteractive={false} isBackground={true} />
          </div>
        ))}
      </div>

      <div className="hero-content">
        <h1 className="hero-title">
          <div className="line-1">{renderChars("Decide Together.", "char-1")}</div>
          <div className="line-2 text-gradient">{renderChars("Watch Better.", "char-2")}</div>
        </h1>
        <p className="hero-subtitle">
          Swipe. Vote. Discover your group’s perfect movie.
        </p>
        <button className="cta-button spotlight-target" onClick={handleVoteClick}>
          Let’s Vote
        </button>
      </div>
    </div>
  );
};

export default HeroScreen;
