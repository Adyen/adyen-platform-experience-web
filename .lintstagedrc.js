module.exports = {
    // Fix Prettier formatting
    // Don't include TS schemas
    '!(packages/lib/src/types/api/resources/**/*)/**/*.(ts|tsx|js|scss|css|md|json|html)': filenames => [
        `npx prettier --write ${filenames.join(' ')}`,
    ],
};
