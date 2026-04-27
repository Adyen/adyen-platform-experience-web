import type { Preview } from '@storybook/vue3';
import { setup } from '@storybook/vue3';
import { createI18n } from 'vue-i18n';
import { getMockHandlers } from '@integration-components/testing/msw';
import { mswLoader, initialize, getWorker } from 'msw-storybook-addon';
import { mocks } from '../../../../mocks/mock-server';

// Bento (`@adyen/bento-vue3`) components call `useI18n()` internally, which
// throws "Need to install with `app.use` function" unless a vue-i18n instance
// is registered on the Vue app. Storybook for Vue3 exposes a `setup` hook that
// runs against the story app, so we install a minimal i18n instance here.
setup(app => {
    app.use(
        createI18n({
            legacy: false,
            locale: 'en-US',
            fallbackLocale: 'en-US',
            messages: { 'en-US': {} },
        })
    );
});

const allHandlers = [...getMockHandlers(mocks)];

// Register the worker once for the lifetime of the preview iframe with an empty
// initial handler set; stories opt in to mocks via `mockedApi: true` in the loader
// below. Keeping the worker running avoids races.
initialize({}, []);

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
        // mswLoader runs first so story-level `parameters.msw.handlers` get applied
        // cleanly. Our loader below appends the global mocks on top for `mockedApi: true`
        mswLoader,
        async context => {
            const worker = getWorker();
            // initialize() fires worker.start() without awaiting, so this guards against
            // the story rendering before the SW is ready to intercept.
            await worker.start();
            if (context.args.mockedApi) {
                worker.use(...allHandlers);
            }
            return { worker };
        },
    ],
};

export default preview;
