import { Preview } from '@storybook/preact';
import '../playground/assets/style/style.scss';
import '../src/components/shared.scss';
import { createAdyenPlatformExperience } from './utils/create-adyenPE';
import { getMockHandlers } from '../mocks/mock-server/utils';
import sessionRequest from '../playground/utils/sessionRequest';
import { mswLoader, initialize } from 'msw-storybook-addon';
import { mocks } from '../mocks/mock-server';

initialize({}, [...getMockHandlers(mocks)]);

const preview: Preview = {
    parameters: {
        controls: {
            hideNoControlsWarning: true,
        },
        options: {
            storySort: { order: ['components', ['Transactions', 'Payouts']] },
        },
    },
    argTypes: {
        mockedApi: {
            table: {
                disable: true,
            },
        },
        balanceAccountId: { type: 'string' },
    },
    loaders: [
        async context => {
            const AdyenPlatformExperience = await createAdyenPlatformExperience({
                ...context.coreOptions,
                balanceAccountId: context.args.balanceAccountId,
                environment: 'beta',
                onSessionCreate: async () => {
                    return await sessionRequest(context.args.session);
                },
            });
            return { AdyenPlatformExperience };
        },
        mswLoader,
    ],
};

export default preview;
