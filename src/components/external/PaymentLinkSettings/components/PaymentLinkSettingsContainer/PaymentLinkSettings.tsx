import { SecondaryNav } from '../../../../internal/SecondaryNav';
import {
    CONTAINER_CLASS_NAME,
    SIDEBAR_CONTAINER_CLASS_NAME,
    SECONDARY_NAV_CLASS_NAME,
    CONTENT_CONTAINER_CLASS_NAME,
    CONTENT_CONTAINER_MOBILE_CLASS_NAME,
} from './constants';
import { type ExternalUIComponentProps, PaymentLinkSettingsComponentProps } from '../../../../types';
import './PaymentLinkSettingsContainer.scss';
import { StoreSelector } from '../../../../internal/StoreSelector';
import { Header } from '../../../../internal/Header';
import { usePaymentLinkSettingsContext } from './context/context';
import PaymentLinkSettingsContent from './components/PaymentLinkSettingsContent/PaymentLinkSettingsContent';
import SettingsActionButtons from './components/SettingsActionButtons/SettingsActionButtons';
import { MenuItemType } from './context/types';
import { useCallback, useEffect, useState } from 'preact/hooks';
import { containerQueries, useResponsiveContainer } from '../../../../../hooks/useResponsiveContainer';
import cx from 'classnames';
import LoadingSkeleton from './components/LoadingSkeleton/LoadingSkeleton';
import { useMemo } from 'preact/hooks';
import AdyenPlatformExperienceError from '../../../../../core/Errors/AdyenPlatformExperienceError';
import SettingsError from './components/SettingsError/SettingsError';
import { ACCOUNT_MISCONFIGURATION, WRONG_STORE_IDS } from './utils/getSettingsErrorMessage';

const ERROR_MESSAGE_KEY = 'payByLink.settings.errors.couldNotLoadSettings' as const;

const PaymentLinkSettings = ({
    navigateBack,
    ...props
}: ExternalUIComponentProps<PaymentLinkSettingsComponentProps> & {
    navigateBack?: () => void;
}) => {
    const {
        activeMenuItem,
        setSelectedMenuItem,
        selectedStore,
        isLoadingStores,
        isShowingRequirements,
        storesError,
        setSelectedStore,
        filteredStores,
        menuItems,
        isLoadingContent,
        allStores,
        themeError,
        termsAndConditionsError,
    } = usePaymentLinkSettingsContext();
    const isSmContainer = useResponsiveContainer(containerQueries.down.xs);
    const [contentVisible, setContentVisible] = useState(false);

    useEffect(() => {
        const visibility = Boolean(!isSmContainer || (isSmContainer && menuItems && menuItems?.length === 1));
        setContentVisible(visibility);
    }, [isSmContainer, menuItems]);

    const onContentVisibilityChange = useCallback(
        (contentVisible: boolean) => {
            setContentVisible(contentVisible);
        },
        [setContentVisible]
    );

    const closeContent = useCallback(() => {
        if (!isSmContainer) return;
        setContentVisible(false);
    }, [isSmContainer]);

    const noStoresError = useMemo(() => {
        if (!allStores || allStores.length > 0 || isLoadingStores) return undefined;
        return {
            errorCode: ACCOUNT_MISCONFIGURATION,
            type: 'error',
            requestId: '',
        } as AdyenPlatformExperienceError;
    }, [allStores, isLoadingStores]);

    const storesFilteredError = useMemo(() => {
        if ((allStores && allStores?.length > 0 && filteredStores?.length !== 0) || isLoadingStores) return undefined;
        return {
            errorCode: WRONG_STORE_IDS,
            type: 'error',
            requestId: '',
        } as AdyenPlatformExperienceError;
    }, [allStores, filteredStores, isLoadingStores]);

    const error = storesError ?? noStoresError ?? storesFilteredError;

    const errorDisplay = useMemo(() => {
        if (!error) return null;
        return <SettingsError error={error} onContactSupport={props.onContactSupport} errorMessage={ERROR_MESSAGE_KEY} />;
    }, [props.onContactSupport, error]);

    const hasError = !!noStoresError || !!storesError || !!storesFilteredError;

    if (!menuItems || menuItems.length === 0) return null;

    const showActionButtons = contentVisible && !themeError && !storesError && !termsAndConditionsError && !isShowingRequirements;

    return (
        <div className={CONTAINER_CLASS_NAME}>
            {(!isSmContainer || !contentVisible) && <Header hideTitle={props.hideTitle} titleKey="payByLink.settings.title" />}
            {hasError ? (
                errorDisplay
            ) : (
                <>
                    <div className={cx(CONTENT_CONTAINER_CLASS_NAME, { [CONTENT_CONTAINER_MOBILE_CLASS_NAME]: isSmContainer && contentVisible })}>
                        {menuItems.length > 1 ? (
                            <div className={SIDEBAR_CONTAINER_CLASS_NAME}>
                                <SecondaryNav<MenuItemType>
                                    renderHeader={() => (
                                        <StoreSelector
                                            stores={filteredStores}
                                            selectedStoreId={selectedStore}
                                            setSelectedStoreId={setSelectedStore}
                                        />
                                    )}
                                    contentVisible={contentVisible}
                                    loading={isLoadingStores}
                                    className={SECONDARY_NAV_CLASS_NAME}
                                    items={menuItems}
                                    activeValue={activeMenuItem}
                                    onValueChange={setSelectedMenuItem}
                                    onContentVisibilityChange={onContentVisibilityChange}
                                    renderContent={(activeMenuItem: string) => (
                                        <PaymentLinkSettingsContent
                                            activeMenuItem={activeMenuItem}
                                            isLoadingContent={isLoadingContent}
                                            navigateBack={navigateBack}
                                        />
                                    )}
                                    renderLoadingContent={() => <LoadingSkeleton rowNumber={3} />}
                                />
                            </div>
                        ) : (
                            <PaymentLinkSettingsContent
                                activeMenuItem={activeMenuItem}
                                isLoadingContent={isLoadingContent}
                                navigateBack={navigateBack}
                            />
                        )}
                    </div>
                    {showActionButtons && (
                        <SettingsActionButtons
                            navigateBack={navigateBack ? navigateBack : undefined}
                            closeContent={isSmContainer ? closeContent : undefined}
                        />
                    )}
                </>
            )}
        </div>
    );
};

export default PaymentLinkSettings;
