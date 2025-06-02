import { Ref, RefCallback, RefObject } from 'preact';
import { useMemo } from 'preact/hooks';
import { isFunction, noop } from '../utils';

export interface TrackedRef<T> {
    (instance: T | null): void;
    get current(): T | null;
    set current(instance: T | null);
}

export const useTrackedRef = <T>(ref?: Ref<T>) => {
    return useMemo<TrackedRef<T>>(() => {
        let currentInstance: TrackedRef<T>['current'] = (ref as RefObject<T>)?.current ?? null;
        let updateRef: RefCallback<T> = noop;

        if (ref) {
            // prettier-ignore
            updateRef = isFunction(ref)
                ? ref // ref is a ref callback (will be used as is)

                // ref is a ref object (with current property)
                // use a callback that takes the next ref instance and updates ref
                : instance => void (ref.current = instance);
        }

        // ref callback that takes next ref instance,
        // and updates both currentInstance and ref
        const trackedRef: RefCallback<T> = instance => {
            currentInstance = instance;
            updateRef(instance);
        };

        return Object.defineProperty(trackedRef as TrackedRef<T>, 'current', {
            enumerable: true,
            get: () => currentInstance,
            set: trackedRef,
        });
    }, [ref]);
};

export default useTrackedRef;
