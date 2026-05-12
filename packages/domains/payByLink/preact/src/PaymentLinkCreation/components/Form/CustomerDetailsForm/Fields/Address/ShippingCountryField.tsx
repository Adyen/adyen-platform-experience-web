import { useCoreContext } from '@integration-components/core/preact';
import { useMemo, useCallback } from 'preact/hooks';
import { FormSelect } from '@integration-components/ui-components-preact/FormWrappers/FormSelect';
import { PaymentLinkCreationFormValues } from '../../../../types';
import { useWizardFormContext } from '@integration-components/hooks-preact/form/wizard/WizardFormContext';
import { IPaymentLinkCountry } from '@integration-components/types';
import type { AddressFieldRequiredChecker } from '../../useAddressChecker';
import { SelectChangeEvent } from '@integration-components/ui-components-preact/FormFields/Select/types';

interface ShippingCountryFieldProps {
    countriesData?: { data?: IPaymentLinkCountry[] };
    isAddressFieldRequired: AddressFieldRequiredChecker;
    isFetchingCountries: boolean;
    isSameAddress: boolean;
    isSameAddressCopyEnabled?: boolean;
    countryDatasetData?: Array<{ id: string; name: string }>;
    isFetchingCountryDataset: boolean;
}

export const ShippingCountryField = ({
    countriesData,
    isAddressFieldRequired,
    isFetchingCountries,
    isSameAddress,
    isSameAddressCopyEnabled = false,
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
            // Only copy when the same-address checkbox is enabled.
            // Prevents unintended copying when no address is prefilled and target fields are readOnly
            if (isSameAddressCopyEnabled && isSameAddress) {
                setValue('billingAddress.country', (e.target as HTMLSelectElement).value);
            }
        },
        [isSameAddress, setValue, isSameAddressCopyEnabled]
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
