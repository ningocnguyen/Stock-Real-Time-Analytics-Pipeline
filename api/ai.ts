import { handleAiRequest } from '../server/ai';

export async function POST(request: Request): Promise<Response> {
  try {
    const contentLength = Number(request.headers.get('content-length') || 0);
    if (contentLength > 12_000) return Response.json({ error: 'Request too large.' }, { status: 413 });
    const body = await request.text();
    if (body.length > 12_000) return Response.json({ error: 'Request too large.' }, { status: 413 });
    const result = await handleAiRequest(JSON.parse(body));
    return Response.json(result.body, { status: result.status });
  } catch {
    return Response.json({ error: 'Invalid JSON.' }, { status: 400 });
  }
}
