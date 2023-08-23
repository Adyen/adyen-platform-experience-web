import getHeaders from './utils/getHeaders.js';
import { getBasicAuthHeaders } from './utils/getBasicAuthHeaders.js';
import { endpoints } from '../endpoints.js';

const makeProxyOptions = ({ url, version, username, password, apiKey }, basicAuth = false) => ({
    target: `${url}${version ?? ''}`,
    ...(apiKey ? {} : { auth: `${username}:${password}` }),
    headers: basicAuth ? getBasicAuthHeaders({ user: username, pass: password }) : getHeaders(undefined, apiKey),
    changeOrigin: true,
    rewrite: path => path.replace(/^\/api/, ''),
});

export const realApiProxies = (lemApiOptions, btlApiOptions, bclApiOptions) => {
    const lemApiProxyOptions = makeProxyOptions(lemApiOptions);
    const btlApiProxyOptions = makeProxyOptions(btlApiOptions);
    const bclApiProxyOptions = makeProxyOptions(bclApiOptions);

    return {
        [endpoints.transactions]: btlApiProxyOptions,
        [endpoints.balanceAccount]: bclApiProxyOptions,
        [endpoints.accountHolder]: bclApiProxyOptions,
        [endpoints.legalEntities]: lemApiProxyOptions,
    };
};
