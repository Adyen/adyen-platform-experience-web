import { useLayoutEffect, useRef, useState } from 'preact/hooks';
import { NullableReflexable, ReflexableRecord, ReflexAction, registerReflexable, unbindAction } from '../useReflex';

// [TODO]: This should belong to a shared type module
type List<T = any> = (List<T> | T)[];

type Reflexion = { reflex: ReflexableRecord<Element>[0] };

const EXCESS_SPACE_REGEX = /^\s+|\s+(?=\s|$)/g;

const $ElementRefProto = Object.freeze(
    Object.defineProperty(Object.create(null), 'toString', {
        value(this: Reflexion) {
            return this.reflex.current?.id ?? '';
        },
    })
);

const uniqueFlatten = <T>(items: List<T>, uniqueItems: Set<T> = new Set<T>()) => {
    for (const item of items) {
        if (Array.isArray(item)) uniqueFlatten(item, uniqueItems);
        else if (!uniqueItems.has(item)) uniqueItems.add(item);
    }
    return uniqueItems;
};

const useIdentifierString = (...refs: List<NullableReflexable<Element>>) => {
    const [id, setId] = useState('');
    const reflexions = useRef<Reflexion[]>([]);

    const callback = useRef<ReflexAction<Element>>(() => {
        setId(reflexions.current.join(' ').replace(EXCESS_SPACE_REGEX, ''));
    });

    useLayoutEffect(() => {
        for (const ref of uniqueFlatten(refs)) {
            if (!ref) return;

            const reflexion = Object.create($ElementRefProto, {
                reflex: { value: registerReflexable(ref, callback.current)[0] },
            });

            reflexions.current.push(reflexion);
            callback.current(reflexion.reflex.current, null);
        }

        return () => {
            reflexions.current.forEach(({ reflex }) => unbindAction(reflex, callback.current));
            reflexions.current.length = 0;
        };
    });

    return id;
};

export default useIdentifierString;
