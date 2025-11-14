import { Controller } from '../../../../../../../../hooks/form';
import { FormValues } from '../../../types';
import FormField from '../../FormField';
import useCoreContext from '../../../../../../../../core/Context/useCoreContext';
import { useWizardFormContext } from '../../../../../../../../hooks/form/wizard/WizardFormContext';
import { useMemo, useCallback } from 'preact/hooks';
import { FunctionalComponent } from 'preact';
import Select from '../../../../../../../internal/FormFields/Select';
import { PaymentLinkConfiguration, PaymentLinkTypeDTO } from '../../../../../../../../types/api/models/payByLink';
import { useFetch } from '../../../../../../../../hooks/useFetch';
import { useConfigContext } from '../../../../../../../../core/ConfigContext';
import { EMPTY_OBJECT } from '../../../../../../../../utils';
import { TranslationKey } from '../../../../../../../../translations';

export type LinkTypeFieldProps = {
    configuration?: PaymentLinkConfiguration;
    isLoading?: boolean;
};

export const LinkTypeField: FunctionalComponent<LinkTypeFieldProps> = ({ configuration, isLoading }) => {
    const { i18n } = useCoreContext();
    const { control, fieldsConfig } = useWizardFormContext<FormValues>();

    const { getPayByLinkConfiguration } = useConfigContext().endpoints;
    const configurationQuery = useFetch({
        fetchOptions: { enabled: !!getPayByLinkConfiguration && !configuration },
        queryFn: useCallback(async () => {
            return getPayByLinkConfiguration?.(EMPTY_OBJECT);
        }, [getPayByLinkConfiguration]),
    });
    const configData = configuration ?? configurationQuery.data;
    const effectiveLoading = isLoading ?? configurationQuery.isFetching;

    const isRequired = useMemo(() => fieldsConfig['linkType']?.required, [fieldsConfig]);

    const linkTypes = useMemo(() => {
        const options = configData?.linkType?.options ?? [];
        return options.map(type => {
            const key = `payByLink.linkCreation.form.linkTypes.${type}` as TranslationKey;
            return {
                id: type as PaymentLinkTypeDTO,
                name: i18n.get(key),
            };
        });
    }, [configData, i18n]);

    return (
        <FormField label={i18n.get('payByLink.linkCreation.fields.linkType.label')} optional={!isRequired}>
            <Controller<FormValues>
                name="linkType"
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
                                selected={field.value as PaymentLinkTypeDTO}
                                onChange={onInput}
                                items={linkTypes}
                                readonly={effectiveLoading}
                                isValid={!fieldState.error}
                                isInvalid={!!fieldState.error}
                            />
                            <span className="adyen-pe-input__invalid-value">{fieldState.error?.message}</span>
                        </div>
                    );
                }}
            />
        </FormField>
    );
};
