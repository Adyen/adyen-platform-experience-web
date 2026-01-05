import { memo, PropsWithChildren } from 'preact/compat';
import { createContext } from 'preact';
import { useCallback, useContext, useRef, useState, useEffect, useMemo } from 'preact/hooks';
import { noop } from '../../../../../../../utils';
import { IPayByLinkSettingsContext, MenuItemType, PayByLinkSettingsData, PayByLinkSettingsItem, PayByLinkSettingsPayload } from './types';
import { DEFAULT_MENU_ITEM, MenuItem } from './constants';
import { useStores } from '../../../../../../../hooks/useStores';
import { SecondaryNavItem } from '../../../../../../internal/SecondaryNav';
import { useStoreTheme } from '../../../hooks/useStoreTheme';
import { useStoreTermsAndConditions } from '../../../hooks/useStoreTermsAndConditions';
import { useSaveAction } from '../../../hooks/useSaveAction';
import { containerQueries, useResponsiveContainer } from '../../../../../../../hooks/useResponsiveContainer';

export const PayByLinkSettingsContext = createContext<IPayByLinkSettingsContext>({
    activeMenuItem: MenuItem.theme,
    payload: undefined,
    setPayload: noop,
    selectedStore: undefined,
    setSelectedMenuItem: noop,
    saveActionCalled: undefined,
    setIsValid: noop,
    getIsValid: () => false,
    setSaveActionCalled: noop,
    filteredStores: undefined,
    allStores: undefined,
    setSelectedStore: noop,
    savedData: undefined,
    setSavedData: () => undefined,
    menuItems: undefined,
    isLoadingContent: true,
    isSaveError: undefined,
    isSaveSuccess: undefined,
    isSaving: undefined,
    isShowingRequirements: false,
    onSave: noop,
    setIsSaveError: noop,
    setIsSaveSuccess: noop,
    setIsShowingRequirements: noop,
    isLoadingStores: false,
    storesError: undefined,
    termsAndConditionsError: undefined,
    themeError: undefined,
});

