import { ShopperEmailField } from './Fields/ShopperEmailField';
import { ShopperPhoneField } from './Fields/ShopperPhoneField';
import { CountryRegionField } from './Fields/CountryRegionField';
import { LanguageField } from './Fields/LanguageField';
import { BillingAndShippingCheckboxField } from './Fields/BillingAndShippingCheckboxField';
import { StateUpdater } from 'preact/hooks';
import { FormTextInput } from '../../../../../internal/FormWrappers/FormTextInput';
import { PaymentLinkCreationFormValues } from '../../types';
// import { EmailDependentCheckboxField } from './Fields/EmailDependentCheckboxField';
import { DeliveryAddressSection } from './Fields/Address/DeliveryAddressSection';
import { BillingAddressSection } from './Fields/Address/BillingAddressSection';
import useCoreContext from '../../../../../../core/Context/useCoreContext';
import './CustomerDetailsForm.scss';
import { PAYMENT_LINK_CREATION_FIELD_LENGTHS } from '../../../constants';
import { useWizardFormContext } from '../../../../../../hooks/form/wizard/WizardFormContext';
import { Dispatch } from 'preact/compat';
import { IPaymentLinkCountry } from '../../../../../../types';
import { useAddressChecker } from './useAddressChecker';

interface CustomerDetailsFormProps {
    isSeparateAddress: boolean;
    setIsSeparateAddress: Dispatch<StateUpdater<boolean>>;
    countriesData?: { data?: IPaymentLinkCountry[] };
    isFetchingCountries: boolean;
    countryDatasetData?: Array<{ id: string; name: string }>;
    isFetchingCountryDataset: boolean;
}

export const CustomerDetailsForm = ({
    isSeparateAddress,
    setIsSeparateAddress,
    countriesData,
    isFetchingCountries,
    countryDatasetData,
    isFetchingCountryDataset,
}: CustomerDetailsFormProps) => {
    const { i18n } = useCoreContext();
    const { fieldsConfig } = useWizardFormContext<PaymentLinkCreationFormValues>();
    const { isAddressFieldRequired } = useAddressChecker();

    const isNameVisible = fieldsConfig['shopperName.firstName']?.visible || fieldsConfig['shopperName.lastName']?.visible;
    const isBillingAddressOptional = !fieldsConfig['billingAddress.street']?.required;
    const isDeliveryAddressOptional = !fieldsConfig['deliveryAddress.street']?.required;
    const isBillingAddressVisible = fieldsConfig['billingAddress.street']?.visible;
    const isDeliveryAddressVisible = fieldsConfig['deliveryAddress.street']?.visible;

    // When billing is required and delivery is optional, show billing first
    const showBillingFirst = isBillingAddressVisible && isDeliveryAddressVisible && !isBillingAddressOptional && isDeliveryAddressOptional;

    return (
        <div className="adyen-pe-payment-link-creation-form__fields-container">
            <FormTextInput<PaymentLinkCreationFormValues>
                fieldName={'shopperReference'}
                label={i18n.get('payByLink.creation.fields.shopperReference.label')}
                maxLength={PAYMENT_LINK_CREATION_FIELD_LENGTHS.shopperReference.max}
                minLength={PAYMENT_LINK_CREATION_FIELD_LENGTHS.shopperReference.min}
            />
            {isNameVisible && (
                <div className="adyen-pe-payment-link-creation-form__shopper-name-container">
                    <FormTextInput<PaymentLinkCreationFormValues>
                        fieldName={'shopperName.firstName'}
                        label={i18n.get('payByLink.creation.fields.shopperName.label')}
                        maxLength={PAYMENT_LINK_CREATION_FIELD_LENGTHS.shopperName.firstName.max}
                    />
                    <FormTextInput<PaymentLinkCreationFormValues>
                        maxLength={PAYMENT_LINK_CREATION_FIELD_LENGTHS.shopperName.lastName.max}
                        fieldName={'shopperName.lastName'}
                        label={i18n.get('payByLink.creation.fields.shopperLastName.label')}
                    />
                </div>
            )}
            <ShopperEmailField />
            {/* TODO: Pending discussion on whether we want to show this functionality                 
                <div className="adyen-pe-payment-link-creation-form__email-checkbox-container">
                    <EmailDependentCheckboxField name="sendLinkToShopper" label={i18n.get('payByLink.creation.fields.sendLinkToShopper.label')} />
                    <EmailDependentCheckboxField
                        name="sendPaymentSuccessToShopper"
                        label={i18n.get('payByLink.creation.fields.sendPaymentSuccessToShopper.label')}
                    />
                </div> */}

            <ShopperPhoneField />
            <CountryRegionField
                countriesData={countriesData}
                isFetchingCountries={isFetchingCountries}
                countryDatasetData={countryDatasetData}
                isFetchingCountryDataset={isFetchingCountryDataset}
            />
            {/* Delivery address shown first (default case: delivery required or both optional/required equally) */}
            {isDeliveryAddressVisible && !showBillingFirst && (
                <>
                    <DeliveryAddressSection
                        isSeparateAddress={isSeparateAddress}
                        isAddressFieldRequired={isAddressFieldRequired}
                        isOptional={isDeliveryAddressOptional}
                        countriesData={countriesData}
                        isFetchingCountries={isFetchingCountries}
                        countryDatasetData={countryDatasetData}
                        isFetchingCountryDataset={isFetchingCountryDataset}
                    />
                    {isBillingAddressVisible && (
                        <BillingAndShippingCheckboxField isSeparateAddress={isSeparateAddress} setIsSeparateAddress={setIsSeparateAddress} />
                    )}
                </>
            )}
            {/* Billing address shown in default case (when isSeparateAddress or only billing visible) */}
            {!showBillingFirst && (isSeparateAddress || (!isDeliveryAddressVisible && isBillingAddressVisible)) && (
                <BillingAddressSection
                    isSeparateAddress={isSeparateAddress}
                    isAddressFieldRequired={isAddressFieldRequired}
                    isOptional={isBillingAddressOptional}
                    countriesData={countriesData}
                    isFetchingCountries={isFetchingCountries}
                    countryDatasetData={countryDatasetData}
                    isFetchingCountryDataset={isFetchingCountryDataset}
                />
            )}
            {/* Billing address shown first (when billing required and delivery optional) */}
            {showBillingFirst && (
                <>
                    <BillingAddressSection
                        isSeparateAddress={isSeparateAddress}
                        isAddressFieldRequired={isAddressFieldRequired}
                        showBillingFirst={showBillingFirst}
                        countriesData={countriesData}
                        isFetchingCountries={isFetchingCountries}
                        countryDatasetData={countryDatasetData}
                        isFetchingCountryDataset={isFetchingCountryDataset}
                    />
                    <BillingAndShippingCheckboxField
                        isSeparateAddress={isSeparateAddress}
                        setIsSeparateAddress={setIsSeparateAddress}
                        showBillingFirst={showBillingFirst}
                    />
                    {isSeparateAddress && (
                        <DeliveryAddressSection
                            isSeparateAddress={isSeparateAddress}
                            isAddressFieldRequired={isAddressFieldRequired}
                            isOptional
                            countriesData={countriesData}
                            isFetchingCountries={isFetchingCountries}
                            countryDatasetData={countryDatasetData}
                            isFetchingCountryDataset={isFetchingCountryDataset}
                        />
                    )}
                </>
            )}
            <LanguageField />
        </div>
    );
};
