import { openai } from '@/lib/openai';
import { NextResponse } from 'next/server';

// Increase timeout for Vercel (up to 60 seconds if supported by account)
export const maxDuration = 60;

export async function POST(req: Request) {
  console.log('--- STYLIST API START ---');
  try {
    const body = await req.json();
    console.log('Request body:', JSON.stringify(body, null, 2));

    const { occasion, weather, styleVibe, customPreferences } = body;

    if (!occasion || !weather) {
      console.warn('Validation failed: missing occasion or weather');
      return NextResponse.json(
        { error: 'Missing occasion or weather' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is missing from environment variables');
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      );
    }

    console.log('Generating style analysis with GPT-4o-mini...');
    // 1. Generate Style Analysis using GPT-4o-mini
    const styleResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a high-end celebrity fashion stylist. 
          Your task is to:
          1. Recommend a complete outfit for a specific occasion and weather.
          2. Include main clothing items, shoes, and accessories (watch, jewelry, bag).
          3. Explain the style rationale (why this works for the weather/occasion).
          4. Describe the color palette.
          
          Return your response in strict JSON format:
          {
            "outfitDescription": "...",
            "items": ["list of key items"],
            "rationale": "...",
            "palette": ["list of colors"],
            "dallePrompt": "A professional high-fashion mood board containing..."
          }`
        },
        {
          role: 'user',
          content: `Occasion: ${occasion}
          Weather: ${weather}
          Vibe: ${styleVibe}
          Extra Preferences: ${customPreferences || 'None'}
          
          Requirements for DALL-E prompt:
          - High-end fashion mood board style.
          - Professional studio lighting.
          - Aesthetic arrangement of clothing items and accessories.
          - Clean, elegant composition.
          - No people, just the flatlay or mannequin arrangement.
          - 8k resolution, Vogue aesthetic.`
        }
      ],
      response_format: { type: 'json_object' }
    });

    const analysis = JSON.parse(styleResponse.choices[0].message.content || '{}');
    console.log('Style analysis complete:', JSON.stringify(analysis, null, 2));

    console.log('Generating image with DALL-E 3 (this can take 15-20 seconds)...');
    // 2. Generate Style Visual using DALL-E 3
    const imageResponse = await openai.images.generate({
      model: 'dall-e-3',
      prompt: analysis.dallePrompt,
      n: 1,
      size: '1024x1024',
      quality: 'hd',
    });

    if (!imageResponse.data || imageResponse.data.length === 0) {
      console.error('DALL-E 3 returned no image data');
      throw new Error('No style board was generated');
    }

    const imageUrl = imageResponse.data[0].url;
    console.log('Image generation successful:', imageUrl?.substring(0, 50) + '...');

    console.log('--- STYLIST API SUCCESS ---');
    return NextResponse.json({
      imageUrl,
      analysis: {
        outfitDescription: analysis.outfitDescription,
        items: analysis.items,
        rationale: analysis.rationale,
        palette: analysis.palette
      }
    });

  } catch (error: any) {
    console.error('--- STYLIST API ERROR ---');
    console.error('Full error details:', error);
    
    let errorMessage = 'Failed to generate style';
    if (error?.status === 401) errorMessage = 'Invalid OpenAI API Key';
    if (error?.status === 429) errorMessage = 'OpenAI rate limit exceeded or insufficient credits';
    
    return NextResponse.json(
      { error: error?.message || errorMessage },
      { status: error?.status || 500 }
    );
  }
}
