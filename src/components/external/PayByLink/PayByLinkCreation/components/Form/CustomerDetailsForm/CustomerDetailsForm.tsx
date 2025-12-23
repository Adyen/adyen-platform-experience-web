import { ShopperEmailField } from './Fields/ShopperEmailField';
import { ShopperPhoneField } from './Fields/ShopperPhoneField';
import { CountryRegionField } from './Fields/CountryRegionField';
import { ShippingStreetField } from './Fields/Address/ShippingStreetField';
import { LanguageField } from './Fields/LanguageField';
import { BillingAndShippingCheckboxField } from './Fields/BillingAndShippingCheckboxField';
import { StateUpdater } from 'preact/hooks';
import { FormTextInput } from '../../../../../../internal/FormWrappers/FormTextInput';
import { PBLFormValues } from '../../types';
// import { EmailDependentCheckboxField } from './Fields/EmailDependentCheckboxField';
import { ShippingHouseNumberField } from './Fields/Address/ShippingHouseNumberField';
import { ShippingCountryField } from './Fields/Address/ShippingCountryField';
import { ShippingCityField } from './Fields/Address/ShippingCityField';
import { ShippingPostalCodeField } from './Fields/Address/ShippingPostalCodeField';
import { BillingCountryField } from './Fields/Address/BillingCountryField';
import { TypographyElement, TypographyVariant } from '../../../../../../internal/Typography/types';
import useCoreContext from '../../../../../../../core/Context/useCoreContext';
import Typography from '../../../../../../internal/Typography/Typography';
import './CustomerDetailsForm.scss';
import { PBL_CREATION_FIELD_LENGTHS } from '../../../constants';
import { useWizardFormContext } from '../../../../../../../hooks/form/wizard/WizardFormContext';
import { Dispatch } from 'preact/compat';
import { PayByLinkCountryDTO } from '../../../../../../../types';
import { useAddressChecker } from './useAddressChecker';

interface CustomerDetailsFormProps {
    isSeparateAddress: boolean;
    setIsSeparateAddress: Dispatch<StateUpdater<boolean>>;
    countriesData?: { data?: PayByLinkCountryDTO[] };
    isFetchingCountries: boolean;
}

