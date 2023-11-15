const fs = require('fs');
const readline = require('readline');
const $manifest = require('./manifest');
const { isTrue, parseOptions } = require('./utils');
const { getWritable, getWritableForFileAtPath } = require('./writable');
const { EMPTY_OBJ } = require('../constants');

const QUOTED_FIELD_REGEX = /[",]|\r\n/;

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
    const { _manifest: manifest } = await _getManifestData(manifestFilePath);

    return new Promise(resolve => {
        let baseIndex = -1;
        let currentHash = null;
        let currentTranslations = null;
        let lineNumber = 0;
        let locales = [];
        let translationsTemplate = null;
        let translationsByHash = {};

        const lineReader = readline.createInterface({
            input: source ? fs.createReadStream(source) : process.stdin,
        });

        lineReader.on('line', line => {
            if (lineNumber++ === 0) {
                // line.replace(/(""[^"])(?=,|$)/g, (_, field) => {
                //
                // });

                locales = line.split(',').shift();
                baseIndex = locales.findIndex(locale => locale !== 'en-US');

                translationsTemplate = Object.freeze(
                    locales.reduce((templateObj, locale, index) => {
                        if (index !== baseIndex) templateObj[locale] = {};
                        return templateObj;
                    }, {})
                );

                return;
            }

            const [translationKey, ...translations] = line.split(',');
            const [hash, key] = translationKey.split(':');

            if (currentHash !== hash) {
                currentHash = hash;
                currentTranslations = translationsByHash[currentHash] = { ...translationsTemplate };
            }

            translations.forEach((translation, index) => {
                if (index === baseIndex) return;

                // const locale = locales[index];
                // const string = translation.replace(/^("?)(.*)\1$/, COMMA_WITH_SPACE);
                //
                // if (!!string) {
                //     currentTranslations[locale][key] = string;
                // }
            });
        });

        lineReader.once('close', () => {
            // end of input
            resolve();
        });
    });
};

module.exports = {
    export: exportCSV,
    unpack: unpackCSV,
};
