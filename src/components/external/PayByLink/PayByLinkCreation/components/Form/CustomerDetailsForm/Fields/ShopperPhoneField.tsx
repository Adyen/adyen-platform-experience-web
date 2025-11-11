import { Controller } from '../../../../../../../../hooks/form';
import { FormValues } from '../../../types';
import FormField from '../../FormField';
import useCoreContext from '../../../../../../../../core/Context/useCoreContext';
import { useWizardFormContext } from '../../../../../../../../hooks/form/wizard/WizardFormContext';
import { useCallback, useMemo, useState } from 'preact/hooks';
import InputBase from '../../../../../../../internal/FormFields/InputBase';

const PHONE_CODES = [
    { code: '+31', country: 'NL' },
    { code: '+1', country: 'US' },
    { code: '+34', country: 'ES' },
];
export const ShopperPhoneField = () => {
    const { i18n } = useCoreContext();
    const { control, setValue, fieldsConfig } = useWizardFormContext<FormValues>();
    const [phoneCode, setPhoneCode] = useState<string>('');

    const phoneCodesDropdown = useMemo(() => {
        return PHONE_CODES.map(({ code, country }) => {
            return {
                id: code,
                name: `${country} (${code})`,
            };
        });
    }, []);

    const onSelectPhoneCode = useCallback(
        (value: string) => {
            // TODO - Check with BE if we need to send this field or merge it with phoneNumber
            //setValue('phoneCode', value);
            setPhoneCode(value);
        },
        [setPhoneCode]
    );

    const isRequired = useMemo(() => fieldsConfig['phoneNumber']?.required, [fieldsConfig]);

    return (
        <FormField label={i18n.get('payByLink.linkCreation.fields.shopperPhone.label')} optional={!isRequired}>
            <Controller<FormValues>
                name="phoneNumber"
                control={control}
                rules={{
                    required: isRequired,
                }}
                render={({ field, fieldState }) => {
                    return (
                        <InputBase
                            {...field}
                            type="number"
                            dropdown={{ items: phoneCodesDropdown, value: phoneCodesDropdown[0]?.id }}
                            onDropdownInput={onSelectPhoneCode}
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
