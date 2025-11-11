import StoreField from './Fields/StoreField';
import { ValidityField } from './Fields/ValidityField';
import { AmountField } from './Fields/AmountField';
import { MerchantReferenceField } from './Fields/MerchantReferenceField';
import { LinkTypeField } from './Fields/LinkTypeField';
import { DescriptionField } from './Fields/DescriptionField';
import { DeliveryDateField } from './Fields/DeliveryDateField';
import { useWizardFormContext } from '../../../../../../../hooks/form/wizard/WizardFormContext';
import { FormValues } from '../../types';

export const PaymentDetailsForm = ({ timezone }: { timezone?: string }) => {
    const { fieldsConfig } = useWizardFormContext<FormValues>();

    return (
        <div className="adyen-pe-pay-by-link-creation__form-fields-container">
            {fieldsConfig['store']?.visible && <StoreField />}

            {fieldsConfig['linkValidity']?.visible && <ValidityField />}

            {fieldsConfig['amountValue']?.visible && <AmountField />}

            {fieldsConfig['merchantReference']?.visible && <MerchantReferenceField />}

            {fieldsConfig['linkType']?.visible && <LinkTypeField />}

            {fieldsConfig['description']?.visible && <DescriptionField />}

            {fieldsConfig['deliveryDate']?.visible && <DeliveryDateField timezone={timezone} />}
        </div>
    );
};
