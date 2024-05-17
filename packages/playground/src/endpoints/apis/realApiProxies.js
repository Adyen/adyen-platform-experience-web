import { endpoints } from '../endpoints.js';
import paymentsConfig from '../../pages/checkout/config/paymentsConfig.js';

const DEFAULT_LOCALE = 'en-US';
const DEFAULT_COUNTRY = 'US';
const shopperReference = 'newshoppert';
const shopperLocale = DEFAULT_LOCALE;
const countryCode = DEFAULT_COUNTRY;
const amountValue = 25940;
const currency = 'EUR';
const amount = {
    currency,
    value: Number(amountValue),
};

const makeProxyOptions = ({ url, version, username, password, apiKey }, basicAuth = false) => ({
    target: `${url}${version ?? ''}`,
    ...(apiKey ? {} : { auth: `${username}:${password}` }),
    headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
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
});

const bod = {
    amount,
    reference: 'ABC123',
    returnUrl: 'http://localhost:3030/result',
    shopperLocale,
    shopperReference,
    telephoneNumber: '+611223344',
    shopperEmail: 'shopper.ctp1@adyen.com',
    countryCode,
    merchantAccount: 'TestMerchantCheckout',
    lineItems: paymentsConfig.lineItems,
};

const makeCheckoutProxyOptions = ({ url, apiKey, merchantAccount }) => {
    const body = JSON.stringify(bod);

    return {
        target: `https://checkout-test.adyen.com/v69`,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
            'X-Api-Key': apiKey,
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

const makeSessionProxyOptions = ({ url, apiKey }) => {
    return {
        target: `${url}`,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'X-Api-Key': apiKey,
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
    const { sessionApi, checkoutApi } = configs;
    const sessionApiProxyOptions = makeSessionProxyOptions(sessionApi);
    const sessionCheckoutProxyOptions = makeCheckoutProxyOptions(checkoutApi);

    const endpointRegex = mode === 'netlify' ? endpoints('netlify') : endpoints('viteDev');

    return {
        '/sessions': sessionCheckoutProxyOptions,
        [endpointRegex.sessions]: sessionApiProxyOptions,
        '/v1/sessions': {
            target: 'https://checkoutshopper-test.adyen.com/checkoutshopper/',
            changeOrigin: true,
            secure: false,
            configure: (proxy, _options) => {
                proxy.on('proxyReq', async (proxyReq, req, _res) => {
                    req.headers = { ...req.headers, path: req._parsedUrl.path };
                });
            },
        },
    };
};
