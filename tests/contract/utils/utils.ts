import { asPlainObject, isPlainObject } from '../../../src/utils';
import { AllowedHttpMethods, AvailableVersions, EndpointUrl, RequestArgs } from './types';
import dotenv from 'dotenv';
dotenv.config({ path: './envs/.env' });

export const getHeaders = ({ token, contentType }: { token: string; contentType?: string }) => {
    const sdkVersion = process.env.VITE_VERSION;
    return {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': contentType || 'application/json',
            Origin: 'https://localhost',
            ...(sdkVersion && { 'SDK-Version': sdkVersion }),
        },
    };
};

const requestHasParams = (request: any): request is Record<'params', any> => {
    return !!request.params;
};

const buildUrl = (baseUrl: string, queryParams: Record<any, any>) => {
    const queryString = Object.keys(queryParams)
        .filter(key => queryParams[key] !== undefined)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(queryParams[key])}`)
        .join('&');

    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
};

export const getRequestURL = <Endpoint extends EndpointUrl, Method extends AllowedHttpMethods, Version extends AvailableVersions = 1>(
    request: RequestArgs<Endpoint, Method, Version>
) => {
    let path = request.endpoint as string;

    if (requestHasParams(request)) {
        const { path: pathParams, query: searchParams } = asPlainObject(request.params as any);
        if (isPlainObject(pathParams)) {
            for (const pathParamKey of Object.keys(pathParams)) {
                path = path.replace(`{${pathParamKey}}`, pathParams[pathParamKey]);
            }
        }

        if (searchParams) {
            path = buildUrl(path, searchParams);
        }
    }
    return `v${request.version}${path}`;
};
