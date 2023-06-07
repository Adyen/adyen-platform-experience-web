import { useEffect, useMemo } from 'preact/hooks';
import Fieldset from '../FormFields/Fieldset';
import Field from '../FormFields/Field';
import ReadOnlyPersonalDetails from './ReadOnlyPersonalDetails';
import { renderFormField } from '../FormFields';
import { personalDetailsValidationRules } from './validate';
import useCoreContext from '@src/core/Context/useCoreContext';
import { PersonalDetailsProps } from './types';
import { checkDateInputSupport } from '../FormFields/InputDate/utils';
import { PersonalDetailsSchema } from '../../../types';
import { getFormattedData } from './utils';
import useForm from '../../../utils/useForm';
import './PersonalDetails.scss';
import { SchemaKeys } from '../../../utils/useForm/types';
import { ValidatorMode } from '../../../utils/Validator/types';
import { JSX } from 'preact';

const personalDetailsRequiredFields: SchemaKeys<PersonalDetailsSchema>[] = [
    'firstName',
    'lastName',
    'gender',
    'dateOfBirth',
    'shopperEmail',
    'telephoneNumber',
];

export default function PersonalDetails(props: PersonalDetailsProps<PersonalDetailsSchema>) {
    const {
        label = '',
        namePrefix,
        placeholders = {},
        requiredFields = personalDetailsRequiredFields,
        visibility = 'editable',
        onChange = () => {},
        validationRules = personalDetailsValidationRules,
        data: defaultData = {},
    } = props;

    const { i18n } = useCoreContext();
    const isDateInputSupported = useMemo(checkDateInputSupport, []);
    const { handleChangeFor, triggerValidation, data, valid, errors, isValid } = useForm<
        PersonalDetailsSchema,
        PersonalDetailsProps<PersonalDetailsSchema>
    >({
        schema: requiredFields,
        rules: validationRules,
        defaultData: defaultData,
    });

    const eventHandler =
        (mode: ValidatorMode) =>
        (e: JSX.TargetedEvent<HTMLInputElement>): void => {
            const { name } = e.target as HTMLInputElement;
            const key = name.split(`${namePrefix}.`).pop();

            if (key) handleChangeFor(key as keyof PersonalDetailsSchema, mode)(e);
        };

    const generateFieldName = (name: string): string => `${namePrefix ? `${namePrefix}.` : ''}${name}`;
    const getErrorMessage = (error: { errorMessage?: string }) => (error && error.errorMessage ? i18n.get(error.errorMessage) : !!error);

    useEffect(() => {
        const formattedData = getFormattedData(data);
        onChange?.({ data: formattedData, valid, errors, isValid });
    }, [data, valid, errors, isValid]);

    props.setTriggerValidation?.(triggerValidation);

    if (visibility === 'hidden') return null;
    if (visibility === 'readOnly') return <ReadOnlyPersonalDetails {...props} data={data} />;

    return (
        <Fieldset classNameModifiers={['personalDetails']} label={label}>
            {requiredFields?.includes('firstName') && (
                <Field
                    label={i18n.get('firstName')}
                    classNameModifiers={['col-50', 'firstName']}
                    errorMessage={!!errors.firstName}
                    name={'firstName'}
                >
                    {renderFormField('text', {
                        name: generateFieldName('firstName'),
                        value: data.firstName,
                        classNameModifiers: ['firstName'],
                        onInput: eventHandler('input'),
                        onBlur: eventHandler('blur'),
                        placeholder: placeholders?.firstName,
                        spellCheck: false,
                    })}
                </Field>
            )}

            {requiredFields?.includes('lastName') && (
                <Field label={i18n.get('lastName')} classNameModifiers={['col-50', 'lastName']} errorMessage={!!errors.lastName} name={'lastName'}>
                    {renderFormField('text', {
                        name: generateFieldName('lastName'),
                        value: data.lastName,
                        classNameModifiers: ['lastName'],
                        onInput: eventHandler('input'),
                        onBlur: eventHandler('blur'),
                        placeholder: placeholders?.lastName,
                        spellCheck: false,
                    })}
                </Field>
            )}

            {requiredFields?.includes('gender') && (
                <Field errorMessage={!!errors.gender} classNameModifiers={['gender']} name={'gender'} useLabelElement={false}>
                    {renderFormField('radio', {
                        i18n,
                        name: generateFieldName('gender'),
                        value: data.gender,
                        items: [
                            { id: 'MALE', name: 'male' },
                            { id: 'FEMALE', name: 'female' },
                        ],
                        classNameModifiers: ['gender'],
                        onChange: eventHandler('blur'),
                    })}
                </Field>
            )}

            {requiredFields?.includes('dateOfBirth') && (
                <Field
                    label={i18n.get('dateOfBirth')}
                    classNameModifiers={['col-50', 'lastName']}
                    errorMessage={getErrorMessage(errors.dateOfBirth)}
                    helper={isDateInputSupported ? undefined : i18n.get('dateOfBirth.format')}
                    name={'dateOfBirth'}
                >
                    {renderFormField('date', {
                        name: generateFieldName('dateOfBirth'),
                        value: data.dateOfBirth,
                        classNameModifiers: ['dateOfBirth'],
                        onInput: eventHandler('input'),
                        onBlur: eventHandler('blur'),
                        placeholder: placeholders?.dateOfBirth,
                    })}
                </Field>
            )}

            {requiredFields?.includes('shopperEmail') && (
                <Field
                    label={i18n.get('shopperEmail')}
                    classNameModifiers={['shopperEmail']}
                    errorMessage={getErrorMessage(errors.shopperEmail)}
                    dir={'ltr'}
                    name={'emailAddress'}
                >
                    {renderFormField('emailAddress', {
                        name: generateFieldName('shopperEmail'),
                        value: data.shopperEmail,
                        classNameModifiers: ['shopperEmail'],
                        onInput: eventHandler('input'),
                        onBlur: eventHandler('blur'),
                        placeholder: placeholders?.shopperEmail,
                    })}
                </Field>
            )}

            {requiredFields?.includes('telephoneNumber') && (
                <Field
                    label={i18n.get('telephoneNumber')}
                    classNameModifiers={['telephoneNumber']}
                    errorMessage={getErrorMessage(errors.telephoneNumber)}
                    dir={'ltr'}
                    name={'telephoneNumber'}
                >
                    {renderFormField('tel', {
                        name: generateFieldName('telephoneNumber'),
                        value: data.telephoneNumber,
                        classNameModifiers: ['telephoneNumber'],
                        onInput: eventHandler('input'),
                        onBlur: eventHandler('blur'),
                        placeholder: placeholders?.telephoneNumber,
                    })}
                </Field>
            )}
        </Fieldset>
    );
}
