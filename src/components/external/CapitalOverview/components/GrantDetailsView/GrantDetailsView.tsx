import cx from 'classnames';
import { FunctionalComponent, h } from 'preact';
import type { TranslationKey } from '../../../../../translations';
import type { GrantDetailsViewProps } from './types';
import './GrantDetailsView.scss';
import { Header } from '../../../../internal/Header';
import Button from '../../../../internal/Button/Button';
import { ButtonVariant } from '../../../../internal/Button/types';
import Icon from '../../../../internal/Icon';
import useCoreContext from '../../../../../core/Context/useCoreContext';

export interface GrantDetailsViewComponentProps extends Pick<GrantDetailsViewProps, 'onDetailsClose'>, Pick<h.JSX.HTMLAttributes, 'className'> {
    headerTitleKey?: TranslationKey;
    headerSubtitleKey?: TranslationKey;
}

export const GrantDetailsView: FunctionalComponent<GrantDetailsViewComponentProps> = ({
    children,
    className,
    headerTitleKey,
    headerSubtitleKey,
    onDetailsClose,
}) => {
    const { i18n } = useCoreContext();

    return (
        <div className={cx('adyen-pe-grant-details-view', className)}>
            <Header titleKey={headerTitleKey} subtitleKey={headerSubtitleKey}>
                <Button
                    onClick={onDetailsClose}
                    variant={ButtonVariant.TERTIARY}
                    iconButton
                    classNameModifiers={['circle']}
                    aria-label={i18n.get('dismiss')}
                >
                    <Icon name="cross" />
                </Button>
            </Header>
            {children}
        </div>
    );
};
