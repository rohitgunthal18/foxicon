import { NextResponse } from 'next/server';
import { z } from 'zod';

import { getCurrentAdmin } from '@/lib/supabase/dal';
import { getSarvamCredentials } from '@/lib/settings';

const audioQuerySchema = z.object({
  interaction_id: z.string().trim().min(1, 'Interaction ID is required'),
});

/**
 * GET /api/agent/audio?interaction_id=xxx — proxy call recording audio.
 *
 * Fetches the raw binary WAV audio file from Sarvam Analytics API using the
 * server's X-API-Key and streams it back to the client. This bypasses Sarvam's
 * session authentication requirement for playing call recordings.
 */
export async function GET(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Not authorised.' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const interactionId = searchParams.get('interaction_id');

  const parsed = audioQuerySchema.safeParse({ interaction_id: interactionId });
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Missing or invalid interaction_id.' },
      { status: 422 }
    );
  }

  try {
    const creds = await getSarvamCredentials();
    if (!creds.apiKey || !creds.orgId || !creds.workspaceId || !creds.appId) {
      return NextResponse.json({ error: 'Sarvam credentials not configured.' }, { status: 503 });
    }

    const url = `https://apps.sarvam.ai/api/analytics/v1/${creds.orgId}/${creds.workspaceId}/${creds.appId}/recordings/${parsed.data.interaction_id}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-API-Key': creds.apiKey,
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch recording from Sarvam.' },
        { status: response.status }
      );
    }

    // Stream the audio data back to the browser
    return new Response(response.body, {
      status: 200,
      headers: {
        'Content-Type': 'audio/wav',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('[api/agent/audio] error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
