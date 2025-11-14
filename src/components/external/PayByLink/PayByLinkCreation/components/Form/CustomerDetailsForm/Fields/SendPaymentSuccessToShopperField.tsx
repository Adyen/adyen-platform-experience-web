import useCoreContext from '../../../../../../../../core/Context/useCoreContext';
import { EmailDependentCheckboxField } from './EmailDependentCheckboxField';

export const SendPaymentSuccessToShopperField = () => {
    const { i18n } = useCoreContext();
    return (
        <EmailDependentCheckboxField
            name="sendPaymentSuccessToShopper"
            label={i18n.get('payByLink.linkCreation.fields.sendPaymentSuccessToShopper.label')}
        />
    );
};
