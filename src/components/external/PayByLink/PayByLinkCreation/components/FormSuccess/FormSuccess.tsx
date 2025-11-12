import cx from 'classnames';

import useCoreContext from '../../../../../../core/Context/useCoreContext';
import Typography from '../../../../../internal/Typography/Typography';
import { TypographyVariant } from '../../../../../internal/Typography/types';
import Icon from '../../../../../internal/Icon/Icon';
import Button from '../../../../../internal/Button/Button';
import { ButtonVariant } from '../../../../../internal/Button/types';
import './FormSuccess.scss';

export const FormSuccess = () => {
    const { i18n } = useCoreContext();
    return (
        <section className={cx('adyen-pe-pay-by-link-form-success')}>
            <div className="adyen-pe-pay-by-link-form-success__content">
                <Icon name="checkmark-circle-fill" className="adyen-pe-pay-by-link-form-success__icon" />
                <Typography variant={TypographyVariant.TITLE} className="adyen-pe-pay-by-link-form-success__title">
                    {i18n.get('payByLink.creation.success.title')}
                </Typography>
                <Typography variant={TypographyVariant.BODY} className="adyen-pe-pay-by-link-form-success__description">
                    {i18n.get('payByLink.creation.success.description')}
                </Typography>
            </div>
            <div className="adyen-pe-pay-by-link-form-success__actions">
                <Button variant={ButtonVariant.SECONDARY} onClick={() => {}}>
                    {i18n.get('payByLink.creation.success.showDetails')}
                </Button>
                <Button
                    variant={ButtonVariant.PRIMARY}
                    onClick={() => {}}
                    iconLeft={<Icon className="adyen-pe-pay-by-link-form-success__button-icon" name="copy" />}
                >
                    {i18n.get('payByLink.creation.success.copyLink')}
                </Button>
            </div>
        </section>
    );
};
