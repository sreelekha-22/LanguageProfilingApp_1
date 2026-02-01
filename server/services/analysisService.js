const axios = require('axios');

// Use Hugging Face Inference API for language analysis (completely free)
async function analyzeLanguage(transcription, round, userTopic) {
  try {
    const apiKey = process.env.HUGGINGFACE_API_KEY;
    
    // Reduced to 2 models to speed up fallback
    // All models require API key now - if you see 410 errors, add HUGGINGFACE_API_KEY to .env
    const models = [
      'mistralai/Mistral-7B-Instruct-v0.2',  // Best quality if available
      'google/flan-t5-base'  // Reliable fallback
    ];
    
    if (!apiKey) {
      console.log('⚠️ No HUGGINGFACE_API_KEY found - models may return 410 errors. Get free key at https://huggingface.co/settings/tokens');
    } else {
      console.log('✓ Using Hugging Face API key for analysis');
    }

    const prompt = `Analyze the following spoken language transcript and provide a comprehensive language profile. 
    
Transcript: "${transcription}"
Round: ${round}
${userTopic ? `User's chosen topic: ${userTopic}` : 'Impromptu topic'}

Please provide a detailed JSON analysis with the following metrics:

1. **Fluency & Coherence** (0-100): Rate how smoothly and logically the speech flows
2. **Vocabulary Richness** (0-100): Assess the variety and sophistication of words used
3. **Grammar Patterns** (0-100): Evaluate grammatical accuracy and complexity
4. **Fillers & Pauses**: Count and list common fillers (um, uh, like, etc.) and note pause frequency
5. **Sentiment/Tone**: Identify the overall emotional tone (positive, neutral, negative) and confidence level
6. **Structure**: Evaluate if the speech has a clear introduction, body, and conclusion (0-100)
7. **Confidence Markers**: Identify phrases that indicate confidence or uncertainty
8. **Complexity Level**: Assess the CEFR level (A1, A2, B1, B2, C1, C2) based on language complexity

Return ONLY a valid JSON object with this exact structure:
{
  "fluency": { "score": 0-100, "comments": "string" },
  "vocabulary": { "score": 0-100, "comments": "string", "sophisticatedWords": ["word1", "word2"] },
  "grammar": { "score": 0-100, "comments": "string", "errors": ["error1", "error2"] },
  "fillers": { "count": 0, "list": ["filler1"], "pauseFrequency": "low/medium/high" },
  "sentiment": { "tone": "positive/neutral/negative", "confidence": "low/medium/high", "comments": "string" },
  "structure": { "score": 0-100, "hasIntroduction": true/false, "hasBody": true/false, "hasConclusion": true/false, "comments": "string" },
  "confidenceMarkers": { "positive": ["marker1"], "negative": ["marker2"] },
  "complexity": { "cefrLevel": "A1/A2/B1/B2/C1/C2", "comments": "string" }
}`;

    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    let response;
    let lastError;
    let analysis = null;
    
    // Try each model with retries
    for (let modelIndex = 0; modelIndex < models.length; modelIndex++) {
      const tryModel = models[modelIndex];
      const apiUrl = `https://api-inference.huggingface.co/models/${tryModel}`;
      const maxRetries = 1; // Reduced from 2 to fail faster
      
      // Determine prompt format based on model
      let formattedPrompt = prompt;
      if (tryModel.includes('mistral') || tryModel.includes('Mixtral')) {
        formattedPrompt = `<s>[INST] You are a language assessment expert. Always respond with valid JSON only, no additional text. ${prompt} [/INST]`;
      } else if (tryModel.includes('flan')) {
        formattedPrompt = `Task: Analyze language transcript. ${prompt}`;
      }
      
      const payload = {
        inputs: formattedPrompt,
        parameters: {
          max_new_tokens: 2000,
          temperature: 0.3,
          return_full_text: false
        }
      };
      
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          console.log(`Trying analysis model: ${tryModel} (attempt ${attempt + 1}/${maxRetries})`);
          
          response = await axios.post(apiUrl, payload, {
            headers: headers,
            timeout: 90000, // 90 seconds
            validateStatus: function (status) {
              return status < 500; // Don't throw on 4xx errors
            }
          });
          
          // Handle 503 (model loading)
          if (response.status === 503) {
            const estimatedTime = response.data?.estimated_time || 20;
            const waitTime = Math.min(estimatedTime * 1000, 30000);
            console.log(`Model ${tryModel} is loading, waiting ${waitTime}ms...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue; // Retry same model
          }
          
          // Handle 410/404 (model not available) - skip immediately
          if (response.status === 410 || response.status === 404) {
            console.log(`Model ${tryModel} not available (${response.status})${!apiKey ? ' - API key may be required' : ''}, trying next...`);
            break; // Try next model immediately
          }
          
          // Handle successful response
          if (response.status === 200) {
            let content = '';
            if (Array.isArray(response.data) && response.data[0]?.generated_text) {
              content = response.data[0].generated_text.trim();
            } else if (response.data?.generated_text) {
              content = response.data.generated_text.trim();
            } else if (typeof response.data === 'string') {
              content = response.data.trim();
            }
            
            if (content) {
              // Try to extract JSON from the response
              try {
                const jsonMatch = content.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                  analysis = JSON.parse(jsonMatch[0]);
                  console.log(`✓ Analysis successful using ${tryModel}`);
                  return analysis;
                } else {
                  analysis = JSON.parse(content);
                  console.log(`✓ Analysis successful using ${tryModel}`);
                  return analysis;
                }
              } catch (parseError) {
                console.log(`Failed to parse JSON from ${tryModel}, trying next model...`);
                break; // Try next model
              }
            }
          }
          
        } catch (modelError) {
          lastError = modelError;
          const errorMessage = modelError.message || '';
          const isSocketError = errorMessage.includes('socket hang up') || 
                               errorMessage.includes('ECONNRESET') ||
                               errorMessage.includes('ETIMEDOUT') ||
                               errorMessage.includes('timeout');
          
          if (isSocketError) {
            console.log(`Network error with ${tryModel}: ${errorMessage}`);
            if (attempt < maxRetries - 1) {
              const waitTime = Math.min(2000 * Math.pow(2, attempt), 10000);
              console.log(`Waiting ${waitTime}ms before retry...`);
              await new Promise(resolve => setTimeout(resolve, waitTime));
              continue; // Retry same model
            } else {
              break; // Move to next model
            }
          } else if (modelError.response?.status === 410 || modelError.response?.status === 404) {
            console.log(`Model ${tryModel} not available (${modelError.response?.status})${!apiKey ? ' - API key may be required' : ''}, trying next...`);
            break; // Try next model immediately
          } else if (modelError.response?.status === 503) {
            const estimatedTime = modelError.response?.data?.estimated_time || 20;
            const waitTime = Math.min(estimatedTime * 1000, 30000);
            console.log(`Model ${tryModel} is loading, waiting ${waitTime}ms...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue; // Retry same model
          } else {
            console.log(`Error with ${tryModel}: ${errorMessage.substring(0, 100)}`);
            break; // Try next model
          }
        }
      }
    }
    
    // If all models failed, use fallback
    if (!analysis) {
      console.log('⚠️ All analysis models failed, using fallback analysis');
      return createFallbackAnalysis(transcription);
    }

    // This code should not be reached, but just in case
    return createFallbackAnalysis(transcription);
  } catch (error) {
    console.error('Analysis error:', error.response?.data || error.message);
    return createFallbackAnalysis(transcription);
  }
}

