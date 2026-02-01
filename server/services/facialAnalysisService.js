const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// Use Hugging Face Inference API for facial expression and confidence analysis (completely free)
async function analyzeFacialExpressions(videoPath) {
  try {
    const apiKey = process.env.HUGGINGFACE_API_KEY;
    
    // Extract frames from video (sample every 2 seconds for analysis)
    const framesDir = path.join(path.dirname(videoPath), 'frames_' + Date.now());
    if (!fs.existsSync(framesDir)) {
      fs.mkdirSync(framesDir, { recursive: true });
    }

    // Extract frames using ffmpeg (if available) or use alternative method
    let framePaths = [];
    try {
      // Try to use ffmpeg to extract frames
      const outputPattern = path.join(framesDir, 'frame_%03d.jpg');
      await execPromise(`ffmpeg -i "${videoPath}" -vf "fps=0.5" -q:v 2 "${outputPattern}"`);
      
      // Get all extracted frames
      const files = fs.readdirSync(framesDir);
      framePaths = files
        .filter(f => f.startsWith('frame_') && f.endsWith('.jpg'))
        .map(f => path.join(framesDir, f))
        .sort();
    } catch (ffmpegError) {
      console.log('FFmpeg not available, using single frame extraction...');
      // Fallback: extract just one frame from middle of video
      try {
        const outputFrame = path.join(framesDir, 'frame_001.jpg');
        await execPromise(`ffmpeg -i "${videoPath}" -ss 00:00:01 -vframes 1 -q:v 2 "${outputFrame}"`);
        if (fs.existsSync(outputFrame)) {
          framePaths = [outputFrame];
        }
      } catch (singleFrameError) {
        console.log('Could not extract frames, skipping facial analysis');
        return createFallbackFacialAnalysis();
      }
    }

    if (framePaths.length === 0) {
      console.log('No frames extracted, using fallback analysis');
      return createFallbackFacialAnalysis();
    }

    // Analyze each frame using Hugging Face vision models
    const analyses = [];
    const models = [
      'trpakov/vit-face-expression',  // Facial expression model
      'julien-c/human-emotion-recognition',  // Emotion recognition
      'dima806/facial_emotions_image_detection'  // Alternative
    ];

    for (const framePath of framePaths.slice(0, 5)) { // Analyze max 5 frames
      try {
        const frameBuffer = fs.readFileSync(framePath);
        
        // Try different models
        let frameAnalysis = null;
        for (const model of models) {
          try {
            const apiUrl = `https://api-inference.huggingface.co/models/${model}`;
            const headers = {
              'Content-Type': 'application/octet-stream'
            };
            
            if (apiKey) {
              headers['Authorization'] = `Bearer ${apiKey}`;
            }

            // Send image as binary data (Hugging Face prefers this format)
            const response = await axios.post(
              apiUrl,
              frameBuffer,
              { 
                headers, 
                timeout: 30000,
                maxContentLength: Infinity,
                maxBodyLength: Infinity
              }
            );

            if (response.data && Array.isArray(response.data) && response.data.length > 0) {
              frameAnalysis = response.data[0];
              break;
            }
          } catch (modelError) {
            // Try next model
            continue;
          }
        }

        if (frameAnalysis) {
          analyses.push(frameAnalysis);
        }
      } catch (frameError) {
        console.log(`Error analyzing frame ${framePath}:`, frameError.message);
      }
    }

    // Clean up frames
    try {
      framePaths.forEach(framePath => {
        if (fs.existsSync(framePath)) {
          fs.unlinkSync(framePath);
        }
      });
      if (fs.existsSync(framesDir)) {
        fs.rmdirSync(framesDir);
      }
    } catch (cleanupError) {
      console.log('Error cleaning up frames:', cleanupError.message);
    }

    // Aggregate results
    return aggregateFacialAnalysis(analyses);
  } catch (error) {
    console.error('Facial analysis error:', error.message);
    return createFallbackFacialAnalysis();
  }
}

function aggregateFacialAnalysis(analyses) {
  if (analyses.length === 0) {
    return createFallbackFacialAnalysis();
  }

  // Extract emotions and expressions from analyses
  const emotions = [];
  const confidenceScores = [];
  
  analyses.forEach(analysis => {
    if (Array.isArray(analysis)) {
      analysis.forEach(item => {
        if (item.label) {
          const label = item.label.toLowerCase();
          if (label.includes('happy') || label.includes('smile') || label.includes('joy')) {
            emotions.push('positive');
            confidenceScores.push(0.7);
          } else if (label.includes('sad') || label.includes('frown')) {
            emotions.push('negative');
            confidenceScores.push(0.3);
          } else if (label.includes('neutral')) {
            emotions.push('neutral');
            confidenceScores.push(0.5);
          } else if (label.includes('confident') || label.includes('confident')) {
            confidenceScores.push(0.8);
          } else if (label.includes('nervous') || label.includes('anxious')) {
            confidenceScores.push(0.3);
          }
        }
        if (item.score) {
          confidenceScores.push(item.score);
        }
      });
    }
  });

  // Calculate averages
  const avgConfidence = confidenceScores.length > 0
    ? confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length
    : 0.5;

  const positiveCount = emotions.filter(e => e === 'positive').length;
  const negativeCount = emotions.filter(e => e === 'negative').length;
  const neutralCount = emotions.filter(e => e === 'neutral').length;

  let dominantEmotion = 'neutral';
  if (positiveCount > negativeCount && positiveCount > neutralCount) {
    dominantEmotion = 'positive';
  } else if (negativeCount > positiveCount && negativeCount > neutralCount) {
    dominantEmotion = 'negative';
  }

  const confidenceLevel = avgConfidence > 0.7 ? 'high' : avgConfidence > 0.4 ? 'medium' : 'low';

  return {
    dominantEmotion: dominantEmotion,
    confidence: {
      level: confidenceLevel,
      score: Math.round(avgConfidence * 100),
      comments: `Based on facial expressions, confidence appears ${confidenceLevel}.`
    },
    expressions: {
      positive: positiveCount,
      neutral: neutralCount,
      negative: negativeCount,
      framesAnalyzed: analyses.length
    },
    observations: [
      `Analyzed ${analyses.length} video frames`,
      `Dominant emotion: ${dominantEmotion}`,
      `Confidence level: ${confidenceLevel}`
    ]
  };
}

function createFallbackFacialAnalysis() {
  return {
    dominantEmotion: 'neutral',
    confidence: {
      level: 'medium',
      score: 50,
      comments: 'Facial analysis unavailable - using default values'
    },
    expressions: {
      positive: 0,
      neutral: 1,
      negative: 0,
      framesAnalyzed: 0
    },
    observations: [
      'Facial analysis could not be performed',
      'This may be due to video format or missing dependencies'
    ]
  };
}

module.exports = { analyzeFacialExpressions };

