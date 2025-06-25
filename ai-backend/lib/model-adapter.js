/**
 * Multi-Model Adapter System for R2 Ditu
 * Supports OpenAI, Anthropic, Google, XAI, Ollama, LM Studio, and custom endpoints
 */

const axios = require('axios');
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

class ModelAdapter {
  constructor(configPath = './config/models.yaml') {
    this.config = this.loadConfig(configPath);
    this.activeConnections = new Map();
    this.requestQueue = [];
    this.isProcessing = false;
  }

  loadConfig(configPath) {
    try {
      const fullPath = path.resolve(__dirname, '..', configPath);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      return yaml.load(fileContents);
    } catch (error) {
      console.error('Failed to load model configuration:', error);
      return this.getDefaultConfig();
    }
  }

  getDefaultConfig() {
    return {
      default_models: {
        primary: "local_deepseek",
        visual: "local_qwen",
        legal: "openai_gpt4",
        document: "local_devstral",
        copilot: "local_qwen_small"
      },
      models: {
        local_deepseek: {
          provider: "ollama",
          model: "deepseek-r1:latest",
          endpoint: "http://localhost:11434",
          temperature: 0.7,
          max_tokens: 2000
        }
      }
    };
  }

  /**
   * Route request to appropriate model based on function type
   */
  async routeRequest(functionType, prompt, context = {}) {
    const routing = this.config.routing[functionType];
    if (!routing) {
      throw new Error(`Unknown function type: ${functionType}`);
    }

    const primaryModel = routing.primary;
    const fallbackModels = routing.fallback || [];

    try {
      return await this.callModel(primaryModel, prompt, context, functionType);
    } catch (error) {
      console.warn(`Primary model ${primaryModel} failed:`, error.message);
      
      // Try fallback models
      for (const fallbackModel of fallbackModels) {
        try {
          console.log(`Trying fallback model: ${fallbackModel}`);
          return await this.callModel(fallbackModel, prompt, context, functionType);
        } catch (fallbackError) {
          console.warn(`Fallback model ${fallbackModel} failed:`, fallbackError.message);
        }
      }
      
      throw new Error(`All models failed for function: ${functionType}`);
    }
  }

  /**
   * Call specific model with prompt and context
   */
  async callModel(modelId, prompt, context = {}, functionType = 'chat') {
    const modelConfig = this.config.models[modelId];
    if (!modelConfig) {
      throw new Error(`Model configuration not found: ${modelId}`);
    }

    // Load function-specific prompt template
    const systemPrompt = await this.loadPromptTemplate(functionType, context);
    
    switch (modelConfig.provider) {
      case 'ollama':
        return await this.callOllama(modelConfig, prompt, systemPrompt);
      case 'lmstudio':
        return await this.callLMStudio(modelConfig, prompt, systemPrompt);
      case 'openai':
        return await this.callOpenAI(modelConfig, prompt, systemPrompt);
      case 'anthropic':
        return await this.callAnthropic(modelConfig, prompt, systemPrompt);
      case 'google':
        return await this.callGoogle(modelConfig, prompt, systemPrompt);
      case 'xai':
        return await this.callXAI(modelConfig, prompt, systemPrompt);
      default:
        throw new Error(`Unsupported provider: ${modelConfig.provider}`);
    }
  }

  /**
   * Ollama API integration
   */
  async callOllama(config, prompt, systemPrompt) {
    const response = await axios.post(`${config.endpoint}/api/generate`, {
      model: config.model,
      prompt: `${systemPrompt}\n\nUser: ${prompt}`,
      stream: false,
      options: {
        temperature: config.temperature || 0.7,
        num_predict: config.max_tokens || 2000
      }
    }, {
      timeout: (config.timeout || 30) * 1000
    });

    return {
      content: response.data.response,
      model: config.model,
      provider: 'ollama',
      usage: {
        prompt_tokens: response.data.prompt_eval_count || 0,
        completion_tokens: response.data.eval_count || 0
      }
    };
  }

  /**
   * LM Studio API integration (OpenAI-compatible)
   */
  async callLMStudio(config, prompt, systemPrompt) {
    const response = await axios.post(`${config.endpoint}/v1/chat/completions`, {
      model: config.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: config.temperature || 0.7,
      max_tokens: config.max_tokens || 2000
    }, {
      timeout: (config.timeout || 30) * 1000
    });

    const choice = response.data.choices[0];
    return {
      content: choice.message.content,
      model: config.model,
      provider: 'lmstudio',
      usage: response.data.usage
    };
  }

  /**
   * OpenAI API integration
   */
  async callOpenAI(config, prompt, systemPrompt) {
    const apiKey = this.resolveApiKey(config.api_key);
    
    const response = await axios.post(`${config.endpoint}/chat/completions`, {
      model: config.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: config.temperature || 0.7,
      max_tokens: config.max_tokens || 2000
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: (config.timeout || 30) * 1000
    });

    const choice = response.data.choices[0];
    return {
      content: choice.message.content,
      model: config.model,
      provider: 'openai',
      usage: response.data.usage
    };
  }

