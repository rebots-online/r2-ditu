const WebSocket = require('ws');
const http = require('http');

const PORT = process.env.PORT || 8080;

// Create an HTTP server
const server = http.createServer((req, res) => {
  // Basic health check or info endpoint
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', message: 'WebSocket server is running' }));
  } else {
    res.writeHead(404);
    res.end();
  }
});

// Create a WebSocket server attached to the HTTP server
const wss = new WebSocket.Server({ server });

// Store connected clients
const clients = new Set();

console.log(`WebSocket server starting on port ${PORT}...`);

wss.on('connection', (ws, req) => {
  // For now, we're not using the token, but we can access it via req.url if needed later
  // const queryParams = new URLSearchParams(req.url.split('?')[1]);
  // const token = queryParams.get('token');
  // console.log('Client token:', token);

  clients.add(ws);
  console.log(`Client connected. Total clients: ${clients.size}`);

  ws.on('message', (messageAsString) => {
    // console.log('Received message:', messageAsString); // For debugging

    let message;
    try {
      message = JSON.parse(messageAsString);
    } catch (e) {
      console.error('Failed to parse message as JSON:', messageAsString);
      // Optionally send an error back to the client
      // ws.send(JSON.stringify({ jsonrpc: "2.0", error: { code: -32700, message: "Parse error" }, id: null }));
      return;
    }

    // Validate JSON-RPC 2.0 structure and method
    if (
      message &&
      message.jsonrpc === '2.0' &&
      message.method === 'sceneUpdate' &&
      message.params &&
      typeof message.params === 'object' // Basic check for params
    ) {
      // Echo the message to all connected clients (including the sender)
      clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          try {
            client.send(messageAsString); // Send the original stringified message
          } catch (err) {
            console.error('Error sending message to client:', err);
            // Handle potential errors, e.g., client disconnected abruptly
          }
        }
      });
    } else {
      console.log('Received non-sceneUpdate message or invalid format, ignoring:', message);
      // Optionally send an error for invalid messages
      // ws.send(JSON.stringify({ jsonrpc: "2.0", error: { code: -32600, message: "Invalid Request" }, id: message.id || null }));
    }
  });

  ws.on('close', (code, reason) => {
    clients.delete(ws);
    console.log(`Client disconnected. Code: ${code}, Reason: ${reason}. Total clients: ${clients.size}`);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    // Attempt to remove client on error as well, as 'close' might not always fire
    clients.delete(ws);
  });
});

server.listen(PORT, () => {
  console.log(`HTTP and WebSocket server is listening on http://localhost:${PORT}`);
  console.log(`WebSocket endpoint: ws://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  wss.clients.forEach(client => client.close());
  server.close(() => {
    console.log('Server shut down.');
    process.exit(0);
  });
});
