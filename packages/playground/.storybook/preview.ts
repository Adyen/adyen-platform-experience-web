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
    loaders: [
        async context => {
            const env = (import.meta as any).env;
            // const isDemo = env.DEV && env.MODE === 'production';
            if (env.MODE === 'mocked') await enableServerInMockedMode();
            const adyenFP = await createAdyenFP(context);
            return { adyenFP };
        },
    ],
};

export default preview;
