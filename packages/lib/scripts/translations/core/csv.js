const $manifest = require('./manifest');
const { getWritable, getWritableForFileAtPath } = require('./writable');

const _normalizeCSVField = field => {
    const shouldBeQuoted = /[",]|\r\n/.test(field);
    const quoteEscapedField = field.replace(/"/g, '""');
    return shouldBeQuoted ? `"${quoteEscapedField}"` : quoteEscapedField;
};

const _getManifestData = async manifestFilePath => {
    if (!manifestFilePath) return $manifest.get();
    await $manifest.export({ output: manifestFilePath });
    return require(manifestFilePath);
};

const exportCSV = async options => {
    const { header, manifest, output, silent, smartling } = await (async () => ({ ...options }))().catch(() => ({}));
    const { _dictionary: data } = await _getManifestData(manifest);
    const { end: writeEnd, write } =
        (output ? await getWritableForFileAtPath(output, true) : silent === true ? null : await getWritable(process.stdout)) ?? {};

    if (!write) return;

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
        await write(`${_normalizeCSVField(key)},${_normalizeCSVField(translation)}\r\n`);
    }

    await writeEnd();
};

module.exports = {
    export: exportCSV,
};
