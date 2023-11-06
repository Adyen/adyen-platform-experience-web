import { UIElementStatus } from '../types';
import { Core } from '@src/core';

const ALLOWED_PROPERTIES = ['action', 'resultCode', 'sessionData', 'order'];

export function getSanitizedResponse(response: Record<string, any>) {
    const removedProperties: string[] = [];

    const sanitizedObject = Object.keys(response).reduce((acc, cur) => {
        if (!ALLOWED_PROPERTIES.includes(cur)) {
            removedProperties.push(cur);
        } else {
            acc[cur] = response[cur];
        }
        return acc;
    }, {} as Record<string, any>);

    if (removedProperties.length) console.warn(`The following properties should not be passed to the client: ${removedProperties.join(', ')}`);

    return sanitizedObject;
}

export function resolveFinalResult(result: { resultCode: string } & { [key: string]: any }): [status: UIElementStatus, statusProps?: any] {
    switch (result.resultCode) {
        case 'Authorised':
        case 'Received':
            return ['success'];
        case 'Pending':
            return ['success'];
        case 'Cancelled':
        case 'Error':
        case 'Refused':
            return ['error'];
        default:
            return ['error'];
    }
}

export function parseComponentOptions<T>({ options, session }: { options: T; session: Core }) {
    return {
        ...options,
        i18n: session.modules.i18n,
        loadingContext: session.options.loadingContext,
        modules: session.modules,
        session: session.session,
    };
}
