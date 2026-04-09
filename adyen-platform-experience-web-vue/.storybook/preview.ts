import type { Preview } from '@storybook/vue3';
import { setup } from '@storybook/vue3';
import { createI18n } from 'vue-i18n';
import BentoPlugin from '@adyen/bento-vue3';
import '@adyen/bento-vue3/fonts.css';
import '@adyen/bento-vue3/styles/bento-light';
import '../stories/utils/styles.scss';
import { initialize, mswLoader, getWorker } from 'msw-storybook-addon';
import { getMockHandlers } from '../mocks/mock-server/utils/utils';
import { mocks } from '../mocks/mock-server';

initialize({ onUnhandledRequest: 'bypass' }, [...getMockHandlers(mocks)]);

const i18n = createI18n({
    locale: 'en-US',
    fallbackLocale: 'en-US',
    fallbackRoot: false,
    allowComposition: true,
    legacy: false,
});

setup(app => {
    app.use(i18n);
    app.use(BentoPlugin, { withToast: true, withDesignTokensCSSInjection: false });
});

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
        locale: {
            control: 'select',
            options: ['da-DK', 'de-DE', 'en-US', 'es-ES', 'fi-FI', 'fr-FR', 'it-IT', 'nl-NL', 'no-NO', 'pt-BR', 'sv-SE'],
        },
    },
    args: {
        locale: 'pt-BR',
    },
    loaders: [
        async context => {
            // Sync vue-i18n global locale so Bento components render in the correct locale
            if (context.args.locale && i18n.global.locale) {
                i18n.global.locale.value = context.args.locale;
            }

            const worker = getWorker();
            if (context.args.mockedApi) {
                await worker.start({ quiet: true, onUnhandledRequest: 'bypass' });
            } else {
                worker.stop();
            }

            return { worker };
        },
        mswLoader,
    ],
};

export default preview;
