import { useCallback, useEffect, useMemo, useRef } from 'preact/hooks';
import { attachCallback, createRefMapping, detachCallback, queueEffect } from './internal/namedRefRegistry';
import { NamedRef, NamedRefCallback, NamedRefRecord } from './types';
import { getUniqueId } from '../../utils/idGenerator';

// [TODO]: Add cleanup to remove reference record from registry when necessary
const useRefWithCallback = <T = any>(withCallback: NamedRefCallback<T>, identifier?: string) => {
    const cachedCallback = useRef<NamedRefCallback<T>>();
    const cachedCallbackRef = useRef<NamedRef<T> | null>(null);
    const cachedId = useRef<string>();
    const defaultId = useRef<string>();

    useEffect(
        useCallback(
            () => () => {
                if (cachedCallback.current) {
                    detachCallback(cachedId.current as string, cachedCallback.current);
                    cachedCallback.current = undefined;
                }
            },
            []
        ),
        []
    );

    return useMemo(() => {
        const id = identifier || defaultId.current || (defaultId.current = getUniqueId('ref'));

        if (cachedId.current !== id) {
            const reference = createRefMapping<T>((cachedId.current = id)) as NamedRefRecord<T>;

            cachedCallbackRef.current =
                reference[0] ||
                (reference[0] = (() => {
                    let refCurrent: T | null = null;

                    const callback = (current: T | null) => {
                        if (refCurrent === current) return;

                        try {
                            try {
                                for (const effect of reference[1]) queueEffect(effect);
                            } finally {
                                for (const [callback] of reference[2]) callback(current, refCurrent);
                            }
                        } finally {
                            refCurrent = current;
                        }
                    };

                    return Object.defineProperty(callback, 'current', { get: () => refCurrent }) as NamedRef<T>;
                })());
        }

        if (cachedCallback.current !== withCallback) {
            if (cachedCallback.current) detachCallback(cachedId.current, cachedCallback.current);
            if ((cachedCallback.current = withCallback)) attachCallback(cachedId.current, cachedCallback.current);
        }

        return cachedCallbackRef.current;
    }, [identifier, withCallback]);
};

export default useRefWithCallback;
