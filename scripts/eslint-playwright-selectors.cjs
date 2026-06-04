const tsParser = require('@typescript-eslint/parser');
const reactHooks = require('eslint-plugin-react-hooks');
const noFrameworkCoupledPlaywrightSelectors = require('./eslint-rules/no-framework-coupled-playwright-selectors.cjs');

const PLAYWRIGHT_SELECTOR_GUARD_PLUGIN = 'playwright-selector-guard';
const NO_FRAMEWORK_COUPLED_SELECTORS_RULE = 'no-framework-coupled-playwright-selectors';
const GUARDED_FILE_GLOBS = [
    'packages/domains/**/tests/**/*.{spec,test}.{ts,tsx}',
    'packages/shared/testing/**/*.{ts,tsx}',
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
            'react-hooks': reactHooks,
            [PLAYWRIGHT_SELECTOR_GUARD_PLUGIN]: selectorGuardPlugin,
        },
        rules: {
            [`${PLAYWRIGHT_SELECTOR_GUARD_PLUGIN}/${NO_FRAMEWORK_COUPLED_SELECTORS_RULE}`]: 'error',
        },
    },
];
