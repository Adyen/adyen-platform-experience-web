const fs = require('fs/promises');
const { glob } = require('glob');
const path = require('path');
const prettier = require('prettier');
const { computeMd5Hash, sortJSON } = require('./utils');
const {
    PKG_ROOT_PATH,
    TRANSLATIONS_GLOB_PATTERN,
    TRANSLATIONS_GLOB_ROOT_PATH,
    TRANSLATIONS_JSON_PATH,
    TRANSLATIONS_SOURCE_FILE,
    TRANSLATIONS_SOURCE_DIRNAME_TRIM_PATTERN,
} = require('./constants');

const PRETTY_OPTIONS = (async () => ({
    ...(await prettier.resolveConfig(PKG_ROOT_PATH)),
    parser: 'json',
}))();

const _getManifest = () =>
    (async () => require(TRANSLATIONS_JSON_PATH))()
        .catch(() => {})
        .then(json => json?._manifest ?? {});

const getManifest = () =>
    (async () => require(TRANSLATIONS_JSON_PATH))().catch(async () => {
        await glob(TRANSLATIONS_GLOB_PATTERN, {
            cwd: TRANSLATIONS_GLOB_ROOT_PATH,
        }).then(updateManifestIfNecessary);

        return getManifest();
    });

/**
 * Writes into the translations manifest data into the target file
 * @param sourcePaths An optional array of file paths that contain translation definitions.
 * @returns {Promise<void>}
 */
const updateManifestIfNecessary = async (sourcePaths = []) => {
    const MANIFEST = await _getManifest();
    const DIRS = new Set();

    const _dictionary = {};
    const _manifest = {};
    let _manifestWillUpdate = false;

    for await (const _path of [...Object.keys(MANIFEST), ...sourcePaths]) {
        const dir = path.dirname(_path).replace(TRANSLATIONS_SOURCE_DIRNAME_TRIM_PATTERN, '');

        if (!DIRS.has(dir)) {
            DIRS.add(dir);
        } else continue;

        const currentManifestData = MANIFEST[dir];
        const translationsFilePath = path.resolve(TRANSLATIONS_GLOB_ROOT_PATH, dir, TRANSLATIONS_SOURCE_FILE);
        let translationsFileJson;

        try {
            [, translationsFileJson] = await sortJSON(translationsFilePath);
        } catch {
            /**
             * > If code execution reaches this point, it means:
             * > The current translations source file could not be found in the filesystem.
             */
            if (currentManifestData) {
                // The current translations source file previously existed in the filesystem.
                // Since it has now been removed, the manifest should update.
                _manifestWillUpdate ||= true;
            }

            continue;
        }

        const checksum = computeMd5Hash(translationsFileJson);
        const prefix = checksum.slice(0, 8);

        if (currentManifestData && currentManifestData.checksum === checksum) {
            _manifest[dir] = currentManifestData;
        } else {
            const prettyJSON = await prettier.format(JSON.stringify(translationsFileJson, null, 4), await PRETTY_OPTIONS);
            const translationsFile = await fs.open(translationsFilePath, 'w');

            await translationsFile.writeFile(prettyJSON);
            const { mtimeMs: lastModified } = await translationsFile.stat();
            await translationsFile.close();

            _manifest[dir] = { checksum, lastModified };

            // The current translations source file did not exist before in the filesystem.
            // Since it has now been recently added, the manifest should update.
            _manifestWillUpdate ||= true;
        }

        for (const key of Object.keys(translationsFileJson)) {
            _dictionary[`${prefix}:${key}`] = translationsFileJson[key];
        }
    }

    const translationsJsonFileHandle = await fs.open(TRANSLATIONS_JSON_PATH, 'wx').catch(() => {
        /**
         * > If code execution reaches this point, it means:
         * > The translations.json file already exists in the filesystem.
         */
        if (_manifestWillUpdate) {
            // Since the manifest needs to be updated, attempt to re-open the file with the `'w'` flag.
            return fs.open(TRANSLATIONS_JSON_PATH, 'w').catch(() => {});
        }
    });

    translationsJsonFileHandle &&
        (await new Promise(async (resolve, reject) => {
            let writeError = null;

            const prettyJSON = await prettier.format(
                JSON.stringify({ _checksum: computeMd5Hash(_dictionary), _dictionary, _manifest }, null, 4),
                await PRETTY_OPTIONS
            );

            const writable = translationsJsonFileHandle.createWriteStream();

            writable.once('close', () => {
                translationsJsonFileHandle.close().then(
                    value => (writeError ? reject(writeError) : resolve(value)),
                    reason => reject(writeError || reason)
                );
            });

            writable.write(prettyJSON, err => (writeError = err))
                ? process.nextTick(() => writable.end())
                : writable.once('drain', () => writable.end());
        }));
};

module.exports = {
    get: getManifest,
    update: updateManifestIfNecessary,
};
