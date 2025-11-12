import { Controller } from '../../../../../../../../hooks/form';
import { FormValues } from '../../../types';
import FormField from '../../FormField';
import useCoreContext from '../../../../../../../../core/Context/useCoreContext';
import { useWizardFormContext } from '../../../../../../../../hooks/form/wizard/WizardFormContext';
import { useCallback, useMemo } from 'preact/hooks';
import Select from '../../../../../../../internal/FormFields/Select';
import { useFetch } from '../../../../../../../../hooks/useFetch';

export const LanguageField = () => {
    const { i18n, getCdnDataset } = useCoreContext();
    const { control, fieldsConfig } = useWizardFormContext<FormValues>();

    const languagesQuery = useFetch({
        fetchOptions: { enabled: true },
        queryFn: useCallback(async () => {
            if (getCdnDataset) {
                return (
                    (await getCdnDataset<Array<{ text: string; value: string | null }>>({
                        name: 'languages',
                        extension: 'json',
                        fallback: [] as Array<{ text: string; value: string | null }>,
                    })) ?? []
                );
            }
            return [] as Array<{ text: string; value: string | null }>;
        }, [getCdnDataset]),
    });

    const localeListItems = useMemo(() => {
        const langs = languagesQuery.data ?? [];
        return langs
            .map(({ text, value }) => {
                return {
                    // TODO - Handle 'auto detect' option when submitting information to the BE
                    id: value === null ? 'auto' : value,
                    name: text,
                };
            })
            .sort(({ name: a }, { name: b }) => a.localeCompare(b));
    }, [languagesQuery.data]);

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
                                readonly={languagesQuery.isFetching}
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
