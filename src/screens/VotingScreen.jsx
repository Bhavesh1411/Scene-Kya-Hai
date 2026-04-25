import React, { useState, useMemo, useEffect } from 'react';
import gsap from 'gsap';
import './VotingScreen.css';

const VotingScreen = ({ players, onFinish }) => {
  // Extract unique movie suggestions from all players
  const moviePool = useMemo(() => {
    const suggestions = players
      .map(p => p.suggestion)
      .filter(s => s && s.trim() !== '');
    return [...new Set(suggestions)];
  }, [players]);

  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [currentMovieIndex, setCurrentMovieIndex] = useState(0);
  const [allVotes, setAllVotes] = useState([]); // Array of { name, votes: [{ movie, vote }] }
  const [currentSessionVotes, setCurrentSessionVotes] = useState([]); // Current player's votes

  const currentPlayer = players[currentPlayerIndex];
  const currentMovie = moviePool[currentMovieIndex];

  // If no movies were suggested, we should handle this gracefully
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

  const handleVote = (voteType) => {
    // Pop effect animation
    gsap.fromTo('.voting-card', 
      { scale: 1 }, 
      { scale: 1.1, duration: 0.1, yoyo: true, repeat: 1, ease: 'power2.out' }
    );

    const newVote = { movie: currentMovie, vote: voteType };
    const updatedSessionVotes = [...currentSessionVotes, newVote];

    if (currentMovieIndex < moviePool.length - 1) {
      // Move to next movie for current player
      setCurrentSessionVotes(updatedSessionVotes);
      setCurrentMovieIndex(currentMovieIndex + 1);
      
      // Slide animation for next movie
      gsap.fromTo('.movie-title-display', 
        { x: 50, opacity: 0 }, 
        { x: 0, opacity: 1, duration: 0.4, ease: 'power2.out' }
      );
    } else {
      // Current player finished all movies
      const playerFinalData = {
        name: currentPlayer.name,
        votes: updatedSessionVotes
      };
      
      const updatedAllVotes = [...allVotes, playerFinalData];
      
      if (currentPlayerIndex < players.length - 1) {
        // Show transition to next player
        setAllVotes(updatedAllVotes);
        setCurrentPlayerIndex(currentPlayerIndex + 1);
        setCurrentMovieIndex(0);
        setCurrentSessionVotes([]);
        
        // Transition animation
        gsap.fromTo('.voting-container', 
          { opacity: 0.5 }, 
          { opacity: 1, duration: 0.8 }
        );
      } else {
        // Everyone finished!
        onFinish(updatedAllVotes);
      }
    }
  };

  return (
    <div className="voting-container">
      <div className="voting-header">
        <div className="player-turn-badge">
          <span className="turn-label">CURRENT VOTER</span>
          <h2 className="turn-name">{currentPlayer.name}’s Turn 🎬</h2>
        </div>
        
        <div className="voting-progress">
          <div className="progress-text">
            Movie {currentMovieIndex + 1} of {moviePool.length}
          </div>
          <div className="progress-bar-bg">
            <div 
              className="progress-bar-fill"
              style={{ width: `${((currentMovieIndex + 1) / moviePool.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="voting-main">
        <div className="voting-card glass-card">
          <div className="movie-tag">VOTE ON THIS MOVIE</div>
          <div className="movie-title-display">
            <h1>{currentMovie}</h1>
          </div>
          <div className="voter-context">
            Wait, who suggested this? <span>(Anonymous)</span>
          </div>
        </div>

        <div className="action-buttons">
          <button className="vote-btn dislike" onClick={() => handleVote('no')}>
            <span className="icon">❌</span>
            <span className="label">No</span>
          </button>
          
          <button className="vote-btn like" onClick={() => handleVote('yes')}>
            <span className="icon">👍</span>
            <span className="label">Yes</span>
          </button>
          
          <button className="vote-btn love" onClick={() => handleVote('love')}>
            <span className="icon">❤️</span>
            <span className="label">Love</span>
          </button>
        </div>
      </div>

      <div className="voting-footer">
        <p>Player {currentPlayerIndex + 1} of {players.length} voting</p>
        <div className="player-dots">
          {players.map((_, i) => (
            <div key={i} className={`dot ${i === currentPlayerIndex ? 'active' : i < currentPlayerIndex ? 'done' : ''}`}></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VotingScreen;
