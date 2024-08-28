import { Preview } from '@storybook/preact';
import '../playground/assets/style/style.scss';
import '../src/components/shared.scss';
import { createAdyenPlatformExperience } from './utils/create-adyenPE';
import { enableServerInMockedMode, stopMockedServer } from '../mocks/mock-server/utils';
import sessionRequest from '../playground/utils/sessionRequest';
import { all_locales } from '../src';

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
                availableTranslations: [all_locales],
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
                translations: {
                    'en-US': { test: 'Translated test' },
                },
            });
            return { AdyenPlatformExperience };
        },
    ],
};

export default preview;
