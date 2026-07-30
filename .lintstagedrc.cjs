const lintPlaywrightSelectors = filenames => [
    `pnpm exec eslint --no-config-lookup --config scripts/eslint-playwright-selectors.cjs ${filenames.join(' ')}`,
];

module.exports = {
    'packages/shared/assets/src/translations/*.json': filenames => [`pnpm run translations:sort ${filenames.join(' ')}`],
    // Fix Prettier formatting
    '{src,packages}/**/*.{ts,tsx,js,scss,css,md,json,html,vue}': filenames => [`pnpm exec prettier --write ${filenames.join(' ')}`],
    // Fix stylelint issues only (no checking/reporting)
    'packages/**/*.scss': filenames => [`pnpm exec stylelint --fix ${filenames.join(' ')}`],
    // Check ESLint for errors (will fail commit if errors found)
    '{src,packages}/**/*.{js,ts,tsx,vue}': filenames => [`pnpm exec eslint ${filenames.join(' ')}`],
    // Check playwright selector usage (mirrors lint:playwright-selectors)
    'packages/domains/**/tests/**/*.{spec,test}.{ts,tsx}': lintPlaywrightSelectors,
    'packages/shared/testing/**/*.{ts,tsx}': lintPlaywrightSelectors,
};
