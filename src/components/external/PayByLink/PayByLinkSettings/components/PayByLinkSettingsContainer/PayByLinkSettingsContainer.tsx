import { SecondaryNav } from '../../../../../internal/SecondaryNav';
import { _UIComponentProps, PayByLinkSettingsComponentProps } from '../../../../../types';
import { PayByLinkThemeContainer } from '../PayByLinkThemeContainer';
import { TermsAndConditions } from '../TermsAndConditions/TermsAndConditions';
import { PAY_BY_LINK_SETTINGS_ITEMS } from './constants';
import { useEffect, useState } from 'preact/hooks';
import { Divider } from '../../../../../internal/Divider/Divider';
import './PayByLinkSettingsContainer.scss';
import { StoreSelector } from '../../../../../internal/StoreSelector';
import { useStores } from '../../../../../../hooks/useStores';
import Typography from '../../../../../internal/Typography/Typography';
import { TypographyVariant } from '../../../../../internal/Typography/types';

const PayByLinkSettingsContainer = (props: _UIComponentProps<PayByLinkSettingsComponentProps>) => {
    const [activeItem, setActiveItem] = useState<string>(PAY_BY_LINK_SETTINGS_ITEMS[0]?.value || '');
    const { stores, selectedStore, setSelectedStore } = useStores();

    useEffect(() => {
        if (!selectedStore) setSelectedStore(stores?.[0]?.id);
    }, [stores, selectedStore]);

    return (
        <section className="adyen-pe-pay-by-link-settings">
            <Typography variant={TypographyVariant.TITLE} className="adyen-pe-pay-by-link-settings__title">
                Settings
            </Typography>
            <div className="adyen-pe-pay-by-link-settings__content">
                <SecondaryNav
                    header={<StoreSelector stores={stores || []} selectedStoreId={selectedStore} setSelectedStoreId={setSelectedStore} />}
                    className="adyen-pe-pay-by-link-settings__secondary-nav"
                    items={PAY_BY_LINK_SETTINGS_ITEMS}
                    activeValue={activeItem}
                    onValueChange={setActiveItem}
                />
                {selectedStore && (
                    <>
                        <Divider variant="vertical" />
                        {activeItem === PAY_BY_LINK_SETTINGS_ITEMS[0]?.value && <PayByLinkThemeContainer selectedStore={selectedStore} />}
                        {activeItem === PAY_BY_LINK_SETTINGS_ITEMS[1]?.value && <TermsAndConditions />}
                    </>
                )}
            </div>
        </section>
    );
};

export default PayByLinkSettingsContainer;
