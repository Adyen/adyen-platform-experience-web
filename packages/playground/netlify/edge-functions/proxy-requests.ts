import { realApiProxies } from '../../src/endpoints/apis/realApiProxies.js';

export default async (request: Request, context: any) => {
    // @ts-ignore
    const {
        SESSION_API_URL,
        SESSION_PASSWORD,
        SESSION_USERNAME,
        SESSION_AUTH_TOKEN,
        SESSION_ACCOUNT_HOLDER,
        SESSION_PERMISSIONS,
        VITE_API_KEY,
        PLATFORM_COMPONENTS_URL,
    } = Netlify.env.toObject();

    const platformComponentsApi = {
        url: PLATFORM_COMPONENTS_URL ?? '',
        apiKey: VITE_API_KEY ?? '',
    };

    const sessionApi = {
        url: SESSION_API_URL ?? '',
        token: SESSION_AUTH_TOKEN ?? '',
        username: SESSION_USERNAME,
        password: SESSION_PASSWORD,
        accountHolder: SESSION_ACCOUNT_HOLDER,
        permissions: SESSION_PERMISSIONS,
    };

    const apis = realApiProxies({ platformComponentsApi, sessionApi });

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
