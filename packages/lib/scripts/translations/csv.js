const manifest = require('./manifest');
const { getWritableForFileAtPath } = require('./writable');
const { TRANSLATIONS_CSV_PATH } = require('./constants');

const normalizeCSVField = field => {
    const shouldBeQuoted = /[",]|\r\n/.test(field);
    const quoteEscapedField = field.replace(/"/g, '""');
    return shouldBeQuoted ? `"${quoteEscapedField}"` : quoteEscapedField;
};

const updateCSVIfNecessary = async options => {
    await manifest.update();
    const { _dictionary: data } = (await manifest.get()).data;
    const { end: writeEnd, write } = (await getWritableForFileAtPath(TRANSLATIONS_CSV_PATH, true)) ?? {};

    if (!write) return;

    const { header, smartling } = await (async () => ({ ...options }))().catch(() => ({}));
    const forSmartling = smartling === true;
    const withHeaderLine = header === true;

    if (forSmartling) {
        await write(`# smartling.source_key_paths = 1\r\n`);
        await write(`# smartling.strip_instructions_on_download = TRUE\r\n`);
        await write(`# smartling.translations_in_columns = TRUE\r\n`);
        await write(`# smartling.first_row_header = TRUE\r\n`);
    }

    if (forSmartling || withHeaderLine) {
        await write(`key,en-US\r\n`);
    }

    for await (const [key, translation] of Object.entries(data)) {
        await write(`${normalizeCSVField(key)},${normalizeCSVField(translation)}\r\n`);
    }

    await writeEnd();
};

module.exports = {
    normalizeField: normalizeCSVField,
    update: updateCSVIfNecessary,
};
