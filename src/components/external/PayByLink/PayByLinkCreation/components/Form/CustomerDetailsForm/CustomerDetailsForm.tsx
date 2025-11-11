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

export const CustomerDetailsForm = ({
    isSeparateAddress,
    setIsSeparateAddress,
}: {
    isSeparateAddress: boolean;
    setIsSeparateAddress: Dispatch<StateUpdater<boolean>>;
}) => {
    return (
        <div className="adyen-pe-pay-by-link-creation__form-fields-container">
            <VisibleField name="shopperReference">
                <ShopperReferenceField />
            </VisibleField>
            <VisibleField name="fullName">
                <ShopperNameField />
            </VisibleField>
            <VisibleField name="emailAddress">
                <ShopperEmailField />
            </VisibleField>
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
