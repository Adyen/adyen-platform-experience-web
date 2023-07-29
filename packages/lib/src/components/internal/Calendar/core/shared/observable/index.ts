import { Observable, ObservableCallable, ObservableCallback } from './types';
import { noop } from '../constants';
import { struct } from '../utils';

const observable = (instantNotification = false) => {
    let idle = true;
    const callbacks: Observable['callback'] = { idle: noop, resume: noop };
    const observers = new Map<ObservableCallback, ObservableCallable<void>>();

    const [captureNotificationArgs = noop, triggerInstantNotification = noop] = (() => {
        if (!instantNotification) return [];
        let lastNotificationArgs: any[];
        return [
            (...args: any[]) => {
                lastNotificationArgs = args;
            },
            (callback: ObservableCallback) => {
                lastNotificationArgs && callback(...lastNotificationArgs);
            },
        ];
    })();

    const resumeObservableIfIdle = () => {
        idle && !(idle = false) && callbacks.resume();
    };

    const idleObservableIfNecessary = () => {
        observers.size === 0 && (idle = true) && callbacks.idle();
    };

    const notifyObservers = (...args: any[]) => {
        captureNotificationArgs(...args);
        if (idle) return false;
        observers.forEach((_, cb) => cb(...args));
        return true;
    };

    const observe = (callback?: ObservableCallback) => {
        if (!callback) return noop;

        let unobserveCallback = observers.get(callback);

        if (!unobserveCallback) {
            unobserveCallback = () => {
                observers.delete(callback) && idleObservableIfNecessary();
            };

            observers.set(callback, unobserveCallback);
            resumeObservableIfIdle();
            triggerInstantNotification(callback);
        }

        return unobserveCallback;
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
