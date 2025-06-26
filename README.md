# R2 Ditu

<!-- TODO: Add your logo/banner image here -->
<!-- ![R2 Ditu Banner](./public/banner.png) -->

<div align="center">

<!-- TODO: Update navigation links for your project -->
#### [Live App](#) | [Documentation](#) | [Blog](#)

## An open source virtual hand-drawn style whiteboard.<br/>Collaborative and end-to-end encrypted.

</div>

<div align="center">

<!-- TODO: Update badges with your project information -->
[![License](https://img.shields.io/badge/license-TBD-blue.svg)](./LICENSE)
[![PRs welcome!](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat)](#contributing)
<!-- Add your own badges here -->

</div>

<div align="center">

<!-- TODO: Add your product showcase image -->
<!-- ![Product showcase](./public/screenshots/showcase.png) -->

*Create beautiful hand-drawn like diagrams, wireframes, or whatever you like.*

</div>

## Features

The R2 Ditu editor supports:

- 💯&nbsp;Free & open-source.
- 🎨&nbsp;Infinite, canvas-based whiteboard.
- ✍️&nbsp;Hand-drawn like style.
- 🌓&nbsp;Dark mode.
- 🏗️&nbsp;Customizable.
- 📷&nbsp;Image support.
- 😀&nbsp;Shape libraries support.
- 🌐&nbsp;Localization (i18n) support.
- 🖼️&nbsp;Export to PNG, SVG & clipboard.
- 💾&nbsp;Open format - export drawings as an `.excalidraw` json file.
- ⚒️&nbsp;Wide range of tools - rectangle, circle, diamond, arrow, line, free-draw, eraser...
- ➡️&nbsp;Arrow-binding & labeled arrows.
- 🔙&nbsp;Undo / Redo.
- 🔍&nbsp;Zoom and panning support.
- 🤖&nbsp;**Multi-Model AI System** - Local & cloud AI collaboration.
- 🎯&nbsp;**Specialized AI Agents** - Code, design, legal, animation experts.
- 🔗&nbsp;**Real-time AI Collaboration** - AI as whiteboard participant.
- ⚖️&nbsp;**Legal Case Preparation** - Landlord-tenant hearing assistance.
- 💻&nbsp;**Wireframe to Code** - Convert designs to production code.
- 🎬&nbsp;**Presentation Animation** - Automated slide transitions.
- 🎨&nbsp;**AI Design Assistant** - Layout optimization and styling.

## R2 Ditu App

<!-- TODO: Update with your hosted app URL -->
The hosted R2 Ditu app showcases the full capabilities of the whiteboard editor. The app's [source code](./excalidraw-app) is part of this repository and features:

- 📡&nbsp;PWA support (works offline).
- 🤼&nbsp;Real-time collaboration.
- 🔒&nbsp;End-to-end encryption.
- 💾&nbsp;Local-first support (autosaves to the browser).
- 🔗&nbsp;Shareable links (export to a readonly link you can share with others).

We'll be adding these features as drop-in plugins for the npm package in the future.

### 🤖 Advanced AI Collaboration System

R2 Ditu features a sophisticated multi-model AI system that transforms your whiteboard into an intelligent collaborative workspace. The AI can participate as a team member, providing specialized assistance across different domains.

#### Multi-Model Support
- **Local Models**: Ollama (DeepSeek R1, Qwen, Codestral), LM Studio
- **Cloud Models**: OpenAI GPT-4, Anthropic Claude, Google Gemini, XAI Grok
- **Automatic Routing**: Different AI models for different tasks (legal, visual, coding)
- **Graceful Fallbacks**: Seamless switching when models are unavailable

#### AI Collaboration Modes

**🎯 API Mode** - Traditional request/response interaction
- Chat with AI about your whiteboard content
- Get suggestions and improvements
- Generate new elements based on descriptions

**🔗 MCP Mode** - Real-time collaborative AI participant
- AI joins your whiteboard session like another human
- Creates and modifies elements in real-time
- Provides contextual suggestions as you work

**🤝 Multi-Agent Orchestration** - Specialized AI agents for different tasks
- **Primary Agent**: Main conversational AI for general assistance
- **Coder Agent**: Converts wireframes to production code
- **Animator Agent**: Creates presentation animations and transitions
- **Designer Agent**: Optimizes visual layouts and color schemes
- **Analyst Agent**: Specialized for legal document analysis
- **Copilot Agent**: Background assistant providing continuous suggestions

#### Specialized Capabilities

**⚖️ Legal Case Preparation**
- Organize landlord-tenant cases and evidence
- Structure legal arguments and timelines
- Analyze documents and identify key issues
- Prepare for hearings with AI guidance

**💻 Wireframe to Code Conversion**
- Convert UI mockups to React/Vue/Angular code
- Generate production-ready components with styling
- Support for Tailwind CSS, Bootstrap, and custom styles
- Responsive design and accessibility features

**🎬 Presentation Animation**
- Create smooth slide transitions
- Animate element sequences
- Generate interactive presentations
- Export animation timelines

**🎨 Visual Design Assistance**
- Optimize layouts and color schemes
- Suggest visual improvements
- Generate design systems
- Create consistent styling

#### Configuration & Setup

The AI system is highly configurable through [`ai-backend/config/models.yaml`](./ai-backend/config/models.yaml):

```yaml
# Route different functions to optimal models
default_models:
  primary: "local_deepseek"      # Main conversation
  legal: "openai_gpt4"          # Legal analysis
  visual: "local_qwen"          # Visual generation
  code: "local_devstral"        # Code generation
```

For detailed setup instructions, see the [AI Backend Documentation](./ai-backend/README.md).

#### API Endpoints

The AI backend provides several endpoints for different interaction modes:

- `POST /v1/ai/llm-brainstorm` - Main AI chat with function routing
- `POST /v1/ai/delegate-task` - Delegate specialized tasks to AI agents
- `GET /v1/ai/models/health` - Check model availability and status
- `GET /v1/ai/models/config` - View current model configuration

#### Example Usage

**Basic AI Chat:**
```javascript
const response = await fetch('/v1/ai/llm-brainstorm', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: "Help me organize a legal case",
    functionType: "legal",
    sceneElements: [...],
    chatHistory: [...]
  })
});
```

**Task Delegation:**
```javascript
const taskResponse = await fetch('/v1/ai/delegate-task', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    task: "wireframe_to_code",
    data: { elements: [...], framework: "react" }
  })
});
```

## Quick Start

<!-- TODO: Update package name and npm registry when published -->
**Note:** The following instructions are for integrating R2 Ditu into your own app. To run the repository locally for development, please refer to the [Development Guide](./dev-docs/README.md).

```bash
# TODO: Update with actual package name when published
npm install react react-dom @r2-ditu/r2-ditu
# or
yarn add react react-dom @r2-ditu/r2-ditu
```

<!-- TODO: Add link to documentation when available -->
Check out our documentation for more details!

## Contributing

<!-- TODO: Update repository URL -->
- Missing something or found a bug? [Report here](https://github.com/rebots-online/r2-ditu/issues).
- Want to contribute? See our [CONTRIBUTING.md](./CONTRIBUTING.md) file for guidelines.
<!-- TODO: Add Discord/community links when available -->
<!-- - Want to help with translations? See the translation guide. -->

## Integrations

<!-- TODO: Add your own integrations when available -->
<!-- - VSCode extension -->
<!-- - npm package -->

## Development

To run R2 Ditu locally for development:

### Frontend Setup
1. Clone this repository
2. Install dependencies: `yarn install`
3. Start the development server: `yarn start`
4. Open [http://localhost:3000](http://localhost:3000) in your browser

### AI Backend Setup (Optional but Recommended)
1. Navigate to AI backend: `cd ai-backend`
2. Install dependencies: `npm install`
3. Configure models in [`config/models.yaml`](./ai-backend/config/models.yaml)
4. Start the AI backend: `npm start`
5. AI backend runs on [http://localhost:3015](http://localhost:3015)

### Local AI Models (Optional)
For privacy and offline use, install local AI models:

**Ollama Setup:**
```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Pull recommended models
ollama pull deepseek-r1:latest    # Primary conversation
ollama pull qwen2.5:latest        # Visual generation
ollama pull codestral:latest      # Code generation
```

**LM Studio Setup:**
1. Download [LM Studio](https://lmstudio.ai/)
2. Load your preferred models
3. Start local server on port 1234

For more detailed development instructions, see the [Development Guide](./dev-docs/README.md).

## License

<!-- TODO: Update license information -->
This project's license is to be determined. See [LICENSE](./LICENSE) file for details.

## Acknowledgments

This project is based on [Excalidraw](https://github.com/excalidraw/excalidraw), an excellent open-source whiteboard tool.
