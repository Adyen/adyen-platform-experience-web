import { ThemeForm } from '../ThemeForm';
import './PayByLinkThemeContainer.scss';
import Spinner from '../../../../../internal/Spinner';
import Typography from '../../../../../internal/Typography/Typography';
import { TypographyVariant } from '../../../../../internal/Typography/types';
import useCoreContext from '../../../../../../core/Context/useCoreContext';
import usePayByLinkSettingsContext from '../PayByLinkSettingsContainer/context/context';
import useMenuItemState from '../../hooks/useMenuItemState';
import { useEffect, useState } from 'preact/hooks';
import { IPayByLinkTheme } from '../../../../../../types';
import { ActiveMenuItem } from '../PayByLinkSettingsContainer/context/constants';

const isTheme = (activeMenuItem: string, data: any): data is IPayByLinkTheme => {
    return activeMenuItem === ActiveMenuItem.theme;
};

const PayByLinkThemeContainer = () => {
    const { i18n } = useCoreContext();
    const { activeMenuItem, selectedStore } = usePayByLinkSettingsContext();
    const [enabled, setEnabled] = useState(true);

    useEffect(() => {
        setEnabled(true);
    }, [activeMenuItem, selectedStore]);

    const { data, isFetching } = useMenuItemState({ activeMenuItem, selectedStore, refreshData: enabled, setRefreshData: setEnabled });

    if (!data || !selectedStore || !isTheme(activeMenuItem, data)) return null;

    return (
        <section className="adyen-pe-pay-by-link-theme">
            <div className="adyen-pe-pay-by-link-settings__content-header">
                <Typography variant={TypographyVariant.TITLE} medium>
                    {i18n.get('payByLink.settings.theme.title')}
                </Typography>
                <Typography variant={TypographyVariant.BODY} wide className="adyen-pe-pay-by-link-settings-terms-and-conditions-disclaimer">
                    {i18n.get('payByLink.settings.theme.subtitle')}
                </Typography>
            </div>
            {isFetching ? <Spinner size={'x-small'} /> : <ThemeForm theme={data} />}
        </section>
    );
};

export default PayByLinkThemeContainer;
