const { globSync } = require('glob');
const path = require('path');
const CWD = path.resolve(__dirname);

const getClosestDirectory = (fileBasePath, rootScopePath = '/') => {
    let cwd = CWD;
    while (cwd && cwd !== rootScopePath) {
        const [closestFile] = globSync(fileBasePath, { cwd, absolute: true });
        if (closestFile) return path.dirname(closestFile);
        cwd = path.resolve(cwd, '..');
    }
};

const PKG_ROOT_PATH = getClosestDirectory('package.json');
const TRANSLATIONS_DIRNAME = 'translations';
const TRANSLATIONS_GLOB_ROOT_PATH = path.resolve(PKG_ROOT_PATH, 'src');
const TRANSLATIONS_GLOB_PATTERN = `**/${TRANSLATIONS_DIRNAME}/en-US.json`;
const TRANSLATIONS_JSON_PATH = getClosestDirectory('translations.json', CWD) ?? path.resolve(CWD, 'translations.json');
const TRANSLATIONS_SUB_PATH_REGEX = RegExp(`\\/${TRANSLATIONS_DIRNAME}(?:\\/.*)?$`);

module.exports = {
    PKG_ROOT_PATH,
    TRANSLATIONS_DIRNAME,
    TRANSLATIONS_GLOB_PATTERN,
    TRANSLATIONS_GLOB_ROOT_PATH,
    TRANSLATIONS_JSON_PATH,
    TRANSLATIONS_SUB_PATH_REGEX,
};
