import { Observable, ObservableAtoms, ObservableCallable, ObservableCallback } from './types';
import { OBSERVABLE_DISCONNECT_SIGNAL } from './constants';
import { noop } from '../constants';
import { struct } from '../utils';

const observable = <T extends Record<string, any>>(atoms = {} as ObservableAtoms<T>) => {
    let snapshot: T | undefined;
    let idle = true;
    const observers = new Map<ObservableCallback<T>, Set<ObservableCallable<void>>>();

    const callbacks = (() => {
        const callbacks: Observable<T>['callback'] = { idle: noop, resume: noop };
        const descriptors = {} as {
            [K in keyof typeof callbacks]: PropertyDescriptor;
        };

        const factory = (type: keyof typeof callbacks) => ({
            get: () => callbacks[type],
            set: (callback?: ObservableCallable<any> | null) => {
                if (callback == undefined) callbacks[type] = noop;
                else if (typeof callback === 'function' && callback !== callbacks[type]) callbacks[type] = callback;
            },
        });

        for (const key of Object.keys(callbacks) as (keyof typeof callbacks)[]) {
            descriptors[key] = factory(key);
        }

        return struct(descriptors) as Observable<T>['callback'];
    })();

    const state = (() => {
        const descriptors = {} as {
            [K in keyof T]: {
                enumerable: true;
                get: () => ObservableCallable<T[K]>;
            };
        };

        for (const key of Object.keys(atoms) as (keyof T)[]) {
            const { get, value } = Object.getOwnPropertyDescriptor(atoms, key) as PropertyDescriptor;
            descriptors[key] = {
                enumerable: true,
                get:
                    get ||
                    (typeof value === 'function'
                        ? () => value() // ensures that the `this` binding of the getter function is preserved
                        : () => value),
            };
        }

        return struct(descriptors) as T;
    })();

    const resumeObservableIfIdle = () => {
        if (idle) {
            idle = false;
            snapshot = snapshot || { ...state };
            callbacks.resume();
        }
    };

    const idleObservableIfNecessary = () => {
        if (observers.size === 0) {
            idle = true;
            snapshot = undefined;
            callbacks.idle();
        }
    };

    const notifyObservers = (signal?: typeof OBSERVABLE_DISCONNECT_SIGNAL) => {
        if (idle) return;

        if (signal === OBSERVABLE_DISCONNECT_SIGNAL) {
            observers.forEach((_, cb) => cb(signal));
            return true;
        }

        const currentSnapshot = snapshot as T;
        snapshot = { ...state };

        for (const key of Object.keys(snapshot) as (keyof T)[]) {
            if (snapshot[key] !== currentSnapshot[key] && snapshot[key] === snapshot[key]) {
                observers.forEach((_, cb) => cb(snapshot as T));
                return true;
            }
        }

        return false;
    };

    const observe = (callback?: ObservableCallback<T>) => {
        if (!callback) return noop;

        const unobserveCallback = () => {
            const unobserveCallbacks = observers.get(callback);
            if (unobserveCallbacks?.delete(unobserveCallback) && unobserveCallbacks.size === 0) {
                observers.delete(callback) && idleObservableIfNecessary();
            }
        };

        let unobserveCallbacks = observers.get(callback);

        if (!unobserveCallbacks) {
            observers.set(callback, (unobserveCallbacks = new Set()));
        }

        unobserveCallbacks.add(unobserveCallback);
        resumeObservableIfIdle();
        callback(snapshot as T);

        return unobserveCallback;
    };

    return struct({
        callback: { value: callbacks },
        idle: { get: () => idle },
        notify: { value: notifyObservers },
        observe: { value: observe },
        snapshot: { get: () => ({ ...(snapshot || state) }) },
    }) as Observable<T>;
};

export default observable;
