import { Controller } from '../../../../../../../../hooks/form';
import { FormValues } from '../../../types';
import FormField from '../../FormField';
import useCoreContext from '../../../../../../../../core/Context/useCoreContext';
import { useWizardFormContext } from '../../../../../../../../hooks/form/wizard/WizardFormContext';
import { useMemo } from 'preact/hooks';
import Select from '../../../../../../../internal/FormFields/Select';
import { CountryDTO } from '../../../../../../../../types/api/models/countries';
import { TranslationKey } from '../../../../../../../../translations';

const COUNTRIES: CountryDTO[] = [
    { countryCode: 'NL', countryName: 'Netherlands' },
    { countryCode: 'ES', countryName: 'Spain' },
];

export const CountryRegionField = () => {
    const { i18n } = useCoreContext();
    const { control, fieldsConfig } = useWizardFormContext<FormValues>();

    const countriesListItems = useMemo(() => {
        return COUNTRIES.map(({ countryCode }) => {
            const label = `payByLink.linkCreation.fields.country.countryName.${countryCode}` as TranslationKey;

            return {
                id: countryCode,
                name: i18n.get(label),
            };
        });
    }, [i18n]);

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
