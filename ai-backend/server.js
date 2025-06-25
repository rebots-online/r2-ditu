const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const WebSocket = require('ws');
const http = require('http');
require('dotenv').config();

// Import new multi-model system
const ModelAdapter = require('./lib/model-adapter');
const MCPClient = require('./lib/mcp-client');
const { AgentOrchestrator } = require('./lib/agent-orchestrator');

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 3015;

// Initialize multi-model system
const modelAdapter = new ModelAdapter();
const mcpClient = new MCPClient({ 
  wsUrl: 'ws://localhost:12000/ws',
  modelAdapter 
});
const orchestrator = new AgentOrchestrator(modelAdapter, mcpClient);

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'R2 Ditu AI Backend',
    features: {
      multi_model: true,
      mcp_client: mcpClient.isConnected,
      orchestrator: true,
      local_models: true
    }
  });
});

// Main AI brainstorming endpoint - Enhanced with multi-model support
app.post('/v1/ai/llm-brainstorm', async (req, res) => {
  try {
    const { prompt, sceneElements = [], selectedElements = [], chatHistory = [], functionType = 'chat' } = req.body;

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

    // Create context object for multi-model system
    const context = {
      whiteboard: {
        elements: sceneElements,
        selected: selectedElements,
        summary: contextInfo
      },
      history: chatHistory,
      prompt: prompt
    };

    // Route request through multi-model system
    let aiResponse;
    try {
      const response = await modelAdapter.routeRequest(functionType, prompt, context);
      aiResponse = response.content;
      
      // Log model used for debugging
      console.log(`🤖 Response from ${response.model} (${response.provider})`);
      
    } catch (modelError) {
      console.warn('Multi-model system error, using fallback:', modelError.message);
      
      // Fallback to original OpenAI logic
      if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.length > 50) {
        try {
          const completion = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
              { role: "system", content: await modelAdapter.loadPromptTemplate(functionType, context) },
              { role: "user", content: prompt }
            ],
            max_tokens: 1000,
            temperature: 0.7,
          });
          aiResponse = completion.choices[0].message.content;
        } catch (apiError) {
          console.warn('OpenAI API also failed, using mock response:', apiError.message);
          aiResponse = generateMockResponse(prompt, contextInfo);
        }
      } else {
        console.log('Using mock response (no valid API keys)');
        aiResponse = generateMockResponse(prompt, contextInfo);
      }
    }

    // Parse AI response for whiteboard elements (if applicable)
    const parsedResponse = parseAIResponse(aiResponse, functionType);

    res.json({
      textResponse: aiResponse,
      newElements: parsedResponse.newElements || [],
      modifiedElements: parsedResponse.modifiedElements || [],
      suggestions: parsedResponse.suggestions || [],
      functionType: functionType,
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

// New endpoint for task delegation to specialized agents
app.post('/v1/ai/delegate-task', async (req, res) => {
  try {
    const { task, data, context = {} } = req.body;

    if (!task) {
      return res.status(400).json({ error: 'Task type is required' });
    }

    const taskId = await orchestrator.delegateTask(task, data, context);
    
    res.json({
      taskId,
      task,
      status: 'delegated',
      message: `Task ${task} has been delegated to specialized agent`,
      success: true
    });

  } catch (error) {
    console.error('Task delegation error:', error);
    res.status(500).json({
      error: 'Failed to delegate task',
      details: error.message
    });
  }
});

// Endpoint for model health check
app.get('/v1/ai/models/health', async (req, res) => {
  try {
    const healthStatus = await modelAdapter.healthCheck();
    
    res.json({
      models: healthStatus,
      timestamp: new Date().toISOString(),
      success: true
    });

  } catch (error) {
    console.error('Model health check error:', error);
    res.status(500).json({
      error: 'Failed to check model health',
      details: error.message
    });
  }
});

// Endpoint to get available models and configuration
app.get('/v1/ai/models/config', (req, res) => {
  try {
    const config = {
      default_models: modelAdapter.config.default_models,
      routing: modelAdapter.config.routing,
      available_providers: Object.keys(modelAdapter.config.models).reduce((acc, modelId) => {
        const model = modelAdapter.config.models[modelId];
        if (!acc[model.provider]) acc[model.provider] = [];
        acc[model.provider].push({
          id: modelId,
          model: model.model,
          endpoint: model.endpoint
        });
        return acc;
      }, {}),
      orchestration: modelAdapter.config.orchestration
    };

    res.json({
      config,
      success: true
    });

  } catch (error) {
    console.error('Config retrieval error:', error);
    res.status(500).json({
      error: 'Failed to retrieve configuration',
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

// Helper function to parse AI response for whiteboard elements
function parseAIResponse(response, functionType) {
  const result = {
    newElements: [],
    modifiedElements: [],
    suggestions: []
  };

  try {
    // Look for JSON blocks in the response
    const jsonMatches = response.match(/```json\n([\s\S]*?)\n```/g);
    
    if (jsonMatches) {
      jsonMatches.forEach(match => {
        try {
          const jsonStr = match.replace(/```json\n/, '').replace(/\n```/, '');
          const parsed = JSON.parse(jsonStr);
          
          if (parsed.elements) {
            result.newElements.push(...parsed.elements);
          }
          if (parsed.suggestions) {
            result.suggestions.push(...parsed.suggestions);
          }
        } catch (parseError) {
          console.warn('Failed to parse JSON from AI response:', parseError.message);
        }
      });
    }

    // Extract suggestions from text
    const suggestionPatterns = [
      /I suggest (.*?)(?:\.|$)/gi,
      /Consider (.*?)(?:\.|$)/gi,
      /You might want to (.*?)(?:\.|$)/gi,
      /Try (.*?)(?:\.|$)/gi
    ];

    suggestionPatterns.forEach(pattern => {
      const matches = response.match(pattern);
      if (matches) {
        matches.forEach(match => {
          result.suggestions.push({
            type: 'text_suggestion',
            content: match.trim()
          });
        });
      }
    });

  } catch (error) {
    console.warn('Error parsing AI response:', error.message);
  }

  return result;
}

// Initialize MCP client connection
async function initializeMCPClient() {
  try {
    // Set up event handlers first
    mcpClient.on('connected', () => {
      console.log('🔗 AI collaborator joined the whiteboard session');
    });
    
    mcpClient.on('disconnected', () => {
      console.log('🔌 AI collaborator disconnected from whiteboard');
    });
    
    mcpClient.on('whiteboard_updated', (state) => {
      console.log('📝 Whiteboard state updated, AI analyzing changes...');
    });
    
    // Attempt connection (non-blocking)
    mcpClient.connect().catch(error => {
      console.warn('⚠️  MCP Client connection failed:', error.message);
      console.log('🔄 AI will operate in API-only mode');
    });
    
  } catch (error) {
    console.warn('⚠️  MCP Client initialization failed:', error.message);
    console.log('🔄 AI will operate in API-only mode');
  }
}

// Start server and initialize systems
server.listen(port, '0.0.0.0', async () => {
  console.log(`🚀 R2 Ditu AI Backend running on port ${port}`);
  console.log(`📊 Health check: http://localhost:${port}/health`);
  console.log(`🤖 AI endpoint: http://localhost:${port}/v1/ai/llm-brainstorm`);
  console.log(`🎯 Task delegation: http://localhost:${port}/v1/ai/delegate-task`);
  console.log(`🏥 Model health: http://localhost:${port}/v1/ai/models/health`);
  console.log(`⚙️  Model config: http://localhost:${port}/v1/ai/models/config`);
  
  // Initialize MCP client for real-time collaboration
  await initializeMCPClient();
  
  console.log('\n🎉 Multi-Model AI System Ready!');
  console.log('📋 Supported features:');
  console.log('   • Local models (Ollama, LM Studio)');
  console.log('   • Cloud models (OpenAI, Anthropic, Google, XAI)');
  console.log('   • Multi-agent orchestration');
  console.log('   • Real-time whiteboard collaboration');
  console.log('   • Specialized task delegation');
  console.log('   • Wireframe to code conversion');
  console.log('   • Presentation animation');
  console.log('   • Legal document analysis');
});