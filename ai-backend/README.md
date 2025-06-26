# R2 Ditu Multi-Model AI Backend

## 🚀 Overview

R2 Ditu's AI backend is a sophisticated multi-model orchestration system that supports local and cloud-based AI models. The system enables AI to collaborate directly on the whiteboard like another human participant through MCP (Model Context Protocol) integration.

## 🎯 Key Features

### Multi-Model Support
- **Local Models**: Ollama, LM Studio
- **Cloud Models**: OpenAI, Anthropic, Google, XAI
- **Custom Endpoints**: Configurable API endpoints
- **Automatic Fallbacks**: Graceful degradation when models fail

### AI Collaboration Modes
- **API Mode**: Traditional request/response via REST API
- **MCP Mode**: Real-time collaboration via WebSocket
- **Agent Orchestration**: Specialized AI agents for different tasks
- **Sidecar Copilot**: Background AI assistant providing suggestions

### Specialized Agents
- **Primary Agent**: Main conversational AI
- **Coder Agent**: Wireframe to code conversion
- **Animator Agent**: Presentation animation
- **Designer Agent**: Visual layout creation
- **Analyst Agent**: Legal document analysis
- **Copilot Agent**: Background suggestions

## 🔧 Configuration

### Model Configuration (`config/models.yaml`)

```yaml
# Default model assignments
default_models:
  primary: "local_deepseek"      # Main conversational AI
  visual: "local_qwen"           # Visual element generation
  legal: "openai_gpt4"          # Legal analysis
  document: "local_devstral"     # Document processing
  copilot: "local_qwen_small"    # Background assistant

# Model definitions
models:
  local_deepseek:
    provider: "ollama"
    model: "deepseek-r1:latest"
    endpoint: "http://localhost:11434"
    temperature: 0.7
    max_tokens: 2000
```

### Environment Variables

```bash
# OpenAI (optional)
OPENAI_API_KEY=your_openai_key

# Anthropic (optional)
ANTHROPIC_API_KEY=your_anthropic_key

# Google (optional)
GOOGLE_API_KEY=your_google_key

# XAI (optional)
XAI_API_KEY=your_xai_key

# Server configuration
PORT=3015
```

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd ai-backend
npm install
```

### 2. Configure Models
Edit `config/models.yaml` to match your setup:

```yaml
# For Ollama users
default_models:
  primary: "local_deepseek"
  
models:
  local_deepseek:
    provider: "ollama"
    model: "deepseek-r1:latest"  # or your preferred model
    endpoint: "http://localhost:11434"
```

### 3. Start Local Models (if using)

**Ollama:**
```bash
# Install and start Ollama
ollama serve

# Pull models
ollama pull deepseek-r1:latest
ollama pull qwen2.5:latest
ollama pull codestral:latest
```

**LM Studio:**
```bash
# Start LM Studio server on port 1234
# Load your preferred model
```

### 4. Start the Backend
```bash
npm start
```

## 📡 API Endpoints

### Main AI Chat
```http
POST /v1/ai/llm-brainstorm
Content-Type: application/json

{
  "prompt": "Help me organize a landlord-tenant case",
  "sceneElements": [...],
  "selectedElements": [...],
  "chatHistory": [...],
  "functionType": "legal"  // chat, legal, visual, document, code
}
```

### Task Delegation
```http
POST /v1/ai/delegate-task
Content-Type: application/json

{
  "task": "wireframe_to_code",
  "data": {
    "elements": [...],
    "framework": "react",
    "style": "tailwind"
  },
  "context": {...}
}
```

### Model Health Check
```http
GET /v1/ai/models/health
```

### Model Configuration
```http
GET /v1/ai/models/config
```

## 🤖 MCP Integration

The AI connects to the whiteboard as a collaborative participant:

```javascript
// AI joins whiteboard session
{
  type: 'ai_join',
  aiId: 'ai-collaborator-primary',
  capabilities: [
    'code_generation',
    'wireframe_to_code',
    'presentation_animation',
    'legal_analysis'
  ]
}

