export interface OpenAIConfig {
  apiKey: string;
  apiEndpoint: string;
  model: string;
  maxTokens: number;
  temperature: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
}

export const defaultConfig: OpenAIConfig = {
  apiKey: process.env.OPENAI_API_KEY || '',
  apiEndpoint: process.env.OPENAI_API_ENDPOINT || 'https://api.openai.com/v1',
  model: process.env.OPENAI_MODEL || 'gpt-4',
  maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '1024'),
  temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7'),
  topP: parseFloat(process.env.OPENAI_TOP_P || '0.9'),
  frequencyPenalty: parseFloat(process.env.OPENAI_FREQUENCY_PENALTY || '0.0'),
  presencePenalty: parseFloat(process.env.OPENAI_PRESENCE_PENALTY || '0.0')
};

export interface OpenAIResponse {
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