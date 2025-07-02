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

export const realApiProxies = (configs, mode) => {
    const { sessionApi } = configs;
    return {
        ['/api/authe/api/v1/sessions']: makeSessionProxyOptions(sessionApi, mode),
    };
};
