import type { ComponentType } from 'preact';
import type { CdnComponentResult, CdnComponentName, InferCdnComponentProps } from '../../types';
import { useEffect, useRef, useState } from 'preact/hooks';
import useCoreContext from '../../../../Context/useCoreContext';

export const useCdnComponent = <Name extends CdnComponentName>(name: Name): CdnComponentResult<ComponentType<InferCdnComponentProps<Name>>> => {
    const { getCdnComponent } = useCoreContext();

    const [component, setComponent] = useState<ComponentType<InferCdnComponentProps<Name>> | null>(null);
    const [error, setError] = useState<Error | null>(null);
    const [loading, setLoading] = useState(false);

    const mountedRef = useRef(false);

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);

    useEffect(() => {
        const load = async () => {
            try {
                if (mountedRef.current) {
                    setLoading(true);
                    const component = (await getCdnComponent<ComponentType<InferCdnComponentProps<Name>>>?.({ name })) ?? null;

                    if (mountedRef.current) {
                        // Wrap in function to prevent Preact from treating component as state initializer
                        setComponent(() => component);
                        setLoading(false);
                    }
                }
            } catch (err) {
                if (mountedRef.current) {
                    setError(err instanceof Error ? err : new Error(String(err)));
                    setLoading(false);
                }
            }
        };

        void load();
    }, [name, getCdnComponent]);

    return { component, loading, error } as const;
};
