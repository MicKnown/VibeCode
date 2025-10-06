// Simplified VibeSDK Worker with CSP fixes
import { createApp } from './app';

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const { pathname } = url;

    // Handle all requests to serve the frontend with proper CSP headers
    if (!pathname.startsWith('/api/')) {
      // Get the response from ASSETS
      const response = await env.ASSETS.fetch(request);
      
      // If it's an HTML response, add CSP headers for Monaco Editor
      if (response.headers.get('content-type')?.includes('text/html')) {
        // Clone response to modify headers
        const newResponse = new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        });
        
        // Add CSP header that allows Monaco Editor to work
        newResponse.headers.set(
          'Content-Security-Policy',
          "default-src 'self'; " +
          "script-src 'self' 'unsafe-eval' 'unsafe-inline' data: blob:; " +
          "style-src 'self' 'unsafe-inline' data:; " +
          "worker-src 'self' blob:; " +
          "child-src 'self' blob:; " +
          "font-src 'self' data:; " +
          "img-src 'self' data: blob:; " +
          "connect-src 'self' ws: wss: https:;"
        );
        
        return newResponse;
      }
      
      return response;
    }

    // Handle API requests
    try {
      const app = createApp(env);
      return app.fetch(request, env, ctx);
    } catch (error) {
      console.error('API request failed:', error);
      return new Response('API Error', { status: 500 });
    }
  },
} satisfies ExportedHandler<Env>;

export default worker;