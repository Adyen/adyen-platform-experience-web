const tsParser = require('@typescript-eslint/parser');
const noFrameworkCoupledPlaywrightSelectors = require('./eslint-rules/no-framework-coupled-playwright-selectors.cjs');

const PLAYWRIGHT_SELECTOR_GUARD_PLUGIN = 'playwright-selector-guard';
const NO_FRAMEWORK_COUPLED_SELECTORS_RULE = 'no-framework-coupled-playwright-selectors';
const GUARDED_FILE_GLOBS = [
    'tests/**/*.{spec,test}.{ts,tsx,js,jsx}',
    'tests/models/**/*.{ts,tsx,js,jsx}',
    'packages/domains/*/tests/**/*.{spec,test}.{ts,tsx,js,jsx}',
];
const selectorGuardPlugin = {
    rules: {
        [NO_FRAMEWORK_COUPLED_SELECTORS_RULE]: noFrameworkCoupledPlaywrightSelectors,
    },
};

module.exports = [
    {
        files: GUARDED_FILE_GLOBS,
        languageOptions: {
            parser: tsParser,
            ecmaVersion: 2020,
            sourceType: 'module',
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
        },
        plugins: {
            [PLAYWRIGHT_SELECTOR_GUARD_PLUGIN]: selectorGuardPlugin,
        },
        rules: {
            [`${PLAYWRIGHT_SELECTOR_GUARD_PLUGIN}/${NO_FRAMEWORK_COUPLED_SELECTORS_RULE}`]: 'error',
        },
    },
];
