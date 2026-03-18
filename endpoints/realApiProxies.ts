import type { ProxyOptions } from 'vite';
import type { Environment } from '../envs/getEnvs';

type ApiConfig = Environment['api'];
type SessionConfig = ApiConfig['session'];

const makeSessionProxyOptions = ({ url, apiKey }: SessionConfig, mode: string): ProxyOptions => {
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

export const realApiProxies = (configs: ApiConfig, mode: string): Record<string, ProxyOptions> => {
    const { session } = configs;
    return {
        ['/api/authe/api/v1/sessions']: makeSessionProxyOptions(session, mode),
    };
};
