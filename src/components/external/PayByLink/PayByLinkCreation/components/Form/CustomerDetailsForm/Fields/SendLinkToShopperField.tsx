import useCoreContext from '../../../../../../../../core/Context/useCoreContext';
import { EmailDependentCheckboxField } from './EmailDependentCheckboxField';

export const SendLinkToShopperField = () => {
    const { i18n } = useCoreContext();
    return <EmailDependentCheckboxField name="sendLinkToShopper" label={i18n.get('payByLink.linkCreation.fields.sendLinkToShopper.label')} />;
};
