import useCoreContext from '../../../../../../../../core/Context/useCoreContext';
import { useMemo, useCallback } from 'preact/hooks';
import { FormSelect } from '../../../../../../../internal/FormWrappers/FormSelect';
import { PaymentLinkCreationFormValues } from '../../../../types';
import { useWizardFormContext } from '../../../../../../../../hooks/form/wizard/WizardFormContext';
import { IPaymentLinkCountry } from '../../../../../../../../types';
import type { AddressFieldRequiredChecker } from '../../useAddressChecker';
import { SelectChangeEvent } from '../../../../../../../internal/FormFields/Select/types';

interface ShippingCountryFieldProps {
    countriesData?: { data?: IPaymentLinkCountry[] };
    isAddressFieldRequired: AddressFieldRequiredChecker;
    isFetchingCountries: boolean;
    isSeparateAddress: boolean;
    countryDatasetData?: Array<{ id: string; name: string }>;
    isFetchingCountryDataset: boolean;
}

export const ShippingCountryField = ({
    countriesData,
    isAddressFieldRequired,
    isFetchingCountries,
    isSeparateAddress,
    countryDatasetData,
    isFetchingCountryDataset,
}: ShippingCountryFieldProps) => {
    const { i18n } = useCoreContext();
    const { setValue, fieldsConfig } = useWizardFormContext<PaymentLinkCreationFormValues>();

    const countriesListItems = useMemo(() => {
        const allowedCodes = new Set((countriesData?.data ?? []).map(({ countryCode }: IPaymentLinkCountry) => countryCode).filter(Boolean));
        const countries = countryDatasetData?.length
            ? countryDatasetData
            : (countriesData?.data?.map(({ countryCode, countryName }) => ({ id: countryCode, name: countryName })) ?? []);

        const allowedCountries = countries.filter(({ id }) => !allowedCodes.size || allowedCodes.has(id));

        return allowedCountries.sort((a, b) => a.name.localeCompare(b.name));
    }, [countriesData?.data, countryDatasetData]);

    const handleChange = useCallback(
        (e: SelectChangeEvent) => {
            if (!isSeparateAddress) {
                setValue('billingAddress.country', (e.target as HTMLSelectElement).value);
            }
        },
        [isSeparateAddress, setValue]
    );

    const isRequired = fieldsConfig['deliveryAddress.country']?.required || isAddressFieldRequired('deliveryAddress.country');

    return (
        <FormSelect<PaymentLinkCreationFormValues>
            clearable
            filterable
            fieldName="deliveryAddress.country"
            label={i18n.get('payByLink.creation.fields.deliveryAddress.country.label')}
            items={countriesListItems}
            readonly={isFetchingCountries || isFetchingCountryDataset}
            className="adyen-pe-payment-link-creation-form__shipping-address-field--medium"
            onChange={handleChange}
            hideOptionalLabel
            isRequired={isRequired}
        />
    );
};
