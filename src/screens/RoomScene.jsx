import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import './RoomScene.css';

const MOCK_PLAYERS = [
  { id: 1, name: 'Rahul',  suggestions: ['Interstellar', 'John Wick'],         color: '#3B82F6', avatar: '👨‍💻' },
  { id: 2, name: 'Aman',   suggestions: ['The Dark Knight', 'Inception'],      color: '#14B8A6', avatar: '🎮' },
  { id: 3, name: 'Sneha',  suggestions: ['La La Land', 'About Time'],          color: '#A78BFA', avatar: '🎨' },
  { id: 4, name: 'Priya',  suggestions: ['The Conjuring', 'Hereditary'],       color: '#F43F5E', avatar: '🎬' },
  { id: 5, name: 'Vikram', suggestions: ['Mad Max: Fury Road', 'Dune'],        color: '#F59E0B', avatar: '🍿' },
  { id: 6, name: 'Kabir',  suggestions: ['Interstellar', 'Tenet'],             color: '#34D399', avatar: '🎸' },
  { id: 7, name: 'Meera',  suggestions: ['Pride & Prejudice', 'Ratatouille'],  color: '#EC4899', avatar: '🌸' },
];

const RoomScene = ({ onStartVoting }) => {
  const [isAmbient, setIsAmbient] = useState(true);   // true = "Add Players" button shown
  const [openPlayer, setOpenPlayer]   = useState(null);  // player whose modal is open
  const containerRef = useRef(null);
  const overlayRef   = useRef(null);
  const modalRef     = useRef(null);

  /* ── Fade the whole scene in on mount ────────────── */
  useEffect(() => {
    gsap.to(containerRef.current, {
      opacity: 1,
      duration: 1,
      ease: 'power2.out',
    });
  }, []);

  /* ── Open player modal ─────────────────────────── */
  const openModal = (player) => {
    setOpenPlayer(player);
    // animate overlay + modal in (RAF so modal is in DOM)
    requestAnimationFrame(() => {
      gsap.to(overlayRef.current, { opacity: 1, duration: 0.4 });
      gsap.fromTo(
        modalRef.current,
        { opacity: 0, scale: 0.75, y: 40 },
        { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: 'back.out(1.4)' }
      );
    });
  };

  /* ── Close player modal ────────────────────────── */
  const closeModal = () => {
    gsap.to(modalRef.current,  { opacity: 0, scale: 0.8, y: 30, duration: 0.35, ease: 'power2.in' });
    gsap.to(overlayRef.current, { opacity: 0, duration: 0.4, onComplete: () => setOpenPlayer(null) });
  };

  return (
    <div ref={containerRef} className="room-scene">

      {/* ── Layer 1: full-screen background image ── */}
      <img
        src="/room-bg.png"
        alt="Movie Night Room"
        className="room-bg-img"
        /* Inline fallback in case the CSS file loads late */
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center',
          display: 'block',
          zIndex: 1,
        }}
      />

      {/* ── Layer 2: subtle readability veil ── */}
      <div className="room-dark-veil" />

      {/* ── Layer 3: card-open backdrop ── */}
      <div
        ref={overlayRef}
        className="room-overlay"
        onClick={closeModal}
      />

      {/* ── Layer 4: header text ── */}
      <header className="scene-header">
        <h2>{isAmbient ? 'The Stage is Set.' : "Who's Watching?"}</h2>
        <p>{isAmbient ? 'Click "Add Players" on the TV screen to begin' : 'Pick a card from the table to see their pick'}</p>
      </header>

      {/* ── Layer 5a: TV zone — "Add Players" button ── */}
      {isAmbient && (
        <div className="tv-zone">
          <button
            id="add-players-btn"
            className="add-players-btn"
            onClick={() => setIsAmbient(false)}
          >
            Add Players
          </button>
        </div>
      )}

      {/* ── Layer 5b: table card row ── */}
      {!isAmbient && (
        <div className="table-cards-row">
          {MOCK_PLAYERS.map((player) => (
            <div
              key={player.id}
              id={`card-${player.id}`}
              className="player-card-ghost"
              style={{ '--player-color': player.color }}
              onClick={() => openModal(player)}
            >
              <div className="card-ghost-face">
                <span className="ghost-label">{player.name}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Layer 6: expanded player modal ── */}
      {openPlayer && (
        <div
          ref={modalRef}
          className="player-card-modal is-open"
          style={{ '--player-color': openPlayer.color }}
        >
          <button className="modal-close-btn" onClick={closeModal}>×</button>
          <div className="modal-avatar">{openPlayer.avatar}</div>
          <h3 className="modal-name">{openPlayer.name}'s Picks</h3>
          <div className="modal-suggestions">
            {openPlayer.suggestions.map((movie, i) => (
              <div key={i} className="suggestion-chip">
                <span>Suggests</span>
                <strong>{movie}</strong>
              </div>
            ))}
          </div>
          <button
            className="ready-vote-btn"
            onClick={(e) => { e.stopPropagation(); onStartVoting(); }}
          >
            Ready to Vote 🎬
          </button>
        </div>
      )}

    </div>
  );
};

export default RoomScene;
