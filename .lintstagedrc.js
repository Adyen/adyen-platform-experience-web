module.exports = {
    // Fix Prettier formatting
    '**/*.(ts|tsx|js|scss|css|md|json|html)': filenames => [`npx prettier --write ${filenames.join(' ')}`],
    // Update translations manifest
    'packages/lib/src/**/translations/en-US.json': filenames => [`npm run translations:manifest -- ${filenames.join(' ')}`],
};
