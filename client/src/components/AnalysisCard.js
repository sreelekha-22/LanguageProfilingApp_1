import React from 'react';
import './AnalysisCard.css';

function AnalysisCard({ title, score, comments, extraInfo }) {
  const getScoreColor = (score) => {
    if (score >= 80) return '#4caf50';
    if (score >= 60) return '#ff9800';
    return '#f44336';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  return (
    <div className="analysis-card">
      <div className="card-header">
        <h3>{title}</h3>
        <div 
          className="score-circle"
          style={{ borderColor: getScoreColor(score) }}
        >
          <span className="score-value">{score}</span>
        </div>
      </div>
      
      <div className="score-label" style={{ color: getScoreColor(score) }}>
        {getScoreLabel(score)}
      </div>
      
      <div className="comments">
        {typeof comments === 'string' ? <p>{comments}</p> : comments}
      </div>
      
      {extraInfo && (
        <div className="extra-info">
          {extraInfo}
        </div>
      )}
    </div>
  );
}

export default AnalysisCard;


