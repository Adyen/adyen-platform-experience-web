import { Preview } from '@storybook/preact';
import '../src/assets/style/style.scss';
import '@adyen/adyen-fp-web/style/index.scss';
import '@adyen/adyen-fp-web/components/shared.scss';
import { enableServerInMockedMode } from '../src/endpoints/mock-server/utils';
import { createAdyenFP } from './utils/create-adyenFP';

await enableServerInMockedMode();

const preview: Preview = {
    parameters: {
        controls: {
            hideNoControlsWarning: true,
        },
    },
    loaders: [
        async context => {
            const adyenFP = await createAdyenFP(context);
            return { adyenFP };
        },
    ],
};

export default preview;
