import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ThumbsUp, ThumbsDown, Heart } from 'lucide-react';
import MovieCard from './MovieCard';
import './SwipeStack.css';

const SwipeStack = ({ movies, onSwipe }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const stackRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);

  const currentMovie = movies[currentIndex];

  const handleStart = (e) => {
    setIsDragging(true);
    setStartX(e.clientX || e.touches[0].clientX);
    setStartY(e.clientY || e.touches[0].clientY);
  };

  const handleMove = (e) => {
    if (!isDragging) return;
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - startX;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - startY;
    setOffsetX(x);
    setOffsetY(y);
  };

  const handleEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const threshold = 100;
    if (offsetX > threshold) {
      completeSwipe('right');
    } else if (offsetX < -threshold) {
      completeSwipe('left');
    } else if (offsetY < -threshold) {
      completeSwipe('up');
    } else {
      setOffsetX(0);
      setOffsetY(0);
    }
  };

  const completeSwipe = (direction) => {
    const x = direction === 'right' ? 1000 : direction === 'left' ? -1000 : 0;
    const y = direction === 'up' ? -1000 : 0;
    const rotation = direction === 'right' ? 30 : direction === 'left' ? -30 : 0;

    gsap.to('.top-card', {
      x,
      y,
      rotation,
      opacity: 0,
      duration: 0.5,
      ease: 'power2.in',
      onComplete: () => {
        onSwipe(currentMovie.id, direction);
        setOffsetX(0);
        setOffsetY(0);
        if (currentIndex < movies.length - 1) {
          setCurrentIndex(currentIndex + 1);
        } else {
          onSwipe(null, 'done');
        }
      }
    });
  };

  if (!currentMovie) return null;

  const rotation = offsetX / 10;
  const opacity = Math.min(Math.abs(offsetX) / 100, 1);
  const opacityUp = Math.min(Math.abs(Math.min(offsetY, 0)) / 100, 1);

  return (
    <div 
      className="stack-container"
      onMouseDown={handleStart}
      onMouseMove={handleMove}
      onMouseUp={handleEnd}
      onTouchStart={handleStart}
      onTouchMove={handleMove}
      onTouchEnd={handleEnd}
    >
      <div className="indicators">
        <div className="indicator left" style={{ opacity: offsetX < 0 ? opacity : 0 }}>
          <ThumbsDown size={48} color="#ef4444" />
        </div>
        <div className="indicator up" style={{ opacity: offsetY < 0 ? opacityUp : 0 }}>
          <Heart size={48} color="#A78BFA" fill="#A78BFA" />
        </div>
        <div className="indicator right" style={{ opacity: offsetX > 0 ? opacity : 0 }}>
          <ThumbsUp size={48} color="#3B82F6" />
        </div>
      </div>

      <div className="card-stack" ref={stackRef}>
        {movies.slice(currentIndex, currentIndex + 2).reverse().map((movie, index) => {
          const isTop = index === 1 || movies.length - currentIndex === 1;
          return (
            <div 
              key={movie.id} 
              className={`stack-item ${isTop ? 'top-card' : 'next-card'}`}
              style={isTop ? {
                transform: `translate(${offsetX}px, ${offsetY}px) rotate(${rotation}deg)`,
                cursor: isDragging ? 'grabbing' : 'grab'
              } : {}}
            >
              <MovieCard movie={movie} isInteractive={false} />
            </div>
          );
        })}
      </div>
      
      <div className="swipe-hints">
        <div className="hint"><ThumbsDown size={16} /> Swipe Left to Skip</div>
        <div className="hint"><Heart size={16} /> Swipe Up to Love</div>
        <div className="hint"><ThumbsUp size={16} /> Swipe Right to Vote</div>
      </div>
    </div>
  );
};

export default SwipeStack;
