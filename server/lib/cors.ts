export function corsHeaders(): HeadersInit {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

export function json(data: unknown, status = 200): Response {
  return Response.json(data, { status, headers: corsHeaders() });
}

export function emptyOptions(): Response {
  return new Response(null, { status: 204, headers: corsHeaders() });
}
