const fs = require('fs/promises');

const _getWritableHandleForFileAtPath = async (filePath, retryOpenIfExists) => {
    let fileHandle = await fs.open(filePath, 'wx').catch(() => {});
    let lessRestrictiveRetry = (await retryOpenIfExists) === true;

    try {
        if (typeof retryOpenIfExists === 'function') {
            lessRestrictiveRetry = (await retryOpenIfExists()) === true;
        }
    } catch (ex) {
        /* ignore exception and retain the current value for `lessRestrictiveRetry` */
        console.error(ex);
    }

    if (!fileHandle && lessRestrictiveRetry) {
        // the file already exists and there is an opportunity to retry opening it
        // attempt to re-open the file with the less restrictive `'w'` flag
        fileHandle = await fs.open(filePath, 'w').catch(() => {});
    }

    return fileHandle;
};

const getWritableForFileAtPath = async (filePath, retryOpenIfExists) => {
    const fileHandle = await _getWritableHandleForFileAtPath(filePath, retryOpenIfExists);

    if (!fileHandle) return;

    const writeComplete = (...args) =>
        (writeCompletePromise ||= new Promise((resolve, reject) => {
            writable.once('close', () => {
                fileHandle.close().then(
                    () => (writeError == null ? resolve() : reject(writeError)),
                    reason => reject(writeError || reason)
                );
            });

            args.length ? writable.end(args[0]) : writable.end();
        }));

    const writeOperation = executor =>
        typeof executor !== 'function'
            ? writeOperation(() => {})
            : (...args) =>
                  (writePromise = (writePromise || Promise.resolve()).then(
                      () => writeCompletePromise || new Promise(resolve => executor(resolve, ...args))
                  ));

    const end = writeOperation((resolve, ...args) => resolve(writeComplete(...args)));

    const write = writeOperation((resolve, data) => {
        const done = () => (writeError == null ? resolve() : resolve(writeComplete()));
        writable.write(data, error => (writeError = error)) ? process.nextTick(done) : writable.once('drain', done);
    });

    const writable = fileHandle.createWriteStream();

    let writeCompletePromise = null;
    let writeError = null;
    let writePromise = null;

    return { end, write };
};

module.exports = {
    getWritableForFileAtPath,
};
