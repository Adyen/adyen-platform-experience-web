import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';

// [TODO]: Modify hook to also accept object with initial values
const useReactiveObject = <Key extends string, Value = any>(keys: Key[]) => {
    const VERSION = useRef(0);
    const [ version, setVersion ] = useState(VERSION.current);
    const incrementVersion = useCallback(() => setVersion(version => version + 1), []);

    const reactiveObject = useMemo(() => {
        const reactiveObject: {[P in Key]?: Value} = Object.create(null);
        const pendingUpdateBlocks = [0];

        let updatesCount = 0;

        for (let index = 0, len = keys.length; index < len; index++) {
            const property = keys[index] as Key;
            const block = Math.floor(index / 31);
            const bitmask = 1 << (index % 31);

            let latestValue: Value | undefined;
            let value = latestValue;
            let version = VERSION.current;

            if (pendingUpdateBlocks[block] === undefined) {
                pendingUpdateBlocks[block] = 0;
            }

            Object.defineProperty(reactiveObject, property, {
                enumerable: true,
                get: () => {
                    if (version !== VERSION.current) {
                        version = VERSION.current;
                        value = latestValue;
                    }
                    return latestValue;
                },
                set: (updateValue?: Value) => {
                    if (version !== VERSION.current) {
                        version = VERSION.current;
                        value = latestValue;
                    }

                    (latestValue = updateValue) === value
                        ? (pendingUpdateBlocks[block] &= ~bitmask)
                        : (pendingUpdateBlocks[block] |= bitmask);

                    const count = ++updatesCount;

                    Promise.resolve().then(() => {
                        if (count === updatesCount && pendingUpdateBlocks.some(int => int)) {
                            incrementVersion();
                            pendingUpdateBlocks.fill(0);
                            updatesCount = 0;
                        }
                    });
                },
            });
        }

        return Object.seal(reactiveObject);
    }, [keys]);

    useEffect(() => { VERSION.current = version }, [version]);
    useEffect(() => { setVersion(0) }, [keys]);

    return [reactiveObject, version] as const;
};

export default useReactiveObject;
