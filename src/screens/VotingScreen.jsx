import React, { useState, useMemo, useRef, useEffect } from 'react';
import gsap from 'gsap';
import './VotingScreen.css';

const VotingScreen = ({ players, onFinish }) => {
  // Extract unique movie suggestions
  const moviePool = useMemo(() => {
    const suggestions = players
      .map(p => p.suggestion)
      .filter(s => s && s.trim() !== '');
    return [...new Set(suggestions)];
  }, [players]);

  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [currentMovieIndex, setCurrentMovieIndex] = useState(0);
  const [allVotes, setAllVotes] = useState([]);
  const [currentSessionVotes, setCurrentSessionVotes] = useState([]);
  
  // Feedback state for labels
  const [swipeFeedback, setSwipeFeedback] = useState(null); // 'LIKE', 'NOPE', 'LOVE'
  const [likedCount, setLikedCount] = useState(0);

  const cardRef = useRef(null);
  const containerRef = useRef(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);

  const currentPlayer = players[currentPlayerIndex];
  const currentMovie = moviePool[currentMovieIndex];

  // Floating animation effect
  useEffect(() => {
    if (cardRef.current) {
      gsap.to(cardRef.current, {
        y: "-=15",
        rotation: 2,
        duration: 2.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
    }
    // Cleanup float on drag
    return () => gsap.killTweensOf(cardRef.current);
  }, [currentMovieIndex, currentPlayerIndex]);

  if (moviePool.length === 0) {
    return (
      <div className="voting-container empty-state">
        <div className="glass-card error-card">
          <h2>No Movies Suggested! 🍿</h2>
          <p>Please go back and ensure at least one player suggests a movie.</p>
          <button className="back-btn" onClick={() => window.location.reload()}>
            Back to Add Players
          </button>
        </div>
      </div>
    );
  }

  const handleDragStart = (e) => {
    isDragging.current = true;
    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
    dragStartPos.current = { x: clientX, y: clientY };
    
    // Stop floating animation
    gsap.killTweensOf(cardRef.current);
  };

  const handleDragMove = (e) => {
    if (!isDragging.current || !cardRef.current) return;

    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
    
    const deltaX = clientX - dragStartPos.current.x;
    const deltaY = clientY - dragStartPos.current.y;
    
    const rotation = deltaX * 0.1;

    gsap.set(cardRef.current, {
      x: deltaX,
      y: deltaY,
      rotation: rotation
    });

    // Determine feedback
    if (deltaY < -100) setSwipeFeedback('LOVE');
    else if (deltaX > 100) setSwipeFeedback('LIKE');
    else if (deltaX < -100) setSwipeFeedback('NOPE');
    else setSwipeFeedback(null);
  };

  const handleDragEnd = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    
    const x = gsap.getProperty(cardRef.current, "x");
    const y = gsap.getProperty(cardRef.current, "y");
    
    const threshold = 150;

    if (y < -threshold) {
      triggerVote('love');
    } else if (x > threshold) {
      triggerVote('yes');
    } else if (x < -threshold) {
      triggerVote('no');
    } else {
      // Snap back
      setSwipeFeedback(null);
      gsap.to(cardRef.current, {
        x: 0,
        y: 0,
        rotation: 0,
        duration: 0.5,
        ease: "elastic.out(1, 0.5)",
        onComplete: () => {
          // Restart floating
          gsap.to(cardRef.current, {
            y: "-=15",
            rotation: 2,
            duration: 2.5,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
          });
        }
      });
    }
  };

  const triggerVote = (type) => {
    setSwipeFeedback(null);
    const tl = gsap.timeline();

    if (type === 'no') {
      // Crumpled paper effect
      tl.to(cardRef.current, {
        scale: 0.4,
        rotation: 180,
        borderRadius: "50%",
        opacity: 0,
        x: -500,
        y: 500,
        duration: 0.8,
        ease: "power2.in",
        onComplete: () => nextItem(type)
      });
    } else {
      // Fly to collection zone
      tl.to(cardRef.current, {
        x: 600,
        y: 200,
        rotation: 45,
        scale: 0.2,
        opacity: 0,
        duration: 0.6,
        ease: "back.in(1.2)",
        onComplete: () => {
          setLikedCount(prev => prev + 1);
          nextItem(type);
        }
      });
    }
  };

  const nextItem = (voteType) => {
    const newVote = { movie: currentMovie, vote: voteType };
    const updatedSessionVotes = [...currentSessionVotes, newVote];

    if (currentMovieIndex < moviePool.length - 1) {
      setCurrentSessionVotes(updatedSessionVotes);
      setCurrentMovieIndex(currentMovieIndex + 1);
      
      // Reset card position for next
      gsap.set(cardRef.current, { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1, borderRadius: "32px" });
      gsap.from(cardRef.current, { scale: 0, opacity: 0, duration: 0.5, ease: "back.out" });
    } else {
      // Next player or Finish
      const playerFinalData = { name: currentPlayer.name, votes: updatedSessionVotes };
      const updatedAllVotes = [...allVotes, playerFinalData];
      
      if (currentPlayerIndex < players.length - 1) {
        setAllVotes(updatedAllVotes);
        setCurrentPlayerIndex(currentPlayerIndex + 1);
        setCurrentMovieIndex(0);
        setCurrentSessionVotes([]);
        setLikedCount(0);
        gsap.set(cardRef.current, { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1, borderRadius: "32px" });
      } else {
        onFinish(updatedAllVotes);
      }
    }
  };

  return (
    <div 
      className="voting-container cinematic-room"
      onMouseMove={handleDragMove}
      onMouseUp={handleDragEnd}
      onMouseLeave={handleDragEnd}
      onTouchMove={handleDragMove}
      onTouchEnd={handleDragEnd}
    >
      <div className="room-bg-layer" />
      
      <header className="voter-header">
        <div className="player-badge">
          <span className="label">TURN</span>
          <h3>{currentPlayer.name}’s Choice 🎬</h3>
        </div>
        <div className="progress-indicator">
          {currentMovieIndex + 1} / {moviePool.length}
        </div>
      </header>

      {/* Visual Feedback Labels */}
      {swipeFeedback && (
        <div className={`swipe-label ${swipeFeedback.toLowerCase()}`}>
          {swipeFeedback}
        </div>
      )}

      {/* Main Swipe Card */}
      <div className="swipe-stack-container">
        <div 
          ref={cardRef} 
          className="movie-swipe-card"
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
        >
          <div className="card-top">CINEMA TICKET</div>
          <div className="card-body">
            <h1>{currentMovie}</h1>
          </div>
          <div className="card-footer">DRAG TO VOTE</div>
        </div>
      </div>

      {/* Scene Elements */}
      <div className="room-decoration-layer">
        <div className="trash-zone">
          <div className="dustbin">🗑️</div>
          <span>DISLIKE</span>
        </div>

        <div className="collection-zone">
          <div className="liked-stack">
            {Array.from({ length: likedCount }).map((_, i) => (
              <div key={i} className="stacked-card" style={{ 
                transform: `rotate(${i * 5}deg) translate(${i * 2}px, -${i * 2}px)` 
              }} />
            ))}
            <div className="liked-icon">❤️</div>
          </div>
          <span>LIKED</span>
        </div>
      </div>

      <div className="gesture-hint">
        ← NOPE | LOVE ↑ | YES →
      </div>
    </div>
  );
};

export default VotingScreen;
