import { useCallback, useEffect, useRef, useState } from 'react';
import { AdyenPlatformExperience } from '../AdyenPlatformExperience';
import { getChanges } from '../playground/getChanges';

export interface AdyenElement {
    mount(target: Element): unknown;
    update(props: object): unknown;
    remove(): unknown;
}

export type AdyenElementClass<Props> = new (props: Props) => AdyenElement;
export type ElementProps<Props> = Omit<Props, 'core'>;

export const useAdyenElement = <Props extends { core: unknown }>(
    elementClass: AdyenElementClass<Props>,
    props: ElementProps<Props>,
    remountKey = ''
) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const elementRef = useRef<AdyenElement | null>(null);
    const propsRef = useRef(props);
    const [mountCount, setMountCount] = useState(0);

    useEffect(() => {
        const changes = getChanges(propsRef.current, props);
        propsRef.current = props;
        if (Object.keys(changes).length > 0) elementRef.current?.update(changes);
    }, [props]);

    useEffect(() => {
        let cancelled = false;
        let element: AdyenElement | null = null;

        AdyenPlatformExperience.getInstance()
            .then(({ core }) => {
                if (cancelled || !containerRef.current) return;
                element = new elementClass({ ...propsRef.current, core } as unknown as Props);
                element.mount(containerRef.current);
                elementRef.current = element;
            })
            .catch(error => console.error('[integration-demo] Failed to mount component:', error));

        return () => {
            cancelled = true;
            element?.remove();
            elementRef.current = null;
        };
    }, [elementClass, remountKey, mountCount]);

    const remount = useCallback(() => setMountCount(count => count + 1), []);

    return { containerRef, remount };
};
