module.exports = {
    '**/*.(ts|tsx|js|scss|css|md|json|html)': filenames => [
        // Fix Prettier formatting
        `npx prettier --write ${filenames.join(' ')}`,
    ],

    'packages/lib/src/**/translations/en-US.json': () => [
        // Update translations manifest
        `npm run translations -- --silent`,
    ],
};
