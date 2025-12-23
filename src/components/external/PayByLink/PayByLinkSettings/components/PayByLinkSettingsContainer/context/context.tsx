import { memo, PropsWithChildren } from 'preact/compat';
import { createContext } from 'preact';
import { useCallback, useContext, useRef, useState, useEffect } from 'preact/hooks';
import { noop } from '../../../../../../../utils';
import { IPayByLinkSettingsContext, PayByLinkSettingsData, PayByLinkSettingsPayload } from './types';
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
    savedData: undefined,
    setSavedData: () => undefined,
});

export const PayByLinkSettingsProvider = memo(({ children }: PropsWithChildren) => {
    const [activeMenuItem, setActiveMenuItem] = useState<string>(DEFAULT_MENU_ITEM);
    const [payload, setPayload] = useState<PayByLinkSettingsPayload>(undefined);
    const [savedData, setSavedData] = useState<PayByLinkSettingsData>(undefined);
    const isValid = useRef(false);
    const [saveActionCalled, setSaveActionCalled] = useState<boolean | undefined>(false);
    const { stores, selectedStore, setSelectedStore } = useStores();

    useEffect(() => {
        if (!selectedStore) setSelectedStore(stores?.[0]?.id);
    }, [stores, selectedStore, setSelectedStore]);

    const onPayloadChange = useCallback((payload: PayByLinkSettingsPayload) => {
        if (payload) {
            setPayload(payload);
        }
    }, []);

    const onDataSave = useCallback(
        (data: PayByLinkSettingsData) => {
            setSavedData(data);
        },
        [setSavedData]
    );

    const setIsValid = (validity: boolean) => {
        if (isValid.current !== validity) {
            isValid.current = validity;
        }
    };

    const getIsValid = useCallback(() => {
        return isValid.current;
    }, []);

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
                savedData,
                setSavedData: onDataSave,
            }}
        >
            {!selectedStore || !activeMenuItem || !stores || stores?.length === 0 ? null : children}
        </PayByLinkSettingsContext.Provider>
    );
});

export const usePayByLinkSettingsContext = () => useContext(PayByLinkSettingsContext);
export default usePayByLinkSettingsContext;
