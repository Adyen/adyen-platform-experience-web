import { useStoreTheme } from '../../hooks/useStoreTheme';
import { ThemeForm } from '../ThemeForm';
import './PayByLinkThemeContainer.scss';
import Spinner from '../../../../../internal/Spinner';
import Typography from '../../../../../internal/Typography/Typography';
import { TypographyVariant } from '../../../../../internal/Typography/types';
import useCoreContext from '../../../../../../core/Context/useCoreContext';
import { useConfigContext } from '../../../../../../core/ConfigContext';

interface PayByLinkThemeContainerProps {
    selectedStore: string;
}

const PayByLinkThemeContainer = ({ selectedStore }: PayByLinkThemeContainerProps) => {
    const { i18n } = useCoreContext();
    const { theme, isFetching } = useStoreTheme(selectedStore);

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
            {isFetching ? (
                <Spinner size={'x-small'} />
            ) : (
                <>
                    <ThemeForm theme={theme} selectedStore={selectedStore} />
                    <img src={theme?.logoUrl} alt="" />
                </>
            )}
        </section>
    );
};

export default PayByLinkThemeContainer;
