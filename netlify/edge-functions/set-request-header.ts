export default async (request: Request, context: any) => {
    // @ts-ignore
    const API_KEY = Deno.env.get('VITE_API_KEY');

    request.headers.set('Access-Control-Allow-Origin', '*');
    request.headers.set('Content-Type', 'application/json');
    request.headers.set('X-Api-Key', API_KEY);
};
