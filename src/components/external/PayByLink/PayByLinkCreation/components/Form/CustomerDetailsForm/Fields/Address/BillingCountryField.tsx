import useCoreContext from '../../../../../../../../../core/Context/useCoreContext';
import { useMemo, useCallback } from 'preact/hooks';
import { useFetch } from '../../../../../../../../../hooks/useFetch';
import { FormSelect } from '../../../../../../../../internal/FormWrappers/FormSelect';
import { PBLFormValues } from '../../../../types';
import type { AddressFieldRequiredChecker } from '../../useAddressChecker';
import { PayByLinkCountryDTO } from '../../../../../../../../../types';
import { useWizardFormContext } from '../../../../../../../../../hooks/form/wizard/WizardFormContext';

interface BillingCountryFieldProps {
    countriesData?: { data?: PayByLinkCountryDTO[] };
    isAddressFieldRequired: AddressFieldRequiredChecker;
    isFetchingCountries: boolean;
}

export const BillingCountryField = ({ countriesData, isAddressFieldRequired, isFetchingCountries }: BillingCountryFieldProps) => {
    const { i18n, getCdnDataset } = useCoreContext();
    const { fieldsConfig } = useWizardFormContext<PBLFormValues>();

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

    const isRequired = fieldsConfig['billingAddress.country']?.required || isAddressFieldRequired('billingAddress.country');

    return (
        <FormSelect<PBLFormValues>
            filterable
            className="adyen-pe-pay-by-link-creation-form__billing-address-field--medium"
            fieldName="billingAddress.country"
            label={i18n.get('payByLink.linkCreation.fields.billingAddress.country.label')}
            items={countriesListItems}
            readonly={isFetchingCountries || countryDatasetQuery.isFetching}
            hideOptionalLabel
            isRequired={isRequired}
        />
    );
};
