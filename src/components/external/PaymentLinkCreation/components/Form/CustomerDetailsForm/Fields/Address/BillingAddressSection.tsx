import useCoreContext from '../../../../../../../../core/Context/useCoreContext';
import Typography from '../../../../../../../internal/Typography/Typography';
import { TypographyElement, TypographyVariant } from '../../../../../../../internal/Typography/types';
import { BillingStreetField } from './BillingStreetField';
import { BillingHouseNumberField } from './BillingHouseNumberField';
import { BillingCountryField } from './BillingCountryField';
import { BillingCityField } from './BillingCityField';
import { BillingPostalCodeField } from './BillingPostalCodeField';
import type { AddressFieldRequiredChecker } from '../../useAddressChecker';
import { IPaymentLinkCountry } from '../../../../../../../../types';

interface BillingAddressSectionProps {
    isSeparateAddress: boolean;
    isAddressFieldRequired: AddressFieldRequiredChecker;
    isOptional?: boolean;
    showBillingFirst?: boolean;
    countriesData?: { data?: IPaymentLinkCountry[] };
    isFetchingCountries: boolean;
    countryDatasetData?: Array<{ id: string; name: string }>;
    isFetchingCountryDataset: boolean;
}

export const BillingAddressSection = ({
    isSeparateAddress,
    isAddressFieldRequired,
    isOptional = false,
    showBillingFirst = false,
    countriesData,
    isFetchingCountries,
    countryDatasetData,
    isFetchingCountryDataset,
}: BillingAddressSectionProps) => {
    const { i18n } = useCoreContext();

    return (
        <div className="adyen-pe-payment-link-creation-form__billing-address-container">
            <div className="adyen-pe-payment-link-creation-form__billing-address-title-container">
                <Typography
                    el={TypographyElement.SPAN}
                    variant={TypographyVariant.SUBTITLE}
                    stronger
                    className="adyen-pe-payment-link-creation-form__billing-address-title"
                >
                    {i18n.get('payByLink.creation.sections.billingAddress.label')}
                </Typography>
                {isOptional && (
                    <Typography
                        el={TypographyElement.SPAN}
                        variant={TypographyVariant.BODY}
                        className="adyen-pe-payment-link-creation-form__field-label-optional"
                    >
                        {`(${i18n.get('payByLink.common.fields.optional.label')})`}
                    </Typography>
                )}
            </div>
            <div>
                <BillingStreetField
                    isSeparateAddress={isSeparateAddress}
                    isAddressFieldRequired={isAddressFieldRequired}
                    showBillingFirst={showBillingFirst}
                />
                <BillingHouseNumberField
                    isSeparateAddress={isSeparateAddress}
                    isAddressFieldRequired={isAddressFieldRequired}
                    showBillingFirst={showBillingFirst}
                />
            </div>
            <div>
                <BillingCountryField
                    countriesData={countriesData}
                    isAddressFieldRequired={isAddressFieldRequired}
                    isFetchingCountries={isFetchingCountries}
                    countryDatasetData={countryDatasetData}
                    isFetchingCountryDataset={isFetchingCountryDataset}
                    isSeparateAddress={isSeparateAddress}
                    showBillingFirst={showBillingFirst}
                />
                <BillingCityField
                    isSeparateAddress={isSeparateAddress}
                    isAddressFieldRequired={isAddressFieldRequired}
                    showBillingFirst={showBillingFirst}
                />
                <BillingPostalCodeField
                    isSeparateAddress={isSeparateAddress}
                    isAddressFieldRequired={isAddressFieldRequired}
                    showBillingFirst={showBillingFirst}
                />
            </div>
        </div>
    );
};
