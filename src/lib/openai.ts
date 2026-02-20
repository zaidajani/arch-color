import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  // We'll handle this in the route handlers with a friendly error
  console.warn('Warning: OPENAI_API_KEY is not defined in the environment.');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});
