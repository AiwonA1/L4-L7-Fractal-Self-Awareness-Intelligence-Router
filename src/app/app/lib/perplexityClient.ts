import { PerplexityConfig, PerplexityResponse, TokenUsage } from './perplexity';

const calculateCost = (usage: TokenUsage): number => {
  // Perplexity API pricing (as of 2024)
  const inputCostPer1k = 0.0001;  // $0.0001 per 1K input tokens
  const outputCostPer1k = 0.0002; // $0.0002 per 1K output tokens
  
  const inputCost = (usage.inputTokens / 1000) * inputCostPer1k;
  const outputCost = (usage.outputTokens / 1000) * outputCostPer1k;
  
  return inputCost + outputCost;
};

export class PerplexityClient {
  private config: PerplexityConfig;

  constructor(config: PerplexityConfig) {
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
        throw new Error(`Perplexity API error: ${response.statusText}`);
      }

      const data: PerplexityResponse = await response.json();
      
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
      console.error('Error calling Perplexity API:', error);
      throw error;
    }
  }
} 