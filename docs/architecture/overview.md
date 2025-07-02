# Architecture Overview

```
R2 Ditu (monorepo)
├── excalidraw-app (React frontend)
│   └── components, collab, llm, etc.
├── ai-backend (Node.js Express backend)
│   ├── server.js
│   ├── config/
│   ├── lib/
│   └── prompts/
├── packages (shared libraries)
│   ├── common
│   ├── element
│   ├── excalidraw
│   ├── math
│   └── utils
├── examples
├── scripts
└── docker-compose.yml
```

This diagram reflects the current repository structure. The `excalidraw-app` provides the frontend whiteboard. `ai-backend` exposes AI endpoints and WebSocket collaboration. Shared packages contain reusable logic and UI components.
