import TermsAndConditionsContainer from '../../../TermsAndConditions/TermsAndConditionsContainer';
import PayByLinkThemeContainer from '../../../PayByLinkThemeContainer/PayByLinkThemeContainer';
import { MenuItem } from '../../context/constants';
import LoadingSkeleton from '../LoadingSkeleton/LoadingSkeleton';
import { containerQueries, useResponsiveContainer } from '../../../../../../../../hooks/useResponsiveContainer';
import Alert from '../../../../../../../internal/Alert/Alert';
import { AlertTypeOption } from '../../../../../../../internal/Alert/types';
import useCoreContext from '../../../../../../../../core/Context/useCoreContext';
import usePayByLinkSettingsContext from '../../context/context';

type PayByLinkSettingsContentProps = {
    activeMenuItem: string | null;
    isLoadingContent: boolean;
};

const PayByLinkSettingsContentItem = ({ activeMenuItem, isLoadingContent }: PayByLinkSettingsContentProps) => {
    if (isLoadingContent) {
        return <LoadingSkeleton rowNumber={5} />;
    }
    switch (activeMenuItem) {
        case MenuItem.theme:
            return <PayByLinkThemeContainer />;
        case MenuItem.termsAndConditions:
            return <TermsAndConditionsContainer />;
        default:
            return null;
    }
};

const PayByLinkSettingsContent = ({ activeMenuItem, isLoadingContent }: PayByLinkSettingsContentProps) => {
    const isSmContainer = useResponsiveContainer(containerQueries.down.xs);
    const { i18n } = useCoreContext();
    const { isSaveSuccess, isSaveError, setIsSaveSuccess, setIsSaveError } = usePayByLinkSettingsContext();

    return (
        <div className={isSmContainer ? 'adyen-pe-pay-by-link-settings__content-item--mobile' : 'adyen-pe-pay-by-link-settings__content-item'}>
            <PayByLinkSettingsContentItem activeMenuItem={activeMenuItem} isLoadingContent={isLoadingContent} />
            {isSaveSuccess && (
                <Alert
                    type={AlertTypeOption.SUCCESS}
                    onClose={() => setIsSaveSuccess(false)}
                    description={i18n.get('payByLink.settings.common.alerts.saveSuccess')}
                    className={'adyen-pe-pay-by-link-settings__content-item--alert'}
                />
            )}
            {isSaveError && (
                <Alert
                    type={AlertTypeOption.CRITICAL}
                    onClose={() => setIsSaveError(false)}
                    description={i18n.get('payByLink.settings.common.alerts.saveError')}
                    className={'adyen-pe-pay-by-link-settings__content-item--alert'}
                />
            )}
        </div>
    );
};

export default PayByLinkSettingsContent;
