import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import Localization from '@src/core/Localization';
import TranslationsManager from './_translations';
import { noop } from '@src/utils/common';

const _useCoreContextI18n = (i18n: Localization['i18n']) => {
    const [, setLastRefresh] = useState(i18n.lastRefreshTimestamp);
    const cachedTranslationsManager = useRef<TranslationsManager>();
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

    return useMemo(() => {
        const { erase, i18n: _i18n } = (cachedTranslationsManager.current = cachedTranslationsManager.current
            ? cachedTranslationsManager.current.swap(i18n)
            : new TranslationsManager(i18n));
        return [_i18n, erase] as const;
    }, [i18n]);
};

export default _useCoreContextI18n;
