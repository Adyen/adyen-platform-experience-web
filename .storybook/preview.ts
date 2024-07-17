import { Preview } from '@storybook/preact';
import '../playground/assets/style/style.scss';
import '../src/components/shared.scss';
import { createAdyenPlatformExperience } from './utils/create-adyenPE';
import { enableServerInMockedMode, stopMockedServer } from '../playground/mock-server/utils';
import sessionRequest from '../playground/utils/sessionRequest';

const preview: Preview = {
    parameters: {
        controls: {
            hideNoControlsWarning: true,
        },
        options: {
            storySort: { order: ['screens', ['Transactions', 'Payouts']] },
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
            await enableServerInMockedMode();
            const AdyenPlatformExperience = await createAdyenPlatformExperience({
                ...context.coreOptions,
                balanceAccountId: context.args.balanceAccountId,
                environment: 'beta',
                onSessionCreate: async () => {
                    if (context.args.mockedApi) {
                        await enableServerInMockedMode(true);
                    } else {
                        stopMockedServer();
                    }
                    return await sessionRequest(context.args.session);
                },
            });
            return { AdyenPlatformExperience };
        },
    ],
};

export default preview;
