import type { AIConfig } from '../types';

export interface AIResponse {
  success: boolean;
  data?: string[];
  error?: string;
  metadata?: {
    model?: string;
    tokensUsed?: number;
    cost?: number;
    citations?: string[];
  };
}

export interface KeyValidationResponse {
  success: boolean;
  messageKey: string;
  messageParams?: Record<string, string | number>;
  data?: any;
}

export interface ModelPricing {
  input: number;
  output: number;
  offPeakInput?: number;
  offPeakOutput?: number;
  offPeakHours?: string;
  caching?: number;
  batch?: number;
}

export interface AIProvider {
  name: string;
  description: string;
  endpoint: string;
  models: string[];
  validationEndpoint?: string;
  pricing?: Record<string, ModelPricing>;
  features?: string[];
  website?: string;
  note?: string;
  headers?: Record<string, string>;
  rateLimits?: {
    rpm: number;
    tpm: number;
    tier?: string;
  };
}

export const AI_PROVIDERS: Record<string, AIProvider> = {
  openai: {
    name: 'OpenAI',
    description: 'GPT-4o és GPT-4o mini modellek',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    models: [
      'gpt-4o',
      'gpt-4o-mini',
      'gpt-4-turbo',
      'gpt-3.5-turbo'
    ],
    validationEndpoint: 'https://api.openai.com/v1/models',
    pricing: {
      'gpt-4o': { input: 2.50, output: 10.00 },
      'gpt-4o-mini': { input: 0.15, output: 0.60 },
      'gpt-4-turbo': { input: 10.00, output: 30.00 },
      'gpt-3.5-turbo': { input: 0.50, output: 1.50 }
    },
    features: ['multimodal', 'fast', 'reliable'],
    website: 'https://openai.com'
  },
  
  anthropic: {
    name: 'Anthropic',
    description: 'Claude 3.5 Sonnet és Haiku modellek',
    endpoint: 'https://api.anthropic.com/v1/messages',
    models: [
      'claude-3-5-sonnet-20241022',
      'claude-3-5-haiku-20241022',
      'claude-3-opus-20240229',
      'claude-3-sonnet-20240229'
    ],
    validationEndpoint: 'https://api.anthropic.com/v1/messages',
    pricing: {
      'claude-3-5-sonnet-20241022': { input: 3.00, output: 15.00 },
      'claude-3-5-haiku-20241022': { input: 0.25, output: 1.25 },
      'claude-3-opus-20240229': { input: 15.00, output: 75.00 },
      'claude-3-sonnet-20240229': { input: 3.00, output: 15.00 }
    },
    features: ['reasoning', 'coding', 'analysis'],
    website: 'https://anthropic.com'
  },
  
  google: {
    name: 'Google',
    description: 'Gemini 1.5 Pro és Flash modellek',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
    models: [
      'gemini-1.5-pro',
      'gemini-1.5-flash',
      'gemini-1.0-pro',
      'gemini-1.0-flash'
    ],
    validationEndpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
    pricing: {
      'gemini-1.5-pro': { input: 3.50, output: 10.50 },
      'gemini-1.5-flash': { input: 0.075, output: 0.30 },
      'gemini-1.0-pro': { input: 1.00, output: 2.00 },
      'gemini-1.0-flash': { input: 0.075, output: 0.30 }
    },
    features: ['multimodal', 'long-context', 'fast'],
    website: 'https://ai.google.dev'
  },
  
  perplexity: {
    name: 'Perplexity',
    description: 'Sonar modell - gyors és pontos',
    endpoint: 'https://api.perplexity.ai/chat/completions',
    models: [
      'sonar',
      'llama-3-sonar-large-32k-online',
      'llama-3-sonar-small-32k-online',
      'mixtral-8x7b-instruct'
    ],
    validationEndpoint: 'https://api.perplexity.ai/models',
    pricing: {
      'sonar': { input: 0.20, output: 0.80 },
      'llama-3-sonar-large-32k-online': { input: 0.20, output: 0.80 },
      'llama-3-sonar-small-32k-online': { input: 0.10, output: 0.40 },
      'mixtral-8x7b-instruct': { input: 0.14, output: 0.56 }
    },
    features: ['fast', 'search', 'real-time'],
    website: 'https://www.perplexity.ai'
  },
  
  deepseek: {
    name: 'DeepSeek',
    description: 'DeepSeek Chat - 67B paraméter',
    endpoint: 'https://api.deepseek.com/v1/chat/completions',
    models: [
      'deepseek-chat',
      'deepseek-coder',
      'deepseek-llm-7b-chat',
      'deepseek-llm-67b-chat'
    ],
    validationEndpoint: 'https://api.deepseek.com/v1/models',
    pricing: {
      'deepseek-chat': { input: 0.14, output: 0.28 },
      'deepseek-coder': { input: 0.14, output: 0.28 },
      'deepseek-llm-7b-chat': { input: 0.10, output: 0.20 },
      'deepseek-llm-67b-chat': { input: 0.14, output: 0.28 }
    },
    features: ['coding', 'reasoning', 'multilingual'],
    website: 'https://www.deepseek.com'
  },
  
  mistral: {
    name: 'Mistral AI',
    description: 'Mistral Large és Nemo modellek',
    endpoint: 'https://api.mistral.ai/v1/chat/completions',
    models: [
      'mistral-large-2411',
      'mistral-nemo',
      'mistral-medium',
      'mistral-small'
    ],
    validationEndpoint: 'https://api.mistral.ai/v1/models',
    pricing: {
      'mistral-large-2411': { input: 6.00, output: 24.00 },
      'mistral-nemo': { input: 0.14, output: 0.42 },
      'mistral-medium': { input: 2.70, output: 8.10 },
      'mistral-small': { input: 0.14, output: 0.42 }
    },
    features: ['agentic', 'reasoning', 'efficient'],
    website: 'https://mistral.ai'
  },
  
  ollama: {
    name: 'Ollama',
    description: 'Helyi modellek futtatása',
    endpoint: 'http://localhost:11434/api/generate',
    models: [
      'llama-3.1-8b-instruct',
      'llama-3.1-70b-instruct',
      'llama-3.1-405b-instruct',
      'mistral',
      'codellama',
      'phi3'
    ],
    validationEndpoint: 'http://localhost:11434/api/tags',
    pricing: {
      'llama-3.1-8b-instruct': { input: 0.00, output: 0.00 },
      'llama-3.1-70b-instruct': { input: 0.00, output: 0.00 },
      'llama-3.1-405b-instruct': { input: 0.00, output: 0.00 },
      'mistral': { input: 0.00, output: 0.00 },
      'codellama': { input: 0.00, output: 0.00 },
      'phi3': { input: 0.00, output: 0.00 }
    },
    features: ['local', 'private', 'customizable'],
    website: 'https://ollama.ai'
  }
};

