import { ShopperEmailField } from './Fields/ShopperEmailField';
import { ShopperPhoneField } from './Fields/ShopperPhoneField';
import { CountryRegionField } from './Fields/CountryRegionField';
import { ShippingStreetField } from './Fields/Address/ShippingStreetField';
import { LanguageField } from './Fields/LanguageField';
import { BillingAndShippingCheckboxField } from './Fields/BillingAndShippingCheckboxField';
import { StateUpdater } from 'preact/hooks';
import { Dispatch } from 'preact/compat';
import { FormTextInput } from '../../../../../../internal/FormWrappers/FormTextInput';
import { PBLFormValues } from '../../types';
// import { EmailDependentCheckboxField } from './Fields/EmailDependentCheckboxField';
import { ShippingHouseNumberField } from './Fields/Address/ShippingHouseNumberField';
import { ShippingCountryField } from './Fields/Address/ShippingCountryField';
import { ShippingCityField } from './Fields/Address/ShippingCityField';
import { ShippingPostalCodeField } from './Fields/Address/ShippingPostalCodeField';
import { BillingCountryField } from './Fields/Address/BillingCountryField';
import { TypographyVariant } from '../../../../../../internal/Typography/types';
import useCoreContext from '../../../../../../../core/Context/useCoreContext';
import Typography from '../../../../../../internal/Typography/Typography';
import './CustomerDetailsForm.scss';
import { PBL_CREATION_FIELD_LENGTHS } from '../../../constants';

export const CustomerDetailsForm = ({
    isSeparateAddress,
    setIsSeparateAddress,
}: {
    isSeparateAddress: boolean;
    setIsSeparateAddress: Dispatch<StateUpdater<boolean>>;
}) => {
    const { i18n } = useCoreContext();
    return (
        <div className="adyen-pe-pay-by-link-creation-form__fields-container">
            <FormTextInput<PBLFormValues>
                fieldName={'shopperReference'}
                label={i18n.get('payByLink.linkCreation.fields.shopperReference.label')}
                maxLength={PBL_CREATION_FIELD_LENGTHS.shopperReference.max}
                minLength={PBL_CREATION_FIELD_LENGTHS.shopperReference.min}
            />
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
            <div>
                <ShopperEmailField />
                {/* TODO: Pending discussion on whether we want to show this functionality                 
                <div className="adyen-pe-pay-by-link-creation-form__email-checkbox-container">
                    <EmailDependentCheckboxField name="sendLinkToShopper" label={i18n.get('payByLink.linkCreation.fields.sendLinkToShopper.label')} />
                    <EmailDependentCheckboxField
                        name="sendPaymentSuccessToShopper"
                        label={i18n.get('payByLink.linkCreation.fields.sendPaymentSuccessToShopper.label')}
                    />
                </div> */}
            </div>

            <ShopperPhoneField />
            <CountryRegionField />
            <div className="adyen-pe-pay-by-link-creation-form__shipping-address-container">
                <Typography variant={TypographyVariant.TITLE} className="adyen-pe-pay-by-link-creation-form__billing-address-title">
                    {i18n.get('payByLink.linkCreation.sections.deliveryAddress.label')}
                </Typography>
                <div>
                    <ShippingStreetField isSeparateAddress={isSeparateAddress} />
                    <ShippingHouseNumberField isSeparateAddress={isSeparateAddress} />
                </div>
                <div>
                    <ShippingCountryField isSeparateAddress={isSeparateAddress} />
                    <ShippingCityField isSeparateAddress={isSeparateAddress} />
                    <ShippingPostalCodeField isSeparateAddress={isSeparateAddress} />
                </div>
            </div>
            <BillingAndShippingCheckboxField isSeparateAddress={isSeparateAddress} setIsSeparateAddress={setIsSeparateAddress} />
            {isSeparateAddress && (
                <div className="adyen-pe-pay-by-link-creation-form__billing-address-container">
                    <Typography variant={TypographyVariant.TITLE} className="adyen-pe-pay-by-link-creation-form__billing-address-title">
                        {i18n.get('payByLink.linkCreation.sections.billingAddress.label')}
                    </Typography>
                    <div>
                        <FormTextInput<PBLFormValues>
                            maxLength={PBL_CREATION_FIELD_LENGTHS.billingAddress.street.max}
                            className="adyen-pe-pay-by-link-creation-form__billing-address-field--large"
                            fieldName="billingAddress.street"
                            label={i18n.get('payByLink.linkCreation.fields.billingAddress.street.label')}
                        />
                        <FormTextInput<PBLFormValues>
                            maxLength={PBL_CREATION_FIELD_LENGTHS.billingAddress.houseNumberOrName.max}
                            className="adyen-pe-pay-by-link-creation-form__billing-address-field--small"
                            fieldName="billingAddress.houseNumberOrName"
                            label={i18n.get('payByLink.linkCreation.fields.billingAddress.houseNumberOrName.label')}
                        />
                    </div>
                    <div>
                        <BillingCountryField />
                        <FormTextInput<PBLFormValues>
                            maxLength={PBL_CREATION_FIELD_LENGTHS.billingAddress.city.max}
                            className="adyen-pe-pay-by-link-creation-form__billing-address-field--medium"
                            fieldName="billingAddress.city"
                            label={i18n.get('payByLink.linkCreation.fields.billingAddress.city.label')}
                        />
                        <FormTextInput<PBLFormValues>
                            maxLength={PBL_CREATION_FIELD_LENGTHS.billingAddress.postalCode.max}
                            minLength={PBL_CREATION_FIELD_LENGTHS.billingAddress.postalCode.min}
                            className="adyen-pe-pay-by-link-creation-form__billing-address-field--small"
                            fieldName="billingAddress.postalCode"
                            label={i18n.get('payByLink.linkCreation.fields.billingAddress.postalCode.label')}
                        />
                    </div>
                </div>
            )}
            <LanguageField />
        </div>
    );
};
