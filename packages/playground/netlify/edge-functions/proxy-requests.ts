import { realApiProxies } from '../../src/endpoints/apis/realApiProxies.js';

export default async (request: Request, context: any) => {
    // @ts-ignore
    const { SESSION_API_URL, SESSION_ACCOUNT_HOLDER, SESSION_PERMISSIONS, VITE_API_KEY, PLATFORM_COMPONENTS_URL } = Netlify.env.toObject();

    const platformComponentsApi = {
        url: PLATFORM_COMPONENTS_URL ?? '',
        apiKey: VITE_API_KEY ?? '',
    };

    const sessionApi = {
        url: SESSION_API_URL ?? '',
        apiKey: VITE_API_KEY,
        accountHolder: SESSION_ACCOUNT_HOLDER,
        permissions: SESSION_PERMISSIONS,
    };

    const apis = realApiProxies({ platformComponentsApi, sessionApi }, 'netlify');

    const url = new URL(request.url);

    // Find the matching API proxy configuration based on the pathname.
    const [match, apiConfig] = Object.entries(apis).find(([apiPath]) => new RegExp(apiPath).test(url.pathname)) || [];

    if (!match || !apiConfig) return;

    try {
        const res = await fetch(`${apiConfig.target}/${url.search ?? ''}`, {
            headers: apiConfig.headers,
            method: request.method,
        });
        const data = await res.json();
        // @ts-ignore
        return Response.json(data);
    } catch (err) {
        console.log(err);
    }
};
