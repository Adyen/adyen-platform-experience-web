import { toChildArray } from 'preact';
import { useEffect, useMemo } from 'preact/hooks';
import { CoreContext } from './CoreContext';
import { CoreProviderProps } from './types';
import useBooleanState from '../../hooks/useBooleanState';
import Localization from '../Localization';

/**
 * CoreProvider Component
 * Wraps a component delaying the render until after the i18n module is fully loaded
 */
const CoreProvider = ({
    i18n = new Localization().i18n,
    children,
    commonProps: _commonProps,
    loadingContext: _loadingContext,
    theme: _theme,
    updateCore,
    externalErrorHandler,
    componentRef,
    getImageAsset,
    getDatasetAsset,
    getCdnDataset,
    getCdnConfig,
}: CoreProviderProps) => {
    const [ready, setReady] = useBooleanState(false);
    const commonProps = useMemo(() => _commonProps || {}, [_commonProps]);
    const loadingContext = useMemo(() => _loadingContext ?? '', [_loadingContext]);
    const theme = useMemo(() => _theme ?? 'light', [_theme]);

    useEffect(() => {
        (async () => {
            await i18n?.ready;
            setReady(true);
        })().catch();
    }, []);

    const coreContextValues = useMemo(
        () => ({
            i18n,
            commonProps,
            loadingContext,
            theme,
            updateCore,
            externalErrorHandler,
            componentRef,
            getImageAsset,
            getDatasetAsset,
            getCdnConfig,
            getCdnDataset,
        }),
        [
            commonProps,
            componentRef,
            externalErrorHandler,
            i18n,
            loadingContext,
            theme,
            getImageAsset,
            getDatasetAsset,
            getCdnConfig,
            getCdnDataset,
            updateCore,
        ]
    );

    if (!ready) return null;

    return <CoreContext.Provider value={coreContextValues}>{toChildArray(children)}</CoreContext.Provider>;
};

export default CoreProvider;
