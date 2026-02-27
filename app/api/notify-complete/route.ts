import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const NotifySchema = z.object({
  sessionId: z.string(),
  clientEmail: z.string().email().optional(),
  os: z.enum(['windows', 'mac']).optional(),
  toolsInstalled: z.number().optional(),
  errors: z.number().optional(),
  durationSeconds: z.number().optional(),
});

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = NotifySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: result.error.issues },
        { status: 400, headers: corsHeaders }
      );
    }

    const { sessionId, clientEmail, os, toolsInstalled, errors, durationSeconds } = result.data;

    // Log the completion — visible in Vercel function logs
    console.log('[notify-complete]', JSON.stringify({
      sessionId,
      clientEmail: clientEmail || 'not provided',
      os: os || 'unknown',
      toolsInstalled: toolsInstalled ?? 0,
      errors: errors ?? 0,
      durationSeconds: durationSeconds ?? 0,
      timestamp: new Date().toISOString(),
    }));

    return NextResponse.json(
      {
        success: true,
        message: clientEmail
          ? `Setup complete logged for ${clientEmail}`
          : 'Setup complete logged',
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('[notify-complete] error:', error);
    return NextResponse.json(
      { error: 'Failed to process notification' },
      { status: 500, headers: corsHeaders }
    );
  }
}
