import { openai } from '@/lib/openai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { image, productDescription, backgroundStyle, customPrompt } = await req.json();

    if (!image && !productDescription) {
      return NextResponse.json(
        { error: 'Missing product information' },
        { status: 400 }
      );
    }

    let finalProductDescription = productDescription;

    // If an image is provided, use GPT-4o to describe it first (Visual to Text)
    if (image && !productDescription) {
      const visionResponse = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Describe the main product in this image in detail. Focus on its shape, color, materials, and unique features. Keep it to one paragraph.' },
              {
                type: 'image_url',
                image_url: {
                  url: image, // base64 or URL
                },
              },
            ],
          },
        ],
      });
      finalProductDescription = visionResponse.choices[0].message.content;
    }

    // Prepare the background description
    const styles: Record<string, string> = {
      'Minimalist Studio': 'clean, soft-lit professional studio setting with a neutral light-grey background',
      'Luxury Marble': 'opulent white marble surface with elegant reflections and soft warm lighting',
      'Industrial Concrete': 'raw industrial concrete surface with dramatic shadows and atmospheric lighting',
      'Soft Silk': 'draped luxurious silk fabric in soft neutral tones with gentle folds and highlights',
      'Nature Green': 'fresh natural setting with blurred green leaves in the background and natural sunlight',
    };

    const styleDesc = styles[backgroundStyle] || styles['Minimalist Studio'];
    
    // 2. Generate New Image using DALL-E 3
    const dallePrompt = `A high-end, professional commercial product photograph of ${finalProductDescription || 'a luxury product'}. The product is placed in a ${styleDesc}. ${customPrompt || ''} The lighting is cinematic and perfectly showcases the product's details. High resolution, 8k, sharp focus, clean composition. Commercial photography style.`;

    const imageResponse = await openai.images.generate({
      model: 'dall-e-3',
      prompt: dallePrompt,
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
      description: finalProductDescription
    });

  } catch (error: any) {
    console.error('Swap error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to swap background' },
      { status: 500 }
    );
  }
}
