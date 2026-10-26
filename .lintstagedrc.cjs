// lint-staged appends the staged file names to string tasks itself. With its default shell:false
// mode (lint-staged 13.x) they are passed as literal argv entries without any shell involved, so
// no quoting is needed and the tasks stay plain strings that work on every platform.
const lintPlaywrightSelectors = 'pnpm exec eslint --no-config-lookup --config scripts/eslint-playwright-selectors.cjs';

module.exports = {
    'packages/{sdk,domains/*/vue}/translations/**/*.json': 'pnpm run translations:sort',
    // Fix Prettier formatting
    '{src,packages}/**/*.{ts,js,scss,css,md,json,html,vue}': 'pnpm exec prettier --write',
    // Fix and check stylelint (auto-fixes what it can; fails the commit on remaining errors or warnings)
    'packages/**/*.scss': 'pnpm exec stylelint --fix --max-warnings 0 --report-needless-disables',
    // Fix and check ESLint (auto-fixes what it can; fails the commit on remaining errors or warnings)
    '{src,packages}/**/*.{js,ts,vue}': 'pnpm exec eslint --fix --max-warnings 0',
    // Check playwright selector usage (mirrors lint:playwright-selectors)
    'packages/domains/**/tests/**/*.{spec,test}.ts': lintPlaywrightSelectors,
    'packages/sdk/tests/**/*.{spec,test}.ts': lintPlaywrightSelectors,
    'packages/shared/testing/**/*.ts': lintPlaywrightSelectors,
};
