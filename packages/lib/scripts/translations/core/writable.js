const fs = require('fs/promises');

const _getWriteHandleForFileAtPath = async (filePath, retryOpenIfExists) => {
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

const _isNeverEndingStream = (() => {
    const NEVER_ENDING_STREAMS = [process.stderr, process.stdin, process.stdout];
    return stream => NEVER_ENDING_STREAMS.includes(stream);
})();

const getWritable = async (writable, initialize) => {
    let writeAbortController = null;
    let writeCompletePromise = null;
    let writeError = null;
    let writePromise = null;

    let writeComplete = (...args) =>
        (writeCompletePromise ||= new Promise(resolve => {
            resolve(writablePromise);
            args.length ? writable.end(args[0]) : writable.end();
        }));

    const isNeverEndingStream = _isNeverEndingStream(writable);

    if (isNeverEndingStream) {
        writeComplete = (...args) => {
            writeCompletePromise ||= new Promise(async resolve => {
                resolve(writablePromise);

                if (args.length) {
                    await new Promise(resolve => {
                        writable.write(args[0], err => (writeError = err)) ? process.nextTick(resolve) : writable.once('drain', resolve);
                    });
                }

                writeAbortController?.abort();
            });
        };

        writeAbortController = new AbortController();
    }

    const writablePromise = (async () => {
        const promise = new Promise((resolve, reject) => {
            const onFinishListener = async () => {
                writeAbortController = null;

                try {
                    if (typeof onFinishCallback === 'function') {
                        await onFinishCallback(writeError ?? null);
                    }
                    writeError == null ? resolve() : reject(writeError);
                } catch (reason) {
                    reject(writeError ?? reason);
                }
            };

            isNeverEndingStream
                ? writeAbortController?.signal.addEventListener('abort', onFinishListener)
                : writable.once('finish', onFinishListener);
        });

        const onFinishCallback = typeof initialize === 'function' ? await initialize() : null;
        return promise;
    })();

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
        writable.write(data, err => (writeError = err)) ? process.nextTick(done) : writable.once('drain', done);
    });

    return { end, write };
};

const getWritableForFileAtPath = async (filePath, retryOpenIfExists) => {
    const fileHandle = await _getWriteHandleForFileAtPath(filePath, retryOpenIfExists);
    return fileHandle && getWritable(fileHandle.createWriteStream(), () => () => fileHandle.close());
};

module.exports = {
    getWritable,
    getWritableForFileAtPath,
};
