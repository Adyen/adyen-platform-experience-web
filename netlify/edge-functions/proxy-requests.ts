// eslint-disable-next-line import/extensions
import { realApiProxies } from '../../endpoints/realApiProxies.js';

export default async (request: Request, context: any) => {
    // @ts-ignore
    const { SESSION_API_URL, SESSION_ACCOUNT_HOLDER, SESSION_PERMISSIONS, VITE_API_KEY } = Netlify.env.toObject();

    const sessionApi = {
        url: SESSION_API_URL ?? '',
        apiKey: VITE_API_KEY,
        accountHolder: SESSION_ACCOUNT_HOLDER,
        permissions: SESSION_PERMISSIONS,
    };

    const apis = realApiProxies({ sessionApi }, 'netlify');
    const url = new URL(request.url);

    // Find the matching API proxy configuration based on the pathname.
    const [match, apiConfig] = Object.entries(apis).find(([apiPath]) => new RegExp(apiPath).test(url.pathname)) || [];

    if (!match || !apiConfig) return;

    try {
        const fetchUrl = `${apiConfig.target}${url.pathname.replace('/api/', '/')}${url.search ?? ''}`;

        const res = await fetch(fetchUrl, {
            method: request.method,
            headers: { ...request.headers, ...apiConfig.headers },
            ...(request.method === 'POST' ? { body: request.body } : {}),
        });

        // @ts-ignore
        return Response.json(await res.json());
    } catch (err) {
        console.log(err);
    }
};
