import { useLayoutEffect, useRef, useState } from 'preact/hooks';
import { detachEffect, registerRef } from './internal/registry';
import { CallbackRefEffect, List, NullableTrackableRefArgument, TrackableRefRecord } from './types';

const EXCESS_SPACE_REGEX = /^\s+|\s+(?=\s|$)/g;

const $ElementRefProto = Object.freeze(
    Object.create(null, {
        toString: {
            value(this: { ref: TrackableRefRecord<Element>[0] }) {
                return this.ref.current?.id ?? '';
            },
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

const useElementUniqueIdRefs = (...refs: List<NullableTrackableRefArgument<Element>>) => {
    const [id, setId] = useState('');
    const references = useRef<{ ref: TrackableRefRecord<Element>[0] }[]>([]);

    const effect = useRef<CallbackRefEffect<Element>>(() => {
        setId(references.current.join(' ').replace(EXCESS_SPACE_REGEX, ''));
    });

    useLayoutEffect(() => {
        for (const ref of uniqueFlatten(refs)) {
            if (!ref) return;

            const reference = Object.create($ElementRefProto, {
                ref: { value: registerRef(ref, effect.current)[0] },
            });

            references.current.push(reference);
            effect.current(reference.ref.current, null);
        }

        return () => {
            references.current.forEach(({ ref }) => detachEffect(ref, effect.current));
            references.current.length = 0;
        };
    });

    return id;
};

export default useElementUniqueIdRefs;
