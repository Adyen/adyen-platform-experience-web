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
    updateCore,
    externalErrorHandler,
    componentRef,
}: CoreProviderProps) => {
    const [ready, setReady] = useBooleanState(false);
    const commonProps = useMemo(() => _commonProps || {}, [_commonProps]);
    const loadingContext = useMemo(() => _loadingContext ?? '', [_loadingContext]);

    useEffect(() => {
        (async () => {
            await i18n?.ready;
            setReady(true);
        })().catch();
    }, []);

    if (!ready) return null;

    return (
        <CoreContext.Provider value={{ i18n, commonProps, loadingContext, updateCore, externalErrorHandler, componentRef }}>
            {toChildArray(children)}
        </CoreContext.Provider>
    );
};

export default CoreProvider;
