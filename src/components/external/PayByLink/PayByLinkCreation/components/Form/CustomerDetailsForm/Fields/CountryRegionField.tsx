import { Controller } from '../../../../../../../../hooks/form';
import { FormValues } from '../../../types';
import FormField from '../../FormField';
import useCoreContext from '../../../../../../../../core/Context/useCoreContext';
import { useWizardFormContext } from '../../../../../../../../hooks/form/wizard/WizardFormContext';
import { useMemo, useCallback } from 'preact/hooks';
import Select from '../../../../../../../internal/FormFields/Select';
import { CountryDTO } from '../../../../../../../../types/api/models/countries';
import { useFetch } from '../../../../../../../../hooks/useFetch';
import { useConfigContext } from '../../../../../../../../core/ConfigContext';
import { EMPTY_OBJECT } from '../../../../../../../../utils';

export const CountryRegionField = () => {
    const { i18n, getDatasetAsset } = useCoreContext();
    const { control, fieldsConfig } = useWizardFormContext<FormValues>();
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
            // Build dataset URL using Core's asset helper (points to CDN or local assets depending on env)
            const fileName = `${i18n.locale}`;
            const url = getDatasetAsset?.({ name: fileName, extension: 'json', subFolder: 'countries' });

            if (!url) return [] as { id: string; name: string }[];

            const res = await fetch(url);
            if (!res.ok) return [] as { id: string; name: string }[];
            return (await res.json()) as { id: string; name: string }[];
        }, [getDatasetAsset, i18n.locale]),
    });

    const countriesListItems = useMemo(() => {
        const subset = new Set((countriesQuery.data?.data ?? []).map(({ countryCode }: CountryDTO) => countryCode).filter(Boolean));
        const store = datasetQuery.data ?? [];

        const available = subset.size ? store.filter(({ id }) => subset.has(id)) : store;

        return available.map(({ id, name }) => ({ id, name })).sort(({ name: a }, { name: b }) => a.localeCompare(b));
    }, [countriesQuery.data, datasetQuery.data]);

    const isRequired = useMemo(() => fieldsConfig['countryCode']?.required, [fieldsConfig]);

    return (
        <FormField label={i18n.get('payByLink.linkCreation.fields.country.label')} optional={!isRequired}>
            <Controller<FormValues>
                name="countryCode"
                control={control}
                rules={{
                    required: isRequired,
                }}
                render={({ field, fieldState }) => {
                    const onInput = (e: any) => {
                        field.onInput(e.target.value);
                    };
                    return (
                        <div>
                            <Select
                                {...field}
                                selected={field.value as string}
                                onChange={onInput}
                                items={countriesListItems}
                                readonly={countriesQuery.isFetching || datasetQuery.isFetching}
                                isValid={!!fieldState.error}
                            />
                            <span className="adyen-pe-input__invalid-value">{fieldState.error?.message}</span>
                        </div>
                    );
                }}
            />
        </FormField>
    );
};
