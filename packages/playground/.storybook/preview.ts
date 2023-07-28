import { Preview } from '@storybook/preact';

import '../src/assets/style/style.scss';
import '@adyen/adyen-fp-web/style/index.scss';
import '@adyen/adyen-fp-web/components/shared.scss';
import { enableServerInMockedMode } from '../src/endpoints/mock-server/utils';

await enableServerInMockedMode();

const preview: Preview = {
    parameters: {},
};

export default preview;
