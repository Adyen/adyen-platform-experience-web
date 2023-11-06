const path = require('path');

const PKG_ROOT_PATH = (() => {
    const { globSync } = require('glob');
    let cwd = path.resolve(__dirname);
    while (cwd) {
        const [nearestPkg] = globSync('package.json', { cwd, absolute: true });
        if (nearestPkg) return path.dirname(nearestPkg);
        cwd = path.resolve(cwd, '..');
    }
})();

const TRANSLATIONS_DIRNAME = 'translations';
const TRANSLATIONS_GLOB_ROOT_PATH = path.resolve(PKG_ROOT_PATH, 'src');
const TRANSLATIONS_GLOB_PATTERN = `**/${TRANSLATIONS_DIRNAME}/en-US.json`;
const TRANSLATIONS_SUB_PATH_REGEX = RegExp(`\\/${TRANSLATIONS_DIRNAME}(?:\\/.*)?$`);

module.exports = {
    PKG_ROOT_PATH,
    TRANSLATIONS_DIRNAME,
    TRANSLATIONS_GLOB_PATTERN,
    TRANSLATIONS_GLOB_ROOT_PATH,
    TRANSLATIONS_SUB_PATH_REGEX,
};
