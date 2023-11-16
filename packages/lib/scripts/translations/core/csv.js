const fs = require('fs');
const path = require('path');
const readline = require('readline');
const $manifest = require('./manifest');
const { isTrue, parseOptions, prettifyJSON } = require('./utils');
const { getWritable, getWritableForFileAtPath } = require('./writable');
const { EMPTY_OBJ, TRANSLATIONS_DIRNAME, TRANSLATIONS_GLOB_ROOT_PATH } = require('../constants');

const QUOTED_FIELD_REGEX = /[",]|\r?\n/;
const MATCH_FIELD_REGEX = /((?<=^|,)[^",\r\n]*?(?=,|$|\r?\n)|(?<=(?:^|,)")[\s\S]*?(?="(?:,|$|\r?\n)))/g;

const _normalizeCSVField = field => {
    const shouldBeQuoted = QUOTED_FIELD_REGEX.test(field);
    const quoteEscapedField = field.replace('"', '""');
    return shouldBeQuoted ? `"${quoteEscapedField}"` : quoteEscapedField;
};

const _getManifestData = async manifestFilePath => {
    if (!manifestFilePath) return $manifest.get();
    await $manifest.export({ output: manifestFilePath });
    return require(manifestFilePath);
};

const _parseSourceCSV = source =>
    new Promise((resolve, reject) => {
        let baseIndex = -1;
        let currentHash = null;
        let currentTranslations = null;
        let lineNumber = 0;
        let locales = null;
        let translationsByHash = {};

        const lineReader = readline.createInterface({
            input: source ? fs.createReadStream(source) : process.stdin,
        });

        lineReader.once('close', () => resolve(translationsByHash));

        lineReader.on('line', line => {
            try {
                if (lineNumber++ === 0) {
                    locales = line
                        .match(MATCH_FIELD_REGEX)
                        .map(field => field.replace('""', '"'))
                        .slice(1);

                    baseIndex = locales.findIndex(locale => locale === 'en-US');

                    if (baseIndex >= 0) return;
                    throw new Error('Missing header record in translations source data');
                }

                const [translationKey, ...translations] = line.match(MATCH_FIELD_REGEX).map(field => field.replace('""', '"'));
                const [hash, key] = translationKey.split(':');

                if (currentHash !== hash) {
                    currentTranslations = locales.reduce((templateObj, locale, index) => {
                        if (index !== baseIndex) templateObj[locale] = {};
                        return templateObj;
                    }, {});

                    translationsByHash[(currentHash = hash)] = currentTranslations;
                }

                translations.forEach((translation, index) => {
                    if (index === baseIndex) return;
                    const locale = locales[index];
                    translation && (currentTranslations[locale][key] = translation);
                });
            } catch (ex) {
                reject(ex);
                translationsByHash = {};
                lineReader.close();
            }
        });
    });

const exportCSV = async options => {
    const { header, output, silent, smartling } = await parseOptions(options);
    const { _dictionary: data } = await _getManifestData();
    const { end: writeEnd, write } =
        (output ? await getWritableForFileAtPath(output, true) : isTrue(silent) ? null : await getWritable(process.stdout)) ?? EMPTY_OBJ;

    if (!write) return;

    if (isTrue(smartling)) {
        await write(`# smartling.source_key_paths = 1\r\n`);
        await write(`# smartling.strip_instructions_on_download = TRUE\r\n`);
        await write(`# smartling.translations_in_columns = TRUE\r\n`);
        await write(`# smartling.first_row_header = TRUE\r\n`);
    }

    if (isTrue(smartling) || isTrue(header)) {
        await write(`key,en-US\r\n`);
    }

    for await (const [key, translation] of Object.entries(data)) {
        await write(`${_normalizeCSVField(key)},${_normalizeCSVField(translation)}\r\n`);
    }

    await writeEnd();
};

const unpackCSV = async options => {
    const { manifest: manifestFilePath, source } = await parseOptions(options);
    const { _checksum: checksum, _manifest: manifest } = await _getManifestData(manifestFilePath);
    const files = {};

    if (checksum && checksum !== $manifest.EMPTINESS_CHECKSUM) {
        const translationsByHash = await _parseSourceCSV(source);

        for await (const [dir, { checksum }] of Object.entries(manifest)) {
            const translations = translationsByHash[$manifest.getHashFromChecksum(checksum)];
            if (translations === undefined) continue;
            const dirname = path.resolve(TRANSLATIONS_GLOB_ROOT_PATH, dir, TRANSLATIONS_DIRNAME);

            for await (const [locale, json] of Object.entries(translations)) {
                const filepath = path.resolve(dirname, `${locale}.json`);
                try {
                    const { end: writeEnd } = await getWritableForFileAtPath(filepath, true);
                    writeEnd && (await writeEnd(await prettifyJSON(json)));
                    files[filepath] = true;
                } catch (ex) {
                    files[filepath] = false;
                    console.error(ex);
                }
            }
        }
    }

    return Object.freeze(files);
};

module.exports = {
    export: exportCSV,
    unpack: unpackCSV,
};