  /**
   * Anthropic API integration
   */
  async callAnthropic(config, prompt, systemPrompt) {
    const apiKey = this.resolveApiKey(config.api_key);
    
    const response = await axios.post(`${config.endpoint}/v1/messages`, {
      model: config.model,
      max_tokens: config.max_tokens || 2000,
      system: systemPrompt,
      messages: [
        { role: 'user', content: prompt }
      ],
      temperature: config.temperature || 0.7
    }, {
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      timeout: (config.timeout || 30) * 1000
    });

    return {
      content: response.data.content[0].text,
      model: config.model,
      provider: 'anthropic',
      usage: response.data.usage
    };
  }

  /**
   * Google Gemini API integration
   */
  async callGoogle(config, prompt, systemPrompt) {
    const apiKey = this.resolveApiKey(config.api_key);
    
    const response = await axios.post(
      `${config.endpoint}/v1beta/models/${config.model}:generateContent?key=${apiKey}`,
      {
        contents: [{
          parts: [{
            text: `${systemPrompt}\n\nUser: ${prompt}`
          }]
        }],
        generationConfig: {
          temperature: config.temperature || 0.7,
          maxOutputTokens: config.max_tokens || 2000
        }
      },
      {
        timeout: (config.timeout || 30) * 1000
      }
    );

    return {
      content: response.data.candidates[0].content.parts[0].text,
      model: config.model,
      provider: 'google',
      usage: response.data.usageMetadata
    };
  }

  /**
   * XAI Grok API integration
   */
  async callXAI(config, prompt, systemPrompt) {
    const apiKey = this.resolveApiKey(config.api_key);
    
    const response = await axios.post(`${config.endpoint}/v1/chat/completions`, {
      model: config.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: config.temperature || 0.7,
      max_tokens: config.max_tokens || 2000
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: (config.timeout || 30) * 1000
    });

    const choice = response.data.choices[0];
    return {
      content: choice.message.content,
      model: config.model,
      provider: 'xai',
      usage: response.data.usage
    };
  }

  /**
   * Load prompt template for specific function
   */
  async loadPromptTemplate(functionType, context) {
    const templatePath = this.config.prompt_templates[functionType];
    if (!templatePath) {
      return this.getDefaultPrompt(functionType);
    }

    try {
      const fullPath = path.resolve(__dirname, '..', templatePath);
      let template = fs.readFileSync(fullPath, 'utf8');
      
      // Replace context placeholders
      template = template.replace('{contextInfo}', JSON.stringify(context.whiteboard || {}, null, 2));
      template = template.replace('{historyContext}', JSON.stringify(context.history || [], null, 2));
      template = template.replace('{userPrompt}', context.prompt || '');
      template = template.replace('{recentActivity}', JSON.stringify(context.activity || [], null, 2));
      
      return template;
    } catch (error) {
      console.warn(`Failed to load prompt template for ${functionType}:`, error.message);
      return this.getDefaultPrompt(functionType);
    }
  }

  getDefaultPrompt(functionType) {
    const prompts = {
      chat: "You are a helpful AI assistant for R2 Ditu collaborative whiteboard.",
      legal: "You are a legal analysis AI specializing in landlord-tenant law and case preparation.",
      visual: "You are a visual design AI that creates whiteboard elements and layouts.",
      document: "You are a document processing AI that analyzes and extracts information from legal documents.",
      copilot: "You are a background copilot AI providing helpful suggestions and tips.",
      code: "You are a code generation AI that converts designs and processes into executable code."
    };
    
    return prompts[functionType] || prompts.chat;
  }

  /**
   * Resolve API key from environment variables
   */
  resolveApiKey(keyTemplate) {
    if (!keyTemplate || keyTemplate === 'null') return null;
    
    // Handle environment variable substitution like ${OPENAI_API_KEY}
    const envVarMatch = keyTemplate.match(/\$\{([^}]+)\}/);
    if (envVarMatch) {
      const envVar = envVarMatch[1];
      return process.env[envVar];
    }
    
    return keyTemplate;
  }

  /**
   * Health check for all configured models
   */
  async healthCheck() {
    const results = {};
    
    for (const [modelId, config] of Object.entries(this.config.models)) {
      try {
        const startTime = Date.now();
        await this.callModel(modelId, "Hello", {}, 'chat');
        const responseTime = Date.now() - startTime;
        
        results[modelId] = {
          status: 'healthy',
          responseTime,
          provider: config.provider,
          model: config.model
        };
      } catch (error) {
        results[modelId] = {
          status: 'unhealthy',
          error: error.message,
          provider: config.provider,
          model: config.model
        };
      }
    }
    
    return results;
  }
}

module.exports = ModelAdapter;