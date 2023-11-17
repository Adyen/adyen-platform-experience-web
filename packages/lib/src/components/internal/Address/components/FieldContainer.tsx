import Field from '../../FormFields/Field';
import StateField from './StateField';
import CountryField from './CountryField';
import { renderFormField } from '../../FormFields';
import { AddressState, FieldContainerProps } from '../types';
import useCoreContext from '../../../../core/Context/useCoreContext';
import Localization from '@src/core/Localization/Localization';
import { ErrorMessageObject } from '../../../../utils/Validator/types';
import { TranslationKey } from '../../../../core/Localization/types';
import { isString } from '@src/utils/validator-utils';


function getErrorMessage<Schema extends Record<string, any>>(
    errors: AddressState<Schema>,
    fieldName: keyof AddressState<Schema>,
    i18n: Localization['i18n']
): string | boolean {
    if (isString(errors[fieldName]?.errorMessage)) {
        return errors[fieldName] ? i18n.get(errors[fieldName]?.errorMessage as TranslationKey) : !!errors[fieldName];
    }
    if (errors[fieldName]) {
        const { translationKey, translationObject } = errors[fieldName]?.errorMessage as ErrorMessageObject;
        return errors[fieldName] ? i18n.get(translationKey, translationObject) : false;
    }
    return false;
}

/**
 * USAGE: Specifically defined as a util to provide a wrapper for fields created within the Address component
 *
 * NOT TO BE USED: if you just want to add a Country or State dropdown outside of an Address component
 * - then you should implement <CountryField> or <StateField> directly
 */
function FieldContainer<Schema extends Record<string, any>>(props: FieldContainerProps<Schema>) {
    const { i18n, commonProps } = useCoreContext();
    const { classNameModifiers = [], data, errors, valid, fieldName, onInput, onBlur, trimOnBlur, maxlength, disabled } = props;

    const value: string = data[fieldName];
    const selectedCountry = data.country ?? '';
    const isOptional: boolean = !!selectedCountry && props.specifications.countryHasOptionalField(selectedCountry, fieldName);
    const labelKey = selectedCountry ? props.specifications.getKeyForField(fieldName, selectedCountry) : '';
    const optionalLabel = isOptional ? ` ${i18n.get('field.title.optional')}` : '';
    const label = `${labelKey ? i18n.get(labelKey) : fieldName}${optionalLabel}`;
    const errorMessage = getErrorMessage<Schema>(errors, fieldName, i18n);

    switch (fieldName) {
        case 'country':
            return (
                <CountryField
                    allowedCountries={props.allowedCountries}
                    classNameModifiers={classNameModifiers}
                    label={label}
                    errorMessage={errorMessage}
                    onDropdownChange={props.onDropdownChange}
                    value={value}
                />
            );
        case 'stateOrProvince':
            return (
                <StateField
                    classNameModifiers={classNameModifiers}
                    label={label}
                    errorMessage={errorMessage}
                    onDropdownChange={props.onDropdownChange}
                    selectedCountry={selectedCountry}
                    specifications={props.specifications}
                    value={value}
                />
            );
        default:
            return (
                <Field
                    label={label}
                    classNameModifiers={classNameModifiers}
                    errorMessage={errorMessage}
                    isValid={valid?.[fieldName]}
                    name={fieldName}
                    isCollatingErrors={commonProps?.isCollatingErrors}
                >
                    {renderFormField('text', {
                        classNameModifiers,
                        name: fieldName,
                        value,
                        onInput,
                        onBlur,
                        isCollatingErrors: commonProps?.isCollatingErrors,
                        maxLength: maxlength,
                        trimOnBlur,
                        disabled,
                    })}
                </Field>
            );
    }
}

export default FieldContainer;
