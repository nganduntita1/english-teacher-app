import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateCompleteLesson } from '@/lib/contentGenerator';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Vercel Hobby: 10s, Pro: 60s

export async function GET(request: NextRequest) {
  try {
    // Verify authorization (Vercel Cron sends Authorization header)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'dev-secret';
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Create service role client for server-side operations
    // Service role bypasses RLS policies
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      }
    );

    const results = [];
    const levels: ('beginner' | 'intermediate' | 'advanced')[] = ['beginner', 'intermediate'];

    // Generate 2 lessons (one beginner, one intermediate)
    for (const level of levels) {
      try {
        const result = await generateCompleteLesson(level, undefined, supabase);
        results.push({
          level,
          success: true,
          lessonId: result.lessonId,
          lesson: result.lesson,
          vocabularyCount: result.vocabularyCount,
          quizCount: result.quizCount,
        });
      } catch (error) {
        console.error(`Error generating ${level} lesson:`, error);
        results.push({
          level,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    const successCount = results.filter(r => r.success).length;

    return NextResponse.json({
      success: true,
      message: `Daily content generation complete: ${successCount}/${levels.length} lessons created`,
      timestamp: new Date().toISOString(),
      results,
    });

  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
