import React, { useState } from 'react';
import SwipeStack from '../components/SwipeStack';
import { MOCK_MOVIES } from '../data/movies';
import './VotingScreen.css';

const VotingScreen = ({ players, onFinish }) => {
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [votes, setVotes] = useState({}); // { movieId: score }

  const handleSwipe = (movieId, direction) => {
    if (direction === 'done') {
      if (currentPlayerIndex < players.length - 1) {
        setCurrentPlayerIndex(currentPlayerIndex + 1);
      } else {
        onFinish(votes);
      }
      return;
    }

    const score = direction === 'right' ? 1 : direction === 'up' ? 3 : 0;
    setVotes(prev => ({
      ...prev,
      [movieId]: (prev[movieId] || 0) + score
    }));
  };

  return (
    <div className="voting-container">
      <div className="voting-header">
        <div className="player-badge">
          <span className="player-label">VOTING NOW</span>
          <h2 className="player-name">{players[currentPlayerIndex]}</h2>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${((currentPlayerIndex + 1) / players.length) * 100}%` }}
          ></div>
        </div>
      </div>

      <SwipeStack 
        key={currentPlayerIndex} // Reset stack for each player
        movies={MOCK_MOVIES} 
        onSwipe={handleSwipe} 
      />

      <div className="voting-footer">
        Player {currentPlayerIndex + 1} of {players.length}
      </div>
    </div>
  );
};

export default VotingScreen;
