import { memo, PropsWithChildren } from 'preact/compat';
import { createContext } from 'preact';
import { useCallback, useContext, useRef, useState, useEffect } from 'preact/hooks';
import { noop } from '../../../../../../../utils';
import { IPayByLinkSettingsContext } from './types';
import { ActiveMenuItem, DEFAULT_MENU_ITEM } from './constants';
import { useStores } from '../../../../../../../hooks/useStores';

export const PayByLinkSettingsContext = createContext<IPayByLinkSettingsContext>({
    activeMenuItem: ActiveMenuItem.theme,
    payload: undefined,
    setPayload: noop,
    selectedStore: undefined,
    setActiveMenuItem: noop,
    saveActionCalled: undefined,
    setIsValid: noop,
    getIsValid: () => false,
    setSaveActionCalled: noop,
    stores: undefined,
    setSelectedStore: noop,
});

export const PayByLinkSettingsProvider = memo(({ children }: PropsWithChildren) => {
    const [activeMenuItem, setActiveMenuItem] = useState<string>(DEFAULT_MENU_ITEM);
    const [payload, setPayload] = useState(null);
    const isValid = useRef(false);
    const [saveActionCalled, setSaveActionCalled] = useState<boolean | undefined>(false);
    const { stores, selectedStore, setSelectedStore } = useStores();

    console.log('context');

    useEffect(() => {
        if (!selectedStore) setSelectedStore(stores?.[0]?.id);
    }, [stores, selectedStore, setSelectedStore]);

    const onPayloadChange = useCallback((payload: any) => {
        setPayload(payload);
    }, []);

    const setIsValid = (validity: boolean) => {
        if (isValid.current !== validity) {
            isValid.current = validity;
        }
    };

    const getIsValid = () => {
        return isValid.current;
    };

    return (
        <PayByLinkSettingsContext.Provider
            value={{
                setPayload: onPayloadChange,
                payload,
                activeMenuItem,
                selectedStore,
                setActiveMenuItem,
                getIsValid,
                setIsValid,
                saveActionCalled: saveActionCalled,
                setSaveActionCalled: setSaveActionCalled,
                stores,
                setSelectedStore,
            }}
        >
            {!selectedStore || !activeMenuItem || !stores || stores?.length === 0 ? null : children}
        </PayByLinkSettingsContext.Provider>
    );
});

export const usePayByLinkSettingsContext = () => useContext(PayByLinkSettingsContext);
export default usePayByLinkSettingsContext;
