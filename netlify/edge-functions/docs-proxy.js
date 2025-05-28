export default async (request, context) => {
    const url = new URL(request.url);

    // Replace the origin with the docs site URL
    const docsUrl = url.href.replace(
        'https://codexeditor.app/docs',
        'https://codex-documentation.netlify.app/docs'
    );

    try {
        // Fetch from the docs site
        const response = await fetch(docsUrl, {
            method: request.method,
            headers: request.headers,
            body: request.method !== 'GET' && request.method !== 'HEAD' ? await request.text() : undefined,
        });

        // Return the response, preserving headers
        return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
        });
    } catch (error) {
        return new Response('Error proxying to documentation site', { status: 500 });
    }
};

export const config = {
    path: "/docs/*",
}; 