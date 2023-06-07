import { useLayoutEffect, useRef, useState } from 'preact/hooks';
import { createRefMapping } from './internal/namedRefRegistry';
import { NamedRefRecord, List } from './types';

const EXCESS_SPACE_REGEX = /^\s+|\s+(?=\s|$)/g;

const $ElementRefProto = Object.freeze(
    Object.create(null, {
        toString: {
            value(this: { ref: NamedRefRecord<Element> }) {
                return this.ref[0]?.current?.id ?? '';
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

const useIdRefs = (...identifiers: List<string>) => {
    const [id, setId] = useState('');
    const references = useRef<{ ref: NamedRefRecord<Element> }[]>([]);

    const effect = useRef(() => {
        setId(references.current.join(' ').replace(EXCESS_SPACE_REGEX, ''));
    });

    useLayoutEffect(() => {
        for (const identifier of uniqueFlatten(identifiers)) {
            references.current.push(
                Object.create($ElementRefProto, {
                    ref: { value: createRefMapping<Element>(identifier, effect.current) },
                })
            );
        }
        return () => references.current.forEach(reference => reference.ref[1].delete(effect.current));
    }, []);

    return id;
};

export default useIdRefs;
