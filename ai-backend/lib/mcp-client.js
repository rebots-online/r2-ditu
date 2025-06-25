/**
 * MCP (Model Context Protocol) Client for R2 Ditu
 * Enables AI to connect as a collaborative participant via WebSocket
 */

const WebSocket = require('ws');
const EventEmitter = require('events');

class MCPClient extends EventEmitter {
  constructor(options = {}) {
    super();
    this.wsUrl = options.wsUrl || 'ws://localhost:12000/ws';
    this.aiId = options.aiId || 'ai-collaborator-primary';
    this.modelAdapter = options.modelAdapter;
    this.ws = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    
    // AI state
    this.whiteboardState = {};
    this.collaborators = new Map();
    this.taskQueue = [];
    this.activeTask = null;
    
    // Specialized AI agents
    this.agents = {
      coder: null,
      animator: null,
      designer: null,
      analyst: null
    };
  }

  /**
   * Connect to R2 Ditu whiteboard as AI collaborator
   */
  async connect() {
    try {
      this.ws = new WebSocket(this.wsUrl);
      
      this.ws.on('open', () => {
        console.log('🤖 AI connected to R2 Ditu whiteboard');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        
        // Announce AI presence
        this.send({
          type: 'ai_join',
          aiId: this.aiId,
          capabilities: [
            'code_generation',
            'wireframe_to_code',
            'presentation_animation',
            'legal_analysis',
            'visual_design',
            'document_processing'
          ],
          timestamp: Date.now()
        });
        
        this.emit('connected');
      });

      this.ws.on('message', (data) => {
        try {
          const message = JSON.parse(data);
          this.handleMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      });

      this.ws.on('close', () => {
        console.log('🤖 AI disconnected from whiteboard');
        this.isConnected = false;
        this.emit('disconnected');
        this.attemptReconnect();
      });

      this.ws.on('error', (error) => {
        console.warn('WebSocket connection failed:', error.message);
        this.isConnected = false;
        // Don't emit error to prevent crash, just log and attempt reconnect
        this.attemptReconnect();
      });

    } catch (error) {
      console.error('Failed to connect to whiteboard:', error);
      this.attemptReconnect();
    }
  }

  /**
   * Handle incoming messages from whiteboard
   */
  async handleMessage(message) {
    switch (message.type) {
      case 'whiteboard_state':
        this.whiteboardState = message.data;
        this.emit('whiteboard_updated', message.data);
        await this.analyzeWhiteboardChanges(message.data);
        break;

      case 'element_added':
      case 'element_updated':
      case 'element_deleted':
        await this.handleElementChange(message);
        break;

      case 'user_message':
        await this.handleUserMessage(message);
        break;

      case 'task_request':
        await this.handleTaskRequest(message);
        break;

      case 'collaborator_joined':
      case 'collaborator_left':
        this.updateCollaborators(message);
        break;

      default:
        console.log('Unknown message type:', message.type);
    }
  }

  /**
   * Handle task requests from users or other AIs
   */
  async handleTaskRequest(message) {
    const { task, data, requestId } = message;
    
    console.log(`🤖 Received task request: ${task}`);
    
    try {
      let result;
      
      switch (task) {
        case 'wireframe_to_code':
          result = await this.wireframeToCode(data);
          break;
          
        case 'animate_presentation':
          result = await this.animatePresentation(data);
          break;
          
        case 'generate_business_logic':
          result = await this.generateBusinessLogic(data);
          break;
          
        case 'analyze_legal_document':
          result = await this.analyzeLegalDocument(data);
          break;
          
        case 'create_visual_layout':
          result = await this.createVisualLayout(data);
          break;
          
        default:
          result = await this.handleGenericTask(task, data);
      }
      
      // Send result back
      this.send({
        type: 'task_result',
        requestId,
        task,
        result,
        timestamp: Date.now()
      });
      
    } catch (error) {
      console.error(`Task ${task} failed:`, error);
      this.send({
        type: 'task_error',
        requestId,
        task,
        error: error.message,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Convert wireframe elements to executable code
   */
  async wireframeToCode(data) {
    const { elements, framework = 'react', style = 'tailwind' } = data;
    
    const prompt = `Convert this wireframe to ${framework} code with ${style} styling:
    
Wireframe Elements:
${JSON.stringify(elements, null, 2)}

Generate:
1. Component structure
2. Styling classes
3. Event handlers
4. State management
5. Responsive design

Output clean, production-ready code.`;

    const response = await this.modelAdapter.routeRequest('code', prompt, {
      whiteboard: this.whiteboardState,
      task: 'wireframe_to_code'
    });

    // Create code elements on whiteboard
    await this.createCodeElements(response.content, elements);
    
    return {
      code: response.content,
      framework,
      style,
      elements_created: true
    };
  }

  /**
   * Animate presentation elements
   */
  async animatePresentation(data) {
    const { slides, transitions, duration = 5000 } = data;
    
    const prompt = `Create presentation animation sequence:
    
Slides: ${JSON.stringify(slides, null, 2)}
Transitions: ${transitions.join(', ')}
Duration: ${duration}ms per slide

Generate:
1. Animation timeline
2. Transition effects
3. Element choreography
4. Timing sequences
5. Interactive controls`;

    const response = await this.modelAdapter.routeRequest('visual', prompt, {
      whiteboard: this.whiteboardState,
      task: 'animate_presentation'
    });

    // Apply animations to whiteboard elements
    await this.applyAnimations(response.content, slides);
    
    return {
      animation_sequence: response.content,
      total_duration: slides.length * duration,
      slides_animated: slides.length
    };
  }

  /**
   * Generate business logic from process diagrams
   */
  async generateBusinessLogic(data) {
    const { process_elements, rules, language = 'javascript' } = data;
    
    const prompt = `Convert business process to ${language} code:
    
Process Elements:
${JSON.stringify(process_elements, null, 2)}

Business Rules:
${JSON.stringify(rules, null, 2)}

Generate:
1. Process flow logic
2. Decision trees
3. Validation rules
4. Error handling
5. API integrations`;

    const response = await this.modelAdapter.routeRequest('code', prompt, {
      whiteboard: this.whiteboardState,
      task: 'business_logic'
    });

    return {
      business_logic: response.content,
      language,
      processes_implemented: process_elements.length
    };
  }

  /**
   * Create code elements on whiteboard
   */
  async createCodeElements(code, originalElements) {
    const codeElement = {
      type: 'code_block',
      content: code,
      x: originalElements[0]?.x + 300 || 100,
      y: originalElements[0]?.y || 100,
      width: 600,
      height: 400,
      backgroundColor: '#1e1e1e',
      textColor: '#ffffff',
      fontSize: 12,
      fontFamily: 'Monaco, monospace'
    };

    this.send({
      type: 'create_element',
      element: codeElement,
      source: 'ai_coder',
      timestamp: Date.now()
    });
  }

  /**
   * Apply animations to whiteboard elements
   */
  async applyAnimations(animationData, slides) {
    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      
      this.send({
        type: 'animate_elements',
        elements: slide.elements,
        animation: {
          type: 'slide_transition',
          duration: 1000,
          delay: i * 5000,
          easing: 'ease-in-out'
        },
        timestamp: Date.now()
      });
    }
  }

  /**
   * Analyze whiteboard changes and provide proactive suggestions
   */
  async analyzeWhiteboardChanges(newState) {
    // Check for patterns that might benefit from AI assistance
    const suggestions = [];
    
    // Detect wireframes that could be converted to code
    const wireframes = this.detectWireframes(newState);
    if (wireframes.length > 0) {
      suggestions.push({
        type: 'code_generation',
        message: `I can convert ${wireframes.length} wireframe(s) to executable code`,
        action: 'wireframe_to_code',
        data: { elements: wireframes }
      });
    }
    
    // Detect presentation slides that could be animated
    const slides = this.detectPresentationSlides(newState);
    if (slides.length > 2) {
      suggestions.push({
        type: 'animation',
        message: `I can animate your ${slides.length}-slide presentation`,
        action: 'animate_presentation',
        data: { slides }
      });
    }
    
    // Detect business processes that could be coded
    const processes = this.detectBusinessProcesses(newState);
    if (processes.length > 0) {
      suggestions.push({
        type: 'business_logic',
        message: `I can generate business logic for ${processes.length} process(es)`,
        action: 'generate_business_logic',
        data: { process_elements: processes }
      });
    }
    
    // Send suggestions if any found
    if (suggestions.length > 0) {
      this.send({
        type: 'ai_suggestions',
        suggestions,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Detect wireframe elements
   */
  detectWireframes(state) {
    const wireframes = [];
    
    for (const element of state.elements || []) {
      if (element.type === 'rectangle' && 
          element.strokeStyle === 'dashed' ||
          element.text?.includes('Button') ||
          element.text?.includes('Input') ||
          element.text?.includes('Form')) {
        wireframes.push(element);
      }
    }
    
    return wireframes;
  }

  /**
   * Detect presentation slides
   */
  detectPresentationSlides(state) {
    const slides = [];
    const elements = state.elements || [];
    
    // Group elements by approximate Y position (slides)
    const yGroups = {};
    elements.forEach(element => {
      const yGroup = Math.floor(element.y / 600) * 600;
      if (!yGroups[yGroup]) yGroups[yGroup] = [];
      yGroups[yGroup].push(element);
    });
    
    // Convert groups to slides if they have enough elements
    Object.values(yGroups).forEach((group, index) => {
      if (group.length >= 2) {
        slides.push({
          id: `slide_${index}`,
          elements: group,
          y_position: group[0].y
        });
      }
    });
    
    return slides;
  }

  /**
   * Detect business process elements
   */
  detectBusinessProcesses(state) {
    const processes = [];
    
    for (const element of state.elements || []) {
      if (element.type === 'diamond' || // Decision points
          element.type === 'arrow' ||   // Process flow
          (element.type === 'rectangle' && element.text?.includes('Process'))) {
        processes.push(element);
      }
    }
    
    return processes;
  }

  /**
   * Send message to whiteboard
   */
  send(message) {
    if (this.isConnected && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('Cannot send message: WebSocket not connected');
    }
  }

  /**
   * Attempt to reconnect to whiteboard
   */
  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
    
    setTimeout(() => {
      this.connect();
    }, this.reconnectDelay * this.reconnectAttempts);
  }

  /**
   * Disconnect from whiteboard
   */
  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

module.exports = MCPClient;