module.exports = {
    '**/*.(ts|tsx|js|scss|css|md|json|html)': filenames => [
        // Fix Prettier formatting
        `npx prettier --write ${filenames.join(' ')}`,
    ],

    'packages/lib/src/**/translations/en-US.json': () => [
        // Generate translations manifest
        'npm run translations -- generate --manifest',
        // Generate translations source CSV (for Smartling)
        'npm run translations -- generate --smartling',
    ],
};
