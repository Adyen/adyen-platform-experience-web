import Field from '../../FormFields/Field';
import StateField from './StateField';
import CountryField from './CountryField';
import { renderFormField } from '../../FormFields';
import { AddressState, FieldContainerProps } from '../types';
import useCoreContext from '../../../../core/Context/useCoreContext';
import Language from '../../../../language/Language';

function getErrorMessage<FormSchema extends Record<string, any>>(
    errors: AddressState<FormSchema>,
    fieldName: string,
    i18n: Language
): string | boolean {
    if (typeof errors[fieldName]?.errorMessage === 'object') {
        const { translationKey, translationObject } = errors[fieldName].errorMessage;
        return i18n.get(translationKey, translationObject);
    }
    return i18n.get(errors[fieldName]?.errorMessage) || !!errors[fieldName];
}

/**
 * USAGE: Specifically defined as a util to provide a wrapper for fields created within the Address component
 *
 * NOT TO BE USED: if you just want to add a Country or State dropdown outside of an Address component
 * - then you should implement <CountryField> or <StateField> directly
 */
function FieldContainer<FormSchema extends Record<string, any>>(props: FieldContainerProps<FormSchema>) {
    const {
        i18n,
        commonProps: { isCollatingErrors },
    } = useCoreContext();
    const { classNameModifiers = [], data, errors, valid, fieldName, onInput, onBlur, trimOnBlur, maxlength, disabled } = props;

    const value: string = data[fieldName];
    const selectedCountry = data.country ?? '';
    const isOptional: boolean = !!selectedCountry && props.specifications.countryHasOptionalField(selectedCountry, fieldName);
    const labelKey: string = selectedCountry ? props.specifications.getKeyForField(fieldName, selectedCountry) : '';
    const optionalLabel = isOptional ? ` ${i18n.get('field.title.optional')}` : '';
    const label = `${i18n.get(labelKey)}${optionalLabel}`;
    const errorMessage = getErrorMessage<FormSchema>(errors, fieldName, i18n);

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
                    isCollatingErrors={isCollatingErrors}
                >
                    {renderFormField('text', {
                        classNameModifiers,
                        name: fieldName,
                        value,
                        onInput,
                        onBlur,
                        isCollatingErrors,
                        maxlength,
                        trimOnBlur,
                        disabled,
                    })}
                </Field>
            );
    }
}

export default FieldContainer;
