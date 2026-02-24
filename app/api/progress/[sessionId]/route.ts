import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import { z } from 'zod';

// Progress data schema
const ToolStatusSchema = z.object({
  status: z.enum(['pending', 'installing', 'success', 'error', 'skipped']),
  version: z.string().optional(),
  error: z.string().optional(),
});

const ProgressErrorSchema = z.object({
  tool: z.string(),
  error: z.string(),
  suggestedFix: z.string(),
});

const ProgressDataSchema = z.object({
  sessionId: z.string(),
  currentStep: z.number(),
  completedSteps: z.array(z.number()),
  currentAction: z.string(),
  toolStatus: z.record(z.string(), ToolStatusSchema),
  errors: z.array(ProgressErrorSchema),
  timestamp: z.string(),
  phase: z.enum(['phase1', 'phase2']),
  complete: z.boolean(),
});

type ProgressData = z.infer<typeof ProgressDataSchema>;

// TTL: 1 hour
const TTL_SECONDS = 3600;

// CORS headers for local script access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// GET: Retrieve current progress
export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    const key = `progress:${sessionId}`;
    const data = await kv.get<ProgressData>(key);

    if (!data) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(data, { headers: corsHeaders });
  } catch (error) {
    console.error('Error retrieving progress:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve progress' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// POST: Store progress updates
export async function POST(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    const body = await request.json();

    // Validate the request body
    const validationResult = ProgressDataSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid progress data',
          details: validationResult.error.issues,
        },
        { status: 400, headers: corsHeaders }
      );
    }

    const progressData = validationResult.data;

    // Ensure sessionId matches
    if (progressData.sessionId !== sessionId) {
      return NextResponse.json(
        { error: 'Session ID mismatch' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Store in Vercel KV with TTL
    const key = `progress:${sessionId}`;
    await kv.set(key, progressData, { ex: TTL_SECONDS });

    return NextResponse.json(
      { success: true, sessionId },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Error storing progress:', error);
    return NextResponse.json(
      { error: 'Failed to store progress' },
      { status: 500, headers: corsHeaders }
    );
  }
}
