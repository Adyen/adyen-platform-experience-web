import useCoreContext from '../../../../../../../../core/Context/useCoreContext';
import { useMemo, useCallback } from 'preact/hooks';
import { useFetch } from '../../../../../../../../hooks/useFetch';
import { FormSelect } from '../../../../../../../internal/FormWrappers/FormSelect';
import { PBLFormValues } from '../../../types';
import { useWizardFormContext } from '../../../../../../../../hooks/form/wizard/WizardFormContext';
import { PayByLinkCountryDTO } from '../../../../../../../../types';

interface CountryRegionFieldProps {
    countriesData?: { data?: PayByLinkCountryDTO[] };
    isFetchingCountries: boolean;
}

export const CountryRegionField = ({ countriesData, isFetchingCountries }: CountryRegionFieldProps) => {
    const { i18n, getCdnDataset } = useCoreContext();
    const { fieldsConfig } = useWizardFormContext<PBLFormValues>();

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
        const countriesFromConfig = fieldsConfig?.['countryCode']?.options as string[] | undefined;
        const countriesQueryData = (countriesData?.data ?? []).map(({ countryCode }) => countryCode);

        const allowedCodes = new Set(countriesFromConfig ?? countriesQueryData);
        const countriesTranslationDataset = datasetQuery.data ?? [];
        const available = allowedCodes.size ? countriesTranslationDataset.filter(({ id }) => allowedCodes.has(id)) : countriesTranslationDataset;

        return available.sort((a, b) => a.name.localeCompare(b.name));
    }, [countriesData?.data, datasetQuery.data, fieldsConfig]);

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