// AI creates elements directly
{
  type: 'create_element',
  element: {
    type: 'code_block',
    content: 'generated code...',
    x: 100, y: 100
  },
  source: 'ai_coder'
}
```

## 🎨 Specialized Tasks

### Wireframe to Code
```javascript
// Request
{
  "task": "wireframe_to_code",
  "data": {
    "elements": [/* wireframe elements */],
    "framework": "react",
    "style": "tailwind"
  }
}

// AI generates production-ready code
// Creates code block on whiteboard
// Returns structured response
```

### Presentation Animation
```javascript
// Request
{
  "task": "animate_presentation",
  "data": {
    "slides": [/* slide elements */],
    "transitions": ["fade", "slide"],
    "duration": 3000
  }
}

// AI creates animation timeline
// Applies transitions to elements
// Returns animation sequence
```

### Legal Analysis
```javascript
// Request
{
  "task": "analyze_legal_document",
  "data": {
    "document": "lease agreement text...",
    "case_type": "landlord_tenant"
  }
}

// AI provides legal analysis
// Identifies key issues
// Suggests evidence organization
```

## 🔄 Agent Orchestration

### Primary Agent Delegation
The primary agent automatically delegates specialized tasks:

```javascript
// User: "Convert this wireframe to React code"
// Primary agent detects code generation request
// Delegates to Coder agent
// Returns: "I've delegated this to our code specialist"
```

### Inter-Agent Collaboration
```javascript
// Coder agent requests design input
await this.requestCollaboration('designer', 'optimize_layout', {
  elements: wireframeElements
});

// Designer agent provides layout suggestions
// Coder agent incorporates suggestions into code
```

## 📋 Prompt Templates

### Legal Analysis (`prompts/legal-analysis.txt`)
Specialized for landlord-tenant law, case preparation, evidence analysis.

### Visual Generation (`prompts/visual-generation.txt`)
Creates whiteboard elements, layouts, color schemes.

### Code Generation (`prompts/code-generation.txt`)
Converts designs to production code with best practices.

### Copilot Suggestions (`prompts/copilot-suggestions.txt`)
Background assistance, workflow optimization.

## 🔧 Customization

### Adding New Models
1. Add model configuration to `config/models.yaml`
2. Update routing rules
3. Test with health check endpoint

### Creating Custom Agents
```javascript
class CustomAgent extends BaseAgent {
  async executeTask(task) {
    // Custom task logic
    const response = await this.modelAdapter.routeRequest(
      'custom_function', 
      task.data.prompt, 
      task.context
    );
    return response;
  }
}
```

### Custom Prompt Templates
1. Create template file in `prompts/`
2. Add to `prompt_templates` in config
3. Use placeholders: `{contextInfo}`, `{historyContext}`

## 🚨 Troubleshooting

### Model Connection Issues
```bash
# Check Ollama
curl http://localhost:11434/api/tags

# Check LM Studio
curl http://localhost:1234/v1/models

# Check backend health
curl http://localhost:3015/v1/ai/models/health
```

### Common Issues
- **"Model not found"**: Check model name in config
- **"Connection refused"**: Verify endpoint URLs
- **"API key invalid"**: Check environment variables
- **"MCP connection failed"**: Whiteboard WebSocket not available

## 📊 Performance

### Optimization Tips
- Use local models for speed
- Configure appropriate timeouts
- Enable parallel processing
- Use model-specific routing

### Monitoring
- Health check endpoint shows model status
- Console logs show model selection
- Response times tracked per model

## 🔐 Security

### API Keys
- Store in environment variables
- Use different keys for different environments
- Rotate keys regularly

### Local Models
- No external API calls
- Data stays on your machine
- Full privacy control

## 🎯 Legal Use Case

Perfect for landlord-tenant hearing preparation:

1. **Case Organization**: AI helps structure facts and evidence
2. **Document Analysis**: Processes lease agreements and communications
3. **Timeline Creation**: Organizes events chronologically
4. **Argument Structure**: Helps build legal arguments
5. **Evidence Mapping**: Connects evidence to legal issues

## 🚀 Future Enhancements

- Voice integration for hands-free operation
- Document OCR and analysis
- Real-time collaboration with multiple AIs
- Custom model fine-tuning
- Advanced visualization generation
- Integration with legal databases

---

**Ready to revolutionize collaborative AI whiteboarding!** 🎨🤖