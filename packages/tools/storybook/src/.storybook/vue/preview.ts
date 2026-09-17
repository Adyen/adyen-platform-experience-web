import type { Preview } from '@storybook/vue3';
import { setup } from '@storybook/vue3';
import { createI18n } from 'vue-i18n';
import { computed, reactive, toRaw } from 'vue';
import type { ThemeMode, ThemeVariables } from '@integration-components/core/vue';
import { sharedPreviewConfig } from '../../shared/previewDefaults';
import Container from './Container.vue';

const THEME_VARIABLE_CONTROLS = {
    themePrimary: { label: 'Primary', variable: 'primary' },
    themeOutline: { label: 'Outline', variable: 'outline' },
    themeNeutral: { label: 'Neutral', variable: 'neutral' },
    themeBackground: { label: 'Background', variable: 'background' },
    themeLabel: { label: 'Label', variable: 'label' },
} as const satisfies Record<string, { label: string; variable: keyof ThemeVariables }>;

const THEME_DARK_CONTROL = 'themeDark';
const STORYBOOK_ONLY_ARGS = new Set(['component', 'session', 'mockedApi', 'compact', THEME_DARK_CONTROL, ...Object.keys(THEME_VARIABLE_CONTROLS)]);

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
// reactively updates args. To make globals (locale, fontFamily, theme) reactive we
// store them in a module-level reactive object that is mutated each time the
// render function is called, and expose them via computed refs in setup().
const storyGlobals = reactive({
    locale: 'en-US' as string,
    fontFamily: undefined as string | undefined,
    theme: 'story' as ThemeMode | 'story',
});

const preview: Preview = {
    ...sharedPreviewConfig,
    globalTypes: {
        ...sharedPreviewConfig.globalTypes,
        theme: {
            description: 'Global default theme mode for Vue components',
            toolbar: {
                title: 'Theme',
                items: [
                    { title: 'Story', value: 'story' },
                    { title: 'Light', value: 'light' },
                    { title: 'Dark', value: 'dark' },
                ],
                dynamicTitle: true,
            },
        },
    },
    initialGlobals: {
        ...sharedPreviewConfig.initialGlobals,
        theme: 'story',
    },
    argTypes: {
        ...sharedPreviewConfig.argTypes,
        [THEME_DARK_CONTROL]: {
            name: 'Dark',
            description: 'Override the theme mode for this story',
            control: { type: 'boolean' },
            table: { category: 'Theme' },
        },
        ...Object.fromEntries(
            Object.entries(THEME_VARIABLE_CONTROLS).map(([arg, { label }]) => [
                arg,
                {
                    name: label,
                    description: `Override the ${label.toLowerCase()} theme color`,
                    control: { type: 'color' },
                    table: { category: 'Theme' },
                },
            ])
        ),
    },
    render: (args, context) => {
        storyGlobals.locale = context.globals.locale ?? 'en-US';
        storyGlobals.fontFamily = context.globals.fontFamily;
        storyGlobals.theme = context.globals.theme ?? 'story';

        return {
            components: { Container },
            setup() {
                const { component, session, mockedApi, compact } = args;
                const componentProps = computed<Record<string, unknown>>(previous => {
                    const nextEntries = Object.entries(args).filter(([arg]) => !STORYBOOK_ONLY_ARGS.has(arg));
                    const unchanged =
                        previous &&
                        nextEntries.length === Object.keys(previous).length &&
                        nextEntries.every(([arg, value]) => Object.is(previous[arg], value));

                    return unchanged ? previous : Object.fromEntries(nextEntries);
                });
                const themeVariables = computed<ThemeVariables>(() =>
                    Object.fromEntries(
                        Object.entries(THEME_VARIABLE_CONTROLS).flatMap(([arg, { variable }]) => {
                            const value = args[arg];
                            return typeof value === 'string' && value ? [[variable, value]] : [];
                        })
                    )
                );

                return {
                    containerKey: computed(() => `${storyGlobals.locale}-${storyGlobals.fontFamily}-${JSON.stringify(session)}`),
                    component: toRaw(component),
                    locale: computed(() => storyGlobals.locale),
                    fontFamily: computed(() => storyGlobals.fontFamily),
                    theme: computed(() => storyGlobals.theme),
                    session,
                    mockedApi,
                    compact,
                    componentProps,
                    themeDark: computed(() => (typeof args[THEME_DARK_CONTROL] === 'boolean' ? args[THEME_DARK_CONTROL] : undefined)),
                    themeVariables,
                };
            },
            template: `<Container :key="containerKey" :component="component" :component-props="componentProps" :locale="locale" :font-family="fontFamily" :theme="theme" :theme-dark="themeDark" :theme-variables="themeVariables" :session="session" :mocked-api="mockedApi" :compact="compact" />`,
        };
    },
};

export default preview;
