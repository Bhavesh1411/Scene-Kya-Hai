import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import './MovieCard.css';

const MovieCard = ({ movie, isInteractive = true, isBackground = false, style = {} }) => {
  const cardRef = useRef(null);
  const glowRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!isInteractive || isBackground || !cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;

    gsap.to(cardRef.current, {
      rotateX: rotateX,
      rotateY: rotateY,
      duration: 0.5,
      ease: 'power2.out',
    });

    if (glowRef.current) {
      gsap.to(glowRef.current, {
        x: x - 100,
        y: y - 100,
        opacity: 0.4,
        duration: 0.3,
      });
    }
  };

  const handleMouseLeave = () => {
    if (!isInteractive || isBackground || !cardRef.current) return;

    gsap.to(cardRef.current, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.5,
      ease: 'power2.out',
    });

    if (glowRef.current) {
      gsap.to(glowRef.current, {
        opacity: 0,
        duration: 0.3,
      });
    }
  };

  return (
    <div 
      className={`card-perspective ${isBackground ? 'is-background' : ''}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={style}
    >
      <div ref={cardRef} className="movie-card glass-card">
        {!isBackground && <div ref={glowRef} className="card-glow"></div>}
        <div className="card-image-container">
          <img src={movie.image} alt={movie.title} className="card-image" />
        </div>
        <div className="card-content">
          {!isBackground && (
            <div className="card-header">
              <span className="card-year">{movie.year}</span>
              <span className="card-rating">★ {movie.rating}</span>
            </div>
          )}
          <h3 className="card-title">{movie.title}</h3>
          <p className="card-genre">{movie.genre}</p>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
