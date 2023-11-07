import { DefaultBodyType, MockedRequest, RestHandler } from 'msw';
import { mockWorker } from './index';

export function getMockHandlers(mocks: RestHandler<MockedRequest<DefaultBodyType>>[][]): RestHandler<MockedRequest<DefaultBodyType>>[] {
    const handlers = [] as RestHandler<MockedRequest<DefaultBodyType>>[];
    mocks.forEach(mocks => handlers.push(...mocks));
    return handlers;
}

const MOCK_MODES = ['mocked', 'demo'];
export async function enableServerInMockedMode() {
    const env = (import.meta as any).env;
    if (MOCK_MODES.includes(env.VITE_MODE || env.MODE)) {
        await mockWorker.start({});
    }
}
export function stopMockedServer() {
    mockWorker.stop();
}
