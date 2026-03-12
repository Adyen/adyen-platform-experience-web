import { toChildArray } from 'preact';
import { useEffect, useMemo } from 'preact/hooks';
import { CoreContext } from '../CoreContext';
import { CoreProviderProps } from '../types';
import useBooleanState from '../../../hooks/useBooleanState';
import { waitForI18n, createCoreContextValue } from '../setupCore';

/**
 * CoreProvider Component
 * Wraps a component delaying the render until after the i18n module is fully loaded
 */
const CoreProvider = (props: CoreProviderProps) => {
    const { children } = props;
    const [ready, setReady] = useBooleanState(false);

    useEffect(() => {
        waitForI18n(props.i18n)
            .then(() => setReady(true))
            .catch();
    }, [props.i18n]);

    const coreContextValues = useMemo(
        () => createCoreContextValue(props),
        [
            props.commonProps,
            props.componentRef,
            props.externalErrorHandler,
            props.i18n,
            props.loadingContext,
            props.getImageAsset,
            props.getDatasetAsset,
            props.getCdnConfig,
            props.getCdnDataset,
            props.updateCore,
        ]
    );

    if (!ready) return null;

    return <CoreContext.Provider value={coreContextValues}>{toChildArray(children)}</CoreContext.Provider>;
};

export default CoreProvider;
