import React, { useState } from 'react';
import { UserPlus, X, Play } from 'lucide-react';
import './SetupScreen.css';

const SetupScreen = ({ onStartVoting }) => {
  const [players, setPlayers] = useState(['', '']);
  
  const addPlayer = () => {
    if (players.length < 5) {
      setPlayers([...players, '']);
    }
  };

  const removePlayer = (index) => {
    if (players.length > 2) {
      const newPlayers = players.filter((_, i) => i !== index);
      setPlayers(newPlayers);
    }
  };

  const updatePlayer = (index, name) => {
    const newPlayers = [...players];
    newPlayers[index] = name;
    setPlayers(newPlayers);
  };

  const isValid = players.every(p => p.trim().length > 0);

  return (
    <div className="setup-container">
      <div className="setup-card glass-card">
        <h2 className="setup-title">Who's Watching?</h2>
        <p className="setup-subtitle">Enter names for 2 to 5 players to start voting.</p>
        
        <div className="players-list">
          {players.map((player, index) => (
            <div key={index} className="player-input-group">
              <input 
                type="text" 
                placeholder={`Player ${index + 1}`}
                value={player}
                onChange={(e) => updatePlayer(index, e.target.value)}
                className="player-input"
              />
              {players.length > 2 && (
                <button className="remove-btn" onClick={() => removePlayer(index)}>
                  <X size={18} />
                </button>
              )}
            </div>
          ))}
        </div>

        {players.length < 5 && (
          <button className="add-player-btn" onClick={addPlayer}>
            <UserPlus size={20} />
            <span>Add Player</span>
          </button>
        )}

        <button 
          className={`start-btn ${isValid ? 'valid' : ''}`} 
          disabled={!isValid}
          onClick={() => onStartVoting(players)}
        >
          <span>Start Voting</span>
          <Play size={20} fill="currentColor" />
        </button>
      </div>
    </div>
  );
};

export default SetupScreen;
