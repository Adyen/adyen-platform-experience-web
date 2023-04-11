module.exports = {
    // Fix Prettier formatting
    '**/*.(ts|tsx|js|scss|css|md|json|html)': filenames => [`npx prettier --write ${filenames.join(' ')}`],
};
