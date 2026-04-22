import { Decorator } from '@storybook/preact';
import { http, HttpResponse } from 'msw';
import { getWorker } from 'msw-storybook-addon';
import { endpoints } from '../../../endpoints/endpoints';
import { setupBasicResponse } from '../../../mocks/mock-server/setup';
import { delay } from '@integration-components/testing/msw';

// Resolve the worker lazily inside the decorator. Calling `getWorker()` at
// module top level crashes in production builds, where this module can be
// eagerly evaluated before `preview.tsx` has run `initialize(...)`.
export const legaEntityDecorator: Decorator = (Story, context) => {
    const worker = getWorker();
    const legalEntity = context.args.legalEntity ?? {};
    worker.use(
        http.post(endpoints().setup, async () => {
            await delay(200);
            return HttpResponse.json({
                ...setupBasicResponse,
                ...(legalEntity ? { legalEntity } : {}),
            });
        })
    );
    return Story();
};
