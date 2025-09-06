const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
// app.use(express.static(path.join(__dirname, 'build'))); // Commented out for development

// Groq API integration (FREE with great limits!)
const convertCode = async (code, fromLanguage, toLanguage) => {
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  
  if (!GROQ_API_KEY) {
    throw new Error('Groq API key not configured. Get free key at: https://console.groq.com/');
  }

  const prompt = `Convert the following ${fromLanguage} code to ${toLanguage}. 
Only return the converted code without explanations or formatting markers:

${code}`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile', // Current active model
        messages: [
          {
            role: 'system',
            content: 'You are a code conversion expert. Convert code between programming languages accurately and return only the converted code without explanations.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1024,
        temperature: 0.1
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Groq API error');
    }

    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Groq API error:', error);
    throw error;
  }
};

// API Routes
app.post('/api/convert', async (req, res) => {
  try {
    const { code, fromLanguage, toLanguage } = req.body;

    if (!code || !fromLanguage || !toLanguage) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: code, fromLanguage, toLanguage'
      });
    }

    if (fromLanguage === toLanguage) {
      return res.json({
        success: true,
        convertedCode: code
      });
    }

    const convertedCode = await convertCode(code, fromLanguage, toLanguage);
    
    res.json({
      success: true,
      convertedCode: convertedCode
    });
    
  } catch (error) {
    console.error('Conversion error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to convert code'
    });
  }
});

// Chat endpoint for AI assistant
app.post('/api/chat', async (req, res) => {
  try {
    const { message, currentCode, currentLanguage, targetLanguage, chatHistory } = req.body;
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    
    if (!GROQ_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'Groq API key not configured'
      });
    }

    // Create context-aware prompt
    const systemPrompt = `You are a helpful coding assistant specialized in code conversion and programming help. 
    
Current context:
- User's current code language: ${currentLanguage}
- Target conversion language: ${targetLanguage}
- Current code: ${currentCode ? currentCode.substring(0, 500) + '...' : 'No code provided'}

You can help with:
1. Explaining code concepts
2. Suggesting code improvements
3. Helping with conversion issues
4. Answering programming questions
5. Code optimization tips
6. Debugging help

Keep responses concise but helpful.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          ...chatHistory.slice(-3).map(msg => ({
            role: msg.type === 'user' ? 'user' : 'assistant',
            content: msg.content
          })),
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 512,
        temperature: 0.7
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Groq API error');
    }

    res.json({
      success: true,
      response: data.choices[0].message.content.trim()
    });
    
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to process chat message'
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve React app for all other routes (commented out for development)
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'build', 'index.html'));
// });

app.listen(PORT, () => {
  console.log(`🚀 Code Converter IDE server running on port ${PORT}`);
  console.log(`📝 Make sure to set your GROQ_API_KEY in .env file`);
  console.log(`🆓 Get free Groq API key at: https://console.groq.com/`);
});
