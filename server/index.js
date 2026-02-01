require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { analyzeLanguage } = require('./services/analysisService');
const { transcribeAudio } = require('./services/transcriptionService');
const { analyzeFacialExpressions } = require('./services/facialAnalysisService');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Get impromptu topic
app.get('/api/topic/impromptu', (req, res) => {
  const topics = [
    "Describe your ideal vacation destination",
    "Talk about a skill you'd like to learn",
    "Explain your favorite hobby",
    "Describe a memorable childhood experience",
    "Talk about a book or movie that influenced you",
    "Explain what you would do if you had a free day",
    "Describe your dream job",
    "Talk about a place you'd like to visit"
  ];
  const randomTopic = topics[Math.floor(Math.random() * topics.length)];
  res.json({ topic: randomTopic });
});

// Upload and analyze video/audio
app.post('/api/analyze', upload.single('recording'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { round, userTopic } = req.body;
    const filePath = req.file.path;

    // Run transcription and facial analysis in parallel for faster processing
    console.log('Starting analysis...');
    const [transcription, facialAnalysis] = await Promise.allSettled([
      transcribeAudio(filePath),
      analyzeFacialExpressions(filePath)
    ]);
    
    // Handle transcription result
    let transcriptionText = '';
    let transcriptionWarning = null;
    if (transcription.status === 'fulfilled' && transcription.value?.text) {
      transcriptionText = transcription.value.text;
      if (transcription.value.isFallback) {
        transcriptionWarning = 'Transcription service unavailable - using fallback. Analysis may be limited.';
        console.warn(transcriptionWarning);
      }
    } else {
      console.error('Transcription failed:', transcription.reason);
      // Instead of failing completely, use a fallback
      transcriptionText = '[Transcription failed - unable to process audio. Please check your internet connection and Hugging Face API status.]';
      transcriptionWarning = 'Transcription service unavailable. Analysis will be limited.';
    }

    // Handle facial analysis result
    let facialData = null;
    if (facialAnalysis.status === 'fulfilled') {
      facialData = facialAnalysis.value;
    } else {
      console.error('Facial analysis failed:', facialAnalysis.reason);
      // Use fallback facial analysis
      facialData = {
        dominantEmotion: 'neutral',
        confidence: { level: 'medium', score: 50, comments: 'Facial analysis unavailable' },
        expressions: { positive: 0, neutral: 1, negative: 0, framesAnalyzed: 0 },
        observations: ['Facial analysis could not be performed']
      };
    }

    // Analyze language
    console.log('Analyzing language...');
    const languageAnalysis = await analyzeLanguage(transcriptionText, round, userTopic);

    // Merge facial analysis into language analysis
    if (languageAnalysis.sentiment) {
      // Enhance sentiment with facial expression data
      languageAnalysis.sentiment.facialEmotion = facialData.dominantEmotion;
      languageAnalysis.sentiment.confidenceScore = facialData.confidence.score;
      languageAnalysis.sentiment.facialConfidence = facialData.confidence.level;
    }

    // Add facial analysis as a separate section
    languageAnalysis.facialExpressions = {
      dominantEmotion: facialData.dominantEmotion,
      confidence: facialData.confidence,
      expressions: facialData.expressions,
      observations: facialData.observations
    };

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    res.json({
      transcription: transcriptionText,
      analysis: languageAnalysis,
      round: round,
      warning: transcriptionWarning
    });
  } catch (error) {
    console.error('Error processing recording:', error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: error.message || 'Failed to process recording' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

