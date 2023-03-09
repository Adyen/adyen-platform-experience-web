import { useEffect, useState } from 'preact/hooks';
import classNames from 'classnames';
import renderFormField from '../FormFields';
import Field from '../FormFields/Field';
import useForm from '../../../utils/useForm';
import useCoreContext from '../../../core/Context/useCoreContext';
import './PhoneInput.scss';
import { PhoneInputSchema } from './types';

export function PhoneInput(props) {
    const { i18n } = useCoreContext();
    const [status, setStatus] = useState('ready');
    const showPrefix = !!props?.items?.length;
    const { handleChangeFor, triggerValidation, data, valid, errors, isValid } = useForm<PhoneInputSchema>({
        schema: [...(showPrefix ? ['phonePrefix'] : []), 'phoneNumber'],
        defaultData: { ...(showPrefix ? { phonePrefix: props.selected } : {}) },
        rules: {
            phoneNumber: {
                modes: ['blur'],
                errorMessage: 'error.va.gen.01',
                validate: phone => phone?.length > 6
            }
        }
    });

    useEffect(() => {
        props.onChange({ data, valid, errors, isValid });
    }, [data, valid, errors, isValid]);

    this.showValidation = triggerValidation;
    this.setStatus = setStatus;
    return (
        <div className="adyen-fp-phone-input">
            <Field
                errorMessage={!!errors.phoneNumber}
                label={i18n.get(props.phoneLabel)}
                className={classNames({
                    'adyen-fp-input--phone-number': true
                })}
                inputWrapperModifiers={['phoneInput']}
            >
                <div className="adyen-fp-input-wrapper">
                    <div
                        className={classNames({
                            'adyen-fp-input': true,
                            'adyen-fp-input--invalid': !!errors.phoneNumber
                        })}
                    >
                        {!!showPrefix && (
                            <Field inputWrapperModifiers={['phoneInput']}>
                                {renderFormField('select', {
                                    className: 'adyen-fp-dropdown--small adyen-fp-countryFlag',
                                    filterable: false,
                                    items: props.items,
                                    name: props.prefixName,
                                    onChange: handleChangeFor('phonePrefix'),
                                    placeholder: i18n.get('infix'),
                                    selected: data.phonePrefix
                                })}

                                <div className="adyen-fp-phoneNumber">
                                    <div>{data.phonePrefix}</div>

                                    <input
                                        type="tel"
                                        name={props.phoneName}
                                        value={data.phoneNumber}
                                        onInput={handleChangeFor('phoneNumber', 'input')}
                                        onBlur={handleChangeFor('phoneNumber', 'blur')}
                                        placeholder="123 456 789"
                                        className="adyen-fp-input adyen-fp-input--phoneNumber"
                                        autoCorrect="off"
                                    />
                                </div>
                            </Field>
                        )}
                    </div>
                </div>
            </Field>
            {this.props.showPayButton && this.props.payButton({ status })}
        </div>
    );
}

PhoneInput.defaultProps = {
    phoneLabel: 'telephoneNumber'
};

export default PhoneInput;
