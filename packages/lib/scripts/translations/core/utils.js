const crypto = require('crypto');
const path = require('path');
const prettier = require('prettier');
const { PKG_ROOT_PATH } = require('../constants');

const useJSON = async filepath => {
    const _path = path.resolve(PKG_ROOT_PATH, filepath);
    if (path.extname(_path).toLowerCase() === '.json') return require(_path);
    throw new TypeError('Expected JSON file');
};

const sortJSON = async filepath => {
    const json = await useJSON(filepath);
    return Object.fromEntries(Object.entries(json).sort(([a], [b]) => (a < b ? -1 : +(a > b))));
};

const prettifyJSON = (() => {
    const _prettifyOptions = (async () => ({
        ...(await prettier.resolveConfig(PKG_ROOT_PATH)),
        parser: 'json',
    }))();

    return async data => prettier.format(JSON.stringify(typeof data === 'string' ? JSON.parse(data) : data, null, 4), await _prettifyOptions);
})();

const computeMd5Hash = (value, encoding = 'hex') =>
    crypto
        .createHash('md5')
        .update(typeof value === 'string' ? value : JSON.stringify(value))
        .digest()
        .toString(encoding);

module.exports = {
    computeMd5Hash,
    prettifyJSON,
    sortJSON,
    useJSON,
};
