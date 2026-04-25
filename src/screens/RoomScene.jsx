import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import './RoomScene.css';

const RoomScene = ({ onStartVoting }) => {
  const [isAmbient, setIsAmbient] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [players, setPlayers] = useState(() => {
    const saved = localStorage.getItem('moviePlayers');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Migration: Convert old single 'suggestion' to 'suggestions' array
        return parsed.map(p => ({
          ...p,
          suggestions: p.suggestions || (p.suggestion ? [p.suggestion] : [])
        }));
      } catch (e) {
        return [];
      }
    }
    return [];
  });
  const [playerName, setPlayerName] = useState('');
  const [movieSuggestions, setMovieSuggestions] = useState(['']);
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
    setMovieSuggestions(['']); // Reset to one empty field
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
        setMovieSuggestions(['']);
      },
    });
  };

  const addSuggestionField = () => {
    if (movieSuggestions.length < 5) {
      setMovieSuggestions([...movieSuggestions, '']);
    }
  };

  const updateSuggestion = (index, value) => {
    const newSugs = [...movieSuggestions];
    newSugs[index] = value;
    setMovieSuggestions(newSugs);
  };

  const handleAddPlayer = () => {
    if (!playerName.trim()) {
      setError('Player name is required!');
      return;
    }
    
    const validSuggestions = movieSuggestions.map(s => s.trim()).filter(s => s !== '');
    if (validSuggestions.length === 0) {
      setError('At least one movie suggestion is required!');
      return;
    }

    if (players.length >= 5) {
      setError('Max 5 players allowed.');
      return;
    }

    const newPlayerData = {
      id: Date.now(),
      name: playerName.trim(),
      suggestions: validSuggestions,
      color: `hsl(${Math.random() * 360}, 70%, 60%)`,
    };

    setPlayers([...players, newPlayerData]);
    setPlayerName('');
    setMovieSuggestions(['']);
    setError('');
    
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
            <label>Movie Suggestions (At least one)</label>
            <div className="multi-input-container">
              {movieSuggestions.map((s, idx) => (
                <input 
                  key={idx}
                  type="text" 
                  value={s} 
                  onChange={(e) => updateSuggestion(idx, e.target.value)}
                  placeholder={`Suggestion #${idx + 1}`}
                  className="multi-input"
                />
              ))}
              {movieSuggestions.length < 5 && (
                <button className="add-more-sug-btn" onClick={addSuggestionField}>
                  + Add Another Movie
                </button>
              )}
            </div>
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
              <div className="chip-suggestions-list">
                {player.suggestions.map((s, idx) => (
                  <span key={idx} className="chip-suggestion-mini">{s}</span>
                ))}
              </div>
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
