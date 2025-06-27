# Simple Whiteboard WebSocket Server (Proof of Concept)

This Node.js server provides a basic WebSocket backend for a real-time collaborative whiteboard based on Excalidraw.

It echoes `sceneUpdate` messages received from any client to all connected clients.

## Prerequisites

- Node.js (v14 or later recommended)
- npm

## Running the Server

1.  **Navigate to the server directory:**
    ```bash
    cd whiteboard-server
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Start the server:**
    ```bash
    node server.js
    ```

The server will start by default on `http://localhost:8080`, with the WebSocket endpoint at `ws://localhost:8080`.

## How it Works

-   The server uses the `ws` library for WebSocket communication.
-   It maintains a list of all connected clients.
-   When a client sends a JSON-RPC 2.0 message with `method: "sceneUpdate"`, the server broadcasts this message (specifically, its `params` containing `elements` and `appState`) to all currently connected clients.
-   Clients are expected to handle these `sceneUpdate` messages to update their local Excalidraw canvas.

## For Development

-   The server logs client connections, disconnections, received messages (if debugging is enabled in code), and errors to the console.
-   The server listens for `SIGINT` (e.g., Ctrl+C) for graceful shutdown.

## Note on Deployment Token

The original requirement mentioned a URL format `wss://<YOUR_MCP_HOST>/ws?token=<API_TOKEN>`. This POC server does not currently implement token-based authentication or secure WebSockets (`wss`). For a production environment, these would need to be handled, likely by a reverse proxy (like Nginx or Caddy) that terminates SSL and potentially manages authentication before forwarding to this Node.js server. The token can be accessed from `req.url` in the `wss.on('connection', (ws, req) => { ... });` callback if needed in the future.
