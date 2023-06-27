import { useLayoutEffect, useMemo, useRef } from 'preact/hooks';
import { attachEffect, detachEffect, registerRef } from './internal/registry';
import { CallbackRef, CallbackRefEffect, NullableTrackableRefArgument } from './types';

const useRefWithCallback = <T = any>(callback: CallbackRefEffect<T>, ref?: NullableTrackableRefArgument<T>) => {
    const cachedCallback = useRef<typeof callback>(callback);
    const cachedCallbackRef = useRef<CallbackRef<T>>();
    const cachedRef = useRef<Exclude<typeof ref, undefined>>(null);

    useLayoutEffect(
        useMemo(() => {
            const cleanup = () => {
                cachedRef.current && detachEffect(cachedRef.current, cachedCallback.current);
            };
            return () => cleanup;
        }, []),
        []
    );

    return useMemo((): CallbackRef<T> => {
        const currentRef = ref ?? null;

        if (cachedCallback.current === callback && cachedRef.current === currentRef) {
            if (cachedCallbackRef.current) return cachedCallbackRef.current;
        } else if (cachedRef.current) {
            detachEffect(cachedRef.current, cachedCallback.current);

            if (cachedRef.current === currentRef) {
                attachEffect(cachedRef.current, (cachedCallback.current = callback));
                if (cachedCallbackRef.current) return cachedCallbackRef.current;
            }
        }

        cachedCallback.current = callback;

        if ((cachedRef.current = currentRef)) {
            return (cachedCallbackRef.current = registerRef(cachedRef.current, cachedCallback.current)[0]);
        }

        const callbackRef = (instance: T | null) => {
            if (_current === instance) return;
            const previous = _current;
            callback((_current = instance), previous);
        };

        let _current: T | null = null;

        return (cachedCallbackRef.current = Object.defineProperties(callbackRef, {
            _ref: { value: callbackRef },
            current: { get: () => _current },
        }) as CallbackRef<T>);
    }, [callback, ref]);
};

export default useRefWithCallback;
