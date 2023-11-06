const { glob } = require('glob');
const path = require('path');
const { sortJSON, computeMd5Hash } = require('./helpers');
const { TRANSLATIONS_GLOB_PATTERN, TRANSLATIONS_GLOB_ROOT_PATH, TRANSLATIONS_SUB_PATH_REGEX } = require('./constants');

glob(TRANSLATIONS_GLOB_PATTERN, {
    cwd: TRANSLATIONS_GLOB_ROOT_PATH,
}).then(async paths => {
    const hashesJson = {};
    const manifest = {};
    const translations = {};

    for await (const _path of paths) {
        const dir = path.dirname(_path).replace(TRANSLATIONS_SUB_PATH_REGEX, '');
        const [, json] = await sortJSON(path.resolve(TRANSLATIONS_GLOB_ROOT_PATH, _path));
        const hash = computeMd5Hash(JSON.stringify(json));

        hashesJson[hash] = json;
        manifest[dir] = hash;
    }

    Object.keys(hashesJson)
        .sort()
        .forEach(hash => {
            const json = hashesJson[hash];
            for (const key of Object.keys(json)) {
                translations[`${hash}:${key}`] = json[key];
            }
        });
});
