import { Controller } from '../../../../../../../../hooks/form';
import { FormValues } from '../../../types';
import FormField from '../../FormField';
import useCoreContext from '../../../../../../../../core/Context/useCoreContext';
import { useWizardFormContext } from '../../../../../../../../hooks/form/wizard/WizardFormContext';
import { useCallback, useMemo } from 'preact/hooks';
import InputBase from '../../../../../../../internal/FormFields/InputBase';
import { TargetedEvent } from 'preact/compat';

export const ShippingAddressField = ({ isSeparateAddress }: { isSeparateAddress: boolean }) => {
    const { i18n } = useCoreContext();
    const { control, setValue, fieldsConfig } = useWizardFormContext<FormValues>();

    const onInput = useCallback(
        (e: TargetedEvent<HTMLInputElement, Event>, onInputHandler: (value: string) => void) => {
            !isSeparateAddress && setValue('billingAddress', e.currentTarget.value);
            onInputHandler(e.currentTarget.value);
        },
        [isSeparateAddress, setValue]
    );

    const isRequired = useMemo(() => fieldsConfig['shippingAddress']?.required, [fieldsConfig]);

    return (
        <FormField label={i18n.get('payByLink.linkCreation.fields.shippingAddress.label')} optional={!isRequired}>
            <Controller<FormValues>
                name="shippingAddress"
                control={control}
                rules={{
                    required: isRequired,
                }}
                render={({ field, fieldState }) => {
                    return (
                        <InputBase
                            {...field}
                            onInput={e => onInput(e, field.onInput)}
                            isValid={false}
                            isInvalid={!!fieldState.error}
                            errorMessage={fieldState.error?.message}
                        />
                    );
                }}
            />
        </FormField>
    );
};
