import Field from '../FormFields/Field';
import { renderFormField } from '../FormFields';
import SocialSecurityNumberBrazil from './SocialSecurityNumberBrazil';
import { h } from 'preact';

export function BrazilPersonalDetail(props) {
    const { i18n, data, handleChangeFor, errors, valid } = props;
    return (
        <div className={'adyen-fp-fieldset adyen-fp-fieldset--address adyen-fp-fieldset--personalDetails'}>
            <div className="adyen-fp-fieldset__title">{i18n.get('personalDetails')}</div>

            <div className="adyen-fp-fieldset__fields">
                <Field label={i18n.get('firstName')} classNameModifiers={['firstName', 'col-50']} errorMessage={!!errors.firstName}>
                    {renderFormField('text', {
                        name: 'firstName',
                        autocorrect: 'off',
                        spellcheck: false,
                        value: data.firstName,
                        onInput: handleChangeFor('firstName', 'input'),
                        onBlur: handleChangeFor('firstName', 'blur')
                    })}
                </Field>

                <Field label={i18n.get('lastName')} classNameModifiers={['lastName', 'col-50']} errorMessage={!!errors.lastName}>
                    {renderFormField('text', {
                        name: 'lastName',
                        autocorrect: 'off',
                        spellcheck: false,
                        value: data.lastName,
                        onInput: handleChangeFor('lastName', 'input'),
                        onBlur: handleChangeFor('lastName', 'blur')
                    })}
                </Field>

                <SocialSecurityNumberBrazil
                    data={data.socialSecurityNumber}
                    error={errors.socialSecurityNumber}
                    valid={valid.socialSecurityNumber}
                    onInput={handleChangeFor('socialSecurityNumber', 'input')}
                    onBlur={handleChangeFor('socialSecurityNumber', 'blur')}
                />
            </div>
        </div>
    );
}
