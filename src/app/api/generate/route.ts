import { openai } from '@/lib/openai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { brandName, tagline, industry, personality, colorVibe } = await req.json();

    if (!brandName || !industry || !personality) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 1. Generate Brand Analysis and DALL-E Prompt using GPT
    const analysisResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a professional brand strategist and logo designer. 
          Your task is to analyze a brand and create:
          1. A detailed, professional logo generation prompt for DALL-E 3.
          2. A color psychology analysis including primary and secondary colors.
          3. Hex codes for the palette.
          
          Return your response in strict JSON format:
          {
            "dallePrompt": "...",
            "primaryColor": { "hex": "#...", "meaning": "..." },
            "secondaryColors": [ { "hex": "#...", "label": "..." } ],
            "rationale": "..."
          }`
        },
        {
          role: 'user',
          content: `Brand Name: ${brandName}
          Tagline: ${tagline || 'None'}
          Industry: ${industry}
          Personality: ${personality}
          Preferred Vibe: ${colorVibe || 'Default for personality'}
          
          Requirements for DALL-E prompt:
          - Clean, minimalist, professional logo design.
          - Vector style, high resolution.
          - Flat design or subtle gradients.
          - Isolated on a WHITE background.
          - No realistic photos, no complex backgrounds.
          - Focus on scalability and modern branding.`
        }
      ],
      response_format: { type: 'json_object' }
    });

    const analysis = JSON.parse(analysisResponse.choices[0].message.content || '{}');

    // 2. Generate Logo using DALL-E 3
    const imageResponse = await openai.images.generate({
      model: 'dall-e-3',
      prompt: analysis.dallePrompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
    });

    if (!imageResponse.data || imageResponse.data.length === 0) {
      throw new Error('No image was generated');
    }

    const imageUrl = imageResponse.data[0].url;

    return NextResponse.json({
      imageUrl,
      analysis
    });

  } catch (error: any) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to generate logo' },
      { status: 500 }
    );
  }
}
