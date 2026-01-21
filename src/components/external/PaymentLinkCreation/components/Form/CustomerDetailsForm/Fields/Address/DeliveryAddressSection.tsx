import useCoreContext from '../../../../../../../../core/Context/useCoreContext';
import Typography from '../../../../../../../internal/Typography/Typography';
import { TypographyElement, TypographyVariant } from '../../../../../../../internal/Typography/types';
import { ShippingStreetField } from './ShippingStreetField';
import { ShippingHouseNumberField } from './ShippingHouseNumberField';
import { ShippingCountryField } from './ShippingCountryField';
import { ShippingCityField } from './ShippingCityField';
import { ShippingPostalCodeField } from './ShippingPostalCodeField';
import type { AddressFieldRequiredChecker } from '../../useAddressChecker';
import { IPaymentLinkCountry } from '../../../../../../../../types';

interface DeliveryAddressSectionProps {
    isSeparateAddress: boolean;
    isAddressFieldRequired: AddressFieldRequiredChecker;
    isOptional?: boolean;
    countriesData?: { data?: IPaymentLinkCountry[] };
    isFetchingCountries: boolean;
    countryDatasetData?: Array<{ id: string; name: string }>;
    isFetchingCountryDataset: boolean;
}

export const DeliveryAddressSection = ({
    isSeparateAddress,
    isAddressFieldRequired,
    isOptional = false,
    countriesData,
    isFetchingCountries,
    countryDatasetData,
    isFetchingCountryDataset,
}: DeliveryAddressSectionProps) => {
    const { i18n } = useCoreContext();

    return (
        <div className="adyen-pe-payment-link-creation-form__shipping-address-container">
            <div className="adyen-pe-payment-link-creation-form__shipping-address-title-container">
                <Typography
                    el={TypographyElement.SPAN}
                    variant={TypographyVariant.SUBTITLE}
                    stronger
                    className="adyen-pe-payment-link-creation-form__billing-address-title"
                >
                    {i18n.get('payByLink.creation.sections.deliveryAddress.label')}
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
                <ShippingStreetField isSeparateAddress={isSeparateAddress} isAddressFieldRequired={isAddressFieldRequired} />
                <ShippingHouseNumberField isSeparateAddress={isSeparateAddress} isAddressFieldRequired={isAddressFieldRequired} />
            </div>
            <div>
                <ShippingCountryField
                    countriesData={countriesData}
                    isAddressFieldRequired={isAddressFieldRequired}
                    isFetchingCountries={isFetchingCountries}
                    isSeparateAddress={isSeparateAddress}
                    countryDatasetData={countryDatasetData}
                    isFetchingCountryDataset={isFetchingCountryDataset}
                />
                <ShippingCityField isAddressFieldRequired={isAddressFieldRequired} isSeparateAddress={isSeparateAddress} />
                <ShippingPostalCodeField isAddressFieldRequired={isAddressFieldRequired} isSeparateAddress={isSeparateAddress} />
            </div>
        </div>
    );
};
