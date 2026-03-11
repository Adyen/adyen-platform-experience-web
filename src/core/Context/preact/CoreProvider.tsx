import { toChildArray } from 'preact';
import { useEffect, useMemo } from 'preact/hooks';
import { CoreContext } from '../CoreContext';
import { CoreProviderProps } from '../types';
import useBooleanState from '../../../hooks/useBooleanState';
import { waitForI18n, createCoreContextValue } from '../setupCore';
import Localization from '../../Localization';

/**
 * CoreProvider Component
 * Wraps a component delaying the render until after the i18n module is fully loaded
 */
const CoreProvider = (props: CoreProviderProps) => {
    const { children, i18n = new Localization().i18n } = props;
    const [ready, setReady] = useBooleanState(false);

    useEffect(() => {
        waitForI18n(i18n)
            .then(() => setReady(true))
            .catch();
    }, []);

    const coreContextValues = useMemo(
        () => createCoreContextValue({ ...props, i18n }),
        [
            props.commonProps,
            props.componentRef,
            props.externalErrorHandler,
            i18n,
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
