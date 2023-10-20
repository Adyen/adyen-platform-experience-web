import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import Localization from '@src/core/Localization';
import TranslationsManager from './_translations';
import { noop } from '@src/utils/common';

const _useCoreContextI18n = (i18n: Localization['i18n']) => {
    const [lastRefresh, setLastRefresh] = useState(i18n.lastRefreshTimestamp);
    const enhancedI18n = useMemo(() => new TranslationsManager(i18n).i18n, [i18n, lastRefresh]);
    const watchI18n = useCallback(() => setLastRefresh(i18n.lastRefreshTimestamp), [i18n, setLastRefresh]);
    const unwatchI18n = useRef(noop);

    const effectWithUnmountCallback = useMemo(() => {
        const unmount = () => {
            unwatchI18n.current?.();
            unwatchI18n.current = null as unknown as typeof unwatchI18n.current;
        };
        return () => unmount;
    }, []);

    useEffect(effectWithUnmountCallback, []);

    useEffect(() => {
        unwatchI18n.current?.();
        unwatchI18n.current = i18n.watch(watchI18n);
    }, [i18n, watchI18n]);

    return enhancedI18n;
};

export default _useCoreContextI18n;
