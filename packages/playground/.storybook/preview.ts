import { Preview } from '@storybook/preact';
import '../src/assets/style/style.scss';
import '@adyen/adyen-fp-web/style/index.scss';
import '@adyen/adyen-fp-web/components/shared.scss';
import { createAdyenFP } from './utils/create-adyenFP';
import { enableServerInMockedMode, stopMockedServer } from '../src/endpoints/mock-server/utils';
import sessionRequest from '../src/utils/sessionRequest';

const preview: Preview = {
    parameters: {
        controls: {
            hideNoControlsWarning: true,
        },
    },
    argTypes: {
        mockedApi: {
            table: {
                disable: true,
            },
        },
    },
    loaders: [
        async context => {
            await enableServerInMockedMode();
            const adyenFP = await createAdyenFP({
                ...context.coreOptions,
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
            return { adyenFP };
        },
    ],
};

export default preview;
