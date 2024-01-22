import { Preview } from '@storybook/preact';
import '../src/assets/style/style.scss';
import '@adyen/adyen-fp-web/style/index.scss';
import '@adyen/adyen-fp-web/components/shared.scss';
import { createAdyenFP } from './utils/create-adyenFP';
import { enableServerInMockedMode } from '../src/endpoints/mock-server/utils';

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
            const adyenFP = await createAdyenFP(context.coreOptions);
            return { adyenFP };
        },
    ],
};

export default preview;
