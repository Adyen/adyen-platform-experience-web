const fs = require('fs/promises');
const path = require('path');
const { glob } = require('glob');
const { computeMd5Hash, prettifyJSON, sortJSON } = require('./utils');
const {
    TRANSLATIONS_GLOB_PATTERN,
    TRANSLATIONS_GLOB_ROOT_PATH,
    TRANSLATIONS_JSON_PATH,
    TRANSLATIONS_SOURCE_FILE,
    TRANSLATIONS_SOURCE_DIRNAME_TRIM_PATTERN,
} = require('./constants');

const _getJsonFromPath = async filepath => {
    const json = await sortJSON(filepath);
    const prettyJson = await prettifyJSON(json);
    const translationsFile = await fs.open(filepath, 'w');
    await translationsFile.writeFile(prettyJson);

    const checksum = computeMd5Hash(json);
    const lastModified = (await translationsFile.stat()).mtimeMs;
    await translationsFile.close();

    return { checksum, json, lastModified };
};

const _generateManifestUpdateData = async () => {
    const data = {
        _checksum: null,
        _dictionary: {},
        _filesWithProblem: new Set(),
        _manifest: {},
        _shouldUpdate: false,
    };

    const [currentManifest, sourcePaths] = await Promise.all([
        (async () => require(TRANSLATIONS_JSON_PATH)?._manifest ?? {})().catch(() => ({})), // current manifest
        glob(TRANSLATIONS_GLOB_PATTERN, { absolute: true, cwd: TRANSLATIONS_GLOB_ROOT_PATH }).catch(() => []), // translations source paths
    ]);

    const normalizedFileEntriesFromCurrentManifest = Object.keys(currentManifest).map(dir => [
        path.resolve(TRANSLATIONS_GLOB_ROOT_PATH, dir, TRANSLATIONS_SOURCE_FILE),
        dir,
    ]);

    const normalizedFileEntriesFromSourcePaths = sourcePaths.map(_path => [
        _path,
        path.dirname(_path).replace(TRANSLATIONS_SOURCE_DIRNAME_TRIM_PATTERN, ''),
    ]);

    const fileEntriesMap = new Map([...normalizedFileEntriesFromSourcePaths, ...normalizedFileEntriesFromCurrentManifest]);

    for await (const [filepath, dir] of fileEntriesMap) {
        try {
            let { checksum, lastModified } = currentManifest[dir] || {};
            let json = require(filepath);

            if (!checksum || checksum !== computeMd5Hash(json)) {
                try {
                    ({ checksum, json, lastModified } = await _getJsonFromPath(filepath));
                    // file has changed or was recently added since after the last manifest
                    // the manifest should update
                    data._shouldUpdate ||= true;
                } catch {
                    // there was some problem processing this file
                    data._filesWithProblem.add(filepath);
                    continue;
                }
            }

            const prefix = checksum.slice(0, 8);

            for (const key of Object.keys(json)) {
                data._dictionary[`${prefix}:${key}`] = json[key];
            }

            data._manifest[dir] = { checksum, lastModified };
        } catch {
            // file has been removed from the filesystem since after the last manifest
            // the manifest should update
            data._shouldUpdate ||= true;
        }
    }

    data._checksum = computeMd5Hash(data._dictionary);
    data._dictionary = Object.freeze(data._dictionary);
    data._filesWithProblem = Object.freeze([...data._filesWithProblem]);
    data._manifest = Object.freeze(data._manifest);

    return Object.freeze(data);
};

const getManifest = () =>
    (async () => require(TRANSLATIONS_JSON_PATH))().catch(async () => {
        await updateManifestIfNecessary();
        return getManifest();
    });

const updateManifestIfNecessary = async () => {
    const manifest = await _generateManifestUpdateData();
    let translationsJsonFile = await fs.open(TRANSLATIONS_JSON_PATH, 'wx').catch(() => {});

    if (!translationsJsonFile && manifest._shouldUpdate) {
        // the translations.json file already exists and there is a pending manifest update
        // attempt to re-open the file with the less restrictive `'w'` flag
        translationsJsonFile = await fs.open(TRANSLATIONS_JSON_PATH, 'w').catch(() => {});
    }

    if (!translationsJsonFile) return;

    await new Promise(async (resolve, reject) => {
        const { _checksum, _dictionary, _manifest } = manifest;
        const prettyJson = await prettifyJSON({ _checksum, _dictionary, _manifest });
        const writable = translationsJsonFile.createWriteStream();
        const writeComplete = writable.end.bind(writable);

        let writeError = null;

        writable.once('close', () => {
            translationsJsonFile.close().then(
                value => (writeError ? reject(writeError) : resolve(value)),
                reason => reject(writeError || reason)
            );
        });

        writable.write(prettyJson, err => (writeError = err)) ? process.nextTick(writeComplete) : writable.once('drain', writeComplete);
    });
};

module.exports = {
    get: getManifest,
    update: updateManifestIfNecessary,
};
