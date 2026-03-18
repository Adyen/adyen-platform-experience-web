import type { Preview } from '@storybook/vue3';
import { setup } from '@storybook/vue3';
import { createI18n } from 'vue-i18n';
import BentoPlugin from '@adyen/bento-vue3';
import '@adyen/bento-vue3/fonts.css';
import '@adyen/bento-vue3/styles/bento-light';
import '../stories/utils/styles.scss';

const i18n = createI18n({
    locale: 'en-US',
    fallbackLocale: 'en-US',
    fallbackRoot: false,
    allowComposition: true,
    legacy: false,
    messages: {
        'en-US': {},
    },
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
        locale: {
            control: 'select',
            options: ['da-DK', 'de-DE', 'en-US', 'es-ES', 'fi-FI', 'fr-FR', 'it-IT', 'nl-NL', 'no-NO', 'pt-BR', 'sv-SE'],
        },
    },
    args: {
        locale: 'en-US',
    },
};

export default preview;
