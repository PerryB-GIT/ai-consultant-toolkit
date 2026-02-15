import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import { z } from 'zod';

// Error log entry schema
const ErrorLogEntrySchema = z.object({
  tool: z.string(),
  error: z.string(),
  suggestedFix: z.string(),
  timestamp: z.string(),
  step: z.number(),
});

type ErrorLogEntry = z.infer<typeof ErrorLogEntrySchema>;

// TTL: 1 hour (same as progress data)
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

// GET: Retrieve all errors with suggested fixes
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

    const key = `progress:${sessionId}:log`;
    const errors = await kv.get<ErrorLogEntry[]>(key);

    if (!errors) {
      return NextResponse.json(
        { errors: [] },
        { headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { errors },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Error retrieving error log:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve error log' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// POST: Append to error log
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
    const validationResult = ErrorLogEntrySchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid error log entry',
          details: validationResult.error.issues,
        },
        { status: 400, headers: corsHeaders }
      );
    }

    const errorEntry = validationResult.data;
    const key = `progress:${sessionId}:log`;

    // Get existing errors or initialize empty array
    const existingErrors = await kv.get<ErrorLogEntry[]>(key) || [];

    // Append new error
    const updatedErrors = [...existingErrors, errorEntry];

    // Store updated log with TTL
    await kv.set(key, updatedErrors, { ex: TTL_SECONDS });

    return NextResponse.json(
      {
        success: true,
        sessionId,
        totalErrors: updatedErrors.length,
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Error appending to error log:', error);
    return NextResponse.json(
      { error: 'Failed to append to error log' },
      { status: 500, headers: corsHeaders }
    );
  }
}
