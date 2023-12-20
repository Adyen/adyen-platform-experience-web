module.exports = {
    '**/*.(ts|tsx|js|scss|css|md|json|html)': filenames => [
        // Fix Prettier formatting
        `npx prettier --write ${filenames.join(' ')}`,
    ],
};
