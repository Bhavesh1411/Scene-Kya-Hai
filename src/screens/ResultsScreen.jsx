import React, { useMemo } from 'react';
import { Trophy, RotateCcw } from 'lucide-react';
import { MOCK_MOVIES } from '../data/movies';
import './ResultsScreen.css';

const ResultsScreen = ({ votes, onRestart }) => {
  const sortedMovies = useMemo(() => {
    return [...MOCK_MOVIES]
      .map(m => ({ ...m, score: votes[m.id] || 0 }))
      .sort((a, b) => b.score - a.score);
  }, [votes]);

  const topThree = sortedMovies.slice(0, 3);
  const rest = sortedMovies.slice(3);

  return (
    <div className="results-container">
      <div className="results-content">
        <h2 className="results-title">The Verdict</h2>
        
        <div className="podium">
          {/* Silver - 2nd */}
          {topThree[1] && (
            <div className="podium-item silver">
              <div className="podium-card glass-card">
                <img src={topThree[1].image} alt="" />
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
                <img src={topThree[0].image} alt="" />
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
                <img src={topThree[2].image} alt="" />
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
          {rest.map((movie, index) => (
            <div key={movie.id} className="result-row">
              <span className="row-rank">#{index + 4}</span>
              <span className="row-title">{movie.title}</span>
              <span className="row-score">{movie.score} pts</span>
            </div>
          ))}
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
