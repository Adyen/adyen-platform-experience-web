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
    const { sessionApi, platformComponentsApi } = configs;
    const sessionApiProxyOptions = makeSessionProxyOptions(sessionApi);
    const platformComponentsApiProxyOptions = makeProxyOptions(platformComponentsApi);

    const prefixedEndpoints = mode === 'prod' ? endpoints('prod') : endpoints('viteDev');

    return {
        [prefixedEndpoints.sessions]: sessionApiProxyOptions,
        [prefixedEndpoints.setup]: platformComponentsApiProxyOptions,
        [prefixedEndpoints.transactions]: platformComponentsApiProxyOptions,
        [prefixedEndpoints.transaction]: platformComponentsApiProxyOptions,
        [prefixedEndpoints.balanceAccount]: platformComponentsApiProxyOptions,
        [prefixedEndpoints.balanceAccountTotals]: platformComponentsApiProxyOptions,
        [prefixedEndpoints.balances]: platformComponentsApiProxyOptions,
    };
};
