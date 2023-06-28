import { useLayoutEffect, useMemo, useRef } from 'preact/hooks';
import { bindAction, registerReflexable, unbindAction } from './registry';
import { NullableReflexable, Reflex, ReflexAction } from './types';

const useReflex = <T = any>(action: ReflexAction<T>, reflexable?: NullableReflexable<T>) => {
    const cachedReflex = useRef<Reflex<T>>();
    const cachedReflexable = useRef<Exclude<typeof reflexable, undefined>>(null);
    const cachedReflexAction = useRef<typeof action>(action);

    useLayoutEffect(
        useMemo(() => {
            const cleanup = () => {
                cachedReflexable.current && unbindAction(cachedReflexable.current, cachedReflexAction.current);
            };
            return () => cleanup;
        }, []),
        []
    );

    return useMemo((): Reflex<T> => {
        const currentReflexable = reflexable ?? null;

        if (cachedReflexAction.current === action && cachedReflexable.current === currentReflexable) {
            if (cachedReflex.current) return cachedReflex.current;
        } else if (cachedReflexable.current) {
            unbindAction(cachedReflexable.current, cachedReflexAction.current);

            if (cachedReflexable.current === currentReflexable) {
                bindAction(cachedReflexable.current, (cachedReflexAction.current = action));
                if (cachedReflex.current) return cachedReflex.current;
            }
        }

        cachedReflexAction.current = action;

        if ((cachedReflexable.current = currentReflexable)) {
            return (cachedReflex.current = registerReflexable(cachedReflexable.current, cachedReflexAction.current)[0]);
        }

        const reflex = (instance: T | null) => {
            if (_current === instance) return;
            const previous = _current;
            action((_current = instance), previous);
        };

        let _current: T | null = null;

        return (cachedReflex.current = Object.defineProperties(reflex, {
            _ref: { value: reflex },
            current: { get: () => _current },
        }) as Reflex<T>);
    }, [action, reflexable]);
};

export default useReflex;