export const CustomerDetailsForm = ({ isSeparateAddress, setIsSeparateAddress, countriesData, isFetchingCountries }: CustomerDetailsFormProps) => {
    const { i18n } = useCoreContext();
    const { fieldsConfig } = useWizardFormContext<PBLFormValues>();
    const { isAddressFieldRequired } = useAddressChecker();

    const isNameVisible = fieldsConfig['shopperName.firstName']?.visible || fieldsConfig['shopperName.lastName']?.visible;
    const isBillingAddressOptional = !fieldsConfig['billingAddress.street']?.required;
    const isDeliveryAddressOptional = !fieldsConfig['deliveryAddress.street']?.required;
    const isBillingAddressVisible = fieldsConfig['billingAddress.street']?.visible;
    const isDeliveryAddressVisible = fieldsConfig['deliveryAddress.street']?.visible;

    return (
        <div className="adyen-pe-pay-by-link-creation-form__fields-container">
            <FormTextInput<PBLFormValues>
                fieldName={'shopperReference'}
                label={i18n.get('payByLink.linkCreation.fields.shopperReference.label')}
                maxLength={PBL_CREATION_FIELD_LENGTHS.shopperReference.max}
                minLength={PBL_CREATION_FIELD_LENGTHS.shopperReference.min}
            />
            {isNameVisible && (
                <div className="adyen-pe-pay-by-link-creation-form__shopper-name-container">
                    <FormTextInput<PBLFormValues>
                        fieldName={'shopperName.firstName'}
                        label={i18n.get('payByLink.linkCreation.fields.shopperName.label')}
                        maxLength={PBL_CREATION_FIELD_LENGTHS.shopperName.firstName.max}
                    />
                    <FormTextInput<PBLFormValues>
                        maxLength={PBL_CREATION_FIELD_LENGTHS.shopperName.lastName.max}
                        fieldName={'shopperName.lastName'}
                        label={i18n.get('payByLink.linkCreation.fields.shopperLastName.label')}
                    />
                </div>
            )}
            <ShopperEmailField />
            {/* TODO: Pending discussion on whether we want to show this functionality                 
                <div className="adyen-pe-pay-by-link-creation-form__email-checkbox-container">
                    <EmailDependentCheckboxField name="sendLinkToShopper" label={i18n.get('payByLink.linkCreation.fields.sendLinkToShopper.label')} />
                    <EmailDependentCheckboxField
                        name="sendPaymentSuccessToShopper"
                        label={i18n.get('payByLink.linkCreation.fields.sendPaymentSuccessToShopper.label')}
                    />
                </div> */}

            <ShopperPhoneField />
            <CountryRegionField countriesData={countriesData} isFetchingCountries={isFetchingCountries} />
            {isDeliveryAddressVisible && (
                <>
                    <div className="adyen-pe-pay-by-link-creation-form__shipping-address-container">
                        <div className="adyen-pe-pay-by-link-creation-form__shipping-address-title-container">
                            <Typography
                                el={TypographyElement.SPAN}
                                variant={TypographyVariant.SUBTITLE}
                                stronger
                                className="adyen-pe-pay-by-link-creation-form__billing-address-title"
                            >
                                {i18n.get('payByLink.linkCreation.sections.deliveryAddress.label')}
                            </Typography>
                            {isDeliveryAddressOptional && (
                                <Typography
                                    el={TypographyElement.SPAN}
                                    variant={TypographyVariant.BODY}
                                    className="adyen-pe-pay-by-link-creation-form__field-label-optional"
                                >
                                    {`(${i18n.get('payByLink.common.fields.optional.label')})`}
                                </Typography>
                            )}
                        </div>
                        <div>
                            <ShippingStreetField isSeparateAddress={isSeparateAddress} isAddressFieldRequired={isAddressFieldRequired} />
                            <ShippingHouseNumberField isSeparateAddress={isSeparateAddress} isAddressFieldRequired={isAddressFieldRequired} />
                        </div>
                        <div>
                            <ShippingCountryField
                                countriesData={countriesData}
                                isAddressFieldRequired={isAddressFieldRequired}
                                isFetchingCountries={isFetchingCountries}
                                isSeparateAddress={isSeparateAddress}
                            />
                            <ShippingCityField isAddressFieldRequired={isAddressFieldRequired} isSeparateAddress={isSeparateAddress} />
                            <ShippingPostalCodeField isAddressFieldRequired={isAddressFieldRequired} isSeparateAddress={isSeparateAddress} />
                        </div>
                    </div>
                    {isBillingAddressVisible && (
                        <BillingAndShippingCheckboxField isSeparateAddress={isSeparateAddress} setIsSeparateAddress={setIsSeparateAddress} />
                    )}
                </>
            )}
            {(isSeparateAddress || (!isDeliveryAddressVisible && isBillingAddressVisible)) && (
                <div className="adyen-pe-pay-by-link-creation-form__billing-address-container">
                    <div className="adyen-pe-pay-by-link-creation-form__billing-address-title-container">
                        <Typography
                            el={TypographyElement.SPAN}
                            variant={TypographyVariant.SUBTITLE}
                            stronger
                            className="adyen-pe-pay-by-link-creation-form__billing-address-title"
                        >
                            {i18n.get('payByLink.linkCreation.sections.billingAddress.label')}
                        </Typography>
                        {isBillingAddressOptional && (
                            <Typography
                                el={TypographyElement.SPAN}
                                variant={TypographyVariant.BODY}
                                className="adyen-pe-pay-by-link-creation-form__field-label-optional"
                            >
                                {`(${i18n.get('payByLink.common.fields.optional.label')})`}
                            </Typography>
                        )}
                    </div>
                    <div>
                        <FormTextInput<PBLFormValues>
                            maxLength={PBL_CREATION_FIELD_LENGTHS.billingAddress.street.max}
                            className="adyen-pe-pay-by-link-creation-form__billing-address-field--large"
                            fieldName="billingAddress.street"
                            label={i18n.get('payByLink.linkCreation.fields.billingAddress.street.label')}
                            hideOptionalLabel
                            isRequired={fieldsConfig['billingAddress.street']?.required || isAddressFieldRequired('billingAddress.street')}
                        />
                        <FormTextInput<PBLFormValues>
                            maxLength={PBL_CREATION_FIELD_LENGTHS.billingAddress.houseNumberOrName.max}
                            className="adyen-pe-pay-by-link-creation-form__billing-address-field--small"
                            fieldName="billingAddress.houseNumberOrName"
                            label={i18n.get('payByLink.linkCreation.fields.billingAddress.houseNumberOrName.label')}
                            hideOptionalLabel
                            isRequired={
                                fieldsConfig['billingAddress.houseNumberOrName']?.required ||
                                isAddressFieldRequired('billingAddress.houseNumberOrName')
                            }
                        />
                    </div>
                    <div>
                        <BillingCountryField
                            countriesData={countriesData}
                            isAddressFieldRequired={isAddressFieldRequired}
                            isFetchingCountries={isFetchingCountries}
                        />
                        <FormTextInput<PBLFormValues>
                            maxLength={PBL_CREATION_FIELD_LENGTHS.billingAddress.city.max}
                            className="adyen-pe-pay-by-link-creation-form__billing-address-field--medium"
                            fieldName="billingAddress.city"
                            label={i18n.get('payByLink.linkCreation.fields.billingAddress.city.label')}
                            hideOptionalLabel
                            isRequired={fieldsConfig['billingAddress.city']?.required || isAddressFieldRequired('billingAddress.city')}
                        />
                        <FormTextInput<PBLFormValues>
                            maxLength={PBL_CREATION_FIELD_LENGTHS.billingAddress.postalCode.max}
                            minLength={PBL_CREATION_FIELD_LENGTHS.billingAddress.postalCode.min}
                            className="adyen-pe-pay-by-link-creation-form__billing-address-field--small"
                            fieldName="billingAddress.postalCode"
                            label={i18n.get('payByLink.linkCreation.fields.billingAddress.postalCode.label')}
                            hideOptionalLabel
                            isRequired={fieldsConfig['billingAddress.postalCode']?.required || isAddressFieldRequired('billingAddress.postalCode')}
                        />
                    </div>
                </div>
            )}
            <LanguageField />
        </div>
    );
};
