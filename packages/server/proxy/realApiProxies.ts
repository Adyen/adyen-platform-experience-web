import { ProxyOptions } from 'vite';
import getHeaders from '../utils/getHeaders';
import { getBasicAuthHeaders } from '../utils/getBasicAuthHeaders';

interface ApiOptions {
    url: string;
    version?: string;
    username?: string;
    password?: string;
    apiKey?: string;
    auth?: string;
}

const makeProxyOptions = ({ url, version, username, password, apiKey, auth }: ApiOptions, basicAuth: boolean = false): ProxyOptions => ({
    target: `${url}${version ?? ''}`,
    ...(apiKey ? {} : { auth: `${username}:${password}` }),
    headers: basicAuth ? getBasicAuthHeaders({ user: username, pass: password }) : getHeaders(undefined, apiKey),
    changeOrigin: true,
});

export const realApiProxies = (lemApiOptions: ApiOptions, btlApiOptions: ApiOptions, bclApiOptions: ApiOptions): Record<string, ProxyOptions> => {
    const lemApiProxyOptions = makeProxyOptions(lemApiOptions, true);
    const btlApiProxyOptions = makeProxyOptions(btlApiOptions);
    const bclApiProxyOptions = makeProxyOptions(bclApiOptions);
    return {
        '/transactions': btlApiProxyOptions,
        '/balanceAccounts': bclApiProxyOptions,
        '/accountHolders': bclApiProxyOptions,
        '/legalEntities': lemApiProxyOptions,
    };
};
