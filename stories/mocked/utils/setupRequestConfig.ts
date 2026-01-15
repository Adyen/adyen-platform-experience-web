import { Decorator } from '@storybook/preact';
import { http, HttpResponse } from 'msw';
import { getWorker } from 'msw-storybook-addon';
import { endpoints } from '../../../endpoints/endpoints';
import { setupBasicResponse } from '../../../mocks/mock-server/setup';
import { delay } from '../../../mocks/mock-server/utils/utils';

const worker = getWorker();

export const legaEntityDecorator: Decorator = (Story, context) => {
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
