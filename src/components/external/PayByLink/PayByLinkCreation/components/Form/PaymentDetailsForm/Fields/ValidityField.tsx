import { Controller } from '../../../../../../../../hooks/form';
import { FormValues } from '../../../types';
import Select from '../../../../../../../internal/FormFields/Select';
import FormField from '../../FormField';
import useCoreContext from '../../../../../../../../core/Context/useCoreContext';
import { useWizardFormContext } from '../../../../../../../../hooks/form/wizard/WizardFormContext';
import { useMemo } from 'preact/hooks';
import { LinkValidityDTO } from '../../../../../../../../types/api/models/payByLink';

const VALIDITY: LinkValidityDTO[] = [
    {
        type: 'fixed',
        quantity: 24,
        durationUnit: 'hour',
    },
    {
        type: 'fixed',
        quantity: 1,
        durationUnit: 'day',
    },
];

export const ValidityField = () => {
    const { i18n } = useCoreContext();
    const { control, fieldsConfig } = useWizardFormContext<FormValues>();

    const selectItemsValidity = useMemo(() => {
        return VALIDITY.map(({ quantity, durationUnit }) => ({
            id: `${quantity}` || '',
            name: i18n.get(`payByLink.linkCreation.fields.validity.linkValidityUnit.${durationUnit}`, { values: { quantity }, count: quantity }),
        }));
    }, [i18n]);

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
