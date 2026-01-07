import useCoreContext from '../../../../../../../../../core/Context/useCoreContext';
import { useMemo, useCallback } from 'preact/hooks';
import { FormSelect } from '../../../../../../../../internal/FormWrappers/FormSelect';
import { PBLFormValues } from '../../../../types';
import { useWizardFormContext } from '../../../../../../../../../hooks/form/wizard/WizardFormContext';
import { PayByLinkCountryDTO } from '../../../../../../../../../types';
import type { AddressFieldRequiredChecker } from '../../useAddressChecker';
import { SelectChangeEvent } from '../../../../../../../../internal/FormFields/Select/types';

interface ShippingCountryFieldProps {
    countriesData?: { data?: PayByLinkCountryDTO[] };
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
    const { setValue, fieldsConfig } = useWizardFormContext<PBLFormValues>();

    const countriesListItems = useMemo(() => {
        const countryCodeSubset = new Set((countriesData?.data ?? []).map(({ countryCode }: PayByLinkCountryDTO) => countryCode).filter(Boolean));
        const countriesTranslationDataset = countryDatasetData ?? [];

        const available = countryCodeSubset.size
            ? countriesTranslationDataset.filter(({ id }) => countryCodeSubset.has(id))
            : countriesTranslationDataset;

        return available.map(({ id, name }) => ({ id, name })).sort(({ name: a }, { name: b }) => a.localeCompare(b));
    }, [countriesData, countryDatasetData]);

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
        <FormSelect<PBLFormValues>
            clearable
            filterable
            fieldName="deliveryAddress.country"
            label={i18n.get('payByLink.creation.fields.deliveryAddress.country.label')}
            items={countriesListItems}
            readonly={isFetchingCountries || isFetchingCountryDataset}
            className="adyen-pe-pay-by-link-creation-form__shipping-address-field--medium"
            onChange={handleChange}
            hideOptionalLabel
            isRequired={isRequired}
        />
    );
};
