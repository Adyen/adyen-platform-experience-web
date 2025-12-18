import './TermsAndConditions.scss';
import Typography from '../../../../../internal/Typography/Typography';
import { TypographyVariant } from '../../../../../internal/Typography/types';
import useCoreContext from '../../../../../../core/Context/useCoreContext';
import { TermsAndConditions } from './TermsAndConditions';
import usePayByLinkSettingsContext from '../PayByLinkSettingsContainer/context/context';
import { useState, useEffect } from 'preact/hooks';
import useMenuItemState from '../../hooks/useMenuItemState';
import { IPayByLinkTermsAndConditions } from '../../../../../../types';
import { ActiveMenuItem } from '../PayByLinkSettingsContainer/context/constants';

const isTermAndConditions = (activeMenuItem: string, data: any): data is IPayByLinkTermsAndConditions => {
    return activeMenuItem === ActiveMenuItem.termsAndConditions;
};

const TermsAndConditionsContainer = () => {
    const { i18n } = useCoreContext();
    const { activeMenuItem, selectedStore } = usePayByLinkSettingsContext();
    const [enabled, setEnabled] = useState(true);

    useEffect(() => {
        setEnabled(true);
    }, [activeMenuItem, selectedStore]);

    console.log('TermsAndConditionsContainer');

    const { data, isFetching } = useMenuItemState({ activeMenuItem, selectedStore, refreshData: enabled, setRefreshData: setEnabled });

    if (!data || !selectedStore || !isTermAndConditions(activeMenuItem, data)) return null;

    return (
        <section className="adyen-pe-pay-by-link-settings">
            <div className="adyen-pe-pay-by-link-settings__content-header">
                <div className="adyen-pe-pay-by-link-settings__content-header">
                    <Typography variant={TypographyVariant.TITLE} medium>
                        {i18n.get('payByLink.settings.termsAndConditions.title')}
                    </Typography>
                    <Typography variant={TypographyVariant.BODY} wide className="adyen-pe-pay-by-link-settings-terms-and-conditions-disclaimer">
                        {i18n.get('payByLink.settings.termsAndConditions.subtitle')}
                    </Typography>
                </div>
            </div>
            <TermsAndConditions data={data} isFetching={isFetching} />
        </section>
    );
};

export default TermsAndConditionsContainer;
