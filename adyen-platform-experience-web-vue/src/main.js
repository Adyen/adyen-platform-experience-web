import { createApp } from 'vue';
import App from './App.vue';
import { createI18n } from 'vue-i18n';
import BentoPlugin from '@adyen/bento-vue3';
import '@adyen/bento-vue3/fonts.css';
import '@adyen/bento-vue3/styles/bento-light';

const i18n = createI18n({
    locale: 'es-US',
    fallbackLocale: 'en-US',
    fallbackRoot: false,
    allowComposition: true,
});

const app = createApp(App);
app.use(i18n);
app.use(BentoPlugin, { withToast: true, withDesignTokensCSSInjection: false });
app.mount('#app');
