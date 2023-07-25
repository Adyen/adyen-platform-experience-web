import { DefaultBodyType, MockedRequest, RestHandler } from 'msw';
import { mockWorker } from './index';

export function getMockHandlers(mocks: RestHandler<MockedRequest<DefaultBodyType>>[][]): RestHandler<MockedRequest<DefaultBodyType>>[] {
    const handlers = [] as RestHandler<MockedRequest<DefaultBodyType>>[];
    mocks.forEach(mocks => handlers.push(...mocks));
    return handlers;
}

const MOCK_MODES = ['mocked', 'demo'];
export async function enableServerInMockedMode() {
    if (MOCK_MODES.includes(import.meta.env.MODE)) {
        await mockWorker.start({
            onUnhandledRequest: (request, print) => {
                if (request.url.pathname.includes('@fs') || request.url.pathname.includes('.svg')) return;
                print.warning();
            },
        });
    }
}
