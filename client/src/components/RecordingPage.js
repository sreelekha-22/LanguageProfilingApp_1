import React, { useState, useEffect, useRef } from 'react';
import './RecordingPage.css';
import VideoRecorder from './VideoRecorder';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function RecordingPage({ round, onComplete, userTopic, setUserTopic }) {
  const [impromptuTopic, setImpromptuTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [topicInput, setTopicInput] = useState(''); // Local state for input field

  useEffect(() => {
    if (round === 1) {
      fetchImpromptuTopic();
    } else if (round === 2) {
      // Initialize topicInput with existing userTopic if available
      setTopicInput(userTopic || '');
    }
  }, [round, userTopic]);

  const fetchImpromptuTopic = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/topic/impromptu`);
      setImpromptuTopic(response.data.topic);
    } catch (err) {
      console.error('Error fetching topic:', err);
      setImpromptuTopic("Describe your ideal vacation destination");
    }
  };

  const handleRecordingComplete = async (videoBlob, fileName = 'recording.webm') => {
    setIsLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('recording', videoBlob, fileName);
      formData.append('round', round.toString());
      if (round === 2 && userTopic) {
        formData.append('userTopic', userTopic);
      }

      const response = await axios.post(`${API_BASE_URL}/analyze`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 120000, // 2 minutes timeout
      });

      onComplete(response.data, round, userTopic);
    } catch (err) {
      console.error('Error analyzing recording:', err);
      setError(err.response?.data?.error || 'Failed to analyze recording. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTopicSubmit = () => {
    const trimmedTopic = topicInput.trim();
    if (trimmedTopic) {
      setUserTopic(trimmedTopic);
    }
  };

  if (round === 2 && !userTopic) {
    return (
      <div className="recording-page">
        <div className="card">
          <h1>Round 2: Choose Your Topic</h1>
          <p className="subtitle">Select a topic you'd like to speak about for 2-4 minutes</p>
          
          <div className="topic-input-section">
            <input
              type="text"
              className="topic-input"
              placeholder="Enter your topic here..."
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && topicInput.trim()) {
                  handleTopicSubmit();
                }
              }}
            />
            <button
              className="btn btn-primary"
              onClick={handleTopicSubmit}
              disabled={!topicInput.trim()}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="recording-page">
      <div className="card">
        <div className="round-badge">Round {round} of 2</div>
        <h1>
          {round === 1 ? 'Impromptu Speaking' : 'Your Chosen Topic'}
        </h1>
        
        {round === 1 ? (
          <div className="topic-section">
            <p className="subtitle">Speak about this topic for 2-4 minutes:</p>
            <div className="topic-box">
              <h2>{impromptuTopic || 'Loading topic...'}</h2>
            </div>
          </div>
        ) : (
          <div className="topic-section">
            <p className="subtitle">Speak about your chosen topic for 2-4 minutes:</p>
            <div className="topic-box">
              <h2>{userTopic}</h2>
            </div>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        {isLoading ? (
          <div className="loading-section">
            <div className="spinner"></div>
            <p>Analyzing your speech... This may take a minute.</p>
          </div>
        ) : (
          <VideoRecorder
            onComplete={handleRecordingComplete}
            disabled={isLoading}
          />
        )}
      </div>
    </div>
  );
}

export default RecordingPage;

