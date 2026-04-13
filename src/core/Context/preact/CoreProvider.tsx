import { toChildArray } from 'preact';
import { useEffect, useMemo } from 'preact/hooks';
import { CoreContext } from './CoreContext';
import { CoreProviderProps } from '../types';
import useBooleanState from '../../../hooks/useBooleanState';
import { waitForI18n, createCoreContextValue } from '../setupCore';

const CoreProvider = (props: CoreProviderProps) => {
    const { children } = props;
    const [ready, setReady] = useBooleanState(false);

    useEffect(() => {
        waitForI18n(props.i18n).then(() => setReady(true));
    }, [props.i18n, setReady]);

    const coreContextValues = useMemo(() => createCoreContextValue(props), [props]);

    if (!ready) return null;

    return <CoreContext.Provider value={coreContextValues}>{toChildArray(children)}</CoreContext.Provider>;
};

export default CoreProvider;
