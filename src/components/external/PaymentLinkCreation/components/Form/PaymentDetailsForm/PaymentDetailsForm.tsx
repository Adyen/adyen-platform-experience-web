import { ValidityField } from './Fields/ValidityField';
import { AmountField } from './Fields/AmountField';
import { LinkTypeField } from './Fields/LinkTypeField';
import { FormTextInput } from '../../../../../internal/FormWrappers/FormTextInput';
import { PaymentLinkCreationFormValues } from '../../types';
import useCoreContext from '../../../../../../core/Context/useCoreContext';
import { FormCalendarInput } from '../../../../../internal/FormWrappers/FormCalendarInput';
import { PAYMENT_LINK_CREATION_FIELD_LENGTHS } from '../../../constants';
import './PaymentDetailsForm.scss';
import { IPaymentLinkConfiguration } from '../../../../../../types/api/models/payByLink';

interface PaymentDetailsFormProps {
    configuration?: IPaymentLinkConfiguration;
}

export const PaymentDetailsForm = ({ configuration }: PaymentDetailsFormProps) => {
    const { i18n } = useCoreContext();
    return (
        <div className="adyen-pe-payment-link-creation-form__fields-container">
            <ValidityField configuration={configuration} />
            <AmountField />
            <FormTextInput<PaymentLinkCreationFormValues>
                minLength={PAYMENT_LINK_CREATION_FIELD_LENGTHS.merchantReference.min}
                maxLength={PAYMENT_LINK_CREATION_FIELD_LENGTHS.merchantReference.max}
                fieldName="reference"
                label={i18n.get('payByLink.creation.fields.merchantReference.label')}
            />
            <LinkTypeField configuration={configuration} />
            <FormTextInput<PaymentLinkCreationFormValues>
                maxLength={PAYMENT_LINK_CREATION_FIELD_LENGTHS.description.max}
                fieldName="description"
                label={i18n.get('payByLink.creation.fields.description.label')}
                supportText={i18n.get('payByLink.creation.fields.description.supportText')}
            />
            <FormCalendarInput<PaymentLinkCreationFormValues>
                clearable
                fieldName="deliverAt"
                label={i18n.get('payByLink.creation.fields.deliverAt.label')}
            />
        </div>
    );
};
