import { Controller } from '../../../../../../../../hooks/form';
import { FormValues } from '../../../types';
import Select from '../../../../../../../internal/FormFields/Select';
import FormField from '../../FormField';
import useCoreContext from '../../../../../../../../core/Context/useCoreContext';
import { useWizardFormContext } from '../../../../../../../../hooks/form/wizard/WizardFormContext';
import { useMemo, useCallback } from 'preact/hooks';
import { FunctionalComponent } from 'preact';
import { LinkValidityDTO, PaymentLinkConfiguration } from '../../../../../../../../types/api/models/payByLink';
import { useFetch } from '../../../../../../../../hooks/useFetch';
import { useConfigContext } from '../../../../../../../../core/ConfigContext';
import { EMPTY_OBJECT } from '../../../../../../../../utils';
import { TranslationKey } from '../../../../../../../../translations';

export type ValidityFieldProps = {
    configuration?: PaymentLinkConfiguration;
    isLoading?: boolean;
};

export const ValidityField: FunctionalComponent<ValidityFieldProps> = ({ configuration, isLoading }) => {
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

    const selectItemsValidity = useMemo(() => {
        const options: LinkValidityDTO[] = configData?.linkValidity?.options ?? [];
        return options.map(({ quantity, durationUnit }) => {
            const key = `payByLink.linkCreation.fields.validity.linkValidityUnit.${durationUnit}` as TranslationKey;
            return {
                id: `${quantity}` || '',
                name: i18n.get(key, { values: { quantity }, count: quantity }),
            };
        });
    }, [configData, i18n]);

    const isRequired = useMemo(() => fieldsConfig['linkValidity']?.required, [fieldsConfig]);

    return (
        <FormField
            label={i18n.get('payByLink.linkCreation.fields.validity.label')}
            supportText={i18n.get('payByLink.linkCreation.fields.validity.supportText')}
            optional={!isRequired}
        >
            <Controller<FormValues>
                name="linkValidity"
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
                                items={selectItemsValidity}
                                readonly={effectiveLoading}
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
