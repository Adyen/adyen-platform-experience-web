import useCoreContext from '../../../../../../../../core/Context/useCoreContext';
import { useMemo, useCallback } from 'preact/hooks';
import { FormSelect } from '../../../../../../../internal/FormWrappers/FormSelect';
import { PaymentLinkCreationFormValues } from '../../../../types';
import type { AddressFieldRequiredChecker } from '../../useAddressChecker';
import { IPaymentLinkCountry } from '../../../../../../../../types';
import { useWizardFormContext } from '../../../../../../../../hooks/form/wizard/WizardFormContext';
import { SelectChangeEvent } from '../../../../../../../internal/FormFields/Select/types';

interface BillingCountryFieldProps {
    countriesData?: { data?: IPaymentLinkCountry[] };
    isAddressFieldRequired: AddressFieldRequiredChecker;
    isFetchingCountries: boolean;
    countryDatasetData?: Array<{ id: string; name: string }>;
    isFetchingCountryDataset: boolean;
    isSameAddress?: boolean;
    showBillingFirst?: boolean;
    isSameAddressCheckboxShown?: boolean;
}

export const BillingCountryField = ({
    countriesData,
    isAddressFieldRequired,
    isFetchingCountries,
    countryDatasetData,
    isFetchingCountryDataset,
    isSameAddress = false,
    showBillingFirst = false,
    isSameAddressCheckboxShown = false,
}: BillingCountryFieldProps) => {
    const { i18n } = useCoreContext();
    const { fieldsConfig, setValue } = useWizardFormContext<PaymentLinkCreationFormValues>();

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
            if (showBillingFirst && isSameAddressCheckboxShown && isSameAddress) {
                setValue('deliveryAddress.country', (e.target as HTMLSelectElement).value);
            }
        },
        [isSameAddress, setValue, showBillingFirst, isSameAddressCheckboxShown]
    );

    const isRequired = fieldsConfig['billingAddress.country']?.required || isAddressFieldRequired('billingAddress.country');

    return (
        <FormSelect<PaymentLinkCreationFormValues>
            clearable
            filterable
            className="adyen-pe-payment-link-creation-form__billing-address-field--medium"
            fieldName="billingAddress.country"
            label={i18n.get('payByLink.creation.fields.billingAddress.country.label')}
            items={countriesListItems}
            readonly={isFetchingCountries || isFetchingCountryDataset}
            onChange={handleChange}
            hideOptionalLabel
            isRequired={isRequired}
        />
    );
};
