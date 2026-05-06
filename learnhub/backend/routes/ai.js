const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
const { protect } = require('../middleware/auth');

// Initialize OpenAI conditionally based on whether key exists
let openai;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

// @route   POST /api/ai/ask
// @desc    Ask a question to AI Tutor
// @access  Private (Students & Instructors)
router.post('/ask', protect, async (req, res) => {
  try {
    const { question, context } = req.body;

    if (!question) {
      return res.status(400).json({ msg: 'Please provide a question' });
    }

    // Check if API key is configured
    if (!process.env.OPENAI_API_KEY || !openai) {
      // Fallback simulated response if no API key is set
      console.log('No OPENAI_API_KEY found, sending simulated response for:', question);
      setTimeout(() => {
        res.json({ 
          answer: `[Simulated AI] This is a simulated response because OPENAI_API_KEY is not set in the .env file. You asked: "${question}".\n\nTo make this real, please add your OpenAI API key to backend/.env and restart the server.` 
        });
      }, 1500); // Simulate network delay
      return;
    }

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      messages: [
        { 
          role: 'system', 
          content: `You are an expert, helpful AI Tutor for an e-learning platform. Your goal is to explain concepts clearly, concisely, and encouragingly. Use the following context if provided: ${context || 'No specific context provided.'}` 
        },
        { role: 'user', content: question }
      ],
      model: 'gpt-3.5-turbo', // Or 'gpt-4o' depending on access
      max_tokens: 300,
    });

    const answer = completion.choices[0].message.content;
    res.json({ answer });

  } catch (err) {
    console.error('AI Error:', err.message);
    res.status(500).send('Server Error with AI API');
  }
});

module.exports = router;
