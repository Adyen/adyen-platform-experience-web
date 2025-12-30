import { ValidityField } from './Fields/ValidityField';
import { AmountField } from './Fields/AmountField';
import { LinkTypeField } from './Fields/LinkTypeField';
import { FormTextInput } from '../../../../../../internal/FormWrappers/FormTextInput';
import { PBLFormValues } from '../../types';
import useCoreContext from '../../../../../../../core/Context/useCoreContext';
import { FormCalendarInput } from '../../../../../../internal/FormWrappers/FormCalendarInput';
import { PBL_CREATION_FIELD_LENGTHS } from '../../../constants';
import './PaymentDetailsForm.scss';
import { PaymentLinkConfiguration } from '../../../../../../../types/api/models/payByLink';

interface PaymentDetailsFormProps {
    timezone?: string;
    configuration?: PaymentLinkConfiguration;
}

export const PaymentDetailsForm = ({ timezone, configuration }: PaymentDetailsFormProps) => {
    const { i18n } = useCoreContext();
    return (
        <div className="adyen-pe-pay-by-link-creation-form__fields-container">
            <ValidityField configuration={configuration} />
            <AmountField />
            <FormTextInput<PBLFormValues>
                minLength={PBL_CREATION_FIELD_LENGTHS.merchantReference.min}
                maxLength={PBL_CREATION_FIELD_LENGTHS.merchantReference.max}
                fieldName="reference"
                label={i18n.get('payByLink.linkCreation.fields.merchantReference.label')}
            />
            <LinkTypeField configuration={configuration} />
            <FormTextInput<PBLFormValues>
                maxLength={PBL_CREATION_FIELD_LENGTHS.description.max}
                fieldName="description"
                label={i18n.get('payByLink.linkCreation.fields.description.label')}
                supportText={i18n.get('payByLink.linkCreation.fields.description.supportText')}
            />
            <FormCalendarInput<PBLFormValues>
                clearable
                fieldName="deliverAt"
                label={i18n.get('payByLink.linkCreation.fields.deliverAt.label')}
                timezone={timezone}
            />
        </div>
    );
};
