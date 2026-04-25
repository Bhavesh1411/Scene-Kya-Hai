import React, { useMemo } from 'react';
import { Trophy, RotateCcw } from 'lucide-react';
import './ResultsScreen.css';

const ResultsScreen = ({ votes, onRestart }) => {
  // votes is now an array of: { name, votes: [{ movie, vote }] }
  
  const movieResults = useMemo(() => {
    const scores = {};
    
    // Aggregate scores from all players
    votes.forEach(playerSession => {
      playerSession.votes.forEach(voteItem => {
        const movieTitle = voteItem.movie;
        const voteValue = voteItem.vote;
        
        let points = 0;
        if (voteValue === 'yes') points = 1;
        if (voteValue === 'love') points = 3;
        
        scores[movieTitle] = (scores[movieTitle] || 0) + points;
      });
    });

    // Convert to sorted array
    return Object.entries(scores)
      .map(([title, score]) => ({
        id: title, // Use title as ID
        title: title,
        score: score,
        // Since we don't have images for user suggestions, use a movie icon or placeholder
        image: null 
      }))
      .sort((a, b) => b.score - a.score);
  }, [votes]);

  const topThree = movieResults.slice(0, 3);
  const rest = movieResults.slice(3);

  if (movieResults.length === 0) {
    return (
      <div className="results-container">
        <div className="results-content">
          <h2 className="results-title">No Votes Recorded!</h2>
          <button className="restart-btn" onClick={onRestart}>
            <RotateCcw size={20} />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="results-container">
      <div className="results-content">
        <h2 className="results-title">The Verdict</h2>
        
        <div className="podium">
          {/* Silver - 2nd */}
          {topThree[1] && (
            <div className="podium-item silver">
              <div className="podium-card glass-card">
                <div className="movie-placeholder">🎬</div>
                <div className="podium-rank">2</div>
              </div>
              <div className="podium-info">
                <span className="movie-name">{topThree[1].title}</span>
                <span className="movie-score">{topThree[1].score} pts</span>
              </div>
            </div>
          )}

          {/* Gold - 1st */}
          {topThree[0] && (
            <div className="podium-item gold">
              <div className="podium-card glass-card winner-glow">
                <div className="trophy-icon">
                  <Trophy size={32} color="#FBBF24" fill="#FBBF24" />
                </div>
                <div className="movie-placeholder">⭐</div>
                <div className="podium-rank">1</div>
              </div>
              <div className="podium-info">
                <span className="movie-name">{topThree[0].title}</span>
                <span className="movie-score">{topThree[0].score} pts</span>
              </div>
            </div>
          )}

          {/* Bronze - 3rd */}
          {topThree[2] && (
            <div className="podium-item bronze">
              <div className="podium-card glass-card">
                <div className="movie-placeholder">🎬</div>
                <div className="podium-rank">3</div>
              </div>
              <div className="podium-info">
                <span className="movie-name">{topThree[2].title}</span>
                <span className="movie-score">{topThree[2].score} pts</span>
              </div>
            </div>
          )}
        </div>

        <div className="other-results glass-card">
          {rest.length > 0 ? rest.map((movie, index) => (
            <div key={movie.id} className="result-row">
              <span className="row-rank">#{index + 4}</span>
              <span className="row-title">{movie.title}</span>
              <span className="row-score">{movie.score} pts</span>
            </div>
          )) : (
            <div className="no-more">That's the top picks!</div>
          )}
        </div>

        <button className="restart-btn" onClick={onRestart}>
          <RotateCcw size={20} />
          <span>New Session</span>
        </button>
      </div>
    </div>
  );
};

export default ResultsScreen;
