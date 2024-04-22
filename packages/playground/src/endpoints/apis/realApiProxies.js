import { endpoints } from '../endpoints.ts';

const makeProxyOptions = ({ url, version, username, password, apiKey }, basicAuth = false) => ({
    target: `${url}${version ?? ''}`,
    ...(apiKey ? {} : { auth: `${username}:${password}` }),
    headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
    },
    changeOrigin: true,
    secure: false,
    rewrite: path => path.replace(/^\/api/, ''),
    configure: (proxy, _options) => {
        proxy.on('proxyReq', async (proxyReq, req, _res) => {
            console.log(
                'Sending Request:',
                req.method,
                req.url,
                ' => TO THE TARGET =>  ',
                proxyReq.method,
                proxyReq.protocol,
                proxyReq.host,
                proxyReq.path
            );
        });
    },
});

const makeSessionProxyOptions = ({ url, apiKey }) => {
    return {
        target: `${url}`,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'X-Api-Key': apiKey,
        },
        changeOrigin: true,
        secure: false,
        rewrite: path => path.replace(/^\/api/, ''),
        configure: (proxy, _options) => {
            proxy.on('proxyReq', async (proxyReq, req, _res) => {
                Object.entries(req.headers).forEach(([key, value]) => {
                    if (value) {
                        if (key.toLowerCase() === 'X-Api-Key') {
                            proxyReq.setHeader(key, value);
                        }
                    }
                });

                console.log(
                    'Sending Request:',
                    req.method,
                    req.url,
                    ' => TO THE TARGET =>  ',
                    proxyReq.method,
                    proxyReq.protocol,
                    proxyReq.host,
                    proxyReq.path
                );
            });
        },
    };
};

export const realApiProxies = (configs, mode) => {
    const { sessionApi } = configs;
    const sessionApiProxyOptions = makeSessionProxyOptions(sessionApi);

    const endpointRegex = mode === 'netlify' ? endpoints('netlify') : endpoints('viteDev');

    return {
        [endpointRegex.sessions]: sessionApiProxyOptions,
    };
};
