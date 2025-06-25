/**
 * Multi-Agent Orchestration System for R2 Ditu
 * Coordinates specialized AI agents for different tasks
 */

const EventEmitter = require('events');

class AgentOrchestrator extends EventEmitter {
  constructor(modelAdapter, mcpClient) {
    super();
    this.modelAdapter = modelAdapter;
    this.mcpClient = mcpClient;
    
    // Specialized agents
    this.agents = {
      primary: new PrimaryAgent(this),
      coder: new CoderAgent(this),
      animator: new AnimatorAgent(this),
      designer: new DesignerAgent(this),
      analyst: new AnalystAgent(this),
      copilot: new CopilotAgent(this)
    };
    
    // Task queue and coordination
    this.taskQueue = [];
    this.activeTasks = new Map();
    this.maxConcurrentTasks = 3;
    
    // Agent communication
    this.agentMessages = [];
    this.collaborationContext = {};
    
    this.setupAgentCommunication();
  }

  /**
   * Setup inter-agent communication
   */
  setupAgentCommunication() {
    // Listen for agent requests
    this.on('agent_request', this.handleAgentRequest.bind(this));
    this.on('task_complete', this.handleTaskComplete.bind(this));
    this.on('agent_collaboration', this.handleAgentCollaboration.bind(this));
  }

  /**
   * Handle agent requests
   */
  async handleAgentRequest(request) {
    console.log('Agent request received:', request);
    // Handle inter-agent communication
  }

  /**
   * Handle task completion
   */
  async handleTaskComplete(task) {
    console.log(`Task ${task.id} completed by ${task.agent}`);
    this.emit('task_result', task);
  }

  /**
   * Delegate task to appropriate agent
   */
  async delegateTask(task, data, context = {}) {
    const agent = this.selectAgent(task);
    
    if (!agent) {
      throw new Error(`No suitable agent found for task: ${task}`);
    }

    const taskId = this.generateTaskId();
    const taskData = {
      id: taskId,
      type: task,
      data,
      context,
      agent: agent.name,
      status: 'pending',
      created: Date.now()
    };

    this.taskQueue.push(taskData);
    this.processTaskQueue();
    
    return taskId;
  }

  /**
   * Select appropriate agent for task
   */
  selectAgent(task) {
    const agentMapping = {
      'wireframe_to_code': this.agents.coder,
      'animate_presentation': this.agents.animator,
      'create_visual_layout': this.agents.designer,
      'analyze_legal_document': this.agents.analyst,
      'generate_business_logic': this.agents.coder,
      'code_review': this.agents.coder,
      'design_optimization': this.agents.designer,
      'legal_analysis': this.agents.analyst,
      'background_suggestions': this.agents.copilot,
      'chat': this.agents.primary
    };

    return agentMapping[task] || this.agents.primary;
  }

  /**
   * Process task queue
   */
  async processTaskQueue() {
    if (this.activeTasks.size >= this.maxConcurrentTasks) {
      return; // Wait for current tasks to complete
    }

    const task = this.taskQueue.shift();
    if (!task) {
      return;
    }

    this.activeTasks.set(task.id, task);
    task.status = 'active';
    task.started = Date.now();

    try {
      const agent = this.agents[task.agent.toLowerCase()];
      const result = await agent.executeTask(task);
      
      task.status = 'completed';
      task.completed = Date.now();
      task.result = result;
      
      this.emit('task_complete', task);
      
    } catch (error) {
      task.status = 'failed';
      task.error = error.message;
      task.completed = Date.now();
      
      console.error(`Task ${task.id} failed:`, error);
      this.emit('task_failed', task);
    }

    this.activeTasks.delete(task.id);
    
    // Process next task in queue
    if (this.taskQueue.length > 0) {
      setTimeout(() => this.processTaskQueue(), 100);
    }
  }

  /**
   * Handle agent collaboration requests
   */
  async handleAgentCollaboration(event) {
    const { requestingAgent, targetAgent, task, data } = event;
    
    console.log(`🤝 Agent collaboration: ${requestingAgent} → ${targetAgent}`);
    
    // Route collaboration request
    const agent = this.agents[targetAgent.toLowerCase()];
    if (agent) {
      const result = await agent.collaborateOn(task, data, requestingAgent);
      
      this.emit('collaboration_result', {
        requestingAgent,
        targetAgent,
        task,
        result
      });
      
      return result;
    }
  }

