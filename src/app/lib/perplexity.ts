export interface PerplexityConfig {
  apiKey: string;
  apiEndpoint: string;
  model: string;
  maxTokens: number;
  temperature: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
}

export const defaultConfig: PerplexityConfig = {
  apiKey: process.env.PERPLEXITY_API_KEY || '',
  apiEndpoint: process.env.PERPLEXITY_API_ENDPOINT || 'https://api.perplexity.ai',
  model: process.env.PERPLEXITY_MODEL || 'pplx-7b-online',
  maxTokens: parseInt(process.env.PERPLEXITY_MAX_TOKENS || '1024'),
  temperature: parseFloat(process.env.PERPLEXITY_TEMPERATURE || '0.7'),
  topP: parseFloat(process.env.PERPLEXITY_TOP_P || '0.9'),
  frequencyPenalty: parseFloat(process.env.PERPLEXITY_FREQUENCY_PENALTY || '0.0'),
  presencePenalty: parseFloat(process.env.PERPLEXITY_PRESENCE_PENALTY || '0.0')
};

export interface PerplexityResponse {
  id: string;
  model: string;
  created: number;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cost: number;
} 