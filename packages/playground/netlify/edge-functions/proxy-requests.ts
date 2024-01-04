import { realApiProxies } from '../../src/endpoints/apis/realApiProxies.js';

export default async (request: Request, context: any) => {
    // @ts-ignore
    const { BCL_API_URL, BTL_API_URL, LEM_API_URL, VITE_API_KEY, LEM_API_KEY, LOOP_API_URL, SESSION_API_URL, SESSION_TOKEN, SESSION_COOKIE } =
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

    const loopApi = {
        url: LOOP_API_URL ?? '',
        apiKey: VITE_API_KEY ?? '',
    };

    const sessionApi = {
        url: SESSION_API_URL ?? '',
        token: SESSION_TOKEN ?? '',
        cookie: SESSION_COOKIE ?? '',
    };

    const apis = realApiProxies({ lemApi, btlApi, bclApi, loopApi, sessionApi });

    const url = new URL(request.url);

    // Find the matching API proxy configuration based on the pathname.
    const [match, apiConfig] = Object.entries(apis).find(([apiPath]) => url.pathname.startsWith(apiPath)) || [];

    if (!match || !apiConfig) return;

    try {
        const res = await fetch(`${apiConfig.target}${url.pathname.replace('/api/', '/')}${url.search ?? ''}`, {
            headers: apiConfig.headers,
        });
        const data = await res.json();
        // @ts-ignore
        return Response.json(data);
    } catch (err) {
        console.log(err);
    }
};
