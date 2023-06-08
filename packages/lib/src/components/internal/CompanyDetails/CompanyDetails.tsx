import { useEffect } from 'preact/hooks';
import Fieldset from '../FormFields/Fieldset';
import Field from '../FormFields/Field';
import ReadOnlyCompanyDetails from './ReadOnlyCompanyDetails';
import { renderFormField } from '../FormFields';
import { companyDetailsValidationRules } from './validate';
import useCoreContext from '@src/core/Context/useCoreContext';
import { getFormattedData } from './utils';
import { CompanyDetailsSchema, CompanyDetailsProps } from './types';
import useForm from '../../../utils/useForm';
import { SchemaKeys } from '../../../utils/useForm/types';
import { ValidatorMode } from '../../../utils/Validator/types';
import { TargetedEvent } from 'preact/compat';

const companyDetailsSchema: SchemaKeys<CompanyDetailsSchema>[] = ['name', 'registrationNumber'];

export default function CompanyDetails(props: CompanyDetailsProps<CompanyDetailsSchema>) {
    const { label = '', namePrefix, requiredFields, visibility } = props;
    const { i18n } = useCoreContext();
    const { handleChangeFor, triggerValidation, data, valid, errors, isValid } = useForm<
        CompanyDetailsSchema,
        CompanyDetailsProps<CompanyDetailsSchema>
    >({
        schema: requiredFields ?? companyDetailsSchema,
        rules: props.validationRules,
        defaultData: props.data,
    });

    const generateFieldName = (name: string): string => `${namePrefix ? `${namePrefix}.` : ''}${name}`;

    const eventHandler =
        (mode: ValidatorMode) =>
        (e: TargetedEvent<HTMLInputElement, Event>): void => {
            const { name } = e.target as HTMLInputElement;
            const key = name.split(`${namePrefix}.`).pop() as keyof CompanyDetailsSchema;

            if (key) handleChangeFor(key, mode)(e);
        };

    useEffect(() => {
        const formattedData = getFormattedData(data);
        props.onChange({ data: formattedData, valid, errors, isValid });
    }, [data, valid, errors, isValid]);

    props.setTriggerValidation?.(triggerValidation);

    if (visibility === 'hidden') return null;
    if (visibility === 'readOnly') return <ReadOnlyCompanyDetails {...props} data={data} />;

    return (
        <Fieldset classNameModifiers={[label]} label={label}>
            {requiredFields?.includes('name') && (
                <Field label={i18n.get('companyDetails.name')} classNameModifiers={['name']} errorMessage={!!errors.name}>
                    {renderFormField('text', {
                        name: generateFieldName('name'),
                        value: data.name,
                        classNameModifiers: ['name'],
                        onInput: eventHandler('input'),
                        onBlur: eventHandler('blur'),
                        spellCheck: false,
                    })}
                </Field>
            )}

            {requiredFields?.includes('registrationNumber') && (
                <Field
                    label={i18n.get('companyDetails.registrationNumber')}
                    classNameModifiers={['registrationNumber']}
                    errorMessage={!!errors.registrationNumber}
                >
                    {renderFormField('text', {
                        name: generateFieldName('registrationNumber'),
                        value: data.registrationNumber,
                        classNameModifiers: ['registrationNumber'],
                        onInput: eventHandler('input'),
                        onBlur: eventHandler('blur'),
                        spellCheck: false,
                    })}
                </Field>
            )}
        </Fieldset>
    );
}

CompanyDetails.defaultProps = {
    data: {},
    onChange: () => {},
    visibility: 'editable',
    requiredFields: companyDetailsSchema,
    validationRules: companyDetailsValidationRules,
};
