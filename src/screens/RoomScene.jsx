import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import './RoomScene.css';

const RoomScene = ({ onStartVoting }) => {
  const [isAmbient, setIsAmbient] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [players, setPlayers] = useState(() => {
    const saved = localStorage.getItem('moviePlayers');
    if (saved) {
      const parsed = JSON.parse(saved);
      // If it's the old mock data (suggestions is an array), ignore it
      if (parsed.length > 0 && Array.isArray(parsed[0].suggestions)) return [];
      return parsed;
    }
    return [];
  });
  const [playerName, setPlayerName] = useState('');
  const [movieSuggestion, setMovieSuggestion] = useState('');
  const [error, setError] = useState('');

  const containerRef = useRef(null);
  const modalRef = useRef(null);
  const overlayRef = useRef(null);
  const chipsRef = useRef([]);

  useEffect(() => {
    gsap.to(containerRef.current, {
      opacity: 1,
      duration: 1.1,
      ease: 'power2.out',
    });
  }, []);

  useEffect(() => {
    localStorage.setItem('moviePlayers', JSON.stringify(players));
  }, [players]);

  const openInputModal = () => {
    setIsModalOpen(true);
    requestAnimationFrame(() => {
      gsap.to(overlayRef.current, { opacity: 1, pointerEvents: 'all', duration: 0.4 });
      gsap.fromTo(
        modalRef.current,
        { opacity: 0, scale: 0.78, y: 30 },
        { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: 'back.out(1.4)' }
      );
    });
  };

  const closeInputModal = () => {
    gsap.to(modalRef.current, { opacity: 0, scale: 0.82, y: 20, duration: 0.3, ease: 'power2.in' });
    gsap.to(overlayRef.current, {
      opacity: 0,
      pointerEvents: 'none',
      duration: 0.4,
      onComplete: () => {
        setIsModalOpen(false);
        setError('');
        setPlayerName('');
        setMovieSuggestion('');
      },
    });
  };

  const handleAddPlayer = () => {
    if (!playerName.trim()) {
      setError('Player name is required!');
      return;
    }
    if (players.length >= 5) {
      setError('Max 5 players allowed.');
      return;
    }

    const newPlayerData = {
      id: Date.now(),
      name: playerName.trim(),
      suggestion: movieSuggestion.trim(),
      color: `hsl(${Math.random() * 360}, 70%, 60%)`,
    };

    setPlayers([...players, newPlayerData]);
    setPlayerName('');
    setMovieSuggestion('');
    setError('');
    
    // Close modal after adding
    closeInputModal();
  };

  const removePlayer = (id) => {
    setPlayers(players.filter(p => p.id !== id));
  };

  return (
    <div ref={containerRef} className="room-scene">
      <div className="room-dark-veil" />
      
      <div 
        ref={overlayRef} 
        className="room-overlay" 
        onClick={closeInputModal}
      />

      <header className="scene-header">
        <h2>{players.length < 2 ? 'Add Your Crew' : 'The Stage is Set.'}</h2>
        <p>
          {players.length < 2 
            ? 'Need at least 2 players to start the vote' 
            : `Group of ${players.length} ready to decide!`}
        </p>
      </header>

      {/* TV Zone: Add Player or Ready */}
      <div className="tv-zone">
        <div className="tv-zone-inner">
          {players.length < 5 ? (
            <button className="add-players-btn" onClick={openInputModal}>
              {players.length === 0 ? 'Add Players' : '+ Add Another'}
            </button>
          ) : (
            <div className="max-players-msg">Full House! 🎬</div>
          )}
        </div>
      </div>

      {/* Input Modal */}
      {isModalOpen && (
        <div ref={modalRef} className="player-input-modal">
          <button className="modal-close-btn" onClick={closeInputModal}>×</button>
          <h3>Join Movie Night</h3>
          <div className="input-group">
            <label>Name (Required)</label>
            <input 
              type="text" 
              value={playerName} 
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="e.g. Rahul"
              autoFocus
            />
          </div>
          <div className="input-group">
            <label>What's your pick? (Optional)</label>
            <input 
              type="text" 
              value={movieSuggestion} 
              onChange={(e) => setMovieSuggestion(e.target.value)}
              placeholder="e.g. Inception"
            />
          </div>
          {error && <p className="input-error">{error}</p>}
          <button className="confirm-add-btn" onClick={handleAddPlayer}>
            Confirm Add 🍿
          </button>
        </div>
      )}

      {/* Player Chips on Table Area */}
      <div className="player-chips-container">
        {players.map((player, i) => (
          <div 
            key={player.id}
            className="player-chip-item"
            style={{ '--player-color': player.color }}
          >
            <div className="chip-content">
              <span className="chip-name">{player.name}</span>
              {player.suggestion && (
                <span className="chip-suggestion">picks "{player.suggestion}"</span>
              )}
            </div>
            <button className="chip-remove" onClick={() => removePlayer(player.id)}>×</button>
          </div>
        ))}
      </div>

      {/* Start Voting Button */}
      {players.length >= 2 && (
        <div className="start-voting-area">
          <button 
            className="start-voting-btn"
            onClick={() => onStartVoting(players)}
          >
            Start Voting 🎬
          </button>
        </div>
      )}
    </div>
  );
};

export default RoomScene;
