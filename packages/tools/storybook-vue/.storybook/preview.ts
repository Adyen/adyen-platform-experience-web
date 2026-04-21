import type { Preview } from '@storybook/vue3';
import { getMockHandlers } from '@integration-components/testing/msw';
import { mswLoader, initialize, getWorker } from 'msw-storybook-addon';
import { mocks } from '../../../../mocks/mock-server';

initialize({}, [...getMockHandlers(mocks)]);

let mockingEnabled = false;

// Globals are intentionally duplicated from storybook-preact instead of living in a
// shared @integration-components/storybook-config package. Promote to a shared package
// only if concrete drift between the two Storybooks appears.
const preview: Preview = {
    parameters: {
        controls: {
            hideNoControlsWarning: true,
        },
    },
    globalTypes: {
        locale: {
            description: 'Global locale for components',
            toolbar: {
                title: 'Locale',
                items: ['da-DK', 'de-DE', 'en-US', 'es-ES', 'fi-FI', 'fr-FR', 'it-IT', 'nl-NL', 'no-NO', 'pt-BR', 'sv-SE'],
                dynamicTitle: true,
            },
        },
        fontFamily: {
            description: 'Global font family for components',
            toolbar: {
                title: 'Font family',
                items: [{ title: 'Default', value: undefined }, { value: 'Comic Sans MS' }],
                dynamicTitle: true,
            },
        },
    },
    initialGlobals: {
        locale: 'en-US',
        fontFamily: undefined,
    },
    loaders: [
        async context => {
            const worker = getWorker();
            const shouldMock = Boolean(context.args.mockedApi);
            if (shouldMock && !mockingEnabled) {
                await worker.start();
                mockingEnabled = true;
            } else if (!shouldMock && mockingEnabled) {
                worker.stop();
                mockingEnabled = false;
            }

            return { worker };
        },
        mswLoader,
    ],
};

export default preview;