function createFallbackAnalysis(transcription) {
  // Skip if transcription is a fallback message
  if (transcription.includes('[Transcription unavailable') || transcription.includes('Transcription failed')) {
    return {
      fluency: { score: 0, comments: "Analysis unavailable - transcription service failed" },
      vocabulary: { score: 0, comments: "Analysis unavailable - transcription service failed", sophisticatedWords: [] },
      grammar: { score: 0, comments: "Analysis unavailable - transcription service failed", errors: [] },
      fillers: { count: 0, list: [], pauseFrequency: "unknown" },
      sentiment: { tone: "neutral", confidence: "unknown", comments: "Analysis unavailable - transcription service failed" },
      structure: { score: 0, hasIntroduction: false, hasBody: false, hasConclusion: false, comments: "Analysis unavailable - transcription service failed" },
      confidenceMarkers: { positive: [], negative: [] },
      complexity: { cefrLevel: "N/A", comments: "Analysis unavailable - transcription service failed" }
    };
  }
  
  // Basic analysis based on transcription text
  const words = transcription.split(/\s+/).filter(w => w.length > 0).length;
  const sentences = transcription.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  const fillers = (transcription.match(/\b(um|uh|like|you know|well|so|er|ah)\b/gi) || []).length;
  const avgWordsPerSentence = sentences > 0 ? words / sentences : 0;
  
  // Estimate scores based on basic metrics
  const fluencyScore = Math.min(100, Math.max(40, 70 - (fillers * 2)));
  const vocabularyScore = avgWordsPerSentence > 15 ? 75 : avgWordsPerSentence > 10 ? 65 : 55;
  const grammarScore = words > 50 ? 70 : 60;
  const structureScore = sentences >= 3 ? 65 : 50;
  
  // Estimate CEFR level
  let cefrLevel = "B1";
  if (avgWordsPerSentence > 20 && words > 100) cefrLevel = "B2";
  else if (avgWordsPerSentence > 15 && words > 80) cefrLevel = "B1";
  else if (words > 50) cefrLevel = "A2";
  else cefrLevel = "A1";
  
  return {
    fluency: { score: fluencyScore, comments: `Basic analysis: ${words} words, ${sentences} sentences. Fillers detected: ${fillers}` },
    vocabulary: { score: vocabularyScore, comments: `Basic vocabulary assessment based on average ${avgWordsPerSentence.toFixed(1)} words per sentence`, sophisticatedWords: [] },
    grammar: { score: grammarScore, comments: "Basic grammar assessment - detailed analysis unavailable", errors: [] },
    fillers: { count: fillers, list: [], pauseFrequency: fillers > 10 ? "high" : fillers > 5 ? "medium" : "low" },
    sentiment: { tone: "neutral", confidence: "medium", comments: "Sentiment analysis unavailable - using default values" },
    structure: { score: structureScore, hasIntroduction: sentences >= 3, hasBody: sentences >= 2, hasConclusion: sentences >= 3, comments: "Structure assessment based on sentence count" },
    confidenceMarkers: { positive: [], negative: [] },
    complexity: { cefrLevel: cefrLevel, comments: `Estimated level based on ${words} words and ${avgWordsPerSentence.toFixed(1)} words per sentence` }
  };
}

module.exports = { analyzeLanguage };


