import { compose, context, DefaultBodyType, DelayMode, MockedRequest, RestHandler } from 'msw';
import { mockWorker } from './index';

const IS_TEST = Boolean(process.env.E2E_TEST === 'true') || process.env.VITE_MODE === 'demo';
const MOCK_MODES = ['mocked', 'demo'];

export async function enableServerInMockedMode(enabled?: boolean) {
    const env = (import.meta as any).env;
    if (enabled || MOCK_MODES.includes(env.VITE_MODE || env.MODE)) {
        await mockWorker.start({
            onUnhandledRequest: (request, print) => {
                if (
                    request.url.pathname.includes('images/logos/') ||
                    request.url.pathname.includes('resources/report.csv') ||
                    request.url.pathname.includes('node_modules')
                )
                    return;

                // Otherwise, print a warning that an API request is not correctly mocked
                print.warning();
            },
        });
    }
}

export function stopMockedServer() {
    mockWorker.stop();
}

export const compareDates = (dateString1: string, dateString2: string, operator: 'ge' | 'le') => {
    let date1 = new Date(dateString1);
    let date2 = new Date(dateString2);

    switch (operator) {
        case 'ge':
            return date1 >= date2;
        case 'le':
            return date1 <= date2;
    }
};

/**
 * Hash function based on {@link https://theartincode.stanis.me/008-djb2/ djb2} algorithm
 */
export function computeHash(...strings: string[]) {
    const hash = strings.reduce((hash, string) => {
        let i = string.length;
        while (i) hash = (hash * 33) ^ string.charCodeAt(--i);
        return hash;
    }, 5381);
    return (hash >>> 0).toString(16).padStart(8, '0');
}

export function delay(duration?: DelayMode | number): any {
    // Ensure there is no response delay in tests.
    return IS_TEST ? compose() : compose(context.delay(duration));
}

export function getMockHandlers(mocks: RestHandler<MockedRequest<DefaultBodyType>>[][]): RestHandler<MockedRequest<DefaultBodyType>>[] {
    const handlers = [] as RestHandler<MockedRequest<DefaultBodyType>>[];
    mocks.forEach(mocks => handlers.push(...mocks));
    return handlers;
}

export const getPaginationLinks = (cursor: number, limit: number, totalLength: number) => {
    const potentialNextCursor = cursor + limit;
    const nextCursor = potentialNextCursor < totalLength ? potentialNextCursor : undefined;

    const potentialPrevCursor = cursor - limit;
    const prevCursor = potentialPrevCursor >= 0 ? potentialPrevCursor : undefined;

    return {
        ...(nextCursor === undefined ? {} : { next: { cursor: nextCursor.toString() } }),
        ...(prevCursor === undefined ? {} : { prev: { cursor: prevCursor.toString() } }),
    };
};
