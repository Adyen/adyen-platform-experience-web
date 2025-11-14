import { Controller } from '../../../../../../../../hooks/form';
import { FormValues } from '../../../types';
import FormField from '../../FormField';
import useCoreContext from '../../../../../../../../core/Context/useCoreContext';
import { useWizardFormContext } from '../../../../../../../../hooks/form/wizard/WizardFormContext';
import { useMemo } from 'preact/hooks';
import InputBase from '../../../../../../../internal/FormFields/InputBase';

export const BillingAddressField = ({ isSeparateAddress }: { isSeparateAddress: boolean }) => {
    const { i18n } = useCoreContext();
    const { control, fieldsConfig } = useWizardFormContext<FormValues>();

    const isRequired = useMemo(() => fieldsConfig['linkValidity']?.required, [fieldsConfig]);

    return (
        <FormField label={i18n.get('payByLink.linkCreation.fields.billingAddress.label')} optional={!isRequired}>
            <Controller<FormValues>
                name="billingAddress"
                control={control}
                rules={{
                    required: isRequired,
                }}
                render={({ field, fieldState }) => {
                    return <InputBase {...field} isValid={false} isInvalid={!!fieldState.error} errorMessage={fieldState.error?.message} />;
                }}
            />
        </FormField>
    );
};
