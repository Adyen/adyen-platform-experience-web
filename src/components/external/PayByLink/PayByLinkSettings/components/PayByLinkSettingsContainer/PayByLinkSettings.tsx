import { SecondaryNav } from '../../../../../internal/SecondaryNav';
import {
    CONTAINER_CLASS_NAME,
    SIDEBAR_CONTAINER_CLASS_NAME,
    SECONDARY_NAV_CLASS_NAME,
    CONTENT_CONTAINER_CLASS_NAME,
    CONTENT_CONTAINER_MOBILE_CLASS_NAME,
} from './constants';
import { type ExternalUIComponentProps, PayByLinkSettingsComponentProps } from '../../../../../types';
import './PayByLinkSettingsContainer.scss';
import { StoreSelector } from '../../../../../internal/StoreSelector';
import { Header } from '../../../../../internal/Header';
import { usePayByLinkSettingsContext } from './context/context';
import PayByLinkSettingsContent from './components/PayByLinkSettingsContent/PayByLinkSettingsContent';
import SettingsActionButtons from './components/SettingsActionButtons/SettingsActionButtons';
import { MenuItemType } from './context/types';
import { useCallback, useEffect, useState } from 'preact/hooks';
import { containerQueries, useResponsiveContainer } from '../../../../../../hooks/useResponsiveContainer';
import cx from 'classnames';
import LoadingSkeleton from './components/LoadingSkeleton/LoadingSkeleton';

const PayByLinkSettings = ({
    navigateBack,
    ...props
}: ExternalUIComponentProps<PayByLinkSettingsComponentProps> & {
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
    } = usePayByLinkSettingsContext();

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

    if (!menuItems || menuItems.length === 0) return null;

    //TODO: Add store error once it is merged
    return (
        <div className={CONTAINER_CLASS_NAME}>
            {(!isSmContainer || !contentVisible) && <Header hideTitle={props.hideTitle} titleKey="payByLink.settings.title" />}
            {storesError ? (
                <>Store Error</>
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
                                        <PayByLinkSettingsContent activeMenuItem={activeMenuItem} isLoadingContent={isLoadingContent} />
                                    )}
                                    renderLoadingContent={() => <LoadingSkeleton rowNumber={3} />}
                                />
                            </div>
                        ) : (
                            <PayByLinkSettingsContent activeMenuItem={activeMenuItem} isLoadingContent={isLoadingContent} />
                        )}
                    </div>
                    {!isShowingRequirements && contentVisible && !isLoadingContent && (
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

export default PayByLinkSettings;
