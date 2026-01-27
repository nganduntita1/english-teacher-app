import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { generateWithGroq } from '@/lib/groq';
import { generateCompleteLesson } from '@/lib/contentGenerator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { level = 'beginner', topic } = body;

    // Validate level
    if (!['beginner', 'intermediate', 'advanced'].includes(level)) {
      return NextResponse.json(
        { error: 'Invalid level. Must be beginner, intermediate, or advanced.' },
        { status: 400 }
      );
    }

    // Create authenticated Supabase client from Authorization header or cookies
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');

    let supabase;
    if (authHeader) {
      supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          global: { headers: { Authorization: authHeader } },
          auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
        }
      );
    } else {
      const cookieStore = await cookies();
      supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll: () => cookieStore.getAll().map(c => ({ name: c.name, value: c.value })),
            setAll: () => {}, // No-op for API routes
          },
        }
      );
    }

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    // Generate content with authenticated client
    const result = await generateCompleteLesson(level, topic, supabase);

    return NextResponse.json(
      {
        success: true,
        message: 'Lesson generated successfully',
        data: result,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in generate-content route:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check status
export async function GET() {
  return NextResponse.json({
    status: 'Content generation API is running',
    endpoints: {
      POST: '/api/generate-content',
      body: {
        level: 'beginner | intermediate | advanced',
        topic: 'optional lesson topic',
      },
    },
  });
}
