import useCoreContext from '../../../../../../../../../core/Context/useCoreContext';
import { useMemo, useCallback } from 'preact/hooks';
import { CountryDTO } from '../../../../../../../../../types/api/models/countries';
import { useFetch } from '../../../../../../../../../hooks/useFetch';
import { useConfigContext } from '../../../../../../../../../core/ConfigContext';
import { EMPTY_OBJECT } from '../../../../../../../../../utils';
import { FormSelect } from '../../../../../../../../internal/FormWrappers/FormSelect';
import { PBLFormValues } from '../../../../types';

export const BillingCountryField = () => {
    const { i18n, getCdnDataset } = useCoreContext();
    const { getCountries } = useConfigContext().endpoints;

    const countriesQuery = useFetch({
        fetchOptions: { enabled: !!getCountries },
        queryFn: useCallback(async () => {
            return getCountries?.(EMPTY_OBJECT);
        }, [getCountries]),
    });

    const datasetQuery = useFetch({
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
        const subset = new Set((countriesQuery.data?.data ?? []).map(({ countryCode }: CountryDTO) => countryCode).filter(Boolean));
        const store = datasetQuery.data ?? [];

        const available = subset.size ? store.filter(({ id }) => subset.has(id)) : store;

        return available.map(({ id, name }) => ({ id, name })).sort(({ name: a }, { name: b }) => a.localeCompare(b));
    }, [countriesQuery.data, datasetQuery.data]);

    return (
        <FormSelect<PBLFormValues>
            filterable
            className="adyen-pe-pay-by-link-creation-form__billing-address-field--medium"
            fieldName="billingAddress.country"
            label={i18n.get('payByLink.linkCreation.fields.billingAddress.country.label')}
            items={countriesListItems}
            readonly={countriesQuery.isFetching || datasetQuery.isFetching}
        />
    );
};
