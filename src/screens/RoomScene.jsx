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
  const [isAmbient, setIsAmbient]   = useState(true);
  const [openPlayer, setOpenPlayer] = useState(null);
  const containerRef = useRef(null);
  const overlayRef   = useRef(null);
  const modalRef     = useRef(null);

  /* ── Fade scene in on mount ─────────────────────── */
  useEffect(() => {
    gsap.to(containerRef.current, {
      opacity: 1,
      duration: 1.1,
      ease: 'power2.out',
    });
  }, []);

  /* ── Open player card modal ─────────────────────── */
  const openModal = (player) => {
    setOpenPlayer(player);
    requestAnimationFrame(() => {
      if (!overlayRef.current || !modalRef.current) return;
      gsap.to(overlayRef.current, { opacity: 1, pointerEvents: 'all', duration: 0.4 });
      gsap.fromTo(
        modalRef.current,
        { opacity: 0, scale: 0.78, y: 36 },
        { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: 'back.out(1.4)' }
      );
    });
  };

  /* ── Close player card modal ────────────────────── */
  const closeModal = () => {
    if (!overlayRef.current || !modalRef.current) return;
    gsap.to(modalRef.current,   { opacity: 0, scale: 0.82, y: 28, duration: 0.32, ease: 'power2.in' });
    gsap.to(overlayRef.current, {
      opacity: 0,
      pointerEvents: 'none',
      duration: 0.38,
      onComplete: () => setOpenPlayer(null),
    });
  };

  return (
    /* ── The container IS the background via CSS background-image ── */
    <div ref={containerRef} className="room-scene">

      {/* Layer 1: readability gradient */}
      <div className="room-dark-veil" />

      {/* Layer 2: card-open dimmer */}
      <div ref={overlayRef} className="room-overlay" onClick={closeModal} />

      {/* Layer 3: header */}
      <header className="scene-header">
        <h2>{isAmbient ? 'The Stage is Set.' : "Who's Watching?"}</h2>
        <p>
          {isAmbient
            ? 'Click "Add Players" on the TV to begin'
            : 'Pick a card from the table to see their choice'}
        </p>
      </header>

      {/* ── Layer 4a: TV zone — "Add Players" button ── */}
      {isAmbient && (
        <div className="tv-zone">
          {/* inner wrapper nudges the button to the "Let's Vote" row */}
          <div className="tv-zone-inner">
            <button
              id="add-players-btn"
              className="add-players-btn"
              onClick={() => setIsAmbient(false)}
            >
              Add Players
            </button>
          </div>
        </div>
      )}

      {/* ── Layer 4b: table card row ── */}
      {!isAmbient && (
        <div className="table-cards-row">
          {MOCK_PLAYERS.map((player) => (
            <div
              key={player.id}
              id={`ghost-card-${player.id}`}
              className="player-card-ghost"
              style={{ '--player-color': player.color }}
              onClick={() => openModal(player)}
              title={`${player.name}'s picks`}
            >
              <div className="card-ghost-face">
                <span className="ghost-label">{player.name}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Layer 5: expanded player modal ── */}
      {openPlayer && (
        <div
          ref={modalRef}
          className="player-card-modal is-open"
          style={{ '--player-color': openPlayer.color }}
        >
          <button className="modal-close-btn" onClick={closeModal} aria-label="Close">
            ×
          </button>
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
