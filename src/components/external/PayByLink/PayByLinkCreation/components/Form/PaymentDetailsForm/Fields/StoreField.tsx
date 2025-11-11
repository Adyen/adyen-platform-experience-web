import { Controller } from '../../../../../../../../hooks/form';
import { FormValues } from '../../../types';
import Select from '../../../../../../../internal/FormFields/Select';
import FormField from '../../FormField';
import useCoreContext from '../../../../../../../../core/Context/useCoreContext';
import { useWizardFormContext } from '../../../../../../../../hooks/form/wizard/WizardFormContext';
import { StoresDTO } from '../../../../../../../../types/api/models/stores';
import { useMemo } from 'preact/hooks';

const STORES: StoresDTO[] = [
    {
        storeCode: 'EvergreenGoods',
        description: 'My Store Description',
    },
    {
        storeCode: 'Starlight Boutique',
        description: 'My Store Description',
    },
];

const StoreField = () => {
    const { i18n } = useCoreContext();
    const { control, fieldsConfig } = useWizardFormContext<FormValues>();

    const selectItems = useMemo(() => {
        return STORES.map(({ storeCode, description }) => ({
            id: storeCode || description || '',
            name: storeCode || description || '',
        }));
    }, []);

    const isRequired = useMemo(() => fieldsConfig['store']?.required, [fieldsConfig]);

    return (
        <FormField label={i18n.get('payByLink.linkCreation.fields.store.label')} optional={!isRequired}>
            <Controller<FormValues>
                name="store"
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
                            <Select {...field} selected={field.value as string} onChange={onInput} items={selectItems} isValid={!fieldState.error} />
                            <span className="adyen-pe-input__invalid-value">{fieldState.error?.message}</span>
                        </div>
                    );
                }}
            />
        </FormField>
    );
};

export default StoreField;
