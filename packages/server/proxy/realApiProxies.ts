import { ProxyOptions } from 'vite';
import getHeaders from '../utils/getHeaders';

interface ApiOptions {
    url: string;
    version?: string;
    username: string;
    password: string;
    apiKey?: string;
}

const makeProxyOptions = ({ url, version, username, password, apiKey }: ApiOptions): ProxyOptions => ({
    target: `${url}${version ?? ''}`,
    ...(apiKey ? {} : { auth: `${username}:${password}` }),
    headers: getHeaders(undefined, apiKey),
    changeOrigin: true,
});

export const realApiProxies = (lemApiOptions: ApiOptions, btlApiOptions: ApiOptions, bclApiOptions: ApiOptions): Record<string, ProxyOptions> => {
    const lemApiProxyOptions = makeProxyOptions(lemApiOptions);
    const btlApiProxyOptions = makeProxyOptions(btlApiOptions);
    const bclApiProxyOptions = makeProxyOptions(bclApiOptions);
    return {
        '/transactions': btlApiProxyOptions,
        '/balanceAccounts': bclApiProxyOptions,
        '/accountHolders': bclApiProxyOptions,
        '/legalEntity': lemApiProxyOptions,
    };
};
