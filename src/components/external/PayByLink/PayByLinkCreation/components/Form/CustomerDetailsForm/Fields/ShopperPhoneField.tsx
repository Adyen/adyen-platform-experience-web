import { Controller } from '../../../../../../../../hooks/form';
import { FormValues } from '../../../types';
import FormField from '../../FormField';
import useCoreContext from '../../../../../../../../core/Context/useCoreContext';
import { useWizardFormContext } from '../../../../../../../../hooks/form/wizard/WizardFormContext';
import { useCallback, useMemo, useState } from 'preact/hooks';
import InputBase from '../../../../../../../internal/FormFields/InputBase';
import { phoneNumberPrefixes } from '../../enums';

export const ShopperPhoneField = () => {
    const { i18n } = useCoreContext();
    const { control, fieldsConfig } = useWizardFormContext<FormValues>();
    const [phoneCode, setPhoneCode] = useState<string>('');

    const phoneCodesDropdown = useMemo(() => {
        return Object.entries(phoneNumberPrefixes).map(([country, code]) => {
            return {
                id: code,
                name: `${country} (${code})`,
            };
        });
    }, []);

    const onSelectPhoneCode = useCallback(
        (value: string) => {
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
                    validate: () => {
                        if (!phoneCode) {
                            return { valid: false, message: i18n.get('payByLink.linkCreation.fields.phoneNumber.errors.requiredPhoneCode') };
                        }
                        return { valid: true };
                    },
                }}
                render={({ field, fieldState }) => {
                    return (
                        <InputBase
                            {...field}
                            type="number"
                            dropdown={{
                                items: phoneCodesDropdown,
                                value: phoneCode,
                                placeholder: i18n.get('payByLink.linkCreation.fields.shopperPhone.phonePrefix.placeholder'),
                            }}
                            onDropdownInput={val => {
                                onSelectPhoneCode(val);
                                field.onBlur();
                            }}
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
