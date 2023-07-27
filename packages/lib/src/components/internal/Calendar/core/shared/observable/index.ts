import { Observable, ObservableCallback } from './types';
import { noop } from '../constants';
import { struct } from '../utils';

const observable = () => {
    let idle = true;
    const callbacks: Observable['callback'] = { idle: noop, resume: noop };
    const observers = new Set<ObservableCallback>();

    const resumeObservableIfIdle = () => {
        idle && !(idle = false) && callbacks.resume();
    };
    const idleObservableIfNecessary = () => {
        observers.size === 0 && (idle = true) && callbacks.idle();
    };

    const notifyObservers = (...args: any[]) => {
        if (idle) return false;
        observers.forEach(cb => cb(...args));
        return true;
    };

    const observe = (callback?: ObservableCallback) => {
        if (!callback) return noop;

        observers.add(callback);
        resumeObservableIfIdle();
        return () => {
            observers.delete(callback) && idleObservableIfNecessary();
        };
    };

    const callbackStruct = (() => {
        const descriptors = {} as {
            [K in keyof typeof callbacks]: PropertyDescriptor;
        };

        const factory = (type: keyof typeof callbacks) => ({
            get: () => callbacks[type],
            set: (callback?: ObservableCallback | null) => {
                if (callback == undefined) callbacks[type] = noop;
                else if (typeof callback === 'function' && callback !== callbacks[type]) callbacks[type] = callback;
            },
        });

        for (const key of Object.keys(callbacks) as (keyof typeof callbacks)[]) {
            descriptors[key] = factory(key);
        }

        return struct(descriptors) as Observable['callback'];
    })();

    return struct({
        callback: { value: callbackStruct },
        idle: { get: () => idle },
        notify: { value: notifyObservers },
        observe: { value: observe },
    }) as Observable;
};

export default observable;
