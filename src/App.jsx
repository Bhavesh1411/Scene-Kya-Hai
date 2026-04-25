import React, { useState } from 'react';
import Background from './components/Background';
import HeroScreen from './screens/HeroScreen';
import SetupScreen from './screens/SetupScreen';
import VotingScreen from './screens/VotingScreen';
import ResultsScreen from './screens/ResultsScreen';
import './App.css';

function App() {
  const [screen, setScreen] = useState('hero'); // 'hero', 'setup', 'voting', 'results'
  const [players, setPlayers] = useState([]);
  const [votes, setVotes] = useState({});

  const startSetup = () => setScreen('setup');
  
  const startVoting = (playerList) => {
    setPlayers(playerList);
    setScreen('voting');
  };

  const finishVoting = (finalVotes) => {
    setVotes(finalVotes);
    setScreen('results');
  };

  const restart = () => {
    setPlayers([]);
    setVotes({});
    setScreen('hero');
  };

  return (
    <div className="app-container">
      <Background />
      
      <main className="content-wrapper">
        {screen === 'hero' && <HeroScreen onStart={startSetup} />}
        {screen === 'setup' && <SetupScreen onStartVoting={startVoting} />}
        {screen === 'voting' && (
          <VotingScreen 
            players={players} 
            onFinish={finishVoting} 
          />
        )}
        {screen === 'results' && (
          <ResultsScreen 
            votes={votes} 
            onRestart={restart} 
          />
        )}
      </main>
    </div>
  );
}

export default App;
