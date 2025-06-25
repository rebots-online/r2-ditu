const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3015;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'R2 Ditu AI Backend' });
});

// Main AI brainstorming endpoint
app.post('/v1/ai/llm-brainstorm', async (req, res) => {
  try {
    const { prompt, sceneElements = [], selectedElements = [], chatHistory = [] } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Build context from whiteboard elements
    const contextInfo = buildWhiteboardContext(sceneElements, selectedElements);
    
    // Build chat history context
    const historyContext = chatHistory
      .slice(-5) // Last 5 messages for context
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n');

    // Create system prompt for legal/brainstorming context
    const systemPrompt = `You are an AI assistant helping with collaborative brainstorming and legal case preparation on a digital whiteboard called R2 Ditu. 

Current whiteboard context:
${contextInfo}

Recent conversation:
${historyContext}

Your role is to:
1. Help organize thoughts and information visually
2. Suggest new elements to add to the whiteboard
3. Provide insights for legal case preparation (especially landlord-tenant matters)
4. Help structure arguments and evidence
5. Suggest modifications to existing elements

When suggesting new elements, provide them in a structured format that can be added to the whiteboard.
Focus on being helpful for legal case preparation and collaborative thinking.`;

    // Call OpenAI API (with fallback for testing)
    let aiResponse;
    
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.length > 50) {
      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-4",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt }
          ],
          max_tokens: 1000,
          temperature: 0.7,
        });
        aiResponse = completion.choices[0].message.content;
      } catch (apiError) {
        console.warn('OpenAI API error, using mock response:', apiError.message);
        aiResponse = generateMockResponse(prompt, contextInfo);
      }
    } else {
      console.log('Using mock response (no valid OpenAI API key)');
      aiResponse = generateMockResponse(prompt, contextInfo);
    }

    // For now, return text response
    // TODO: Parse AI response to extract suggested whiteboard elements
    res.json({
      textResponse: aiResponse,
      newElements: [], // TODO: Parse AI suggestions into whiteboard elements
      modifiedElements: [], // TODO: Parse AI modifications to existing elements
      success: true
    });

  } catch (error) {
    console.error('AI API Error:', error);
    res.status(500).json({ 
      error: 'Failed to process AI request',
      details: error.message 
    });
  }
});

// Mock response generator for testing
function generateMockResponse(prompt, contextInfo) {
  const lowerPrompt = prompt.toLowerCase();
  
  if (lowerPrompt.includes('landlord') || lowerPrompt.includes('tenant') || lowerPrompt.includes('hearing')) {
    return `I'll help you organize your landlord-tenant case for the June 27th hearing. Here's a structured approach:

**Case Organization:**
1. **Timeline of Events** - Create a chronological sequence of key incidents
2. **Evidence Collection** - Photos, documents, communications
3. **Legal Issues** - Identify specific violations or disputes
4. **Witness Information** - Contact details and testimony summaries
5. **Financial Records** - Rent payments, damages, costs

**Preparation Steps:**
- Document all communications with landlord/tenant
- Gather photographic evidence of any property issues
- Prepare a clear statement of facts
- Review relevant local housing laws
- Organize supporting documents chronologically

**Whiteboard Suggestions:**
- Create sections for "Facts", "Evidence", "Legal Arguments", and "Questions"
- Use different colors for different types of information
- Add sticky notes for key points to remember during the hearing

Would you like me to help you organize any specific aspect of your case?`;
  }
  
  if (lowerPrompt.includes('brainstorm') || lowerPrompt.includes('organize')) {
    return `I'm here to help you brainstorm and organize your ideas on the whiteboard! 

Based on your current whiteboard state:
${contextInfo}

Here are some suggestions:
- Use mind maps to connect related concepts
- Create sections with different colors for different topics
- Add text boxes for key points and action items
- Use arrows to show relationships between ideas
- Consider creating a timeline if working with sequential events

What specific topic would you like to explore or organize?`;
  }
  
  return `I'm your AI brainstorming assistant for R2 Ditu! I can help you:

- Organize thoughts and ideas visually
- Structure information for presentations
- Prepare for legal matters (especially landlord-tenant cases)
- Create mind maps and flowcharts
- Suggest new elements for your whiteboard

Current whiteboard status:
${contextInfo}

How can I assist you with your collaborative thinking today?`;
}

// Helper function to build context from whiteboard elements
function buildWhiteboardContext(sceneElements, selectedElements) {
  let context = '';
  
  if (sceneElements.length === 0) {
    context += 'The whiteboard is currently empty.\n';
  } else {
    context += `The whiteboard contains ${sceneElements.length} elements:\n`;
    
    // Summarize element types
    const elementTypes = {};
    sceneElements.forEach(el => {
      elementTypes[el.type] = (elementTypes[el.type] || 0) + 1;
    });
    
    Object.entries(elementTypes).forEach(([type, count]) => {
      context += `- ${count} ${type}${count > 1 ? 's' : ''}\n`;
    });
  }
  
  if (selectedElements.length > 0) {
    context += `\nCurrently selected: ${selectedElements.length} element(s)\n`;
    selectedElements.forEach(el => {
      if (el.type === 'text' && el.text) {
        context += `- Text: "${el.text}"\n`;
      } else {
        context += `- ${el.type}\n`;
      }
    });
  }
  
  return context;
}

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 R2 Ditu AI Backend running on port ${port}`);
  console.log(`🔗 Health check: http://localhost:${port}/health`);
  console.log(`🤖 AI endpoint: http://localhost:${port}/v1/ai/llm-brainstorm`);
});