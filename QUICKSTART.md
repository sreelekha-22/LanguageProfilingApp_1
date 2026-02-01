# Quick Start Guide

## 1. Install Dependencies

```bash
npm run install-all
```

## 2. Set Up API Key

Create `server/.env` file:
```
OPENAI_API_KEY=sk-your-key-here
PORT=5000
```

Get your free API key from: https://platform.openai.com/api-keys

## 3. Start the Application

```bash
npm run dev
```

## 4. Open in Browser

Navigate to: http://localhost:3000

## 5. Use the Application

1. **Round 1**: You'll be given an impromptu topic. Record yourself speaking for 2-4 minutes.
2. **Round 2**: Choose your own topic and record yourself speaking for 2-4 minutes.
3. **View Results**: See your comprehensive language profile with all metrics.

## Troubleshooting

- **Camera/Mic not working**: Check browser permissions
- **API errors**: Verify your OpenAI API key and check your credits
- **Port conflicts**: Change PORT in `server/.env` and update `REACT_APP_API_URL` in client

## Features

✅ Video recording with audio
✅ Two rounds of speaking (impromptu + chosen topic)
✅ Comprehensive language analysis:
   - Fluency & coherence
   - Vocabulary richness
   - Grammar patterns
   - Fillers & pauses
   - Sentiment/tone
   - Structure analysis
   - Confidence markers
   - CEFR complexity level


