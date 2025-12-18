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
        const countriesFromConfig = fieldsConfig?.['countryCode']?.options as string[] | undefined;
        const countriesQueryData = (countriesQuery.data?.data ?? []).map(({ countryCode }) => countryCode);

        const allowedCodes = new Set(countriesFromConfig ?? countriesQueryData);
        const store = datasetQuery.data ?? [];
        const available = allowedCodes.size ? store.filter(({ id }) => allowedCodes.has(id)) : store;

        return available.sort((a, b) => a.name.localeCompare(b.name));
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
