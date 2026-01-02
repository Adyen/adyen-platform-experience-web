import { SecondaryNav } from '../../../../../internal/SecondaryNav';
import { PayByLinkSettingsComponentProps } from '../../../../../types';
import {
    CONTAINER_CLASS_NAME,
    SIDEBAR_CONTAINER_CLASS_NAME,
    SECONDARY_NAV_CLASS_NAME,
    CONTENT_CONTAINER_CLASS_NAME,
    CONTENT_CONTAINER_MOBILE_CLASS_NAME,
} from './constants';
import './PayByLinkSettingsContainer.scss';
import { StoreSelector } from '../../../../../internal/StoreSelector';
import { Header } from '../../../../../internal/Header';
import { usePayByLinkSettingsContext } from './context/context';
import PayByLinkSettingsContent from './components/PayByLinkSettingsContent/PayByLinkSettingsContent';
import SaveAction from './components/SaveAction';
import { MenuItemType } from './context/types';
import { useCallback, useState } from 'preact/hooks';
import { containerQueries, useResponsiveContainer } from '../../../../../../hooks/useResponsiveContainer';
import cx from 'classnames';
import LoadingSkeleton from './components/LoadingSkeleton/LoadingSkeleton';

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
    } = usePayByLinkSettingsContext();
    const isSmContainer = useResponsiveContainer(containerQueries.down.xs);
    const [contentVisible, setContentVisible] = useState(!isSmContainer);

    const onContentVisibilityChange = useCallback(
        (contentVisible: boolean) => {
            setContentVisible(contentVisible);
        },
        [setContentVisible]
    );

    if ((!activeMenuItem && !isSmContainer) || (!isLoadingStores && !selectedStore) || !menuItems || menuItems.length === 0) return null;

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
                    {!isLoadingStores && contentVisible && !isLoadingContent && <SaveAction />}
                </>
            )}
        </div>
    );
};

export default PayByLinkSettings;
