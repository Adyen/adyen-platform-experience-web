import { Controller } from '../../../../../../../../hooks/form';
import { FormValues } from '../../../types';
import FormField from '../../FormField';
import useCoreContext from '../../../../../../../../core/Context/useCoreContext';
import { useWizardFormContext } from '../../../../../../../../hooks/form/wizard/WizardFormContext';
import { useMemo } from 'preact/hooks';
import InputBase from '../../../../../../../internal/FormFields/InputBase';

export const DescriptionField = () => {
    const { i18n } = useCoreContext();
    const { control, fieldsConfig } = useWizardFormContext<FormValues>();

    const isRequired = useMemo(() => fieldsConfig['description']?.required, [fieldsConfig]);

    return (
        <FormField
            label={i18n.get('payByLink.linkCreation.fields.description.label')}
            supportText={i18n.get('payByLink.linkCreation.fields.description.supportText')}
            optional={!isRequired}
        >
            <Controller<FormValues>
                name="description"
                control={control}
                rules={{
                    required: true,
                }}
                render={({ field, fieldState }) => {
                    return <InputBase {...field} isValid={false} isInvalid={!!fieldState.error} errorMessage={fieldState.error?.message} />;
                }}
            />
        </FormField>
    );
};
