import React, { useMemo, useEffect, useRef } from 'react';
import { Trophy, RotateCcw, Medal } from 'lucide-react';
import gsap from 'gsap';
import confetti from 'canvas-confetti';
import './ResultsScreen.css';

const ResultsScreen = ({ votes, onRestart }) => {
  const containerRef = useRef(null);
  const podiumRef = useRef(null);
  const cardRefs = useRef([]); // [1st, 2nd, 3rd]

  const playPop = () => {
    const audio = new Audio('/assets/pop.mp3');
    audio.volume = 0.4;
    audio.play().catch(e => console.log("Audio playback failed:", e));
  };

  const movieResults = useMemo(() => {
    // 1. Log all raw votes for debugging
    console.log("--- RAW VOTING DATA ---");
    console.log(JSON.stringify(votes, null, 2));

    const scores = {};
    
    // 2. Aggregate scores from all players
    if (Array.isArray(votes)) {
      votes.forEach(playerSession => {
        playerSession.votes.forEach(voteItem => {
          const movieTitle = voteItem.movie;
          const voteValue = voteItem.vote;
          
          let points = 0;
          if (voteValue === 'love') points = 3;
          else if (voteValue === 'yes') points = 1;
          else if (voteValue === 'no') points = 0;
          
          scores[movieTitle] = (scores[movieTitle] || 0) + points;
        });
      });
    }

    // 3. Log calculated scores
    console.log("--- CALCULATED SCORES ---");
    console.log(scores);

    // 4. Convert to sorted array
    const sortedResults = Object.entries(scores)
      .map(([title, score]) => ({
        id: title,
        title: title,
        score: score
      }))
      .sort((a, b) => b.score - a.score);

    console.log("--- SORTED RANKINGS ---");
    console.log(sortedResults);

    return sortedResults;
  }, [votes]);

  const topThree = movieResults.slice(0, 3);
  const rest = movieResults.slice(3);

  // Per-film vote breakdown: { [movieTitle]: { yes, love, no } }
  const voteBreakdown = useMemo(() => {
    const breakdown = {};
    if (Array.isArray(votes)) {
      votes.forEach(session => {
        session.votes.forEach(({ movie, vote }) => {
          if (!breakdown[movie]) breakdown[movie] = { yes: 0, love: 0, no: 0 };
          breakdown[movie][vote] = (breakdown[movie][vote] || 0) + 1;
        });
      });
    }
    return breakdown;
  }, [votes]);

  // Sentiment matrix: { [playerName]: { [movieTitle]: vote } }
  const sentimentMatrix = useMemo(() => {
    const matrix = {};
    if (Array.isArray(votes)) {
      votes.forEach(session => {
        matrix[session.name] = {};
        session.votes.forEach(({ movie, vote }) => {
          matrix[session.name][movie] = vote;
        });
      });
    }
    return matrix;
  }, [votes]);

  const allMovies = movieResults.map(m => m.title);
  const allPlayers = Object.keys(sentimentMatrix);

  useEffect(() => {
    if (movieResults.length === 0) return;

    const tl = gsap.timeline({ delay: 0.3 });

    // 1. Podium rises from bottom
    tl.fromTo(".podium-base", 
      { y: 500, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.2, ease: "back.out(1.2)", stagger: 0.1 }
    );

    // 2. 3rd Place Entrance (Index 2 in topThree)
    if (topThree[2]) {
      tl.fromTo(".rank-3",
        { scale: 3, opacity: 0, y: -200, filter: "blur(10px)" },
        { scale: 1, opacity: 1, y: 0, filter: "blur(0px)", duration: 0.8, ease: "power3.out" },
        "-=0.4"
      );
    }

    // 3. 2nd Place Entrance (Index 1 in topThree)
    if (topThree[1]) {
      tl.fromTo(".rank-2",
        { scale: 3, opacity: 0, y: -200, filter: "blur(10px)" },
        { scale: 1, opacity: 1, y: 0, filter: "blur(0px)", duration: 0.8, ease: "power3.out" },
        "-=0.4"
      );
    }

    // 4. 1st Place Hero Moment (Index 0 in topThree)
    if (topThree[0]) {
      tl.fromTo(".rank-1",
        { scale: 5, opacity: 0, y: -300, filter: "blur(20px)" },
        { 
          scale: 1, opacity: 1, y: 0, filter: "blur(0px)", duration: 1.5, ease: "power4.out",
          onStart: () => {
            // Slow motion reveal effect
          },
          onComplete: () => {
            // Trigger Confetti
            const duration = 3 * 1000;
            const end = Date.now() + duration;

            // Play initial pop sounds
            playPop();
            setTimeout(playPop, 100);

            const frame = () => {
              confetti({
                particleCount: 3,
                angle: 60,
                spread: 55,
                origin: { x: 0, y: 0.8 },
                colors: ['#FBBF24', '#ffffff', '#60A5FA']
              });
              confetti({
                particleCount: 3,
                angle: 120,
                spread: 55,
                origin: { x: 1, y: 0.8 },
                colors: ['#FBBF24', '#ffffff', '#60A5FA']
              });

              if (Date.now() < end) {
                requestAnimationFrame(frame);
              }
            };
            frame();
          }
        },
        "-=0.2"
      );
    }

    // 5. Fade in rest of UI
    tl.fromTo(".rest-ui", 
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8 },
      "-=0.5"
    );

    // 6. Fade in analytics sections
    tl.fromTo(".analytics-section",
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.2 },
      "-=0.2"
    );

  }, [movieResults, topThree]);

  if (movieResults.length === 0) {
    return (
      <div className="results-container empty">
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
    <div className="results-container" ref={containerRef}>
      <div className="results-content">
        <h1 className="results-title rest-ui">The Winner is...</h1>
        
        <div className="podium-wrapper" ref={podiumRef}>
          {/* Left - 3rd Place */}
          <div className="podium-column rank-3">
            {topThree[2] && (
              <div className="winner-card bronze">
                <div className="medal-icon"><Medal size={24} color="#D97706" /></div>
                <div className="winner-title">{topThree[2].title}</div>
                <div className="winner-score">{topThree[2].score} pts</div>
              </div>
            )}
            <div className="podium-base bronze-base">
              <span className="rank-num">3</span>
            </div>
          </div>

          {/* Center - 1st Place */}
          <div className="podium-column rank-1">
            {topThree[0] && (
              <div className="winner-card gold winner-glow">
                <div className="trophy-main">
                  <Trophy size={48} color="#FBBF24" fill="#FBBF24" />
                </div>
                <div className="winner-title">{topThree[0].title}</div>
                <div className="winner-score">{topThree[0].score} pts</div>
              </div>
            )}
            <div className="podium-base gold-base">
              <span className="rank-num">1</span>
            </div>
          </div>

          {/* Right - 2nd Place */}
          <div className="podium-column rank-2">
            {topThree[1] && (
              <div className="winner-card silver">
                <div className="medal-icon"><Medal size={24} color="#9CA3AF" /></div>
                <div className="winner-title">{topThree[1].title}</div>
                <div className="winner-score">{topThree[1].score} pts</div>
              </div>
            )}
            <div className="podium-base silver-base">
              <span className="rank-num">2</span>
            </div>
          </div>
        </div>

        {/* Other Results List */}
        {rest.length > 0 && (
          <div className="other-results-list rest-ui glass-card">
            {rest.map((movie, index) => (
              <div key={movie.id} className="result-row">
                <span className="row-rank">#{index + 4}</span>
                <span className="row-title">{movie.title}</span>
                <span className="row-score">{movie.score} pts</span>
              </div>
            ))}
          </div>
        )}

        <div className="action-buttons rest-ui">
          <button className="primary-btn" onClick={onRestart}>
            <RotateCcw size={20} />
            <span>New Session</span>
          </button>
        </div>

        {/* ── ANALYTICS DASHBOARD ── */}
        <div className="analytics-dashboard">

          {/* 1. Score Delta Section */}
          <div className="analytics-section">
            <h2 className="analytics-heading">🏅 Score Breakdown</h2>
            <div className="delta-list">
              {movieResults.map((movie, idx) => {
                const delta = idx === 0 ? null : movie.score - movieResults[0].score;
                const medal = ['🥇','🥈','🥉'][idx] || `#${idx+1}`;
                return (
                  <div key={movie.id} className="delta-row">
                    <span className="delta-medal">{medal}</span>
                    <span className="delta-title">{movie.title}</span>
                    <span className="delta-score">{movie.score} pts</span>
                    {delta !== null && (
                      <span className="delta-diff">{delta}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Per-Film Consensus */}
          <div className="analytics-section">
            <h2 className="analytics-heading">🎬 Film Consensus</h2>
            <div className="consensus-list">
              {movieResults.map(movie => {
                const b = voteBreakdown[movie.title] || { yes: 0, love: 0, no: 0 };
                const total = b.yes + b.love + b.no;
                return (
                  <div key={movie.id} className="consensus-card">
                    <div className="consensus-header">
                      <span className="consensus-title">{movie.title}</span>
                      <span className="consensus-total">{movie.score} pts</span>
                    </div>
                    <div className="consensus-votes">
                      <span className="vote-chip love-chip">❤️ {b.love}</span>
                      <span className="vote-chip yes-chip">👍 {b.yes}</span>
                      <span className="vote-chip no-chip">❌ {b.no}</span>
                    </div>
                    <div className="consensus-bar-track">
                      {total > 0 && (
                        <>
                          <div className="consensus-bar love-bar" style={{ width: `${(b.love/total)*100}%` }} />
                          <div className="consensus-bar yes-bar" style={{ width: `${(b.yes/total)*100}%` }} />
                          <div className="consensus-bar no-bar" style={{ width: `${(b.no/total)*100}%` }} />
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Sentiment Matrix */}
          {allPlayers.length > 0 && allMovies.length > 0 && (
            <div className="analytics-section">
              <h2 className="analytics-heading">👥 Sentiment Matrix</h2>
              <div className="matrix-scroll">
                <table className="matrix-table">
                  <thead>
                    <tr>
                      <th className="matrix-th">Player</th>
                      {allMovies.map(m => (
                        <th key={m} className="matrix-th movie-th">{m}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {allPlayers.map(player => (
                      <tr key={player}>
                        <td className="matrix-player">{player}</td>
                        {allMovies.map(movie => {
                          const v = sentimentMatrix[player]?.[movie];
                          const emoji = v === 'love' ? '❤️' : v === 'yes' ? '👍' : v === 'no' ? '❌' : '—';
                          return (
                            <td key={movie} className={`matrix-cell cell-${v || 'none'}`}>{emoji}</td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ResultsScreen;
