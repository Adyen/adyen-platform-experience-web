import { Controller } from '../../../../../../../../hooks/form';
import { FormValues } from '../../../types';
import FormField from '../../FormField';
import useCoreContext from '../../../../../../../../core/Context/useCoreContext';
import { useWizardFormContext } from '../../../../../../../../hooks/form/wizard/WizardFormContext';
import { useMemo } from 'preact/hooks';
import Select from '../../../../../../../internal/FormFields/Select';
import { PaymentLinkTypeDTO } from '../../../../../../../../types/api/models/payByLink';

const LINK_TYPES: PaymentLinkTypeDTO[] = ['open', 'singleUse'];

export const LinkTypeField = () => {
    const { i18n } = useCoreContext();
    const { control, fieldsConfig } = useWizardFormContext<FormValues>();

    const isRequired = useMemo(() => fieldsConfig['linkType']?.required, [fieldsConfig]);

    const linkTypes = useMemo(() => {
        return LINK_TYPES.map(type => ({
            id: type,
            name: i18n.get(`payByLink.linkCreation.form.linkTypes.${type}`),
        }));
    }, [i18n]);

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
                                isValid={!fieldState.error}
                            />
                            <span className="adyen-pe-input__invalid-value">{fieldState.error?.message}</span>
                        </div>
                    );
                }}
            />
        </FormField>
    );
};
