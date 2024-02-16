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

const makeSessionProxyOptions = ({ url, token, username, password }) => {
    const encodedAuthPair = Buffer.from([username, password].join(':')).toString('base64');

    return {
        target: `${url}`,
        headers: {
            Authorization: `Basic ${encodedAuthPair}`,
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
        },
        changeOrigin: true,
        secure: false,
        rewrite: path => path.replace(/^\/api/, ''),
    };
};

export const realApiProxies = (configs, mode) => {
    const { sessionApi, platformComponentsApi } = configs;
    const sessionApiProxyOptions = makeSessionProxyOptions(sessionApi);
    const platformComponentsApiProxyOptions = makeProxyOptions(platformComponentsApi);

    return {
        [endpoints.sessions]: sessionApiProxyOptions,
        [endpoints.setup]: platformComponentsApiProxyOptions,
        [endpoints.transactions]: platformComponentsApiProxyOptions,
        [endpoints.transaction]: platformComponentsApiProxyOptions,
        [endpoints.balanceAccount]: platformComponentsApiProxyOptions,
        [endpoints.balanceAccountTotals]: platformComponentsApiProxyOptions,
        [endpoints.balances]: platformComponentsApiProxyOptions,
    };
};
