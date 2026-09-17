export const STORYBOOK_CONFIG = Object.freeze({
    configDir: 'src/.storybook/vue',
    framework: 'vue',
});

export const isStorybookConfigAllowed = configDir => configDir === STORYBOOK_CONFIG.configDir;
