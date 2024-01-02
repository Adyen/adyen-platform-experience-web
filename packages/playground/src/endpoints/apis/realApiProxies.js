import getHeaders from './utils/getHeaders.js';
import { getBasicAuthHeaders } from './utils/getBasicAuthHeaders.js';
import { endpoints } from '../endpoints.js';

const makeProxyOptions = ({ url, version, username, password, apiKey }, basicAuth = false) => ({
    target: `${url}${version ?? ''}`,
    ...(apiKey ? {} : { auth: `${username}:${password}` }),
    headers: basicAuth ? getBasicAuthHeaders({ user: username, pass: password }) : getHeaders(undefined, apiKey),
    changeOrigin: true,
    secure: false,
    rewrite: path => path.replace(/^\/api/, ''),
});

const makeSessionProxyOptions = ({ url, token, cookie }) => ({
    target: `${url}`,
    headers: {
        Authorization: `Basic ${token}`,
        Cookie: `JSESSIONID=${cookie}`,
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
    },
    changeOrigin: true,
    secure: false,
});

export const realApiProxies = (lemApiOptions, btlApiOptions, bclApiOptions, sessionApiOptions, setupApiOptions, mode) => {
    const lemApiProxyOptions = makeProxyOptions(lemApiOptions);
    const btlApiProxyOptions = makeProxyOptions(btlApiOptions);
    const bclApiProxyOptions = makeProxyOptions(bclApiOptions);
    const sessionApiProxyOptions = makeSessionProxyOptions(sessionApiOptions);
    const setupApiProxyOptions = makeProxyOptions(setupApiOptions);

    return {
        [endpoints.transactions]: btlApiProxyOptions,
        [endpoints.balanceAccount]: bclApiProxyOptions,
        [endpoints.accountHolder]: bclApiProxyOptions,
        [endpoints.legalEntities]: lemApiProxyOptions,
        [endpoints.sessions]: sessionApiProxyOptions,
        [endpoints.setup]: setupApiProxyOptions,
    };
};
