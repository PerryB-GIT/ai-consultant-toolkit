import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// API-04: Email notification on install complete.
// Resend is not installed (not in package.json). To enable email:
//   1. Run: npm install resend
//   2. Add RESEND_API_KEY to Vercel environment variables
//   3. Uncomment the Resend block below.
//
// Alternatively, if using SendGrid:
//   1. Run: npm install @sendgrid/mail
//   2. Add SENDGRID_API_KEY to Vercel environment variables
//   3. Use sgMail.send(...) instead.

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

    // API-04: Send email notification (requires RESEND_API_KEY env var + `npm install resend`)
    // To activate: install resend, uncomment the import at the top and the block below.
    //
    // import { Resend } from 'resend';
    // try {
    //   const resend = new Resend(process.env.RESEND_API_KEY);
    //   await resend.emails.send({
    //     from: 'noreply@support-forge.com',
    //     to: 'perry@support-forge.com',
    //     subject: `Setup complete — ${clientEmail || 'unknown client'}`,
    //     text: `Client setup completed.\n\nSession: ${sessionId}\nClient: ${clientEmail || 'not provided'}\nOS: ${os || 'unknown'}\nTime: ${new Date().toISOString()}`
    //   });
    // } catch (emailError) {
    //   console.error('[notify-complete] email send failed:', emailError);
    //   // Do not rethrow — a failed email must not break the endpoint response
    // }

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
