import Icon from '../../Icon';
import './FieldError.scss';
import cx from 'classnames';

interface FieldErrorProps {
    id?: string;
    errorMessage: string;
    withTopMargin?: boolean;
}

export const FieldError = ({ id, errorMessage, withTopMargin }: FieldErrorProps) => {
    return (
        <div className={cx('adyen-pe-field-error', { 'adyen-pe-field-error--with-top-margin': withTopMargin })} id={id}>
            <Icon name="cross-circle-fill" className="adyen-pe-field-error__icon" />
            <span className="adyen-pe-field-error__message">{errorMessage}</span>
        </div>
    );
};
