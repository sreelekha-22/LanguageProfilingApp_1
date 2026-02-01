# Setup Instructions

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Hugging Face API key (completely free at https://huggingface.co/settings/tokens)

## Installation Steps

1. **Install all dependencies:**
   ```bash
   npm run install-all
   ```

2. **Set up environment variables:**
   
   Create a `.env` file in the `server` directory:
   ```
   HUGGINGFACE_API_KEY=your-huggingface-api-key-here
   PORT=5000
   ```
   
   **Note:** The Hugging Face API key is optional but recommended for better rate limits. The app will work without it, but may have slower responses.

3. **Start the development servers:**
   ```bash
   npm run dev
   ```

   This will start:
   - Backend server on `http://localhost:5000`
   - React frontend on `http://localhost:3000`

## Getting a Hugging Face API Key (Completely Free)

1. Go to https://huggingface.co
2. Sign up or log in (free account)
3. Navigate to Settings → Access Tokens (https://huggingface.co/settings/tokens)
4. Create a new token with "Read" permissions
5. Copy the token and add it to your `.env` file

**Free Tier Details:**
- Hugging Face Inference API is completely free
- No credit card required
- Uses state-of-the-art models: Whisper Large v3/v2 for transcription, Mistral-7B for analysis
- **API key is now recommended** - many models require authentication to access
- Without an API key, you may see 410 errors indicating models are unavailable

## Troubleshooting

### Camera/Microphone Permissions
- Make sure your browser has permission to access camera and microphone
- Check browser settings if recording doesn't start

### API Errors
- **410 Errors (Model Unavailable)**: Many models now require an API key. Get one from https://huggingface.co/settings/tokens
- **Socket Hang Up**: Network issue or model timeout - the app will retry automatically
- **503 Errors**: Model is loading (cold start) - wait a moment and try again
- The app will use fallback transcription if all models fail, allowing basic analysis to continue
- Verify your Hugging Face API key is correct and has "Read" permissions

### Port Already in Use
- Change the PORT in `.env` if 5000 is already in use
- Update `REACT_APP_API_URL` in client if backend port changes


