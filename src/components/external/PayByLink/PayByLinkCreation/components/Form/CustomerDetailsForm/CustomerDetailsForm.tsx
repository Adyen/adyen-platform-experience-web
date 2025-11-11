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

export const CustomerDetailsForm = ({
    isSeparateAddress,
    setIsSeparateAddress,
}: {
    isSeparateAddress: boolean;
    setIsSeparateAddress: Dispatch<StateUpdater<boolean>>;
}) => {
    return (
        <div className="adyen-pe-pay-by-link-creation__form-fields-container">
            <ShopperReferenceField />
            <ShopperNameField />
            <ShopperEmailField />
            <ShopperPhoneField />
            <CountryRegionField />
            <ShippingAddressField isSeparateAddress={isSeparateAddress} />
            <BillingAndShippingCheckboxField isSeparateAddress={isSeparateAddress} setIsSeparateAddress={setIsSeparateAddress} />
            {isSeparateAddress && <BillingAddressField isSeparateAddress={isSeparateAddress} />}
            <LanguageField />
        </div>
    );
};
