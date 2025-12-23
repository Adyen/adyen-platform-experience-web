import useCoreContext from '../../../../../../../../core/Context/useCoreContext';
import { useMemo, useCallback } from 'preact/hooks';
import { useFetch } from '../../../../../../../../hooks/useFetch';
import { useConfigContext } from '../../../../../../../../core/ConfigContext';
import { EMPTY_OBJECT } from '../../../../../../../../utils';
import { FormSelect } from '../../../../../../../internal/FormWrappers/FormSelect';
import { PBLFormValues } from '../../../types';
import { PayByLinkCountryDTO } from '../../../../../../../../types';

interface CountryRegionFieldProps {
    countriesData?: { data?: PayByLinkCountryDTO[] };
    isFetchingCountries: boolean;
}

export const CountryRegionField = ({ countriesData, isFetchingCountries }: CountryRegionFieldProps) => {
    const { i18n, getCdnDataset } = useCoreContext();

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
        const countryCodes = new Set((countriesData?.data ?? []).map(({ countryCode }: PayByLinkCountryDTO) => countryCode).filter(Boolean));
        const countriesTranslationDataset = datasetQuery.data ?? [];

        const available = countryCodes.size ? countriesTranslationDataset.filter(({ id }) => countryCodes.has(id)) : countriesTranslationDataset;

        return available.map(({ id, name }) => ({ id, name })).sort(({ name: a }, { name: b }) => a.localeCompare(b));
    }, [countriesData, isFetchingCountries, datasetQuery.data]);

    return (
        <FormSelect<PBLFormValues>
            filterable
            fieldName="countryCode"
            label={i18n.get('payByLink.linkCreation.fields.country.label')}
            items={countriesListItems}
            readonly={isFetchingCountries || datasetQuery.isFetching}
        />
    );
};
