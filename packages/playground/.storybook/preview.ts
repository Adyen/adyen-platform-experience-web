import { Preview } from '@storybook/preact';
import '../src/assets/style/style.scss';
import '@adyen/adyen-platform-experience-web/style/index.scss';
import '@adyen/adyen-platform-experience-web/components/shared.scss';
import { createAdyenPlatformExperience } from './utils/create-adyenPE';
import { enableServerInMockedMode, stopMockedServer } from '../src/endpoints/mock-server/utils';
import sessionRequest from '../src/utils/sessionRequest';

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
                    return await sessionRequest();
                },
            });
            return { AdyenPlatformExperience };
        },
    ],
};

export default preview;
