import useCoreContext from '../../../../../../../../core/Context/useCoreContext';
import { useMemo, useCallback } from 'preact/hooks';
import { useFetch } from '../../../../../../../../hooks/useFetch';
import { useConfigContext } from '../../../../../../../../core/ConfigContext';
import { EMPTY_OBJECT } from '../../../../../../../../utils';
import { FormSelect } from '../../../../../../../internal/FormWrappers/FormSelect';
import { PBLFormValues } from '../../../types';
import { useWizardFormContext } from '../../../../../../../../hooks/form/wizard/WizardFormContext';
import { PaymentLinkCountryDTO } from '../../../../../../../../types';

export const CountryRegionField = () => {
    const { i18n, getCdnDataset } = useCoreContext();
    const { fieldsConfig } = useWizardFormContext<PBLFormValues>();
    const { countries: getCountries } = useConfigContext().endpoints;

    const countriesQuery = useFetch({
        fetchOptions: { enabled: !!getCountries && !fieldsConfig?.['countryCode']?.options?.length },
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
        const configCountries = fieldsConfig?.['countryCode']?.options as PaymentLinkCountryDTO[] | undefined;
        console.log('configCountries', configCountries);
        const countriesQueryData = countriesQuery.data?.data ?? [];
        console.log('countriesQuery', countriesQuery);
        const subset = new Set(
            [...(configCountries ?? countriesQueryData)].map(({ countryCode }: PaymentLinkCountryDTO) => countryCode).filter(Boolean)
        );
        const store = datasetQuery.data ?? [];
        console.log('store', store);
        const available = subset.size ? store.filter(({ id }) => subset.has(id)) : store;
        console.log('available', available);

        return available.map(({ id, name }) => ({ id, name })).sort(({ name: a }, { name: b }) => a.localeCompare(b));
    }, [countriesQuery.data, datasetQuery.data, fieldsConfig]);

    return (
        <FormSelect<PBLFormValues>
            filterable
            fieldName="countryCode"
            label={i18n.get('payByLink.linkCreation.fields.country.label')}
            items={countriesListItems}
            readonly={countriesQuery.isFetching || datasetQuery.isFetching}
        />
    );
};
