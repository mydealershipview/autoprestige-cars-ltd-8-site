export async function POST(): Promise<Response> {
  return new Response('Frontend seed endpoint is disabled for this template.', {
    status: 410,
  })
}
