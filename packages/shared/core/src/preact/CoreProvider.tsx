import { toChildArray } from 'preact';
import { useEffect, useMemo, useState } from 'preact/hooks';
import { createCoreContextValue, waitForI18n } from '../setupCore';
import type { CoreProviderProps } from '../CoreContext.types';
import { CoreContext } from './CoreContext';

const CoreProvider = (props: CoreProviderProps) => {
    const { children } = props;
    const [ready, setReady] = useState(false);

    useEffect(() => {
        waitForI18n(props.i18n).then(() => setReady(true));
    }, [props.i18n, setReady]);

    const coreContextValues = useMemo(() => createCoreContextValue(props), [props]);

    if (!ready) return null;

    return <CoreContext.Provider value={coreContextValues}>{toChildArray(children)}</CoreContext.Provider>;
};

export default CoreProvider;
