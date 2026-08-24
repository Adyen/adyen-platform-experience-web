import type { Preview } from '@storybook/vue3';
import { setup } from '@storybook/vue3';
import { createI18n } from 'vue-i18n';
import { computed, reactive, toRaw } from 'vue';
import { sharedPreviewConfig } from '../../shared/previewDefaults';
import Container from './Container.vue';

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

// Storybook's Vue3 renderer does not force-remount on globals changes — it only
// reactively updates args. To make globals (locale, fontFamily, illustrations, titles) reactive we
// store them in a module-level reactive object that is mutated each time the
// render function is called, and expose them via computed refs in setup().
const storyGlobals = reactive({
    locale: 'en-US' as string,
    fontFamily: undefined as string | undefined,
    illustrations: 'visible' as 'visible' | 'hidden',
    titles: 'visible' as 'visible' | 'hidden',
});

const preview: Preview = {
    ...sharedPreviewConfig,
    globalTypes: {
        ...sharedPreviewConfig.globalTypes,
        illustrations: {
            description: 'Global illustration visibility for components',
            toolbar: {
                title: 'Illustrations',
                items: [
                    { title: 'Illustrations visible', value: 'visible' },
                    { title: 'Illustrations hidden', value: 'hidden' },
                ],
                dynamicTitle: true,
            },
        },
        titles: {
            description: 'Global title visibility for components',
            toolbar: {
                title: 'Titles',
                items: [
                    { title: 'Titles visible', value: 'visible' },
                    { title: 'Titles hidden', value: 'hidden' },
                ],
                dynamicTitle: true,
            },
        },
    },
    initialGlobals: {
        ...sharedPreviewConfig.initialGlobals,
        illustrations: 'visible',
        titles: 'visible',
    },
    render: (args, context) => {
        storyGlobals.locale = context.globals.locale ?? 'en-US';
        storyGlobals.fontFamily = context.globals.fontFamily;
        storyGlobals.illustrations = context.globals.illustrations ?? 'visible';
        storyGlobals.titles = context.globals.titles ?? 'visible';

        return {
            components: { Container },
            setup() {
                const { component, session, mockedApi, compact, ...componentProps } = args;
                return {
                    containerKey: computed(
                        () =>
                            `${storyGlobals.locale}-${storyGlobals.fontFamily}-${storyGlobals.illustrations}-${storyGlobals.titles}-${JSON.stringify(session)}`
                    ),
                    component: toRaw(component),
                    locale: computed(() => storyGlobals.locale),
                    fontFamily: computed(() => storyGlobals.fontFamily),
                    illustrations: computed(() => storyGlobals.illustrations),
                    titles: computed(() => storyGlobals.titles),
                    session,
                    mockedApi,
                    compact,
                    componentProps,
                };
            },
            template: `<Container :key="containerKey" :component="component" :component-props="componentProps" :locale="locale" :font-family="fontFamily" :illustrations="illustrations" :titles="titles" :session="session" :mocked-api="mockedApi" :compact="compact" />`,
        };
    },
};

export default preview;
