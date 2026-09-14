const tsParser = require('@typescript-eslint/parser');
const noFrameworkCoupledPlaywrightSelectors = require('./eslint-rules/no-framework-coupled-playwright-selectors.cjs');

const PLAYWRIGHT_SELECTOR_GUARD_PLUGIN = 'playwright-selector-guard';
const NO_FRAMEWORK_COUPLED_SELECTORS_RULE = 'no-framework-coupled-playwright-selectors';
const GUARDED_FILE_GLOBS = [
    'packages/domains/**/tests/**/*.{spec,test}.ts',
    'packages/shared/testing/**/*.ts',
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
        },
        plugins: {
            [PLAYWRIGHT_SELECTOR_GUARD_PLUGIN]: selectorGuardPlugin,
        },
        rules: {
            [`${PLAYWRIGHT_SELECTOR_GUARD_PLUGIN}/${NO_FRAMEWORK_COUPLED_SELECTORS_RULE}`]: 'error',
        },
    },
];
