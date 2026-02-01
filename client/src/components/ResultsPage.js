import React from 'react';
import './ResultsPage.css';
import AnalysisCard from './AnalysisCard';

function ResultsPage({ round1Results, round2Results, onStartOver }) {
  const renderAnalysis = (results, roundNumber) => {
    if (!results || !results.analysis) return null;

    const { analysis, transcription, warning } = results;

    return (
      <div className="round-results">
        <h2 className="round-title">Round {roundNumber} Analysis</h2>
        
        {warning && (
          <div className="warning-banner" style={{ 
            background: '#fff3cd', 
            border: '1px solid #ffc107', 
            padding: '12px', 
            borderRadius: '4px', 
            marginBottom: '20px',
            color: '#856404'
          }}>
            ⚠️ {warning}
          </div>
        )}
        
        <div className="transcription-section">
          <h3>Transcription</h3>
          <div className="transcription-text">{transcription}</div>
        </div>

        <div className="metrics-grid">
          <AnalysisCard
            title="Fluency & Coherence"
            score={analysis.fluency?.score || 0}
            comments={analysis.fluency?.comments || 'No comments available'}
          />
          
          <AnalysisCard
            title="Vocabulary Richness"
            score={analysis.vocabulary?.score || 0}
            comments={analysis.vocabulary?.comments || 'No comments available'}
            extraInfo={analysis.vocabulary?.sophisticatedWords?.length > 0 && (
              <div className="extra-info">
                <strong>Sophisticated words used:</strong> {analysis.vocabulary.sophisticatedWords.join(', ')}
              </div>
            )}
          />
          
          <AnalysisCard
            title="Grammar Patterns"
            score={analysis.grammar?.score || 0}
            comments={analysis.grammar?.comments || 'No comments available'}
            extraInfo={analysis.grammar?.errors?.length > 0 && (
              <div className="extra-info">
                <strong>Noted issues:</strong> {analysis.grammar.errors.join(', ')}
              </div>
            )}
          />
          
          <AnalysisCard
            title="Fillers & Pauses"
            score={100 - Math.min((analysis.fillers?.count || 0) * 5, 100)}
            comments={`${analysis.fillers?.count || 0} fillers detected. Pause frequency: ${analysis.fillers?.pauseFrequency || 'unknown'}`}
            extraInfo={analysis.fillers?.list?.length > 0 && (
              <div className="extra-info">
                <strong>Fillers used:</strong> {analysis.fillers.list.join(', ')}
              </div>
            )}
          />
          
          <AnalysisCard
            title="Sentiment & Tone"
            score={analysis.sentiment?.tone === 'positive' ? 80 : analysis.sentiment?.tone === 'neutral' ? 60 : 40}
            comments={analysis.sentiment?.comments || `Tone: ${analysis.sentiment?.tone || 'unknown'}, Confidence: ${analysis.sentiment?.confidence || 'unknown'}`}
            extraInfo={analysis.sentiment?.facialEmotion && (
              <div className="extra-info">
                <strong>Facial emotion detected:</strong> {analysis.sentiment.facialEmotion}
                {analysis.sentiment.facialConfidence && (
                  <div><strong>Facial confidence:</strong> {analysis.sentiment.facialConfidence}</div>
                )}
              </div>
            )}
          />
          
          <AnalysisCard
            title="Facial Expressions & Confidence"
            score={analysis.facialExpressions?.confidence?.score || 50}
            comments={analysis.facialExpressions?.confidence?.comments || 'Facial analysis unavailable'}
            extraInfo={analysis.facialExpressions && (
              <div className="extra-info">
                <div><strong>Dominant emotion:</strong> {analysis.facialExpressions.dominantEmotion}</div>
                <div><strong>Confidence level:</strong> {analysis.facialExpressions.confidence?.level || 'unknown'}</div>
                {analysis.facialExpressions.expressions && (
                  <div>
                    <strong>Expression breakdown:</strong>
                    <div>Positive: {analysis.facialExpressions.expressions.positive}</div>
                    <div>Neutral: {analysis.facialExpressions.expressions.neutral}</div>
                    <div>Negative: {analysis.facialExpressions.expressions.negative}</div>
                    <div>Frames analyzed: {analysis.facialExpressions.expressions.framesAnalyzed}</div>
                  </div>
                )}
                {analysis.facialExpressions.observations && analysis.facialExpressions.observations.length > 0 && (
                  <div>
                    <strong>Observations:</strong>
                    <ul>
                      {analysis.facialExpressions.observations.map((obs, idx) => (
                        <li key={idx}>{obs}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          />
          
          <AnalysisCard
            title="Structure"
            score={analysis.structure?.score || 0}
            comments={analysis.structure?.comments || 'No comments available'}
            extraInfo={
              <div className="extra-info">
                <div>Introduction: {analysis.structure?.hasIntroduction ? '✓' : '✗'}</div>
                <div>Body: {analysis.structure?.hasBody ? '✓' : '✗'}</div>
                <div>Conclusion: {analysis.structure?.hasConclusion ? '✓' : '✗'}</div>
              </div>
            }
          />
          
          <AnalysisCard
            title="Confidence Markers"
            score={analysis.confidenceMarkers?.positive?.length > analysis.confidenceMarkers?.negative?.length ? 70 : 50}
            comments={
              <div>
                {analysis.confidenceMarkers?.positive?.length > 0 && (
                  <div>Positive: {analysis.confidenceMarkers.positive.join(', ')}</div>
                )}
                {analysis.confidenceMarkers?.negative?.length > 0 && (
                  <div>Negative: {analysis.confidenceMarkers.negative.join(', ')}</div>
                )}
              </div>
            }
          />
          
          <AnalysisCard
            title="Complexity Level (CEFR)"
            score={getCEFRScore(analysis.complexity?.cefrLevel)}
            comments={analysis.complexity?.comments || `CEFR Level: ${analysis.complexity?.cefrLevel || 'unknown'}`}
            extraInfo={
              <div className="cefr-info">
                <div className="cefr-level">{analysis.complexity?.cefrLevel || 'N/A'}</div>
                <div className="cefr-description">
                  {getCEFRDescription(analysis.complexity?.cefrLevel)}
                </div>
              </div>
            }
          />
        </div>
      </div>
    );
  };

  const getCEFRScore = (level) => {
    const scores = { 'A1': 20, 'A2': 35, 'B1': 50, 'B2': 65, 'C1': 80, 'C2': 95 };
    return scores[level] || 50;
  };

  const getCEFRDescription = (level) => {
    const descriptions = {
      'A1': 'Beginner - Can understand and use basic phrases',
      'A2': 'Elementary - Can communicate in simple situations',
      'B1': 'Intermediate - Can handle most situations while traveling',
      'B2': 'Upper Intermediate - Can interact fluently with native speakers',
      'C1': 'Advanced - Can use language flexibly for social and professional purposes',
      'C2': 'Proficient - Can understand virtually everything with ease'
    };
    return descriptions[level] || 'Level not determined';
  };

  return (
    <div className="results-page">
      <div className="card">
        <h1>Your Language Profile</h1>
        <p className="subtitle">Comprehensive analysis of your spoken language</p>

        <div className="results-container">
          {renderAnalysis(round1Results, 1)}
          {renderAnalysis(round2Results, 2)}
        </div>

        <div className="actions">
          <button className="btn btn-primary" onClick={onStartOver}>
            Start New Assessment
          </button>
        </div>
      </div>
    </div>
  );
}

export default ResultsPage;


