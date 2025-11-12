import { Controller } from '../../../../../../../../hooks/form';
import { FormValues } from '../../../types';
import FormField from '../../FormField';
import useCoreContext from '../../../../../../../../core/Context/useCoreContext';
import { useWizardFormContext } from '../../../../../../../../hooks/form/wizard/WizardFormContext';
import { useMemo, useCallback } from 'preact/hooks';
import Select from '../../../../../../../internal/FormFields/Select';
import { CountryDTO } from '../../../../../../../../types/api/models/countries';
import { TranslationKey } from '../../../../../../../../translations';
import { useFetch } from '../../../../../../../../hooks/useFetch';
import { useConfigContext } from '../../../../../../../../core/ConfigContext';
import { EMPTY_OBJECT } from '../../../../../../../../utils';

export const CountryRegionField = () => {
    const { i18n } = useCoreContext();
    const { control, fieldsConfig } = useWizardFormContext<FormValues>();
    const { getCountries } = useConfigContext().endpoints;

    const countriesQuery = useFetch({
        fetchOptions: { enabled: !!getCountries },
        queryFn: useCallback(async () => {
            return getCountries?.(EMPTY_OBJECT);
        }, [getCountries]),
    });

    const countriesListItems = useMemo(() => {
        const countries: CountryDTO[] = countriesQuery.data?.data ?? [];
        return countries.map(({ countryCode }) => {
            const label = `payByLink.linkCreation.fields.country.countryName.${countryCode}` as TranslationKey;

            return {
                id: countryCode,
                name: i18n.get(label),
            };
        });
    }, [countriesQuery.data, i18n]);

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
                                readonly={countriesQuery.isFetching}
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
