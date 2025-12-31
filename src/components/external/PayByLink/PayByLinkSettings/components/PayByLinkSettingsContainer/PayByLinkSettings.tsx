import { SecondaryNav } from '../../../../../internal/SecondaryNav';
import { PayByLinkSettingsComponentProps } from '../../../../../types';
import { CONTAINER_CLASS_NAME, SIDEBAR_CONTAINER_CLASS_NAME, SECONDARY_NAV_CLASS_NAME, CONTENT_CONTAINER_CLASS_NAME } from './constants';
import './PayByLinkSettingsContainer.scss';
import { StoreSelector } from '../../../../../internal/StoreSelector';
import { Header } from '../../../../../internal/Header';
import { usePayByLinkSettingsContext } from './context/context';
import PayByLinkSettingsContent from './components/PayByLinkSettingsContent/PayByLinkSettingsContent';
import SaveAction from './components/SaveAction';
import { MenuItemType } from './context/types';
import { useCallback, useState } from 'preact/hooks';
import { containerQueries, useResponsiveContainer } from '../../../../../../hooks/useResponsiveContainer';
import LoadingSkeleton from './components/LoadingSkeleton/LoadingSkeleton';
import { useMemo } from 'preact/hooks';
import AdyenPlatformExperienceError from '../../../../../../core/Errors/AdyenPlatformExperienceError';
import SettingsError from './components/SettingsError/SettingsError';
import useCoreContext from '../../../../../../core/Context/useCoreContext';

const ERROR_MESSAGE_KEY = 'payByLink.settings.errors.couldNotLoadSettings' as const;

const PayByLinkSettings = ({ ...props }: Omit<PayByLinkSettingsComponentProps, 'storeIds'>) => {
    const {
        activeMenuItem,
        setSelectedMenuItem,
        selectedStore,
        isLoadingStores,
        storesError,
        setSelectedStore,
        filteredStores,
        menuItems,
        isLoadingContent,
        allStores,
        themeError,
        termsAndConditionsError,
    } = usePayByLinkSettingsContext();
    const { getImageAsset } = useCoreContext();
    const isSmContainer = useResponsiveContainer(containerQueries.down.xs);
    const [contentVisible, setContentVisible] = useState(!isSmContainer);

    const onContentVisibilityChange = useCallback(
        (contentVisible: boolean) => {
            setContentVisible(contentVisible);
        },
        [setContentVisible]
    );

    const noStoresError = useMemo(() => {
        if (!allStores || allStores.length > 0 || isLoadingStores) return undefined;
        return {
            message: 'No stores configured',
            name: 'Account misconfiguration',
            errorCode: 'ACCOUNT_MISCONFIGURATION',
            type: 'error',
            requestId: '',
        } as AdyenPlatformExperienceError;
    }, [allStores, isLoadingStores]);

    const storesFilteredError = useMemo(() => {
        if ((allStores && allStores?.length > 0 && filteredStores?.length !== 0) || isLoadingStores) return undefined;
        return {
            message: 'No stores configured',
            name: 'Account misconfiguration',
            errorCode: 'ACCOUNT_MISCONFIGURATION',
            type: 'error',
            requestId: '',
        } as AdyenPlatformExperienceError;
    }, [allStores, filteredStores, isLoadingStores]);

    const error = storesError ?? noStoresError ?? storesFilteredError;

    const errorDisplay = useMemo(() => {
        if (!error) return null;
        return (
            <SettingsError
                getImageAsset={getImageAsset}
                error={error}
                centered
                absolutePosition
                onContactSupport={props.onContactSupport}
                errorMessage={ERROR_MESSAGE_KEY}
            />
        );
    }, [getImageAsset, props.onContactSupport, error]);

    const hasError = !!noStoresError || !!storesError || !!storesFilteredError;

    if (!menuItems) return null;

    const showActionButtons = !isLoadingStores && contentVisible && !isLoadingContent && !themeError && !storesError && !termsAndConditionsError;

    return (
        <div className={CONTAINER_CLASS_NAME}>
            {(!isSmContainer || !contentVisible) && <Header hideTitle={props.hideTitle} titleKey="payByLink.settings.title" />}
            {hasError ? (
                errorDisplay
            ) : (
                <div className={CONTENT_CONTAINER_CLASS_NAME}>
                    {menuItems.length > 1 ? (
                        <div className={SIDEBAR_CONTAINER_CLASS_NAME}>
                            <SecondaryNav<MenuItemType>
                                renderHeader={() => (
                                    <StoreSelector stores={filteredStores} selectedStoreId={selectedStore} setSelectedStoreId={setSelectedStore} />
                                )}
                                loading={isLoadingStores}
                                className={SECONDARY_NAV_CLASS_NAME}
                                items={menuItems}
                                activeValue={activeMenuItem}
                                onValueChange={setSelectedMenuItem}
                                onContentVisibilityChange={onContentVisibilityChange}
                                renderContent={(activeMenuItem: string) => (
                                    <PayByLinkSettingsContent activeMenuItem={activeMenuItem} isLoadingContent={isLoadingContent} />
                                )}
                                renderLoadingContent={() => <LoadingSkeleton rowNumber={3} />}
                            />
                        </div>
                    ) : (
                        <PayByLinkSettingsContent activeMenuItem={activeMenuItem} isLoadingContent={isLoadingContent} />
                    )}
                    {showActionButtons && <SaveAction />}
                </div>
            )}
        </div>
    );
};

export default PayByLinkSettings;
