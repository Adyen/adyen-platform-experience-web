const fs = require('fs/promises');
const path = require('path');
const { glob } = require('glob');
const { computeMd5Hash, isTrue, parseOptions, prettifyJSON, sortJSON } = require('./utils');
const { getWritableForFileAtPath, getWritable } = require('./writable');
const {
    getClosestDirectory,
    EMPTY_OBJ,
    NOOP_OBJ,
    TRANSLATIONS_GLOB_PATTERN,
    TRANSLATIONS_GLOB_ROOT_PATH,
    TRANSLATIONS_JSON_PATH,
    TRANSLATIONS_SOURCE_FILE,
    TRANSLATIONS_SOURCE_DIRNAME_TRIM_PATTERN,
} = require('../constants');

const EMPTINESS_CHECKSUM = computeMd5Hash(EMPTY_OBJ);

const _sortJsonAtPath = async filepath => {
    const json = await sortJSON(filepath);
    const prettyJson = await prettifyJSON(json);
    const translationsFile = await fs.open(filepath, 'w');
    await translationsFile.writeFile(prettyJson);

    const checksum = computeMd5Hash(json);
    const lastModified = (await translationsFile.stat()).mtimeMs;
    await translationsFile.close();

    return { checksum, json, lastModified };
};

const getHashFromChecksum = checksum => checksum.slice(0, 8);

const getManifestData = async () => {
    const data = {
        _checksum: null,
        _dictionary: {},
        _filesWithProblem: new Set(),
        _manifest: {},
        _updated: false,
    };

    const [currentManifest, sourcePaths] = await Promise.all([
        (async () => require(TRANSLATIONS_JSON_PATH)?._manifest ?? EMPTY_OBJ)().catch(NOOP_OBJ), // current manifest
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
            let { checksum, lastModified } = currentManifest[dir] || EMPTY_OBJ;
            let json = require(filepath);

            if (!checksum || checksum !== computeMd5Hash(json)) {
                try {
                    ({ checksum, json, lastModified } = await _sortJsonAtPath(filepath));
                    // file has changed or was recently added since after the last manifest
                    // the manifest should update
                    data._updated ||= true;
                } catch {
                    // there was some problem processing this file
                    data._filesWithProblem.add(filepath);
                    continue;
                }
            }

            const hash = getHashFromChecksum(checksum);

            for (const key of Object.keys(json)) {
                data._dictionary[`${hash}:${key}`] = json[key];
            }

            data._manifest[dir] = { checksum, lastModified };
        } catch {
            // file has been removed from the filesystem since after the last manifest
            // the manifest should update
            data._updated ||= true;
        }
    }

    data._checksum = computeMd5Hash(data._dictionary);
    data._dictionary = Object.freeze(data._dictionary);
    data._filesWithProblem = Object.freeze([...data._filesWithProblem]);
    data._manifest = Object.freeze(data._manifest);

    return Object.freeze(data);
};

const exportManifest = async options => {
    const { output, silent } = await parseOptions(options);
    const { _checksum, _dictionary, _manifest, _updated } = await getManifestData();

    const { end: writeEnd } =
        (output
            ? await getWritableForFileAtPath(output, getClosestDirectory(output) === TRANSLATIONS_JSON_PATH ? _updated : true)
            : isTrue(silent)
            ? null
            : await getWritable(process.stdout)) ?? EMPTY_OBJ;

    writeEnd && (await writeEnd(await prettifyJSON({ _checksum, _dictionary, _manifest })));
};

module.exports = {
    EMPTINESS_CHECKSUM,
    export: exportManifest,
    get: getManifestData,
    getHashFromChecksum,
};
