import { UIElementStatus } from '../types';

const ALLOWED_PROPERTIES = ['action', 'resultCode', 'sessionData', 'order'];

export function getSanitizedResponse(response: Record<string, any>) {
    const removedProperties: string[] = [];

    const sanitizedObject = Object.keys(response).reduce(
        (acc, cur) => {
            if (!ALLOWED_PROPERTIES.includes(cur)) {
                removedProperties.push(cur);
            } else {
                acc[cur] = response[cur];
            }
            return acc;
        },
        {} as Record<string, any>
    );

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

interface DebouncedFunction<T extends (...args: any[]) => any> {
    (...args: Parameters<T>): void;
    cancel: () => void;
}

export const debounce = <T extends (...args: any[]) => any>(func: T, delay: number): DebouncedFunction<T> => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let lastArgs: Parameters<T> | undefined;

    function debounced(...args: Parameters<T>): void {
        clearTimeout(timeoutId);
        lastArgs = args;

        timeoutId = setTimeout(() => {
            if (lastArgs) {
                func(...lastArgs);
            }
            lastArgs = undefined;
        }, delay);
    }

    debounced.cancel = () => {
        if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = undefined;
            lastArgs = undefined;
        }
    };

    return debounced;
};
