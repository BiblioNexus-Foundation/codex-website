export default async (request, context) => {
    const url = new URL(request.url);

    // Rewrite the URL to point to our serverless function
    url.pathname = '/.netlify/functions/getLatestRelease';

    // Forward the request to our serverless function
    const response = await fetch(url.toString());

    // Cache the response for 1 hour
    const headers = new Headers(response.headers);
    headers.set('Cache-Control', 'public, max-age=3600');

    return new Response(response.body, {
        status: response.status,
        headers
    });
};