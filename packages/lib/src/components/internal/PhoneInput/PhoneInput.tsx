import { useEffect, useState } from 'preact/hooks';
import classNames from 'classnames';
import renderFormField from '../FormFields';
import Field from '../FormFields/Field';
import useForm from '../../../utils/useForm';
import useCoreContext from '@src/core/Context/useCoreContext';
import './PhoneInput.scss';
import { PhoneInputComponentProps, PhoneInputSchema } from './types';

export function PhoneInput(props: PhoneInputComponentProps) {
    const { i18n } = useCoreContext();
    const [status, setStatus] = useState('ready');
    const showPrefix = !!props?.items?.length;
    const { handleChangeFor, triggerValidation, data, valid, errors, isValid } = useForm<PhoneInputSchema, PhoneInputComponentProps>({
        schema: showPrefix ? ['phonePrefix', 'phoneNumber'] : ['phoneNumber'],
        defaultData: { ...(showPrefix ? { phonePrefix: props.selected } : {}) },
        rules: {
            phoneNumber: {
                modes: ['blur'],
                errorMessage: 'error.va.gen.01',
                validate: (phone: PhoneInputSchema['phoneNumber']) => !!phone && phone.length > 6,
            },
        },
    });

    useEffect(() => {
        props.onChange({ data, valid, errors, isValid });
    }, [data, valid, errors, isValid]);

    props.setTriggerValidation?.(triggerValidation);
    props.setUIElementStatus?.(setStatus);

    return (
        <div className="adyen-pe-phone-input">
            <Field
                errorMessage={!!errors.phoneNumber}
                label={props.phoneLabel ? i18n.get(props.phoneLabel) : ''}
                className={classNames({
                    'adyen-pe-input--phone-number': true,
                })}
                inputWrapperModifiers={['phoneInput']}
            >
                <div className="adyen-pe-input-wrapper">
                    <div
                        className={classNames({
                            'adyen-pe-input': true,
                            'adyen-pe-input--invalid': !!errors.phoneNumber,
                        })}
                    >
                        {!!showPrefix && (
                            <Field inputWrapperModifiers={['phoneInput']}>
                                {renderFormField('select', {
                                    className: 'adyen-pe-dropdown--small adyen-pe-countryFlag',
                                    filterable: false,
                                    items: props.items,
                                    name: props.prefixName,
                                    onChange: handleChangeFor('phonePrefix'),
                                    placeholder: i18n.get('infix'),
                                    selected: data.phonePrefix,
                                })}

                                <div className="adyen-pe-phoneNumber">
                                    <div>{data.phonePrefix}</div>

                                    <input
                                        type="tel"
                                        name={props.phoneName}
                                        value={data.phoneNumber}
                                        onInput={handleChangeFor('phoneNumber', 'input')}
                                        onBlur={handleChangeFor('phoneNumber', 'blur')}
                                        placeholder="123 456 789"
                                        className="adyen-pe-input adyen-pe-input--phoneNumber"
                                        autoCorrect="off"
                                    />
                                </div>
                            </Field>
                        )}
                    </div>
                </div>
            </Field>
            {props.showPayButton && props.payButton({ status })}
        </div>
    );
}

PhoneInput.defaultProps = {
    phoneLabel: 'telephoneNumber',
};

export default PhoneInput;
