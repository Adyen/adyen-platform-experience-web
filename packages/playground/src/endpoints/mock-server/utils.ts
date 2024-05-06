import { DefaultBodyType, MockedRequest, RestHandler } from 'msw';
import { mockWorker } from './index';

export function getMockHandlers(mocks: RestHandler<MockedRequest<DefaultBodyType>>[][]): RestHandler<MockedRequest<DefaultBodyType>>[] {
    const handlers = [] as RestHandler<MockedRequest<DefaultBodyType>>[];
    mocks.forEach(mocks => handlers.push(...mocks));
    return handlers;
}

const MOCK_MODES = ['mocked', 'demo'];
export async function enableServerInMockedMode(enabled?: boolean) {
    const env = (import.meta as any).env;
    if (enabled || MOCK_MODES.includes(env.VITE_MODE || env.MODE)) {
        await mockWorker.start({
            onUnhandledRequest: (request, print) => {
                if (request.url.pathname.includes('images/logos/') || request.url.pathname.includes('node_modules')) return;

                // Otherwise, print a warning that an API request is not correctly mocked
                print.warning();
            },
        });
    }
}
export function stopMockedServer() {
    mockWorker.stop();
}

export const getPaginationLinks = (cursor: number, limit: number, totalLength: number) => {
    const potentialNext = cursor + limit;
    const next = potentialNext < totalLength ? potentialNext : undefined;

    const potentialPrev = cursor - limit;
    const prev = potentialPrev >= 0 ? potentialPrev : undefined;

    return {
        ...(next === undefined ? {} : { next }),
        ...(prev === undefined ? {} : { prev }),
    };
};
