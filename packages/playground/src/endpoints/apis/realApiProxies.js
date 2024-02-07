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

const makeSessionProxyOptions = ({ url, token }) => ({
    target: `${url}`,
    headers: {
        Authorization: `Basic ${token}`,
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
    },
    changeOrigin: true,
    secure: false,
});

export const realApiProxies = (configs, mode) => {
    const { BTLApi, BCLApi, sessionApi, platformComponentsApi } = configs;
    const btlApiProxyOptions = makeProxyOptions(BTLApi);
    const bclApiProxyOptions = makeProxyOptions(BCLApi);
    const sessionApiProxyOptions = makeSessionProxyOptions(sessionApi);
    const platformComponentsApiProxyOptions = makeProxyOptions(platformComponentsApi);

    return {
        [endpoints.transactions]: btlApiProxyOptions,
        [endpoints.balanceAccount]: bclApiProxyOptions,
        [endpoints.sessions]: sessionApiProxyOptions,
        [endpoints.setup]: platformComponentsApiProxyOptions,
    };
};
