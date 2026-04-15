module.exports = {
    'src/**/translations/*.json': filenames => [`pnpm run translations:sort ${filenames.join(' ')}`],
    // Fix Prettier formatting
    // Don't include TS schemas
    '!(src/types/api/resources/**/*)/**/*.(ts|tsx|js|scss|css|md|json|html)': filenames => [`pnpm exec prettier --write ${filenames.join(' ')}`],
    // Fix stylelint issues only (no checking/reporting)
    'src/**/*.scss': filenames => [`pnpm exec stylelint --fix --quiet ${filenames.join(' ')}`],
    // Check ESLint for errors (will fail commit if errors found)
    'src/**/*.{js,ts,tsx}': filenames => [`bash -c 'ESLINT_USE_FLAT_CONFIG=false pnpm exec eslint ${filenames.join(' ')}'`],
};
