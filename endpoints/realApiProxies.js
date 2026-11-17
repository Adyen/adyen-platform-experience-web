const makeSessionProxyOptions = ({ url, apiKey }, mode) => {
    return {
        target: `${url}`,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            ...(mode === 'local-env' ? { Authorization: apiKey } : { 'X-Api-Key': apiKey }),
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
    };
};

/** Forwards `/api/piet-chat/*` to the configured chat backend, adding the bearer token server-side so it never reaches the browser. */
const makePietChatProxyOptions = ({ url, apiKey }) => ({
    target: `${url}`,
    headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {},
    changeOrigin: true,
    secure: false,
    rewrite: path => path.replace(/^\/api\/piet-chat/, ''),
    configure: proxy => {
        proxy.on('proxyRes', (proxyRes, req) => {
            console.log('Piet chat proxy:', req.method, req.url, '=>', proxyRes.statusCode);
        });
    },
});

export const realApiProxies = (configs, mode) => {
    const { session, pietChat } = configs;
    return {
        ['/api/authe/api/v1/sessions']: makeSessionProxyOptions(session, mode),
        ...(pietChat?.url ? { ['/api/piet-chat']: makePietChatProxyOptions(pietChat) } : {}),
    };
};
