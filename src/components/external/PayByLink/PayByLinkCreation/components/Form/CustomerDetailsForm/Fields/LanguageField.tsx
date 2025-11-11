import { Controller } from '../../../../../../../../hooks/form';
import { FormValues } from '../../../types';
import FormField from '../../FormField';
import useCoreContext from '../../../../../../../../core/Context/useCoreContext';
import { useWizardFormContext } from '../../../../../../../../hooks/form/wizard/WizardFormContext';
import { useMemo } from 'preact/hooks';
import Select from '../../../../../../../internal/FormFields/Select';
import { TranslationKey } from '../../../../../../../../translations';

const shopperLocale = ['en', 'nl', 'es'];

export const LanguageField = () => {
    const { i18n } = useCoreContext();
    const { control, fieldsConfig } = useWizardFormContext<FormValues>();

    const localeListItems = useMemo(() => {
        return shopperLocale.map(locale => {
            const label = `payByLink.linkCreation.fields.locale.${locale}` as TranslationKey;

            return {
                id: locale,
                name: i18n.get(label),
            };
        });
    }, [i18n]);

    const isRequired = useMemo(() => fieldsConfig['shopperLocale']?.required, [fieldsConfig]);

    return (
        <FormField label={i18n.get('payByLink.linkCreation.fields.language.label')} optional={!isRequired}>
            <Controller<FormValues>
                name="shopperLocale"
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
                                items={localeListItems}
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
