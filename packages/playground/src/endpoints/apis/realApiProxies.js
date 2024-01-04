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

export const realApiProxies = (configs, mode) => {
    const { lemApi, BTLApi, BCLApi, sessionApi, platformComponentsApi } = configs;
    const lemApiProxyOptions = makeProxyOptions(lemApi);
    const btlApiProxyOptions = makeProxyOptions(BTLApi);
    const bclApiProxyOptions = makeProxyOptions(BCLApi);
    const sessionApiProxyOptions = makeSessionProxyOptions(sessionApi);
    const setupApiProxyOptions = makeProxyOptions(platformComponentsApi);

    return {
        [endpoints.transactions]: btlApiProxyOptions,
        [endpoints.balanceAccount]: bclApiProxyOptions,
        [endpoints.accountHolder]: bclApiProxyOptions,
        [endpoints.legalEntities]: lemApiProxyOptions,
        [endpoints.sessions]: sessionApiProxyOptions,
        [endpoints.setup]: setupApiProxyOptions,
    };
};
