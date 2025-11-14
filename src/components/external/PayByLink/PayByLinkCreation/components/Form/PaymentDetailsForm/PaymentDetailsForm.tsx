import StoreField from './Fields/StoreField';
import { ValidityField } from './Fields/ValidityField';
import { AmountField } from './Fields/AmountField';
import { MerchantReferenceField } from './Fields/MerchantReferenceField';
import { LinkTypeField } from './Fields/LinkTypeField';
import { DescriptionField } from './Fields/DescriptionField';
import { DeliveryDateField } from './Fields/DeliveryDateField';
import { VisibleField } from '../VisibleField';

export const PaymentDetailsForm = ({
    timezone,
    configuration,
    isConfigLoading,
}: {
    timezone?: string;
    configuration?: any;
    isConfigLoading?: boolean;
}) => {
    return (
        <div className="adyen-pe-pay-by-link-creation-form__form-fields-container">
            <VisibleField name="store">
                <StoreField />
            </VisibleField>

            <VisibleField name="linkValidity">
                <ValidityField configuration={configuration} isLoading={isConfigLoading} />
            </VisibleField>

            <VisibleField name="amountValue">
                <AmountField />
            </VisibleField>

            <VisibleField name="merchantReference">
                <MerchantReferenceField />
            </VisibleField>

            <VisibleField name="linkType">
                <LinkTypeField configuration={configuration} isLoading={isConfigLoading} />
            </VisibleField>

            <VisibleField name="description">
                <DescriptionField />
            </VisibleField>

            <VisibleField name="deliveryDate">
                <DeliveryDateField timezone={timezone} />
            </VisibleField>
        </div>
    );
};
