import { openai } from '@/lib/openai';
import { NextResponse } from 'next/server';

export const maxDuration = 60;

export async function POST(req: Request) {
  console.log('--- BLUEPRINT COLORIZER START ---');
  try {
    const { image, style, customInstructions } = await req.json();

    if (!image) {
      console.warn('Validation failed: missing blueprint image');
      return NextResponse.json(
        { error: 'Missing blueprint image' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is missing');
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    console.log('Analyzing blueprint layout...');
    // 1. Analyze the blueprint using GPT-4o-mini
    const visionResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: [
            { 
              type: 'text', 
              text: 'Analyze this architectural blueprint. Describe the detailed layout, specific rooms, and dimensions indicated. Focus on providing a description for a 2D colored floor plan. Identify areas for wood flooring, tiling, grass, or specific wall colors.' 
            },
            {
              type: 'image_url',
              image_url: {
                url: image,
              },
            },
          ],
        },
      ],
    });

    const analysis = visionResponse.choices[0].message.content;
    console.log('Blueprint analysis complete.');

    // Style mapping for 2D coloring
    const styles: Record<string, string> = {
      'Modern Minimalist': 'clean white palette, light oak wood floors, grey tiles, minimalist aesthetic',
      'Warm Professional': 'rich walnut flooring, beige walls, soft accent lighting, executive feel',
      'Industrial Loft': 'concrete floor textures, exposed red brick accents, black metal outlines',
      'Eco-Green': 'bamboo flooring, vertical green wall textures, natural stone surfaces',
      'Classic Blueprint': 'aesthetic blue and white coloring with realistic texture overlays',
    };

    const styleDesc = styles[style] || styles['Modern Minimalist'];
    
    // 2. Generate 2D Colored Drawing using DALL-E 3
    console.log('Generating 2D colored blueprint (DALL-E 3)...');
    const dallePrompt = `A high-quality 2D colored architectural floor plan based on this layout: ${analysis}. The rendering style is ${styleDesc}. ${customInstructions || ''}. This must be a TOP-DOWN 2D plan view only. No 3D perspectives, no isometric views. Use professional architectural markers and realistic texture overlays for flooring and furniture. Flat 2D vector-style with realistic shading. 8k resolution, crisp lines.`;

    const imageResponse = await openai.images.generate({
      model: 'dall-e-3',
      prompt: dallePrompt,
      n: 1,
      size: '1024x1024',
      quality: 'hd',
    });

    if (!imageResponse.data || imageResponse.data.length === 0) {
      throw new Error('No colored blueprint was generated');
    }

    const imageUrl = imageResponse.data[0].url;
    console.log('Colorization successful.');
    console.log('--- BLUEPRINT COLORIZER SUCCESS ---');

    return NextResponse.json({
      imageUrl,
      analysis
    });

  } catch (error: any) {
    console.error('--- BLUEPRINT COLORIZER ERROR ---');
    console.error(error);
    return NextResponse.json(
      { error: error?.message || 'Failed to colorize blueprint' },
      { status: error?.status || 500 }
    );
  }
}
