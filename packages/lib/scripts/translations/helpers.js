const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');
const prettier = require('prettier');
const { PKG_ROOT_PATH } = require('./constants');

const useJSON = async filepath => {
    const _path = path.resolve(PKG_ROOT_PATH, filepath);
    if (path.extname(_path).toLowerCase() !== '.json') {
        throw 'Expected JSON file';
    }
    return [_path, require(_path)];
};

const sortJSON = async (filepath, overwriteFile = false) => {
    const [_path, json] = await useJSON(filepath);
    const sortedJSON = Object.fromEntries(Object.entries(json).sort(([a], [b]) => (a < b ? -1 : +(a > b))));

    if (overwriteFile === true) {
        const prettyJSON = await prettier.format(JSON.stringify(sortedJSON, null, 4), { parser: 'json' });
        await fs.writeFile(_path, prettyJSON);
    }

    return [_path, sortedJSON];
};

const computeMd5Hash = (value, encoding = 'hex') => crypto.createHash('md5').update(value).digest().toString(encoding);

module.exports = {
    computeMd5Hash,
    sortJSON,
    useJSON,
};