// Enhanced validation with better error handling
export class AIProviderValidator {
  private static async makeRequest(
    url: string, 
    options: RequestInit = {},
    timeout: number = 10000
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  static async validateOpenAICompatible(
    apiKey: string, 
    validationEndpoint: string, 
    providerName: string
  ): Promise<KeyValidationResponse> {
    if (!apiKey?.trim()) {
      return { success: false, messageKey: 'error.apiKeyMissing' };
    }

    try {
      const response = await this.makeRequest(validationEndpoint, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${apiKey}` }
      });

      if (response.ok) {
        return { 
          success: true, 
          messageKey: 'success.apiKeyValid', 
          messageParams: { providerName } 
        };
      }

      const errorText = await response.text().catch(() => '');
      let messageKey = 'error.apiKeyInvalidGeneric';
      
      switch (response.status) {
        case 401: messageKey = 'error.apiKeyUnauthorized'; break;
        case 403: messageKey = 'error.apiKeyForbidden'; break;
        case 429: messageKey = 'error.rateLimitExceeded'; break;
        case 503: messageKey = 'error.serviceUnavailable'; break;
      }

      return { 
        success: false, 
        messageKey,
        messageParams: { 
          providerName, 
          statusCode: response.status, 
          details: errorText.substring(0, 100) 
        }
      };
    } catch (error: any) {
      return { 
        success: false, 
        messageKey: 'error.apiKeyValidationFailed', 
        messageParams: { providerName, errorDetails: error.message }
      };
    }
  }

  static async validateAnthropic(apiKey: string): Promise<KeyValidationResponse> {
    if (!apiKey?.trim()) {
      return { success: false, messageKey: 'error.apiKeyMissing' };
    }

    try {
      const response = await this.makeRequest(AI_PROVIDERS.anthropic.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-5-haiku-20241205',
          messages: [{ role: 'user', content: 'Hi' }],
          max_tokens: 1
        })
      });

      if (response.ok) {
        return { 
          success: true, 
          messageKey: 'success.apiKeyValid', 
          messageParams: { providerName: 'Anthropic' } 
        };
      }

      const errorData = await response.json().catch(() => ({}));
      let messageKey = 'error.apiKeyInvalidGeneric';
      
      if (response.status === 401) messageKey = 'error.apiKeyUnauthorized';
      else if (response.status === 403) messageKey = 'error.apiKeyForbidden';

      return { 
        success: false, 
        messageKey, 
        messageParams: { 
          providerName: 'Anthropic', 
          statusCode: response.status, 
          details: errorData.error?.message || response.statusText 
        }
      };
    } catch (error: any) {
      return { 
        success: false, 
        messageKey: 'error.apiKeyValidationFailed',
        messageParams: { providerName: 'Anthropic', errorDetails: error.message }
      };
    }
  }

  static async validateGemini(apiKey: string): Promise<KeyValidationResponse> {
    if (!apiKey?.trim()) {
      return { success: false, messageKey: 'error.apiKeyMissing' };
    }

    try {
      const validationUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash?key=${apiKey}`;
      const response = await this.makeRequest(validationUrl);

      if (response.ok) {
        return { 
          success: true, 
          messageKey: 'success.apiKeyValid', 
          messageParams: { providerName: 'Google Gemini' } 
        };
      }

      const errorData = await response.json().catch(() => ({}));
      let messageKey = 'error.apiKeyInvalidGeneric';
      
      if (response.status === 400) messageKey = 'error.gemini.apiKeyInvalidOrProject';
      if (response.status === 403) messageKey = 'error.gemini.apiNotEnabledOrPerms';

      return { 
        success: false, 
        messageKey,
        messageParams: { 
          providerName: 'Google Gemini', 
          statusCode: response.status, 
          details: errorData.error?.message || response.statusText 
        }
      };
    } catch (error: any) {
      return { 
        success: false, 
        messageKey: 'error.apiKeyValidationFailed',
        messageParams: { providerName: 'Google Gemini', errorDetails: error.message }
      };
    }
  }

  static async validateOllama(): Promise<KeyValidationResponse> {
    try {
      const endpoint = AI_PROVIDERS.ollama.validationEndpoint;
      if (!endpoint) {
        return { success: false, messageKey: 'error.ollama.noValidationEndpoint' };
      }
      
      const response = await this.makeRequest(endpoint);
      
      if (response.ok) {
        return { success: true, messageKey: 'success.ollama.connectionActive' };
      }

      return { 
        success: false, 
        messageKey: 'error.ollama.connectionFailed',
        messageParams: { statusCode: response.status, statusText: response.statusText }
      };
    } catch (error: any) {
      return { 
        success: false, 
        messageKey: 'error.ollama.connectionFailedGeneric',
        messageParams: { errorDetails: error.message }
      };
    }
  }
}

export async function validateApiKey(config: AIConfig): Promise<KeyValidationResponse> {
  const providerConfig = AI_PROVIDERS[config.provider];

  if (!providerConfig) {
    return { 
      success: false, 
      messageKey: 'error.unknownProvider', 
      messageParams: { providerName: config.provider } 
    };
  }

  switch (config.provider) {
    case 'ollama':
      return await AIProviderValidator.validateOllama();
    
    case 'openai':
      return await AIProviderValidator.validateOpenAICompatible(
        config.apiKey, 
        'https://api.openai.com/v1/models', 
        'OpenAI'
      );
    
    case 'anthropic':
      return await AIProviderValidator.validateAnthropic(config.apiKey);
    
    case 'google':
      return await AIProviderValidator.validateGemini(config.apiKey);
    
    case 'deepseek':
      if (!providerConfig.validationEndpoint) {
        return { success: false, messageKey: 'error.unknownProvider', messageParams: { providerName: config.provider } };
      }
      return await AIProviderValidator.validateOpenAICompatible(
        config.apiKey, 
        providerConfig.validationEndpoint, 
        'DeepSeek'
      );
    
    case 'perplexity':
      if (!providerConfig.validationEndpoint) {
        return { success: false, messageKey: 'error.unknownProvider', messageParams: { providerName: config.provider } };
      }
      return await AIProviderValidator.validateOpenAICompatible(
        config.apiKey, 
        providerConfig.validationEndpoint, 
        'Perplexity'
      );
    
    case 'grok':
      if (!providerConfig.validationEndpoint) {
        return { success: false, messageKey: 'error.unknownProvider', messageParams: { providerName: config.provider } };
      }
      return await AIProviderValidator.validateOpenAICompatible(
        config.apiKey, 
        providerConfig.validationEndpoint, 
        'Grok'
      );
    
    default:
      return { 
        success: false, 
        messageKey: 'error.unknownProvider', 
        messageParams: { providerName: config.provider } 
      };
  }
}

// Enhanced generation with better error handling and metadata
export async function generateWithAI(
  prompt: string,
  config: AIConfig,
  type: 'subtasks' | 'plan' | 'chat' = 'subtasks'
): Promise<AIResponse> {
  try {
    if (config.provider !== 'ollama' && !config.apiKey?.trim()) {
      return {
        success: false,
        error: 'API key is required. Please configure your AI provider in Settings.'
      };
    }

    const provider = AI_PROVIDERS[config.provider];
    if (!provider) {
      return {
        success: false,
        error: `Provider '${config.provider}' is not supported.`
      };
    }

    // Route to specific provider implementations
    switch (config.provider) {
      case 'anthropic':
        return await generateWithAnthropic(prompt, config, type);
      case 'google':
        return await generateWithGemini(prompt, config, type);
      case 'perplexity':
        return await generateWithPerplexity(prompt, config, type);
      default:
        return await generateWithOpenAICompatible(prompt, config, type);
    }
  } catch (error) {
    console.error('AI API error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

async function generateWithOpenAICompatible(
  prompt: string,
  config: AIConfig,
  type: 'subtasks' | 'plan' | 'chat'
): Promise<AIResponse> {
  const provider = AI_PROVIDERS[config.provider];
  if (!provider) {
    return { success: false, error: `Invalid provider: ${config.provider}` };
  }

  const model = config.model || provider.models[0];
  const userPrompt = formatPrompt(prompt, type);
  const maxTokens = getMaxTokens(type);

  try {
    const response = await fetch(provider.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: getSystemPrompt(type) },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: maxTokens,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(await handleAPIError(response, config.provider));
    }

    const data = await response.json();
    
    if (data.choices?.[0]?.message?.content) {
      const content = data.choices[0].message.content.trim();
      const items = parseResponseContent(content);
      
      const cost = calculateCost(data.usage, model, config.provider);

      return { 
        success: true, 
        data: items,
        metadata: {
          model,
          tokensUsed: data.usage?.total_tokens,
          ...(cost !== undefined && { cost }),
        }
      };
    }

    throw new Error('No response received from AI provider.');
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

async function generateWithAnthropic(
  prompt: string,
  config: AIConfig,
  type: 'subtasks' | 'plan' | 'chat'
): Promise<AIResponse> {
  const provider = AI_PROVIDERS.anthropic;
  if (!provider) {
    return { success: false, error: "Anthropic provider not configured" };
  }

  const model = config.model || 'claude-3-5-sonnet-20240620';
  const userPrompt = formatPrompt(prompt, type);
  const maxTokens = getMaxTokens(type);

  try {
    const response = await fetch(provider.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': config.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: userPrompt }],
        max_tokens: maxTokens,
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `Anthropic API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.content?.[0]?.text) {
      const content = data.content[0].text.trim();
      const items = parseResponseContent(content);
      
      const cost = calculateCost(data.usage, model, 'anthropic');

      return { 
        success: true, 
        data: items,
        metadata: {
          model,
          tokensUsed: data.usage?.input_tokens + data.usage?.output_tokens,
          ...(cost !== undefined && { cost }),
        }
      };
    }

    throw new Error('No response received from Anthropic.');
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

async function generateWithGemini(
  prompt: string,
  config: AIConfig,
  type: 'subtasks' | 'plan' | 'chat'
): Promise<AIResponse> {
  const provider = AI_PROVIDERS.google;
  if (!provider) {
    return { success: false, error: "Google provider not configured" };
  }

  const model = config.model || 'gemini-1.5-flash';
  const userPrompt = formatPrompt(prompt, type);
  const maxTokens = getMaxTokens(type);
  
  const endpoint = `${provider.endpoint}/${model}:generateContent?key=${config.apiKey}`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: userPrompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: maxTokens,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(await handleAPIError(response, 'google'));
    }

    const data = await response.json();
    
    if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
      const content = data.candidates[0].content.parts[0].text.trim();
      const items = parseResponseContent(content);
      
      const cost = calculateCost(data.usageMetadata, model, 'google');

      return { 
        success: true, 
        data: items,
        metadata: {
          model,
          tokensUsed: data.usageMetadata?.totalTokenCount,
          ...(cost !== undefined && { cost }),
        }
      };
    }

    throw new Error('No response received from Gemini.');
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

async function generateWithPerplexity(
  prompt: string,
  config: AIConfig,
  type: 'subtasks' | 'plan' | 'chat'
): Promise<AIResponse> {
  const provider = AI_PROVIDERS.perplexity;
  if (!provider) {
    return { success: false, error: "Perplexity provider not configured" };
  }
  const model = config.model || 'llama-3-sonar-large-32k-online';
  const userPrompt = formatPrompt(prompt, type);
  const maxTokens = getMaxTokens(type);

  try {
    const response = await fetch(provider.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: userPrompt }],
        max_tokens: maxTokens,
        temperature: 0.7,
        return_citations: true,
        search_recency_filter: 'month'
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `Perplexity API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.choices?.[0]?.message?.content) {
      const content = data.choices[0].message.content.trim();
      const items = parseResponseContent(content);
      
      const cost = calculateCost(data.usage, model, 'perplexity');

      return { 
        success: true, 
        data: items,
        metadata: {
          model,
          tokensUsed: data.usage?.total_tokens,
          ...(cost !== undefined && { cost }),
          citations: data.choices[0].message.content.includes('sources') ? [] : undefined
        }
      };
    }

    throw new Error('No response received from Perplexity.');
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

// Helper functions
function getSystemPrompt(type: string): string {
  switch (type) {
    case 'subtasks':
      return 'You are a helpful assistant that breaks down tasks into clear, actionable subtasks. Return only the subtasks, one per line, without numbering or bullet points.';
    case 'plan':
      return 'You are a strategic planning assistant. Create detailed action plans with specific, implementable steps.';
    default:
      return 'You are a helpful AI assistant.';
  }
}

function formatPrompt(prompt: string, type: string): string {
  switch (type) {
    case 'subtasks':
      return `Please create detailed, step-by-step subtasks for the following task: ${prompt}. Return only the subtasks, one per line, without numbering or bullet points.`;
    case 'plan':
      return `Based on the following content, create a detailed action plan with specific steps: ${prompt}. Please provide a clear, actionable plan with steps that can be implemented.`;
    default:
      return prompt;
  }
}

function getMaxTokens(type: string): number {
  switch (type) {
    case 'subtasks': return 300;
    case 'plan': return 500;
    default: return 1000;
  }
}

function parseResponseContent(content: string): string[] {
  return content
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(line => line.replace(/^[-*•]\s*/, ''))
    .map(line => line.replace(/^\d+\.\s*/, ''));
}

async function handleAPIError(response: Response, provider: string): Promise<string> {
  try {
    const errorData = await response.json();
    
    switch (response.status) {
      case 401:
        return 'Invalid API key. Please check your API key in Settings.';
      case 400:
        return errorData.error?.message || 'Invalid request. Please check your API configuration.';
      case 429:
        return 'Rate limit exceeded. Please try again later.';
      case 503:
        if (provider === 'deepseek') {
          return 'DeepSeek service temporarily unavailable (peak hours). Try off-peak hours (16:30-00:30 UTC) for better availability.';
        }
        return 'Service temporarily unavailable. Please try again later.';
      default:
        return errorData.error?.message || `API error: ${response.status} ${response.statusText}`;
    }
  } catch {
    switch (response.status) {
      case 401: return 'Invalid API key. Please check your API key in Settings.';
      case 400: return 'Invalid request. Please check your API configuration and try again.';
      case 429: return 'Rate limit exceeded. Please try again later.';
      case 503: return 'Service temporarily unavailable. Please try again later.';
      default: return `API error: ${response.status} ${response.statusText}`;
    }
  }
}

function calculateCost(usage: any, model: string, provider: string): number | undefined {
  const providerConfig = AI_PROVIDERS[provider as keyof typeof AI_PROVIDERS];
  if (!usage || !providerConfig?.pricing?.[model]) return undefined;
  
  const pricing = providerConfig.pricing[model];
  if (!pricing) return undefined;

  const inputTokens = usage.input_tokens || usage.prompt_tokens || 0;
  const outputTokens = usage.output_tokens || usage.completion_tokens || 0;
  
  const inputCost = (inputTokens / 1000000) * pricing.input;
  const outputCost = (outputTokens / 1000000) * pricing.output;
  
  return Number((inputCost + outputCost).toFixed(6));
}