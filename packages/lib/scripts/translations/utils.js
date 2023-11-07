const crypto = require('crypto');
const path = require('path');
const { PKG_ROOT_PATH } = require('./constants');

const useJSON = async filepath => {
    const _path = path.resolve(PKG_ROOT_PATH, filepath);
    if (path.extname(_path).toLowerCase() !== '.json') {
        throw 'Expected JSON file';
    }
    return [_path, require(_path)];
};

const sortJSON = async filepath => {
    const [_path, json] = await useJSON(filepath);
    const sortedJSON = Object.fromEntries(Object.entries(json).sort(([a], [b]) => (a < b ? -1 : +(a > b))));
    return [_path, sortedJSON];
};

const computeMd5Hash = (value, encoding = 'hex') =>
    crypto
        .createHash('md5')
        .update(typeof value === 'string' ? value : JSON.stringify(value))
        .digest()
        .toString(encoding);

module.exports = {
    computeMd5Hash,
    sortJSON,
    useJSON,
};
