const { globSync } = require('glob');
const path = require('path');
const CWD = path.resolve(__dirname);

const getClosestDirectory = (fileBasePath, cwd = process.cwd(), rootScopePath = '/') => {
    while (cwd && cwd !== rootScopePath) {
        const [closestFile] = globSync(fileBasePath, { cwd, absolute: true });
        if (closestFile) return path.dirname(closestFile);
        cwd = path.resolve(cwd, '..');
    }
};

const PKG_ROOT_PATH = getClosestDirectory('package.json', CWD);
const TRANSLATIONS_CSV = 'translations_source_file.csv';
const TRANSLATIONS_DIRNAME = 'translations';
const TRANSLATIONS_JSON = 'translations.json';
const TRANSLATIONS_JSON_PATH = getClosestDirectory(TRANSLATIONS_JSON, CWD, CWD) ?? path.resolve(CWD, TRANSLATIONS_JSON);
const TRANSLATIONS_CSV_PATH = path.resolve(path.dirname(TRANSLATIONS_JSON_PATH), TRANSLATIONS_CSV);
const TRANSLATIONS_SOURCE_FILE = `${TRANSLATIONS_DIRNAME}/en-US.json`;
const TRANSLATIONS_GLOB_PATTERN = `**/${TRANSLATIONS_SOURCE_FILE}`;
const TRANSLATIONS_GLOB_ROOT_PATH = path.resolve(PKG_ROOT_PATH, 'src');
const TRANSLATIONS_SOURCE_DIRNAME_TRIM_PATTERN = RegExp(
    `^${TRANSLATIONS_GLOB_ROOT_PATH}/?|/${TRANSLATIONS_DIRNAME}(?:/.*)?$`.replace('/', '\\/'),
    'gi'
);

module.exports = {
    getClosestDirectory,
    PKG_ROOT_PATH,
    TRANSLATIONS_CSV,
    TRANSLATIONS_CSV_PATH,
    TRANSLATIONS_DIRNAME,
    TRANSLATIONS_GLOB_PATTERN,
    TRANSLATIONS_GLOB_ROOT_PATH,
    TRANSLATIONS_JSON,
    TRANSLATIONS_JSON_PATH,
    TRANSLATIONS_SOURCE_DIRNAME_TRIM_PATTERN,
    TRANSLATIONS_SOURCE_FILE,
};
