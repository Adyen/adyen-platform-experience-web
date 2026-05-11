import type { Preview } from '@storybook/vue3';
import { setup } from '@storybook/vue3';
import { createI18n } from 'vue-i18n';
import { getMockHandlers } from '@integration-components/testing/msw';
import { mswLoader, initialize, getWorker } from 'msw-storybook-addon';
import { mocks } from '../../../../../mocks/mock-server';

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

// Register the default mock handlers at worker initialization so they serve as
// the baseline. `mswLoader` then layers each story's `parameters.msw` handlers
// on top via `worker.use(...)`, which correctly takes precedence over defaults.
initialize({}, allHandlers);

export const sharedPreviewConfig = {
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
    argTypes: {
        mockedApi: {
            table: {
                disable: true,
            },
        },
        component: {
            table: {
                disable: true,
            },
        },
        balanceAccountId: { type: 'string' as const },
        skipDecorators: {
            table: {
                disable: true,
            },
        },
    },
    loaders: [
        async (context: { args: { mockedApi?: boolean } }) => {
            const worker = getWorker();
            if (context.args.mockedApi) {
                await worker.start();
            } else {
                worker.stop();
            }
            return { worker };
        },
        // mswLoader runs LAST so that story-level `parameters.msw` handlers are
        // registered on top of the baseline defaults via `worker.use(...)` and
        // therefore win when MSW matches requests.
        mswLoader,
    ],
};
