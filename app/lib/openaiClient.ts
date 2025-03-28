import { OpenAIConfig, OpenAIResponse, TokenUsage } from './openai';
import OpenAI from 'openai';

// GPT-4-mini (0125) pricing
const inputCostPer1k = 0.01;  // $0.01 per 1K input tokens for GPT-4-mini
const outputCostPer1k = 0.03; // $0.03 per 1K output tokens for GPT-4-mini

const calculateCost = (usage: TokenUsage): number => {
  // OpenAI API pricing (as of 2024)
  const inputCostPer1k = 0.03;  // $0.03 per 1K input tokens for GPT-4
  const outputCostPer1k = 0.06; // $0.06 per 1K output tokens for GPT-4
  
  const inputCost = (usage.inputTokens / 1000) * inputCostPer1k;
  const outputCost = (usage.outputTokens / 1000) * outputCostPer1k;
  
  return inputCost + outputCost;
};

export class OpenAIClient {
  private config: OpenAIConfig;

  constructor(config: OpenAIConfig) {
    this.config = config;
  }

  async generateResponse(prompt: string): Promise<{
    response: string;
    usage: TokenUsage;
    fullPrompt: string;
  }> {
    const fullPrompt = `Key: ${process.env.FRACTIVERSE_KEY}\n\nUser Input: ${prompt}`;

    try {
      const response = await fetch(`${this.config.apiEndpoint}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            {
              role: 'user',
              content: fullPrompt,
            },
          ],
          max_tokens: this.config.maxTokens,
          temperature: this.config.temperature,
          top_p: this.config.topP,
          frequency_penalty: this.config.frequencyPenalty,
          presence_penalty: this.config.presencePenalty,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data: OpenAIResponse = await response.json();
      
      const usage: TokenUsage = {
        inputTokens: data.usage.prompt_tokens,
        outputTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens,
        cost: 0, // Will be calculated below
      };
      
      usage.cost = calculateCost(usage);

      return {
        response: data.choices[0].message.content,
        usage,
        fullPrompt,
      };
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      throw error;
    }
  }
} 