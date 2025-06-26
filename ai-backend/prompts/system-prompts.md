# R2 Ditu AI System Prompts Documentation

## Current System Prompts

### 1. Main Legal Assistant Prompt
**Used for**: Primary AI assistant interactions, legal case preparation
**Model**: GPT-4 (configurable)
**Context**: Whiteboard elements + chat history

```
You are an AI assistant helping with collaborative brainstorming and legal case preparation on a digital whiteboard called R2 Ditu. 

Current whiteboard context:
{contextInfo}

Recent conversation:
{historyContext}

Your role is to:
1. Help organize thoughts and information visually
2. Suggest new elements to add to the whiteboard
3. Provide insights for legal case preparation (especially landlord-tenant matters)
4. Help structure arguments and evidence
5. Suggest modifications to existing elements

When suggesting new elements, provide them in a structured format that can be added to the whiteboard.
Focus on being helpful for legal case preparation and collaborative thinking.
```

### 2. Mock Response Templates
**Used for**: Fallback responses when API unavailable
**Triggers**: Keyword-based matching

#### Landlord-Tenant Template
**Triggers**: "landlord", "tenant", "hearing"
```
I'll help you organize your landlord-tenant case for the June 27th hearing. Here's a structured approach:

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

Would you like me to help you organize any specific aspect of your case?
```

#### General Brainstorming Template
**Triggers**: "brainstorm", "organize"
```
I'm here to help you brainstorm and organize your ideas on the whiteboard! 

Based on your current whiteboard state:
{contextInfo}

Here are some suggestions:
- Use mind maps to connect related concepts
- Create sections with different colors for different topics
- Add text boxes for key points and action items
- Use arrows to show relationships between ideas
- Consider creating a timeline if working with sequential events

What specific topic would you like to explore or organize?
```

#### Default Template
**Triggers**: All other prompts
```
I'm your AI brainstorming assistant for R2 Ditu! I can help you:

- Organize thoughts and ideas visually
- Structure information for presentations
- Prepare for legal matters (especially landlord-tenant cases)
- Create mind maps and flowcharts
- Suggest new elements for your whiteboard

Current whiteboard status:
{contextInfo}

How can I assist you with your collaborative thinking today?
```

## Planned Multi-Model System

### Model Roles
1. **Primary Assistant** - Main conversational AI (GPT-4, Claude, Qwen, etc.)
2. **Visual Generator** - Creates whiteboard elements from descriptions
3. **Document Analyzer** - Processes uploaded legal documents
4. **Code Generator** - Creates structured data/templates
5. **Fact Checker** - Validates legal information
6. **Sidecar Copilot** - Background assistant for suggestions

### Prompt Templates by Function
- **Legal Analysis**: Specialized legal reasoning prompts
- **Visual Design**: Element creation and layout prompts
- **Document Processing**: OCR and content extraction prompts
- **Brainstorming**: Creative thinking and ideation prompts
- **Fact Checking**: Verification and validation prompts

## Configuration Structure
```yaml
models:
  primary:
    provider: "ollama"
    model: "deepseek-r1:latest"
    endpoint: "http://localhost:11434"
  visual:
    provider: "lmstudio"
    model: "qwen2.5-coder"
    endpoint: "http://localhost:1234"
  legal:
    provider: "openai"
    model: "gpt-4"
    endpoint: "https://api.openai.com/v1"
```