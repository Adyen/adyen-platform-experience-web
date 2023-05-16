import { ProxyOptions } from 'vite';

interface ApiOptions {
    url: string;
    version?: string;
    username: string;
    password: string;
}

const makeProxyOptions = ({ url, version, username, password }: ApiOptions): ProxyOptions => ({
    target: `${url}${version ?? ''}`,
    auth: `${username}:${password}`,
});

export const realApiProxies = (lemApiOptions: ApiOptions, kycExternalApiOptions: ApiOptions): Record<string, ProxyOptions> => {
    const lemApiProxyOptions = makeProxyOptions(lemApiOptions);
    const kycExternalApiProxyOptions = makeProxyOptions(kycExternalApiOptions);

    return {
        '/legalEntities': lemApiProxyOptions,
        '/documents': lemApiProxyOptions,
        '/transferInstruments': lemApiProxyOptions,
        '/onfido': {
            ...kycExternalApiProxyOptions,
            headers: {
                'x-kyc-test-instruction': 'ONFIDO_SANDBOX',
            },
        },
        '/addresses': {
            ...kycExternalApiProxyOptions,
            headers: {
                'x-kyc-test-instruction': 'LOQATE_ACCEPTABLE_ADDRESS',
            },
        },
    };
};
