const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const axios = require('axios');

// Use Hugging Face Inference API for transcription (completely free)
async function transcribeAudio(filePath) {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  
  // Check file size - if too large, might cause issues
  const stats = fs.statSync(filePath);
  const fileSizeInMB = stats.size / (1024 * 1024);
  
  if (fileSizeInMB > 25) {
    console.log(`Warning: Audio file is ${fileSizeInMB.toFixed(2)}MB, which might be too large for some models`);
  }

  // Using working Whisper models on Hugging Face (try multiple options)
  // Order: smaller/faster models first, then larger ones
  const models = [
    'openai/whisper-tiny',  // Fastest, smallest
    'openai/whisper-base',  // Small, reliable
    'openai/whisper-small', // Medium size
    'facebook/wav2vec2-base-960h',  // Alternative ASR model
    'jonatasgrosman/wav2vec2-large-xlsr-53-english'  // Larger alternative
  ];

  // Read the file as buffer
  const audioBuffer = fs.readFileSync(filePath);
  
  const baseHeaders = {
    'Content-Type': 'application/octet-stream'
  };
  
  if (apiKey) {
    baseHeaders['Authorization'] = `Bearer ${apiKey}`;
  }

  let lastError;
  
  // Try each model with retries
  for (const tryModel of models) {
    const maxRetries = 2;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const apiUrl = `https://api-inference.huggingface.co/models/${tryModel}`;
        console.log(`Trying transcription model: ${tryModel} (attempt ${attempt + 1}/${maxRetries})`);
        
        // Increase timeout for larger files
        const timeout = fileSizeInMB > 10 ? 120000 : 90000;
        
        const response = await axios.post(
          apiUrl,
          audioBuffer,
          {
            headers: { ...baseHeaders },
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
            timeout: timeout,
            // Add retry configuration
            validateStatus: function (status) {
              return status < 500; // Don't throw on 4xx errors
            }
          }
        );

        // Handle 503 (model loading)
        if (response.status === 503) {
          const estimatedTime = response.data?.estimated_time || 20;
          const waitTime = Math.min(estimatedTime * 1000, 30000);
          console.log(`Model ${tryModel} is loading, waiting ${waitTime}ms...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue; // Retry same model
        }

        // Handle 410/404 (model not available)
        if (response.status === 410 || response.status === 404) {
          console.log(`Model ${tryModel} not available (${response.status}), trying next...`);
          break; // Try next model
        }

        // Handle successful response
        if (response.status === 200) {
          let transcriptionText = null;
          
          if (response.data && response.data.text) {
            transcriptionText = response.data.text;
          } else if (typeof response.data === 'string') {
            transcriptionText = response.data;
          } else if (Array.isArray(response.data) && response.data[0]?.text) {
            transcriptionText = response.data[0].text;
          } else if (Array.isArray(response.data) && response.data[0]?.transcription) {
            transcriptionText = response.data[0].transcription;
          }
          
          if (transcriptionText && transcriptionText.trim().length > 0) {
            console.log(`✓ Transcription successful using ${tryModel}`);
            return { text: transcriptionText.trim() };
          }
        }

        // If we get here, response format was unexpected
        throw new Error(`Unexpected response format from ${tryModel}: ${JSON.stringify(response.data).substring(0, 100)}`);
        
      } catch (modelError) {
        lastError = modelError;
        
        // Handle specific error types
        const errorMessage = modelError.message || '';
        const isSocketError = errorMessage.includes('socket hang up') || 
                             errorMessage.includes('ECONNRESET') ||
                             errorMessage.includes('ETIMEDOUT') ||
                             errorMessage.includes('timeout');
        
        const isNetworkError = errorMessage.includes('ENOTFOUND') ||
                              errorMessage.includes('ECONNREFUSED');
        
        if (isSocketError || isNetworkError) {
          console.log(`Network error with ${tryModel}: ${errorMessage}`);
          if (attempt < maxRetries - 1) {
            // Wait before retry with exponential backoff
            const waitTime = Math.min(2000 * Math.pow(2, attempt), 10000);
            console.log(`Waiting ${waitTime}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue; // Retry same model
          } else {
            // Move to next model
            break;
          }
        } else if (modelError.response?.status === 410 || modelError.response?.status === 404) {
          console.log(`Model ${tryModel} not available, trying next...`);
          break; // Try next model
        } else if (modelError.response?.status === 503) {
          // Model loading - handled above, but just in case
          const estimatedTime = modelError.response?.data?.estimated_time || 20;
          const waitTime = Math.min(estimatedTime * 1000, 30000);
          console.log(`Model ${tryModel} is loading, waiting ${waitTime}ms...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue; // Retry same model
        } else {
          // Other error - log and try next model
          console.log(`Error with ${tryModel}: ${errorMessage.substring(0, 100)}`);
          break; // Try next model
        }
      }
    }
  }
  
  // If all models failed, provide helpful error message
  const errorMsg = lastError?.response?.data?.error || lastError?.message || 'Unknown error';
  console.error('All transcription models failed. Last error:', errorMsg);
  
  throw new Error(`Failed to transcribe audio after trying ${models.length} models. ${errorMsg}. Please check your internet connection and try again.`);
}

module.exports = { transcribeAudio };

