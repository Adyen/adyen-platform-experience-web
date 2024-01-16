import { realApiProxies } from '../../src/endpoints/apis/realApiProxies.js';

export default async (request: Request, context: any) => {
    // @ts-ignore
    const { BCL_API_URL, BTL_API_URL, LEM_API_URL, VITE_API_KEY, LEM_API_KEY, PLATFORM_COMPONENTS_URL, SESSION_API_URL, SESSION_AUTH_TOKEN } =
        Netlify.env.toObject();

    const lemApi = {
        url: LEM_API_URL,
        apiKey: LEM_API_KEY,
    };

    const bclApi = {
        url: BCL_API_URL,
        apiKey: VITE_API_KEY,
    };

    const btlApi = {
        url: BTL_API_URL,
        apiKey: VITE_API_KEY,
    };

    const platformComponentsApi = {
        url: PLATFORM_COMPONENTS_URL ?? '',
        apiKey: VITE_API_KEY ?? '',
    };

    const sessionApi = {
        url: SESSION_API_URL ?? '',
        token: SESSION_AUTH_TOKEN ?? '',
    };

    const apis = realApiProxies({ lemApi, btlApi, bclApi, platformComponentsApi, sessionApi });

    const url = new URL(request.url);

    // Find the matching API proxy configuration based on the pathname.
    const [match, apiConfig] = Object.entries(apis).find(([apiPath]) => url.pathname.startsWith(apiPath)) || [];

    if (!match || !apiConfig) {
        try {
            const res = await fetch(request.url, {
                headers: { ...request.headers, req: request.url, origin: url.origin },
            });
            const data = await res.json();
            // @ts-ignore
            return Response.json(request);
        } catch (err) {
            console.log(err);
        }
    } else {
        try {
            const res = await fetch(`${apiConfig.target}${url.pathname.replace('/api/', '/')}${url.search ?? ''}`, {
                headers: { ...apiConfig.headers, req: request.url, url: url },
            });
            const data = await res.json();
            // @ts-ignore
            return Response.json(request);
        } catch (err) {
            console.log(err);
        }
    }
};
