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
const TRANSLATIONS_FILENAME = 'translations.json';
const TRANSLATIONS_JSON_PATH = getClosestDirectory(TRANSLATIONS_FILENAME, CWD) ?? path.resolve(CWD, TRANSLATIONS_FILENAME);
const TRANSLATIONS_SOURCE_FILE = `${TRANSLATIONS_DIRNAME}/en-US.json`;
const TRANSLATIONS_GLOB_PATTERN = `**/${TRANSLATIONS_SOURCE_FILE}`;
const TRANSLATIONS_GLOB_ROOT_PATH = path.resolve(PKG_ROOT_PATH, 'src');
const TRANSLATIONS_SOURCE_DIRNAME_TRIM_PATTERN = RegExp(
    `^${TRANSLATIONS_GLOB_ROOT_PATH}/?|/${TRANSLATIONS_DIRNAME}(?:/.*)?$`.replace('/', '\\/'),
    'gi'
);

module.exports = {
    PKG_ROOT_PATH,
    TRANSLATIONS_DIRNAME,
    TRANSLATIONS_FILENAME,
    TRANSLATIONS_GLOB_PATTERN,
    TRANSLATIONS_GLOB_ROOT_PATH,
    TRANSLATIONS_JSON_PATH,
    TRANSLATIONS_SOURCE_DIRNAME_TRIM_PATTERN,
    TRANSLATIONS_SOURCE_FILE,
};
