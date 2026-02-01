const axios = require('axios');

// Use Hugging Face Inference API for language analysis (completely free)
async function analyzeLanguage(transcription, round, userTopic) {
  try {
    const apiKey = process.env.HUGGINGFACE_API_KEY;
    
    // Using free text generation models from Hugging Face
    // Using models that are reliably available on free tier
    const models = [
      'mistralai/Mistral-7B-Instruct-v0.2',  // Best quality if available
      'google/flan-t5-base'  // Reliable fallback
    ];
    let apiUrl = `https://api-inference.huggingface.co/models/${models[0]}`;

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

    const payload = {
      inputs: `<s>[INST] You are a language assessment expert. Always respond with valid JSON only, no additional text. ${prompt} [/INST]`,
      parameters: {
        max_new_tokens: 2000,
        temperature: 0.3,
        return_full_text: false
      }
    };

    let response;
    try {
      response = await axios.post(apiUrl, payload, {
        headers: headers,
        timeout: 60000
      });
    } catch (firstError) {
      // If first model fails and it's a 503 or 429, try fallback model
      if ((firstError.response?.status === 503 || firstError.response?.status === 429) && models.length > 1) {
        console.log(`Model ${models[0]} unavailable, trying fallback model ${models[1]}`);
        apiUrl = `https://api-inference.huggingface.co/models/${models[1]}`;
        // Adjust prompt format for Flan-T5
        payload.inputs = prompt;
        response = await axios.post(apiUrl, payload, {
          headers: headers,
          timeout: 60000
        });
      } else {
        throw firstError;
      }
    }

    let content = '';
    if (Array.isArray(response.data) && response.data[0]?.generated_text) {
      content = response.data[0].generated_text.trim();
    } else if (response.data?.generated_text) {
      content = response.data.generated_text.trim();
    } else if (typeof response.data === 'string') {
      content = response.data.trim();
    } else {
      throw new Error('Unexpected response format from Hugging Face API');
    }
    
    // Try to extract JSON from the response
    let analysis;
    try {
      // Remove markdown code blocks if present
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        analysis = JSON.parse(content);
      }
    } catch (parseError) {
      console.error('Failed to parse JSON:', content);
      // Fallback analysis
      analysis = createFallbackAnalysis(transcription);
    }

    return analysis;
  } catch (error) {
    console.error('Analysis error:', error.response?.data || error.message);
    
    // If model is loading, use fallback immediately (faster than waiting)
    if (error.response?.status === 503) {
      console.log('Model is loading, using fallback analysis');
      return createFallbackAnalysis(transcription);
    }
    
    // Return fallback analysis if API fails
    return createFallbackAnalysis(transcription);
  }
}

function createFallbackAnalysis(transcription) {
  const words = transcription.split(/\s+/).length;
  const fillers = (transcription.match(/\b(um|uh|like|you know|well|so)\b/gi) || []).length;
  
  return {
    fluency: { score: 70, comments: "Analysis unavailable - using basic metrics" },
    vocabulary: { score: 70, comments: "Basic vocabulary assessment", sophisticatedWords: [] },
    grammar: { score: 70, comments: "Basic grammar assessment", errors: [] },
    fillers: { count: fillers, list: [], pauseFrequency: fillers > 10 ? "high" : fillers > 5 ? "medium" : "low" },
    sentiment: { tone: "neutral", confidence: "medium", comments: "Unable to assess sentiment" },
    structure: { score: 60, hasIntroduction: false, hasBody: true, hasConclusion: false, comments: "Structure assessment unavailable" },
    confidenceMarkers: { positive: [], negative: [] },
    complexity: { cefrLevel: "B1", comments: "Estimated level based on word count" }
  };
}

module.exports = { analyzeLanguage };


