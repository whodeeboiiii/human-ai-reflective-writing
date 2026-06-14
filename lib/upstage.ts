import { createOpenAI } from '@ai-sdk/openai';

const _upstage = createOpenAI({
  apiKey: process.env.UPSTAGE_API_KEY ?? '',
  baseURL: 'https://api.upstage.ai/v1',
});

// Use .chat() to force the Chat Completions endpoint (/chat/completions).
// The default upstage() call uses the newer /responses endpoint which Upstage does not support.
export const upstage = (modelId: string) => _upstage.chat(modelId);

export const SOLAR_MODEL = 'solar-pro3';