  generateTaskId() {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Base Agent class
 */
class BaseAgent {
  constructor(orchestrator) {
    this.orchestrator = orchestrator;
    this.modelAdapter = orchestrator.modelAdapter;
    this.mcpClient = orchestrator.mcpClient;
    this.name = this.constructor.name.replace('Agent', '').toLowerCase();
  }

  async executeTask(task) {
    throw new Error('executeTask must be implemented by subclass');
  }

  async collaborateOn(task, data, requestingAgent) {
    // Default collaboration behavior
    return await this.executeTask({ type: task, data, context: { collaborator: requestingAgent } });
  }

  async requestCollaboration(targetAgent, task, data) {
    return new Promise((resolve) => {
      this.orchestrator.emit('agent_collaboration', {
        requestingAgent: this.name,
        targetAgent,
        task,
        data
      });

      this.orchestrator.once('collaboration_result', (result) => {
        if (result.requestingAgent === this.name && result.targetAgent === targetAgent) {
          resolve(result.result);
        }
      });
    });
  }
}

/**
 * Primary Agent - Main conversational AI
 */
class PrimaryAgent extends BaseAgent {
  async executeTask(task) {
    const { data, context } = task;
    
    // Determine if task needs delegation
    if (this.shouldDelegate(data.prompt)) {
      return await this.delegateToSpecialist(data.prompt, context);
    }

    // Handle directly
    const response = await this.modelAdapter.routeRequest('chat', data.prompt, context);
    
    return {
      type: 'chat_response',
      content: response.content,
      model: response.model,
      agent: this.name
    };
  }

  shouldDelegate(prompt) {
    const delegationKeywords = {
      'code': ['convert to code', 'generate code', 'wireframe to code'],
      'animate': ['animate', 'presentation', 'slide transition'],
      'design': ['layout', 'visual design', 'color scheme'],
      'legal': ['legal analysis', 'case law', 'contract review']
    };

    for (const [type, keywords] of Object.entries(delegationKeywords)) {
      if (keywords.some(keyword => prompt.toLowerCase().includes(keyword))) {
        return type;
      }
    }

    return false;
  }

  async delegateToSpecialist(prompt, context) {
    const taskType = this.shouldDelegate(prompt);
    
    const taskMapping = {
      'code': 'wireframe_to_code',
      'animate': 'animate_presentation',
      'design': 'create_visual_layout',
      'legal': 'legal_analysis'
    };

    const specialistTask = taskMapping[taskType];
    if (specialistTask) {
      const taskId = await this.orchestrator.delegateTask(specialistTask, { prompt }, context);
      return {
        type: 'delegated',
        taskId,
        specialist: taskType,
        message: `I've delegated this to our ${taskType} specialist. They'll handle this request.`
      };
    }

    return await this.executeTask({ data: { prompt }, context });
  }
}

/**
 * Coder Agent - Code generation and conversion
 */
class CoderAgent extends BaseAgent {
  async executeTask(task) {
    const { data, context } = task;
    
    switch (task.type) {
      case 'wireframe_to_code':
        return await this.wireframeToCode(data, context);
      case 'generate_business_logic':
        return await this.generateBusinessLogic(data, context);
      case 'code_review':
        return await this.reviewCode(data, context);
      default:
        return await this.generateCode(data, context);
    }
  }

  async wireframeToCode(data, context) {
    const { elements, framework = 'react', style = 'tailwind' } = data;
    
    const prompt = `Convert wireframe elements to ${framework} code with ${style}:
    
Elements: ${JSON.stringify(elements, null, 2)}
Context: ${JSON.stringify(context.whiteboard, null, 2)}

Generate production-ready code with:
1. Component structure
2. Responsive design
3. Accessibility features
4. Clean styling
5. Event handlers`;

    const response = await this.modelAdapter.routeRequest('code', prompt, context);
    
    // Create code elements on whiteboard via MCP
    await this.createCodeElements(response.content, elements);
    
    return {
      type: 'code_generated',
      code: response.content,
      framework,
      style,
      elements_processed: elements.length
    };
  }

  async createCodeElements(code, originalElements) {
    if (this.mcpClient.isConnected) {
      this.mcpClient.send({
        type: 'create_element',
        element: {
          type: 'code_block',
          content: code,
          x: (originalElements[0]?.x || 0) + 350,
          y: originalElements[0]?.y || 100,
          width: 600,
          height: 400,
          backgroundColor: '#1e1e1e',
          textColor: '#00ff00',
          fontSize: 12,
          fontFamily: 'Monaco, monospace'
        },
        source: 'ai_coder',
        timestamp: Date.now()
      });
    }
  }
}

/**
 * Animator Agent - Presentation and element animation
 */
class AnimatorAgent extends BaseAgent {
  async executeTask(task) {
    const { data, context } = task;
    
    const { slides, transitions = ['fade', 'slide'], duration = 3000 } = data;
    
    const prompt = `Create animation sequence for presentation:
    
Slides: ${JSON.stringify(slides, null, 2)}
Transitions: ${transitions.join(', ')}
Duration: ${duration}ms per slide

Generate:
1. Animation timeline
2. Transition effects
3. Element choreography
4. Interactive controls`;

    const response = await this.modelAdapter.routeRequest('visual', prompt, context);
    
    // Apply animations via MCP
    await this.applyAnimations(slides, transitions, duration);
    
    return {
      type: 'animation_created',
      sequence: response.content,
      slides_count: slides.length,
      total_duration: slides.length * duration
    };
  }

  async applyAnimations(slides, transitions, duration) {
    if (this.mcpClient.isConnected) {
      slides.forEach((slide, index) => {
        setTimeout(() => {
          this.mcpClient.send({
            type: 'animate_elements',
            elements: slide.elements,
            animation: {
              type: transitions[index % transitions.length],
              duration: 1000,
              easing: 'ease-in-out'
            },
            timestamp: Date.now()
          });
        }, index * duration);
      });
    }
  }
}

/**
 * Designer Agent - Visual layout and design
 */
class DesignerAgent extends BaseAgent {
  async executeTask(task) {
    const { data, context } = task;
    
    const prompt = `Create visual layout design:
    
Requirements: ${JSON.stringify(data, null, 2)}
Current whiteboard: ${JSON.stringify(context.whiteboard, null, 2)}

Design:
1. Layout structure
2. Color scheme
3. Typography
4. Element positioning
5. Visual hierarchy`;

    const response = await this.modelAdapter.routeRequest('visual', prompt, context);
    
    return {
      type: 'design_created',
      layout: response.content,
      agent: this.name
    };
  }
}

/**
 * Analyst Agent - Legal and document analysis
 */
class AnalystAgent extends BaseAgent {
  async executeTask(task) {
    const { data, context } = task;
    
    const prompt = `Analyze legal document or case:
    
Content: ${JSON.stringify(data, null, 2)}
Context: ${JSON.stringify(context, null, 2)}

Provide:
1. Key legal issues
2. Evidence assessment
3. Argument structure
4. Risk analysis
5. Next steps`;

    const response = await this.modelAdapter.routeRequest('legal', prompt, context);
    
    return {
      type: 'legal_analysis',
      analysis: response.content,
      agent: this.name
    };
  }
}

/**
 * Copilot Agent - Background suggestions and assistance
 */
class CopilotAgent extends BaseAgent {
  async executeTask(task) {
    const { data, context } = task;
    
    const prompt = `Provide background suggestions for current whiteboard state:
    
Current state: ${JSON.stringify(context.whiteboard, null, 2)}
Recent activity: ${JSON.stringify(data.activity, null, 2)}

Suggest:
1. Organization improvements
2. Missing elements
3. Workflow optimizations
4. Quality enhancements`;

    const response = await this.modelAdapter.routeRequest('copilot', prompt, context);
    
    return {
      type: 'copilot_suggestions',
      suggestions: response.content,
      agent: this.name
    };
  }
}

module.exports = { AgentOrchestrator, BaseAgent };