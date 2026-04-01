export async function GET(): Promise<Response> {
  return new Response('Frontend preview endpoint is disabled for this template.', {
    status: 410,
  })
}
