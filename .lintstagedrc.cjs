module.exports = {
    'src/**/translations/*.json': filenames => [`pnpm run translations:sort ${filenames.join(' ')}`],
    // Fix Prettier formatting
    // Don't include TS schemas
    '!(src/types/api/resources/**/*)/**/*.(ts|tsx|js|scss|css|md|json|html)': filenames => [`npx prettier --write ${filenames.join(' ')}`],
};
