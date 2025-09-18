export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export function createCorsResponse(data: unknown, status: number = 200) {
  return Response.json(data, { status, headers: corsHeaders });
}

export function handleOptionsRequest() {
  return new Response(null, { status: 200, headers: corsHeaders });
}