export const PayByLinkSettingsProvider = memo(
    ({
        children,
        selectedMenuItems,
        storeIds,
        embeddedInOverview,
    }: PropsWithChildren<{ selectedMenuItems: MenuItemType[]; storeIds?: string | string[]; embeddedInOverview?: boolean }>) => {
        const [isShowingRequirements, setIsShowingRequirements] = useState(false);
        const [menuItems] = useState<MenuItemType[]>(selectedMenuItems);
        const [loading, setLoading] = useState<boolean>(false);
        const isSmContainer = useResponsiveContainer(containerQueries.down.xs);

        const menuItemPreSelect = useMemo(() => {
            if (isSmContainer && menuItems.length > 1) return;
            return menuItems.length > 0 && menuItems[0] ? menuItems[0].value : DEFAULT_MENU_ITEM;
        }, [menuItems, isSmContainer]);

        const [activeMenuItem, setActiveMenuItem] = useState<PayByLinkSettingsItem | null>(null);
        const [payload, setPayload] = useState<PayByLinkSettingsPayload>(undefined);
        const [savedData, setSavedData] = useState<PayByLinkSettingsData>(undefined);
        const isValid = useRef(false);
        const [saveActionCalled, setSaveActionCalled] = useState<boolean | undefined>(false);
        const { filteredStores, selectedStore, setSelectedStore, isFetching: isLoadingStores, error: storesError, allStores } = useStores(storeIds);
        const [isSaving, setIsSaving] = useState(false);
        const [isSaveError, setIsSaveError] = useState(false);
        const [isSaveSuccess, setIsSaveSuccess] = useState(false);

        useEffect(() => {
            if (menuItemPreSelect) {
                setActiveMenuItem(menuItemPreSelect);
            }
        }, [menuItemPreSelect]);

        const getIsValid = useCallback(() => {
            return isValid.current;
        }, []);

        const { onSave } = useSaveAction(
            setIsSaving,
            setIsSaveError,
            setIsSaveSuccess,
            selectedStore,
            payload,
            activeMenuItem,
            getIsValid,
            setSaveActionCalled,
            setSavedData,
            setPayload
        );

        const [fetchThemeEnabled, setFetchThemeEnabled] = useState<boolean>(false);
        const [fetchTermsAndConditionsEnabled, setFetchTermsAndConditionsEnabled] = useState<boolean>(false);

        const resetState = useCallback(() => {
            setIsSaving(false);
            setIsSaveError(false);
            setIsSaveSuccess(false);
            setSaveActionCalled(false);
            setSavedData(undefined);
            setPayload(undefined);
        }, []);

        useEffect(() => {
            resetState();
            switch (activeMenuItem) {
                case MenuItem.theme:
                    setLoading(true);
                    selectedStore && setFetchThemeEnabled(true);
                    break;
                case MenuItem.termsAndConditions:
                    setLoading(true);
                    selectedStore && setFetchTermsAndConditionsEnabled(true);
                    break;
            }
        }, [activeMenuItem, selectedStore, resetState]);

        const onPayloadChange = useCallback(
            (payload: PayByLinkSettingsPayload) => {
                if (payload) {
                    setPayload(payload);
                }
            },
            [setPayload]
        );

        const {
            theme,
            isFetching: loadingThemes,
            error: themeError,
        } = useStoreTheme(selectedStore, fetchThemeEnabled, setFetchThemeEnabled, onPayloadChange, setLoading);
        const {
            data: termsAndConditions,
            isFetching: loadingTermsAndConditions,
            error: termsAndConditionsError,
        } = useStoreTermsAndConditions(selectedStore, fetchTermsAndConditionsEnabled, setFetchTermsAndConditionsEnabled, onPayloadChange, setLoading);

        const activeData = useMemo(() => {
            switch (activeMenuItem) {
                case MenuItem.theme:
                    if (loadingThemes) return;
                    return theme;
                case MenuItem.termsAndConditions:
                    if (loadingTermsAndConditions) return;
                    return termsAndConditions;
                default:
                    return;
            }
        }, [activeMenuItem, theme, termsAndConditions, loadingThemes, loadingTermsAndConditions]);

        useEffect(() => {
            if (activeData) {
                setSavedData(activeData);
            }
        }, [activeData, setSavedData]);

        useEffect(() => {
            if (!selectedStore) setSelectedStore(filteredStores?.[0]?.id);
        }, [filteredStores, selectedStore, setSelectedStore]);

        const onDataSave = useCallback(
            (data: PayByLinkSettingsData) => {
                setSavedData(data);
            },
            [setSavedData]
        );

        useEffect(() => {
            if (themeError || termsAndConditionsError) setLoading(false);
        }, [themeError, termsAndConditionsError]);

        const setIsValid = useCallback((validity: boolean) => {
            if (isValid.current !== validity) {
                isValid.current = validity;
            }
        }, []);

        const setSelectedMenuItem = useCallback((item: SecondaryNavItem<PayByLinkSettingsItem>) => {
            setLoading(true);
            setActiveMenuItem(item.value);
        }, []);

        const contentLoading = loading || loadingThemes || loadingTermsAndConditions || isLoadingStores;

        return (
            <PayByLinkSettingsContext.Provider
                value={{
                    isLoadingContent: contentLoading,
                    setPayload: onPayloadChange,
                    menuItems,
                    payload,
                    activeMenuItem,
                    selectedStore,
                    setSelectedMenuItem,
                    getIsValid,
                    setIsValid,
                    saveActionCalled: saveActionCalled,
                    setSaveActionCalled: setSaveActionCalled,
                    filteredStores,
                    setSelectedStore,
                    savedData,
                    setSavedData: onDataSave,
                    isSaveError,
                    isSaveSuccess,
                    isSaving,
                    isShowingRequirements,
                    setIsShowingRequirements,
                    setIsSaveError,
                    setIsSaveSuccess,
                    onSave: onSave,
                    allStores,
                    isLoadingStores,
                    storesError,
                    embeddedInOverview,
                    themeError,
                    termsAndConditionsError,
                }}
            >
                {!activeMenuItem && !isSmContainer ? null : children}
            </PayByLinkSettingsContext.Provider>
        );
    }
);

export const usePayByLinkSettingsContext = () => useContext(PayByLinkSettingsContext);
export default usePayByLinkSettingsContext;
