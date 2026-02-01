import React, { useState } from 'react';
import './App.css';
import RecordingPage from './components/RecordingPage';
import ResultsPage from './components/ResultsPage';

function App() {
  const [currentRound, setCurrentRound] = useState(1);
  const [round1Results, setRound1Results] = useState(null);
  const [round2Results, setRound2Results] = useState(null);
  const [userTopic, setUserTopic] = useState('');

  const handleRoundComplete = (results, round, topic) => {
    if (round === 1) {
      setRound1Results(results);
      setCurrentRound(2);
    } else {
      setRound2Results(results);
      setCurrentRound(3); // Show results
    }
  };

  const handleStartOver = () => {
    setCurrentRound(1);
    setRound1Results(null);
    setRound2Results(null);
    setUserTopic('');
  };

  if (currentRound === 3) {
    return (
      <ResultsPage 
        round1Results={round1Results}
        round2Results={round2Results}
        onStartOver={handleStartOver}
      />
    );
  }

  return (
    <div className="App">
      <RecordingPage
        round={currentRound}
        onComplete={handleRoundComplete}
        userTopic={userTopic}
        setUserTopic={setUserTopic}
      />
    </div>
  );
}

export default App;


