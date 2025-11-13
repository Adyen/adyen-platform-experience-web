import { ShopperReferenceField } from './Fields/ShopperReferenceField';
import { ShopperNameField } from './Fields/ShopperNameField';
import { ShopperEmailField } from './Fields/ShopperEmailField';
import { ShopperPhoneField } from './Fields/ShopperPhoneField';
import { CountryRegionField } from './Fields/CountryRegionField';
import { ShippingAddressField } from './Fields/ShippingAddressField';
import { BillingAddressField } from './Fields/BillingAddressField';
import { LanguageField } from './Fields/LanguageField';
import { BillingAndShippingCheckboxField } from './Fields/BillingAndShippingCheckboxField';
import { StateUpdater } from 'preact/hooks';
import { Dispatch } from 'preact/compat';
import { VisibleField } from '../VisibleField';
import { SendLinkToShopperField } from './Fields/SendLinkToShopperField';
import { SendPaymentSuccessToShopperField } from './Fields/SendPaymentSuccessToShopperField';

export const CustomerDetailsForm = ({
    isSeparateAddress,
    setIsSeparateAddress,
}: {
    isSeparateAddress: boolean;
    setIsSeparateAddress: Dispatch<StateUpdater<boolean>>;
}) => {
    return (
        <div className="adyen-pe-pay-by-link-creation-form__form-fields-container">
            <VisibleField name="shopperReference">
                <ShopperReferenceField />
            </VisibleField>

            <VisibleField name="fullName">
                <ShopperNameField />
            </VisibleField>

            <div>
                <VisibleField name="emailAddress">
                    <ShopperEmailField />
                </VisibleField>

                <div className="adyen-pe-pay-by-link-creation-form__form-email-checkbox-container">
                    <VisibleField name="sendLinkToShopper">
                        <SendLinkToShopperField />
                    </VisibleField>
                    <VisibleField name="sendPaymentSuccessToShopper">
                        <SendPaymentSuccessToShopperField />
                    </VisibleField>
                </div>
            </div>

            <VisibleField name="phoneNumber">
                <ShopperPhoneField />
            </VisibleField>

            <VisibleField name="countryCode">
                <CountryRegionField />
            </VisibleField>

            <VisibleField name="shippingAddress">
                <ShippingAddressField isSeparateAddress={isSeparateAddress} />
            </VisibleField>

            <BillingAndShippingCheckboxField isSeparateAddress={isSeparateAddress} setIsSeparateAddress={setIsSeparateAddress} />

            <VisibleField name="billingAddress">{isSeparateAddress && <BillingAddressField isSeparateAddress={isSeparateAddress} />}</VisibleField>

            <VisibleField name="shopperLocale">
                <LanguageField />
            </VisibleField>
        </div>
    );
};
