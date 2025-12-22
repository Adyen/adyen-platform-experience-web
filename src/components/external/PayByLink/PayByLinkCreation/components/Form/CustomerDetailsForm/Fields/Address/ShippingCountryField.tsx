import useCoreContext from '../../../../../../../../../core/Context/useCoreContext';
import { useMemo, useCallback } from 'preact/hooks';
import { useFetch } from '../../../../../../../../../hooks/useFetch';
import { FormSelect } from '../../../../../../../../internal/FormWrappers/FormSelect';
import { PBLFormValues } from '../../../../types';
import { useWizardFormContext } from '../../../../../../../../../hooks/form/wizard/WizardFormContext';
import { TargetedEvent } from 'preact/compat';
import { PayByLinkCountryDTO } from '../../../../../../../../../types';
import type { AddressFieldRequiredChecker } from '../../useAddressChecker';

interface ShippingCountryFieldProps {
    countriesData?: { data?: PayByLinkCountryDTO[] };
    isAddressFieldRequired: AddressFieldRequiredChecker;
    isFetchingCountries: boolean;
    isSeparateAddress: boolean;
}

export const ShippingCountryField = ({
    countriesData,
    isAddressFieldRequired,
    isFetchingCountries,
    isSeparateAddress,
}: ShippingCountryFieldProps) => {
    const { i18n, getCdnDataset } = useCoreContext();
    const { setValue, fieldsConfig } = useWizardFormContext<PBLFormValues>();

    const countryDatasetQuery = useFetch({
        fetchOptions: { enabled: !!i18n?.locale },
        queryFn: useCallback(async () => {
            const fileName = `${i18n.locale}`;
            if (getCdnDataset) {
                return (
                    (await getCdnDataset<Array<{ id: string; name: string }>>({
                        name: fileName,
                        extension: 'json',
                        subFolder: 'countries',
                        fallback: [] as Array<{ id: string; name: string }>,
                    })) ?? []
                );
            }
            return [] as Array<{ id: string; name: string }>;
        }, [getCdnDataset, i18n.locale]),
    });

    const countriesListItems = useMemo(() => {
        const countryCodeSubset = new Set((countriesData?.data ?? []).map(({ countryCode }: PayByLinkCountryDTO) => countryCode).filter(Boolean));
        const countriesTranslationDataset = countryDatasetQuery.data ?? [];

        const available = countryCodeSubset.size
            ? countriesTranslationDataset.filter(({ id }) => countryCodeSubset.has(id))
            : countriesTranslationDataset;

        return available.map(({ id, name }) => ({ id, name })).sort(({ name: a }, { name: b }) => a.localeCompare(b));
    }, [countriesData?.data, countryDatasetQuery.data]);

    const handleChange = useCallback(
        (e: TargetedEvent<HTMLSelectElement>) => {
            if (!isSeparateAddress) {
                setValue('billingAddress.country', (e.target as HTMLSelectElement).value);
            }
        },
        [isSeparateAddress, setValue]
    );

    const isRequired = fieldsConfig['deliveryAddress.country']?.required || isAddressFieldRequired('deliveryAddress.country');

    return (
        <FormSelect<PBLFormValues>
            filterable
            fieldName="deliveryAddress.country"
            label={i18n.get('payByLink.linkCreation.fields.deliveryAddress.country.label')}
            items={countriesListItems}
            readonly={isFetchingCountries || countryDatasetQuery.isFetching}
            className="adyen-pe-pay-by-link-creation-form__shipping-address-field--medium"
            onChange={handleChange}
            hideOptionalLabel
            isRequired={isRequired}
        />
    );
};
