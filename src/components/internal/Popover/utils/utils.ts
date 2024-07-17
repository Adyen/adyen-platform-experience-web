import { enumerable, isUndefined, struct, structFrom } from '../../../../utils';

type ObserverCallback = (entry: IntersectionObserverEntry) => void;

interface WithIntersectionObserver {
    remove: (this: { observerCallback: ObserverCallback }) => void;
}

interface ObserverInstance {
    observerCallback: ObserverCallback;
    observer: IntersectionObserver;
}

const getIntersectionObserver = (() => {
    const observerCallbackMap = new WeakMap<ObserverCallback, ObserverInstance & WithIntersectionObserver>();

    const withIntersectionObserver = struct({
        remove: enumerable(function () {
            remove(this.observerCallback);
        } as WithIntersectionObserver['remove']),
    }) as WithIntersectionObserver;

    const findObserver = (callbackFn: ObserverCallback) => {
        let observerInstance = observerCallbackMap.get(callbackFn);

        if (isUndefined(observerInstance)) {
            const observer = new IntersectionObserver(
                entries => {
                    entries.forEach(entry => {
                        if (callbackFn) callbackFn(entry);
                    });
                },
                { root: null, rootMargin: '', threshold: [1] }
            );

            observerInstance = structFrom(withIntersectionObserver, {
                observerCallback: enumerable(callbackFn),
                observer: enumerable(observer),
            }) as ObserverInstance & WithIntersectionObserver;

            observerCallbackMap.set(callbackFn, observerInstance);
        }

        return observerInstance;
    };

    const remove = (callbackFn: ObserverCallback) => {
        const currentObserver = observerCallbackMap.get(callbackFn);
        currentObserver?.observer.disconnect();
        observerCallbackMap.delete(callbackFn);
    };

    return findObserver;
})();

export default getIntersectionObserver;
