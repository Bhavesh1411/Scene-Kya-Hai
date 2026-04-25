import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import './RoomScene.css';

const MOCK_PLAYERS = [
  { id: 1, name: 'Rahul', suggestions: ['Interstellar', 'John Wick'], color: '#3B82F6', avatar: '👨‍💻' },
  { id: 2, name: 'Aman', suggestions: ['The Dark Knight', 'Inception'], color: '#14B8A6', avatar: '🎮' },
  { id: 3, name: 'Sneha', suggestions: ['La La Land', 'About Time'], color: '#A78BFA', avatar: '🎨' },
  { id: 4, name: 'Priya', suggestions: ['The Conjuring', 'Hereditary'], color: '#F43F5E', avatar: '🎬' },
  { id: 5, name: 'Vikram', suggestions: ['Mad Max: Fury Road', 'Dune'], color: '#F59E0B', avatar: '🍿' },
];

const RoomScene = ({ onStartVoting }) => {
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const containerRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    // Ambient room animations
    const ctx = gsap.context(() => {
      gsap.to('.popcorn-bucket', {
        y: -5,
        rotation: 2,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });

      gsap.to('.drink-cup', {
        scaleY: 1.05,
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });

      // Scatter cards on table
      cardsRef.current.forEach((card, i) => {
        if (!card) return;
        const randomX = (Math.random() - 0.5) * 100;
        const randomY = (Math.random() - 0.5) * 40;
        const randomRot = (Math.random() - 0.5) * 45;
        
        gsap.set(card, {
          x: randomX,
          y: randomY,
          rotation: randomRot,
          z: 0
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleCardClick = (player, index) => {
    if (selectedPlayer) {
      if (selectedPlayer.id === player.id) {
        closeCard(index);
      }
      return;
    }

    const card = cardsRef.current[index];
    setSelectedPlayer(player);

    gsap.to(card, {
      x: 0,
      y: -250,
      rotation: 0,
      scale: 2.5,
      zIndex: 100,
      duration: 0.8,
      ease: 'back.out(1.2)'
    });

    gsap.to('.room-overlay', {
      opacity: 1,
      pointerEvents: 'all',
      duration: 0.5
    });
  };

  const closeCard = (index) => {
    const card = cardsRef.current[index];
    const player = MOCK_PLAYERS[index];
    
    // Recalculate original random pos
    const randomX = (Math.random() - 0.5) * 100;
    const randomY = (Math.random() - 0.5) * 40;
    const randomRot = (Math.random() - 0.5) * 45;

    gsap.to(card, {
      x: randomX,
      y: randomY,
      rotation: randomRot,
      scale: 1,
      zIndex: 1,
      duration: 0.6,
      ease: 'power2.inOut',
      onComplete: () => setSelectedPlayer(null)
    });

    gsap.to('.room-overlay', {
      opacity: 0,
      pointerEvents: 'none',
      duration: 0.5
    });
  };

  return (
    <div ref={containerRef} className="room-scene">
      <div className="room-overlay" onClick={() => {
        const idx = MOCK_PLAYERS.findIndex(p => p.id === selectedPlayer?.id);
        if (idx !== -1) closeCard(idx);
      }}></div>

      {/* Friends on Sofa */}
      <div className="sofa-area">
        <div className="sofa">
          <div className="sofa-back"></div>
          <div className="friends-row">
            {MOCK_PLAYERS.map((player, i) => (
              <div key={player.id} className="friend-avatar" style={{ '--delay': `${i * 0.2}s` }}>
                <span className="avatar-icon">{player.avatar}</span>
                <div className="friend-body" style={{ backgroundColor: player.color }}></div>
              </div>
            ))}
          </div>
          <div className="sofa-base"></div>
        </div>
      </div>

      {/* Center Table */}
      <div className="table-area">
        <div className="table-surface">
          <div className="props">
            <div className="popcorn-bucket">🍿</div>
            <div className="drink-cup">🥤</div>
            <div className="drink-cup secondary">🥤</div>
          </div>

          <div className="table-cards">
            {MOCK_PLAYERS.map((player, i) => (
              <div
                key={player.id}
                ref={el => cardsRef.current[i] = el}
                className={`player-card ${selectedPlayer?.id === player.id ? 'active' : ''}`}
                onClick={() => handleCardClick(player, i)}
                style={{ borderTop: `4px solid ${player.color}` }}
              >
                <div className="card-inner">
                  <div className="card-front">
                    <span className="card-avatar">{player.avatar}</span>
                    <p className="card-name">{player.name}</p>
                  </div>
                  <div className="card-expanded-content">
                    <h3>{player.name}'s Picks</h3>
                    <div className="suggestions">
                      {player.suggestions.map((movie, mIdx) => (
                        <div key={mIdx} className="suggestion-item">
                          <span>Suggests:</span>
                          <strong>{movie}</strong>
                        </div>
                      ))}
                    </div>
                    <button className="ready-btn" onClick={(e) => {
                      e.stopPropagation();
                      onStartVoting();
                    }}>
                      Ready to Vote
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="room-floor"></div>

      <div className="scene-footer">
        <h2>Who's Watching?</h2>
        <p>Click a card to see their suggestions</p>
      </div>
    </div>
  );
};

export default RoomScene;
