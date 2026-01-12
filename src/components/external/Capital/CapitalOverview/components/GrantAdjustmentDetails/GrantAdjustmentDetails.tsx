import cx from 'classnames';
import { FunctionalComponent, h } from 'preact';
import type { TranslationKey } from '../../../../../../translations';
import type { GrantAdjustmentDetailsProps } from './types';
import './GrantAdjustmentDetails.scss';
import { Header } from '../../../../../internal/Header';
import Button from '../../../../../internal/Button/Button';
import { ButtonVariant } from '../../../../../internal/Button/types';
import Icon from '../../../../../internal/Icon';
import useCoreContext from '../../../../../../core/Context/useCoreContext';

export interface GrantAdjustmentDetailsComponentProps
    extends Pick<GrantAdjustmentDetailsProps, 'onDetailsClose'>,
        Pick<h.JSX.HTMLAttributes, 'className'> {
    headerTitleKey?: TranslationKey;
    headerSubtitleKey?: TranslationKey;
}

export const GrantAdjustmentDetails: FunctionalComponent<GrantAdjustmentDetailsComponentProps> = ({
    children,
    className,
    headerTitleKey,
    headerSubtitleKey,
    onDetailsClose,
}) => {
    const { i18n } = useCoreContext();

    return (
        <div className={cx('adyen-pe-grant-adjustment-details', className)}>
            <Header titleKey={headerTitleKey} subtitleKey={headerSubtitleKey}>
                <Button
                    onClick={onDetailsClose}
                    variant={ButtonVariant.TERTIARY}
                    iconButton
                    classNameModifiers={['circle']}
                    aria-label={i18n.get('common.actions.dismiss.labels.dismiss')}
                >
                    <Icon name="cross" />
                </Button>
            </Header>
            {children}
        </div>
    );
};
